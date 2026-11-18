-- HELLO VERA, del 64: 💜 Vera-Messenger (app fra App Butik i telefonen, koster 5 Glimt)
-- - Alle gæster og ansatte kan skrive privat sammen, også selvom de ikke er venner.
-- - 🌍 Fælles chat for hele hotellet (gæster + ansatte).
-- - Mutet, frosset eller bannet = man kan ikke skrive (samme straffe som i chatten).
-- - Ejeren (og ansatte med adgang til private beskeder) kan læse alle samtaler.
-- - Alt gemmes, også den fælles chat.
-- Kopiér ALT herfra → Supabase → SQL Editor → + New query → Run. Må gerne køres flere gange.

-- 🛒 Hvem har købt appen (5 Glimt, kun én gang – kan hentes igen gratis)
create table if not exists public.hv_messenger_koeb (
  navn_lille text primary key,
  navn text not null,
  tid timestamptz not null default now()
);

-- 💬 Beskederne. samtale = 'alle' (fælles chat) eller 'anna|bo' (de to navne med små bogstaver, sorteret)
create table if not exists public.hv_messenger_beskeder (
  id bigint generated always as identity primary key,
  samtale text not null,
  fra text not null,
  fra_lille text not null,
  til_lille text,                       -- null i den fælles chat
  tekst text not null,
  slettet boolean not null default false,
  slettet_af text,
  tid timestamptz not null default now()
);
create index if not exists hv_messenger_samtale on public.hv_messenger_beskeder (samtale, id desc);
create index if not exists hv_messenger_til on public.hv_messenger_beskeder (til_lille, id desc);
create index if not exists hv_messenger_fra on public.hv_messenger_beskeder (fra_lille, id desc);

-- 👀 Hvor langt har man læst i hver samtale
create table if not exists public.hv_messenger_laest (
  navn_lille text not null,
  samtale text not null,
  sidst_id bigint not null default 0,
  primary key (navn_lille, samtale)
);

-- 🚫 Blokeringer (blokerer man en, kan personen ikke skrive privat til en)
create table if not exists public.hv_messenger_blok (
  navn_lille text not null,
  blok_lille text not null,
  tid timestamptz not null default now(),
  primary key (navn_lille, blok_lille)
);

alter table public.hv_messenger_koeb enable row level security;
alter table public.hv_messenger_beskeder enable row level security;
alter table public.hv_messenger_laest enable row level security;
alter table public.hv_messenger_blok enable row level security;
revoke all on public.hv_messenger_koeb, public.hv_messenger_beskeder, public.hv_messenger_laest, public.hv_messenger_blok from anon, authenticated;

-- hjælper: navnet på samtalen mellem to
create or replace function public.hv_messenger_noegle(a text, b text)
returns text language sql immutable as $$
  select case when lower(a) < lower(b) then lower(a) || '|' || lower(b) else lower(b) || '|' || lower(a) end;
$$;

-- hjælper: har man appen? (ejeren har den altid gratis)
create or replace function public.hv_messenger_har(p_navn text)
returns boolean language sql stable security definer set search_path = public as $$
  select hv_er_ejer(p_navn) or exists (select 1 from hv_messenger_koeb where navn_lille = lower(p_navn));
$$;

-- hjælper: må man skrive lige nu? (mute, frys og ban fra Ejerpanelet gælder også her). Giver '' eller grunden.
create or replace function public.hv_messenger_straf(p_navn text)
returns text language plpgsql stable security definer set search_path = public as $$
declare d jsonb; nu bigint := (extract(epoch from now()) * 1000)::bigint;
begin
  if hv_er_ejer(p_navn) then return ''; end if;
  select data into d from hv_straffe where navn_lille = lower(p_navn);
  if d is null then return ''; end if;
  if coalesce((d->>'bannet')::boolean, false) or coalesce((d->>'bannetTil')::numeric, 0) > nu then return 'Du er bannet og kan ikke skrive.'; end if;
  if coalesce((d->>'frysTil')::numeric, 0) > nu then return '🧊 Du er frosset og kan ikke skrive lige nu.'; end if;
  if coalesce((d->>'timeoutTil')::numeric, 0) > nu then return '🔇 Du er mutet og kan ikke skrive lige nu.'; end if;
  return '';
exception when others then return '';
end $$;

-- 🛒 Køb appen for 5 Glimt (har man købt den før, er den gratis)
create or replace function public.hv_messenger_koeb_app(p_token uuid)
returns json language plpgsql security definer set search_path = public as $$
declare s hv_spillere; har boolean;
begin
  select * into s from hv_spillere where token = p_token for update;
  if s.id is null then raise exception 'Du er ikke logget ind.'; end if;
  if coalesce(s.er_bot, false) then raise exception 'Botter kan ikke hente apps.'; end if;
  har := hv_messenger_har(s.navn);
  if not har then
    if coalesce(s.glimt, 0) < 5 then raise exception 'Du har ikke råd. Vera-Messenger koster 5 Glimt.'; end if;
    update hv_spillere set glimt = glimt - 5 where id = s.id returning * into s;
    insert into hv_messenger_koeb (navn_lille, navn) values (s.navn_lille, s.navn) on conflict do nothing;
  end if;
  return json_build_object('koebt', true, 'betalt', not har, 'glimt', coalesce(s.glimt, 0), 'stella', coalesce(s.stella, 0));
end $$;

-- ✔ Har jeg købt appen?
create or replace function public.hv_messenger_status(p_token uuid)
returns json language plpgsql security definer set search_path = public as $$
declare s hv_spillere;
begin
  select * into s from hv_spillere where token = p_token;
  if s.id is null then raise exception 'Du er ikke logget ind.'; end if;
  return json_build_object('koebt', hv_messenger_har(s.navn), 'ejer', hv_er_ejer(s.navn),
    'se_alle', hv_er_ejer(s.navn) or hv_maa_se_beskeder(s.navn), 'mod', hv_er_mod(s.navn), 'straf', hv_messenger_straf(s.navn));
end $$;

-- ✉️ Send en besked. p_til = et navn, eller 'alle' for den fælles chat
create or replace function public.hv_messenger_send(p_token uuid, p_til text, p_tekst text)
returns bigint language plpgsql security definer set search_path = public as $$
declare s hv_spillere; m hv_spillere; ny bigint; grund text; v_tekst text; nogle text := 'alle';
begin
  select * into s from hv_spillere where token = p_token;
  if s.id is null then raise exception 'Du er ikke logget ind.'; end if;
  if not hv_messenger_har(s.navn) then raise exception 'Du skal hente Vera-Messenger i App Butik først (5 Glimt).'; end if;
  grund := hv_messenger_straf(s.navn);
  if grund <> '' then raise exception '%', grund; end if;
  v_tekst := left(trim(coalesce(p_tekst, '')), 500);
  if v_tekst = '' then raise exception 'Beskeden er tom.'; end if;
  if exists (select 1 from hv_messenger_beskeder where fra_lille = s.navn_lille and tid > now() - interval '1 second') then
    raise exception 'Vent lidt, før du skriver igen.';
  end if;
  if lower(trim(coalesce(p_til, ''))) = 'alle' then
    insert into hv_messenger_beskeder (samtale, fra, fra_lille, til_lille, tekst)
      values ('alle', s.navn, s.navn_lille, null, v_tekst) returning id into ny;
  else
    select * into m from hv_spillere where navn_lille = lower(trim(coalesce(p_til, '')));
    if m.id is null or coalesce(m.er_bot, false) then raise exception 'Der findes ingen gæst, der hedder %.', p_til; end if;
    if m.id = s.id then raise exception 'Du kan ikke skrive til dig selv.'; end if;
    if exists (select 1 from hv_messenger_blok where navn_lille = m.navn_lille and blok_lille = s.navn_lille)
       and not hv_er_ansat(s.navn) then
      raise exception '% tager ikke imod beskeder fra dig.', m.navn;
    end if;
    nogle := hv_messenger_noegle(s.navn, m.navn);
    insert into hv_messenger_beskeder (samtale, fra, fra_lille, til_lille, tekst)
      values (nogle, s.navn, s.navn_lille, m.navn_lille, v_tekst) returning id into ny;
  end if;
  insert into hv_messenger_laest (navn_lille, samtale, sidst_id)
    values (s.navn_lille, nogle, ny)
    on conflict (navn_lille, samtale) do update set sidst_id = greatest(hv_messenger_laest.sidst_id, excluded.sidst_id);
  update hv_spillere set aktiv = now() where id = s.id;
  return ny;
end $$;

-- 📋 Mine samtaler: den fælles chat + alle mine private samtaler (seneste besked + ulæste)
create or replace function public.hv_messenger_samtaler(p_token uuid)
returns json language plpgsql security definer set search_path = public as $$
declare s hv_spillere;
begin
  select * into s from hv_spillere where token = p_token;
  if s.id is null then raise exception 'Du er ikke logget ind.'; end if;
  return json_build_object(
    'straf', hv_messenger_straf(s.navn),
    'nyeste', coalesce((select max(id) from hv_messenger_beskeder), 0),
    'samtaler', coalesce((
      select json_agg(x order by x.sidst_id desc) from (
        select b.samtale,
          case when b.samtale = 'alle' then 'alle' else coalesce(sp.navn, b.anden) end as med,
          b.id as sidst_id, b.fra, case when b.slettet then '' else b.tekst end as tekst, b.slettet,
          (extract(epoch from b.tid) * 1000)::bigint as tid,
          (select count(*) from hv_messenger_beskeder u where u.samtale = b.samtale and not u.slettet and u.fra_lille <> s.navn_lille
             and u.id > coalesce((select l.sidst_id from hv_messenger_laest l where l.navn_lille = s.navn_lille and l.samtale = b.samtale), 0)) as ulaeste,
          (extract(epoch from sp.aktiv) * 1000)::bigint as aktiv,
          (select a.skilt from hv_ansatte a where a.navn_lille = b.anden) as skilt,
          hv_er_ejer(coalesce(sp.navn, '')) as ejer
        from (
          select distinct on (samtale) *, case when fra_lille = s.navn_lille then til_lille else fra_lille end as anden
          from hv_messenger_beskeder
          where samtale = 'alle' or fra_lille = s.navn_lille or til_lille = s.navn_lille
          order by samtale, id desc
        ) b
        left join hv_spillere sp on b.samtale <> 'alle' and sp.navn_lille = b.anden
      ) x), '[]'::json));
end $$;

-- 💬 Én samtale (de nyeste 80, eller ældre end p_foer). Markerer den som læst.
create or replace function public.hv_messenger_samtale(p_token uuid, p_med text, p_foer bigint)
returns json language plpgsql security definer set search_path = public as $$
declare s hv_spillere; m hv_spillere; nogle text; sidst bigint; deres bigint;
begin
  select * into s from hv_spillere where token = p_token;
  if s.id is null then raise exception 'Du er ikke logget ind.'; end if;
  if lower(trim(coalesce(p_med, ''))) = 'alle' then nogle := 'alle';
  else
    select * into m from hv_spillere where navn_lille = lower(trim(coalesce(p_med, '')));
    if m.id is null then raise exception 'Der findes ingen gæst, der hedder %.', p_med; end if;
    nogle := hv_messenger_noegle(s.navn, m.navn);
  end if;
  select max(id) into sidst from hv_messenger_beskeder where samtale = nogle;
  if sidst is not null and coalesce(p_foer, 0) = 0 then
    insert into hv_messenger_laest (navn_lille, samtale, sidst_id) values (s.navn_lille, nogle, sidst)
      on conflict (navn_lille, samtale) do update set sidst_id = greatest(hv_messenger_laest.sidst_id, excluded.sidst_id);
  end if;
  -- hvor langt har den anden læst? (til "Set")
  if nogle <> 'alle' then select sidst_id into deres from hv_messenger_laest where navn_lille = m.navn_lille and samtale = nogle; end if;
  return json_build_object(
    'samtale', nogle,
    'med', case when nogle = 'alle' then 'alle' else m.navn end,
    'aktiv', case when nogle = 'alle' then null else (extract(epoch from m.aktiv) * 1000)::bigint end,
    'skilt', case when nogle = 'alle' then null else (select skilt from hv_ansatte where navn_lille = m.navn_lille) end,
    'blokeret', case when nogle = 'alle' then false else exists (select 1 from hv_messenger_blok where navn_lille = s.navn_lille and blok_lille = m.navn_lille) end,
    'deres_laest', coalesce(deres, 0),
    'beskeder', coalesce((select json_agg(json_build_object('id', b.id, 'fra', b.fra, 'tekst', case when b.slettet then '' else b.tekst end,
        'slettet', b.slettet, 'skilt', (select a.skilt from hv_ansatte a where a.navn_lille = b.fra_lille),
        'ejer', hv_er_ejer(b.fra), 'tid', (extract(epoch from b.tid) * 1000)::bigint) order by b.id)
      from (select * from hv_messenger_beskeder where samtale = nogle and (coalesce(p_foer, 0) = 0 or id < p_foer) order by id desc limit 80) b), '[]'::json));
end $$;

-- 🔍 Find hvem som helst på hotellet (ingen venner nødvendige)
create or replace function public.hv_messenger_soeg(p_token uuid, p_soeg text)
returns json language plpgsql security definer set search_path = public as $$
declare s hv_spillere; q text := lower(trim(coalesce(p_soeg, '')));
begin
  select * into s from hv_spillere where token = p_token;
  if s.id is null then raise exception 'Du er ikke logget ind.'; end if;
  return coalesce((select json_agg(json_build_object('navn', x.navn, 'aktiv', (extract(epoch from x.aktiv) * 1000)::bigint,
      'skilt', (select a.skilt from hv_ansatte a where a.navn_lille = x.navn_lille), 'ejer', hv_er_ejer(x.navn),
      'har', hv_messenger_har(x.navn)) order by x.aktiv desc nulls last)
    from (select * from hv_spillere where id <> s.id and not coalesce(er_bot, false)
          and (q = '' or navn_lille like '%' || q || '%') order by aktiv desc nulls last limit 40) x), '[]'::json);
end $$;

-- 🚫 Blokér / fjern blokering
create or replace function public.hv_messenger_blokker(p_token uuid, p_navn text, p_blok boolean)
returns void language plpgsql security definer set search_path = public as $$
declare s hv_spillere;
begin
  select * into s from hv_spillere where token = p_token;
  if s.id is null then raise exception 'Du er ikke logget ind.'; end if;
  if p_blok then
    if hv_er_ansat(p_navn) then raise exception 'Du kan ikke blokere hotellets ansatte.'; end if;
    insert into hv_messenger_blok (navn_lille, blok_lille) values (s.navn_lille, lower(trim(p_navn))) on conflict do nothing;
  else
    delete from hv_messenger_blok where navn_lille = s.navn_lille and blok_lille = lower(trim(p_navn));
  end if;
end $$;

-- 🗑 Slet en besked: sin egen, eller (ejer/MOD) hvem som helst
create or replace function public.hv_messenger_slet(p_token uuid, p_id bigint)
returns void language plpgsql security definer set search_path = public as $$
declare s hv_spillere; b hv_messenger_beskeder;
begin
  select * into s from hv_spillere where token = p_token;
  if s.id is null then raise exception 'Du er ikke logget ind.'; end if;
  select * into b from hv_messenger_beskeder where id = p_id;
  if b.id is null then return; end if;
  if b.fra_lille <> s.navn_lille and not hv_er_mod(s.navn) and not hv_er_ejer(s.navn) then
    raise exception 'Du kan kun slette dine egne beskeder.';
  end if;
  -- beskeden gemmes stadig (ejeren kan se den), den vises bare som slettet
  update hv_messenger_beskeder set slettet = true, slettet_af = s.navn where id = p_id;
end $$;

-- 👑 Ejeren (og ansatte med adgang til private beskeder): alle private samtaler på hotellet
create or replace function public.hv_messenger_ejer_samtaler(p_token uuid, p_soeg text)
returns json language plpgsql security definer set search_path = public as $$
declare s hv_spillere; q text := lower(trim(coalesce(p_soeg, '')));
begin
  select * into s from hv_spillere where token = p_token;
  if s.id is null then raise exception 'Du er ikke logget ind.'; end if;
  if not (hv_er_ejer(s.navn) or hv_maa_se_beskeder(s.navn)) then raise exception 'Kun ejeren kan se andres private beskeder.'; end if;
  return coalesce((select json_agg(json_build_object('samtale', b.samtale, 'fra', b.fra,
      'a', coalesce((select navn from hv_spillere where navn_lille = split_part(b.samtale, '|', 1)), split_part(b.samtale, '|', 1)),
      'b', coalesce((select navn from hv_spillere where navn_lille = split_part(b.samtale, '|', 2)), split_part(b.samtale, '|', 2)), 'tekst', b.tekst, 'slettet', b.slettet,
      'antal', (select count(*) from hv_messenger_beskeder c where c.samtale = b.samtale),
      'tid', (extract(epoch from b.tid) * 1000)::bigint) order by b.id desc)
    from (select distinct on (samtale) * from hv_messenger_beskeder where samtale <> 'alle'
          and (q = '' or samtale like '%' || q || '%') order by samtale, id desc) b), '[]'::json);
end $$;

-- 👑 Læs én privat samtale (også slettede beskeder)
create or replace function public.hv_messenger_ejer_laes(p_token uuid, p_samtale text)
returns json language plpgsql security definer set search_path = public as $$
declare s hv_spillere;
begin
  select * into s from hv_spillere where token = p_token;
  if s.id is null then raise exception 'Du er ikke logget ind.'; end if;
  if not (hv_er_ejer(s.navn) or hv_maa_se_beskeder(s.navn)) then raise exception 'Kun ejeren kan se andres private beskeder.'; end if;
  return coalesce((select json_agg(json_build_object('id', b.id, 'fra', b.fra, 'tekst', b.tekst, 'slettet', b.slettet, 'slettet_af', b.slettet_af,
      'tid', (extract(epoch from b.tid) * 1000)::bigint) order by b.id)
    from (select * from hv_messenger_beskeder where samtale = lower(p_samtale) order by id desc limit 300) b), '[]'::json);
end $$;

grant execute on function public.hv_messenger_koeb_app(uuid) to anon, authenticated;
grant execute on function public.hv_messenger_status(uuid) to anon, authenticated;
grant execute on function public.hv_messenger_send(uuid, text, text) to anon, authenticated;
grant execute on function public.hv_messenger_samtaler(uuid) to anon, authenticated;
grant execute on function public.hv_messenger_samtale(uuid, text, bigint) to anon, authenticated;
grant execute on function public.hv_messenger_soeg(uuid, text) to anon, authenticated;
grant execute on function public.hv_messenger_blokker(uuid, text, boolean) to anon, authenticated;
grant execute on function public.hv_messenger_slet(uuid, bigint) to anon, authenticated;
grant execute on function public.hv_messenger_ejer_samtaler(uuid, text) to anon, authenticated;
grant execute on function public.hv_messenger_ejer_laes(uuid, text) to anon, authenticated;
revoke execute on function public.hv_messenger_har(text) from anon, authenticated;
revoke execute on function public.hv_messenger_straf(text) from anon, authenticated;
notify pgrst, 'reload schema';

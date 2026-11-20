-- HELLO VERA, del 66: 🔄 Møbelbytte mellem spillere
-- - Klik på en anden spiller i samme rum → 🔄 Byt møbler. Den anden skal sige ja.
-- - Begge lægger møbler fra Mine ting i byttevinduet. Hotellet passer på møblerne imens.
-- - Begge trykker ✔ Godkend. Ændrer nogen noget, skal begge godkende igen.
-- - Først når begge har godkendt, bytter møblerne ejer. Det sker på én gang på serveren,
--   så ingen kan snyde, og intet kan blive væk eller blive til to.
-- - Stoppes byttet (nej tak, annuller, går ud af rummet, logger ud), får alle deres egne møbler tilbage.
-- - Bannet, frosset eller mutet = man kan ikke bytte.
-- - Ejeren (og MOD) kan se hele bytte-loggen og stoppe et bytte i Ejerpanelet.
-- Kopiér ALT herfra → Supabase → SQL Editor → + New query → Run. Må gerne køres flere gange.

-- 🔄 Selve byttene
create table if not exists public.hv_bytte (
  id bigint generated always as identity primary key,
  fra text not null,                 -- den der inviterede
  fra_lille text not null,
  til text not null,                 -- den der blev inviteret
  til_lille text not null,
  rum text,
  status text not null default 'inviteret',   -- inviteret, aaben, byttet, annulleret, afvist, udloebet, stoppet
  fra_ok boolean not null default false,
  til_ok boolean not null default false,
  version integer not null default 1,         -- tælles op, hver gang nogen ændrer noget
  slut_grund text,
  stoppet_af text,
  oprettet timestamptz not null default now(),
  opdateret timestamptz not null default now(),
  slut timestamptz
);
create index if not exists hv_bytte_fra on public.hv_bytte (fra_lille, id desc);
create index if not exists hv_bytte_til on public.hv_bytte (til_lille, id desc);
create index if not exists hv_bytte_status on public.hv_bytte (status);

-- 🪑 Møblerne, der ligger i et bytte (hotellet passer på dem)
create table if not exists public.hv_bytte_ting (
  id bigint generated always as identity primary key,
  bytte_id bigint not null references public.hv_bytte (id) on delete cascade,
  ejer_lille text not null,          -- hvem der lagde det i
  type text not null,
  fjernet boolean not null default false,   -- taget ud igen, før byttet skete
  tid timestamptz not null default now()
);
create index if not exists hv_bytte_ting_bytte on public.hv_bytte_ting (bytte_id);

-- 📦 Møbler på vej til Mine ting (det man fik, eller fik tilbage)
create table if not exists public.hv_bytte_leveringer (
  id bigint generated always as identity primary key,
  navn_lille text not null,
  type text not null,
  grund text,
  bytte_id bigint,
  oprettet timestamptz not null default now(),
  hentet timestamptz
);
create index if not exists hv_bytte_lev_navn on public.hv_bytte_leveringer (navn_lille) where hentet is null;

alter table public.hv_bytte enable row level security;
alter table public.hv_bytte_ting enable row level security;
alter table public.hv_bytte_leveringer enable row level security;
revoke all on public.hv_bytte, public.hv_bytte_ting, public.hv_bytte_leveringer from anon, authenticated;


-- hjælper: må man bytte lige nu? Giver '' eller grunden.
create or replace function public.hv_bytte_straf(p_navn text)
returns text language plpgsql stable security definer set search_path = public as $$
declare d jsonb; nu bigint := (extract(epoch from now()) * 1000)::bigint;
begin
  if hv_er_ejer(p_navn) then return ''; end if;
  select data into d from hv_straffe where navn_lille = lower(p_navn);
  if d is null then return ''; end if;
  if coalesce((d->>'bannet')::boolean, false) or coalesce((d->>'bannetTil')::numeric, 0) > nu then return 'bannet'; end if;
  if coalesce((d->>'frysTil')::numeric, 0) > nu then return 'frosset'; end if;
  if coalesce((d->>'timeoutTil')::numeric, 0) > nu then return 'mutet'; end if;
  return '';
exception when others then return '';
end $$;

-- hjælper: stop et bytte og giv alle deres egne møbler tilbage
create or replace function public.hv_bytte_stop(p_id bigint, p_status text, p_grund text, p_af text)
returns void language plpgsql security definer set search_path = public as $$
declare b hv_bytte;
begin
  select * into b from hv_bytte where id = p_id for update;
  if b.id is null or b.status not in ('inviteret', 'aaben') then return; end if;
  insert into hv_bytte_leveringer (navn_lille, type, grund, bytte_id)
    select t.ejer_lille, t.type, 'du fik det tilbage fra byttet', b.id
    from hv_bytte_ting t where t.bytte_id = b.id and not t.fjernet;
  update hv_bytte set status = p_status, slut_grund = left(p_grund, 200), stoppet_af = p_af,
    slut = now(), opdateret = now(), version = version + 1, fra_ok = false, til_ok = false
  where id = b.id;
end $$;

-- hjælper: ryd op i gamle invitationer og bytter, hvor en af dem er gået
create or replace function public.hv_bytte_ryd()
returns void language plpgsql security definer set search_path = public as $$
declare r record;
begin
  for r in select b.id, b.status, b.opdateret, b.rum,
      (select o.sidst_set from hv_spillere o where o.navn_lille = b.fra_lille) as fra_set,
      (select o.rum from hv_spillere o where o.navn_lille = b.fra_lille) as fra_rum,
      (select o.sidst_set from hv_spillere o where o.navn_lille = b.til_lille) as til_set,
      (select o.rum from hv_spillere o where o.navn_lille = b.til_lille) as til_rum
    from hv_bytte b where b.status in ('inviteret', 'aaben')
  loop
    if r.status = 'inviteret' and r.opdateret < now() - interval '60 seconds' then
      perform hv_bytte_stop(r.id, 'udloebet', 'Ingen svar inden for et minut.', null);
    elsif coalesce(r.fra_set, 'epoch'::timestamptz) < now() - interval '30 seconds'
       or coalesce(r.til_set, 'epoch'::timestamptz) < now() - interval '30 seconds' then
      perform hv_bytte_stop(r.id, 'annulleret', 'En af jer gik offline.', null);
    elsif r.fra_rum is distinct from r.rum or r.til_rum is distinct from r.rum then
      perform hv_bytte_stop(r.id, 'annulleret', 'En af jer gik ud af rummet.', null);
    elsif r.opdateret < now() - interval '15 minutes' then
      perform hv_bytte_stop(r.id, 'annulleret', 'Byttet stod stille i 15 minutter.', null);
    end if;
  end loop;
end $$;


-- 📨 Inviter en anden spiller til at bytte
create or replace function public.hv_bytte_inviter(p_token uuid, p_til text)
returns bigint language plpgsql security definer set search_path = public as $$
declare s hv_spillere; m hv_spillere; grund text; ny bigint;
begin
  select * into s from hv_spillere where token = p_token;
  if s.id is null then raise exception 'Du er ikke logget ind.'; end if;
  if coalesce(s.er_bot, false) then raise exception 'Botter kan ikke bytte.'; end if;
  perform hv_bytte_ryd();
  grund := hv_bytte_straf(s.navn);
  if grund <> '' then raise exception 'Du er % og kan ikke bytte lige nu.', grund; end if;
  select * into m from hv_spillere where navn_lille = lower(trim(coalesce(p_til, '')));
  if m.id is null or coalesce(m.er_bot, false) then raise exception 'Der findes ingen gæst, der hedder %.', p_til; end if;
  if m.id = s.id then raise exception 'Du kan ikke bytte med dig selv.'; end if;
  if coalesce(m.sidst_set, 'epoch'::timestamptz) < now() - interval '20 seconds' then raise exception '% er ikke online.', m.navn; end if;
  if m.rum is distinct from s.rum then raise exception 'I skal være i samme rum for at bytte.'; end if;
  if hv_bytte_straf(m.navn) <> '' then raise exception '% kan ikke bytte lige nu.', m.navn; end if;
  if exists (select 1 from hv_bytte where status in ('inviteret', 'aaben') and (fra_lille = s.navn_lille or til_lille = s.navn_lille)) then
    raise exception 'Du er allerede i gang med et bytte. Afslut det først.';
  end if;
  if exists (select 1 from hv_bytte where status in ('inviteret', 'aaben') and (fra_lille = m.navn_lille or til_lille = m.navn_lille)) then
    raise exception '% er i gang med et andet bytte lige nu.', m.navn;
  end if;
  if exists (select 1 from hv_bytte where fra_lille = s.navn_lille and oprettet > now() - interval '5 seconds') then
    raise exception 'Vent lidt, før du inviterer igen.';
  end if;
  if (select count(*) from hv_bytte where fra_lille = s.navn_lille and til_lille = m.navn_lille
        and status in ('afvist', 'udloebet') and oprettet > now() - interval '2 minutes') >= 3 then
    raise exception '% har sagt nej flere gange. Vent et par minutter.', m.navn;
  end if;
  insert into hv_bytte (fra, fra_lille, til, til_lille, rum) values (s.navn, s.navn_lille, m.navn, m.navn_lille, s.rum)
    returning id into ny;
  return ny;
end $$;

-- ✔/✕ Svar på en invitation
create or replace function public.hv_bytte_svar(p_token uuid, p_id bigint, p_ja boolean)
returns void language plpgsql security definer set search_path = public as $$
declare s hv_spillere; b hv_bytte; grund text;
begin
  select * into s from hv_spillere where token = p_token;
  if s.id is null then raise exception 'Du er ikke logget ind.'; end if;
  perform hv_bytte_ryd();
  select * into b from hv_bytte where id = p_id for update;
  if b.id is null or b.til_lille <> s.navn_lille then raise exception 'Invitationen findes ikke.'; end if;
  if b.status <> 'inviteret' then raise exception 'Invitationen er ikke gyldig længere.'; end if;
  if not coalesce(p_ja, false) then
    perform hv_bytte_stop(b.id, 'afvist', s.navn || ' sagde nej tak.', null);
    return;
  end if;
  grund := hv_bytte_straf(s.navn);
  if grund <> '' then raise exception 'Du er % og kan ikke bytte lige nu.', grund; end if;
  if exists (select 1 from hv_bytte where id <> b.id and status = 'aaben' and (fra_lille = s.navn_lille or til_lille = s.navn_lille)) then
    raise exception 'Du er allerede i gang med et andet bytte.';
  end if;
  update hv_bytte set status = 'aaben', opdateret = now(), version = version + 1 where id = b.id;
end $$;

-- ➕ Læg et møbel fra Mine ting i byttet
create or replace function public.hv_bytte_laeg(p_token uuid, p_id bigint, p_type text)
returns bigint language plpgsql security definer set search_path = public as $$
declare s hv_spillere; b hv_bytte; ny bigint; v_type text := trim(coalesce(p_type, ''));
begin
  select * into s from hv_spillere where token = p_token;
  if s.id is null then raise exception 'Du er ikke logget ind.'; end if;
  select * into b from hv_bytte where id = p_id for update;
  if b.id is null or s.navn_lille not in (b.fra_lille, b.til_lille) then raise exception 'Byttet findes ikke.'; end if;
  if b.status <> 'aaben' then raise exception 'Byttet er slut.'; end if;
  if v_type !~ '^[A-Za-z0-9_.:-]{1,60}$' then raise exception 'Det møbel kan ikke byttes.'; end if;
  if (select count(*) from hv_bytte_ting where bytte_id = b.id and ejer_lille = s.navn_lille and not fjernet) >= 12 then
    raise exception 'Du kan højst lægge 12 møbler i et bytte.';
  end if;
  insert into hv_bytte_ting (bytte_id, ejer_lille, type) values (b.id, s.navn_lille, v_type) returning id into ny;
  update hv_bytte set fra_ok = false, til_ok = false, version = version + 1, opdateret = now() where id = b.id;
  return ny;
end $$;

-- ➖ Tag et møbel ud af byttet igen (det kommer tilbage i Mine ting)
create or replace function public.hv_bytte_fjern(p_token uuid, p_id bigint, p_ting bigint)
returns void language plpgsql security definer set search_path = public as $$
declare s hv_spillere; b hv_bytte; t hv_bytte_ting;
begin
  select * into s from hv_spillere where token = p_token;
  if s.id is null then raise exception 'Du er ikke logget ind.'; end if;
  select * into b from hv_bytte where id = p_id for update;
  if b.id is null or s.navn_lille not in (b.fra_lille, b.til_lille) then raise exception 'Byttet findes ikke.'; end if;
  if b.status <> 'aaben' then raise exception 'Byttet er slut.'; end if;
  select * into t from hv_bytte_ting where id = p_ting and bytte_id = b.id and ejer_lille = s.navn_lille and not fjernet for update;
  if t.id is null then raise exception 'Møblet er ikke dit, eller det er allerede taget ud.'; end if;
  update hv_bytte_ting set fjernet = true where id = t.id;
  insert into hv_bytte_leveringer (navn_lille, type, grund, bytte_id) values (s.navn_lille, t.type, 'taget ud af byttet', b.id);
  update hv_bytte set fra_ok = false, til_ok = false, version = version + 1, opdateret = now() where id = b.id;
end $$;

-- ✔ Godkend (eller fortryd godkendelsen). Når begge har godkendt, bytter møblerne ejer med det samme.
-- p_version skal passe, så man ikke kommer til at godkende noget, den anden lige har ændret.
create or replace function public.hv_bytte_godkend(p_token uuid, p_id bigint, p_ok boolean, p_version integer)
returns json language plpgsql security definer set search_path = public as $$
declare s hv_spillere; b hv_bytte; grund text; antal integer;
begin
  select * into s from hv_spillere where token = p_token;
  if s.id is null then raise exception 'Du er ikke logget ind.'; end if;
  select * into b from hv_bytte where id = p_id for update;
  if b.id is null or s.navn_lille not in (b.fra_lille, b.til_lille) then raise exception 'Byttet findes ikke.'; end if;
  if b.status <> 'aaben' then raise exception 'Byttet er slut.'; end if;
  if coalesce(p_ok, false) then
    if p_version is distinct from b.version then raise exception 'Byttet er lige blivet ændret. Kig efter igen, og godkend så.'; end if;
    grund := hv_bytte_straf(s.navn);
    if grund <> '' then raise exception 'Du er % og kan ikke bytte lige nu.', grund; end if;
    select count(*) into antal from hv_bytte_ting where bytte_id = b.id and not fjernet;
    if antal = 0 then raise exception 'Der er ingen møbler i byttet endnu.'; end if;
  end if;
  if s.navn_lille = b.fra_lille then
    update hv_bytte set fra_ok = coalesce(p_ok, false), opdateret = now() where id = b.id returning * into b;
  else
    update hv_bytte set til_ok = coalesce(p_ok, false), opdateret = now() where id = b.id returning * into b;
  end if;
  if b.fra_ok and b.til_ok then
    -- begge har sagt ja: tjek dem begge én sidste gang, og byt så alt på én gang
    if hv_bytte_straf(b.fra) <> '' or hv_bytte_straf(b.til) <> '' then
      perform hv_bytte_stop(b.id, 'annulleret', 'En af jer fik en straf, så byttet blev stoppet.', null);
      return json_build_object('byttet', false, 'stoppet', true);
    end if;
    insert into hv_bytte_leveringer (navn_lille, type, grund, bytte_id)
      select case when t.ejer_lille = b.fra_lille then b.til_lille else b.fra_lille end, t.type,
             'byttet med ' || case when t.ejer_lille = b.fra_lille then b.fra else b.til end, b.id
      from hv_bytte_ting t where t.bytte_id = b.id and not t.fjernet;
    update hv_bytte set status = 'byttet', slut = now(), opdateret = now(), version = version + 1 where id = b.id;
    return json_build_object('byttet', true);
  end if;
  return json_build_object('byttet', false);
end $$;

-- ✕ Stop byttet (begge får deres egne møbler tilbage)
create or replace function public.hv_bytte_annuller(p_token uuid, p_id bigint)
returns void language plpgsql security definer set search_path = public as $$
declare s hv_spillere; b hv_bytte;
begin
  select * into s from hv_spillere where token = p_token;
  if s.id is null then raise exception 'Du er ikke logget ind.'; end if;
  select * into b from hv_bytte where id = p_id;
  if b.id is null or s.navn_lille not in (b.fra_lille, b.til_lille) then raise exception 'Byttet findes ikke.'; end if;
  perform hv_bytte_stop(b.id, case when b.status = 'inviteret' and s.navn_lille = b.til_lille then 'afvist' else 'annulleret' end,
    s.navn || ' stoppede byttet.', s.navn);
end $$;

-- 👀 Hvad sker der lige nu? (kaldes hvert andet sekund)
create or replace function public.hv_bytte_hent(p_token uuid)
returns json language plpgsql security definer set search_path = public as $$
declare s hv_spillere; b hv_bytte; jeg_fra boolean; senest json;
begin
  select * into s from hv_spillere where token = p_token;
  if s.id is null then raise exception 'Du er ikke logget ind.'; end if;
  perform hv_bytte_ryd();
  select * into b from hv_bytte where status = 'aaben' and (fra_lille = s.navn_lille or til_lille = s.navn_lille) order by id desc limit 1;
  if b.id is null then
    select * into b from hv_bytte where status = 'inviteret' and fra_lille = s.navn_lille order by id desc limit 1;
  end if;
  -- det seneste bytte, der lige er slut (så man kan få at vide, hvordan det gik)
  select json_build_object('id', x.id, 'status', x.status, 'grund', x.slut_grund, 'med', case when x.fra_lille = s.navn_lille then x.til else x.fra end,
                           'jeg_fra', x.fra_lille = s.navn_lille, 'stoppet_af', x.stoppet_af)
    into senest
    from hv_bytte x where (x.fra_lille = s.navn_lille or x.til_lille = s.navn_lille) and x.slut > now() - interval '20 seconds'
    order by x.slut desc limit 1;
  jeg_fra := b.id is not null and b.fra_lille = s.navn_lille;
  return json_build_object(
    'aktiv', case when b.id is null then null else json_build_object(
      'id', b.id, 'status', b.status, 'version', b.version, 'rum', b.rum,
      'med', case when jeg_fra then b.til else b.fra end,
      'jeg_ok', case when jeg_fra then b.fra_ok else b.til_ok end,
      'han_ok', case when jeg_fra then b.til_ok else b.fra_ok end,
      'mine', coalesce((select json_agg(json_build_object('id', t.id, 'type', t.type) order by t.id) from hv_bytte_ting t
                        where t.bytte_id = b.id and t.ejer_lille = s.navn_lille and not t.fjernet), '[]'::json),
      'hans', coalesce((select json_agg(json_build_object('id', t.id, 'type', t.type) order by t.id) from hv_bytte_ting t
                        where t.bytte_id = b.id and t.ejer_lille <> s.navn_lille and not t.fjernet), '[]'::json)) end,
    'invitationer', coalesce((select json_agg(json_build_object('id', i.id, 'fra', i.fra) order by i.id) from hv_bytte i
                              where i.status = 'inviteret' and i.til_lille = s.navn_lille), '[]'::json),
    'senest', senest,
    'straf', hv_bytte_straf(s.navn),
    'leveringer', (select count(*) from hv_bytte_leveringer where navn_lille = s.navn_lille and hentet is null));
end $$;

-- 📦 Møbler på vej til Mine ting
create or replace function public.hv_bytte_leveringer_hent(p_token uuid)
returns json language plpgsql security definer set search_path = public as $$
declare s hv_spillere;
begin
  select * into s from hv_spillere where token = p_token;
  if s.id is null then raise exception 'Du er ikke logget ind.'; end if;
  return coalesce((select json_agg(json_build_object('id', l.id, 'type', l.type, 'grund', l.grund) order by l.id)
    from hv_bytte_leveringer l where l.navn_lille = s.navn_lille and l.hentet is null), '[]'::json);
end $$;

-- ✔ "Jeg har lagt dem i Mine ting" — giver de id'er tilbage, der faktisk blev hentet nu (så intet kommer to gange)
create or replace function public.hv_bytte_leveringer_kvit(p_token uuid, p_ids bigint[])
returns json language plpgsql security definer set search_path = public as $$
declare s hv_spillere; ud json;
begin
  select * into s from hv_spillere where token = p_token;
  if s.id is null then raise exception 'Du er ikke logget ind.'; end if;
  with u as (
    update hv_bytte_leveringer set hentet = now()
    where navn_lille = s.navn_lille and hentet is null and id = any(coalesce(p_ids, '{}'::bigint[]))
    returning id)
  select json_agg(u.id) into ud from u;
  return coalesce(ud, '[]'::json);
end $$;

-- 👑 Bytte-loggen (ejeren og MOD)
create or replace function public.hv_bytte_log(p_token uuid, p_navn text, p_antal integer)
returns json language plpgsql security definer set search_path = public as $$
declare s hv_spillere; q text := lower(trim(coalesce(p_navn, '')));
begin
  select * into s from hv_spillere where token = p_token;
  if s.id is null then raise exception 'Du er ikke logget ind.'; end if;
  if not hv_er_mod(s.navn) then raise exception 'Kun ejeren og MOD kan se bytte-loggen.'; end if;
  perform hv_bytte_ryd();
  return json_build_object(
    'i_alt', (select count(*) from hv_bytte where status = 'byttet'),
    'i_gang', (select count(*) from hv_bytte where status in ('inviteret', 'aaben')),
    'i_dag', (select count(*) from hv_bytte where status = 'byttet' and slut > date_trunc('day', now())),
    'linjer', coalesce((select json_agg(json_build_object(
        'id', b.id, 'fra', b.fra, 'til', b.til, 'rum', b.rum, 'status', b.status, 'grund', b.slut_grund, 'stoppet_af', b.stoppet_af,
        'oprettet', (extract(epoch from b.oprettet) * 1000)::bigint,
        'slut', (extract(epoch from b.slut) * 1000)::bigint,
        'fra_ting', coalesce((select json_agg(t.type order by t.id) from hv_bytte_ting t where t.bytte_id = b.id and t.ejer_lille = b.fra_lille and not t.fjernet), '[]'::json),
        'til_ting', coalesce((select json_agg(t.type order by t.id) from hv_bytte_ting t where t.bytte_id = b.id and t.ejer_lille = b.til_lille and not t.fjernet), '[]'::json))
      order by b.id desc)
      from (select * from hv_bytte where q = '' or fra_lille like '%' || q || '%' or til_lille like '%' || q || '%'
            order by id desc limit greatest(10, least(coalesce(p_antal, 100), 500))) b), '[]'::json));
end $$;

-- 👑 Stop et bytte (ejeren og MOD). Begge får deres egne møbler tilbage.
create or replace function public.hv_bytte_ejer_stop(p_token uuid, p_id bigint)
returns void language plpgsql security definer set search_path = public as $$
declare s hv_spillere;
begin
  select * into s from hv_spillere where token = p_token;
  if s.id is null then raise exception 'Du er ikke logget ind.'; end if;
  if not hv_er_mod(s.navn) then raise exception 'Kun ejeren og MOD kan stoppe et bytte.'; end if;
  perform hv_bytte_stop(p_id, 'stoppet', 'Stoppet af ' || s.navn || '.', s.navn);
end $$;

grant execute on function public.hv_bytte_inviter(uuid, text) to anon, authenticated;
grant execute on function public.hv_bytte_svar(uuid, bigint, boolean) to anon, authenticated;
grant execute on function public.hv_bytte_laeg(uuid, bigint, text) to anon, authenticated;
grant execute on function public.hv_bytte_fjern(uuid, bigint, bigint) to anon, authenticated;
grant execute on function public.hv_bytte_godkend(uuid, bigint, boolean, integer) to anon, authenticated;
grant execute on function public.hv_bytte_annuller(uuid, bigint) to anon, authenticated;
grant execute on function public.hv_bytte_hent(uuid) to anon, authenticated;
grant execute on function public.hv_bytte_leveringer_hent(uuid) to anon, authenticated;
grant execute on function public.hv_bytte_leveringer_kvit(uuid, bigint[]) to anon, authenticated;
grant execute on function public.hv_bytte_log(uuid, text, integer) to anon, authenticated;
grant execute on function public.hv_bytte_ejer_stop(uuid, bigint) to anon, authenticated;
revoke execute on function public.hv_bytte_straf(text) from public, anon, authenticated;
revoke execute on function public.hv_bytte_stop(bigint, text, text, text) from public, anon, authenticated;
revoke execute on function public.hv_bytte_ryd() from public, anon, authenticated;
notify pgrst, 'reload schema';

-- HELLO VERA, del 61: 🎡 Vera Festival — det store udendørs festivalområde
-- - Ejeren, Eventværter og Eventfolk styrer festivalen fra telefon-appen "Festival":
--   scenelys, lys på hver bod, lyskæder, lygtepæle, springvandet, himlen, effekter, de 3 skærme, skilt og nedtælling.
-- - Serveren husker det hele, så alle på festivalen ser det samme.
-- - Festivalprogrammet (arrangementer med dato og tid) kan alle se i appen "Vera Festival".
-- - Ejeren og Bygmestre kan også flytte møblerne på festivalpladsen.
-- Kør database-21-eventnoter-vindere.sql FØRST (den laver hv_maa_skrive_events). Det er den allerede.
-- Kopiér ALT herfra → Supabase → SQL Editor → + New query → Run. Må gerne køres flere gange.

create table if not exists public.hv_festival (
  rum text primary key,
  tilstand jsonb not null default '{}'::jsonb,
  hvem text,
  tid timestamptz not null default now()
);
alter table public.hv_festival enable row level security;
revoke all on public.hv_festival from anon, authenticated;

-- Alle kan se festivalens lys osv. (og få serverens ur med, så YouTube starter samme sted hos alle)
create or replace function public.hv_festival_hent(p_rum text)
returns json language plpgsql security definer set search_path = public as $$
declare t jsonb;
begin
  select tilstand into t from hv_festival where rum = p_rum;
  return json_build_object('nu', (extract(epoch from now()) * 1000)::bigint, 'tilstand', coalesce(t, '{}'::jsonb));
end $$;

-- Ejeren, Eventværter og Eventfolk ændrer en eller flere ting ad gangen
create or replace function public.hv_festival_saet(p_token uuid, p_rum text, p_del jsonb)
returns json language plpgsql security definer set search_path = public as $$
declare s hv_spillere; t jsonb; nu bigint := (extract(epoch from now()) * 1000)::bigint;
  sk jsonb; id text; ids text[]; gl jsonb; v text; tekst text; lysene text[] := array['slukket', 'varm', 'rosa', 'guld', 'regnbue', 'blink'];
begin
  select * into s from hv_spillere where token = p_token;
  if s.id is null then raise exception 'Du er ikke logget ind.'; end if;
  if not hv_maa_skrive_events(s.navn) then raise exception 'Kun ejeren, Eventværter og Eventfolk kan styre Vera Festival.'; end if;
  select tilstand into t from hv_festival where rum = p_rum for update;
  t := coalesce(t, '{}'::jsonb);

  if p_del ? 'scene' then
    if p_del->>'scene' not in ('slukket', 'varm', 'show', 'spots', 'disko', 'puls', 'regnbue', 'strobe') then raise exception 'Ukendt scenelys.'; end if;
    t := t || jsonb_build_object('scene', p_del->>'scene');
  end if;
  if p_del ? 'effekter' then
    t := t || jsonb_build_object('effekter', coalesce((select jsonb_object_agg(e.noegle, true) from jsonb_each(p_del->'effekter') e(noegle, vaerdi)
      where e.noegle in ('roeg', 'konfetti', 'bobler', 'ild', 'fyrvaerkeri', 'sne', 'hjerter', 'glitter') and e.vaerdi = 'true'::jsonb), '{}'::jsonb));
  end if;
  if p_del ? 'himmel' then
    if p_del->>'himmel' not in ('dag', 'solnedgang', 'aften', 'nat') then raise exception 'Ukendt himmel.'; end if;
    t := t || jsonb_build_object('himmel', p_del->>'himmel');
  end if;
  if p_del ? 'kaeder' then
    if not (p_del->>'kaeder' = any(lysene)) then raise exception 'Ukendt lys.'; end if;
    t := t || jsonb_build_object('kaeder', p_del->>'kaeder');
  end if;
  if p_del ? 'lamper' then
    t := t || jsonb_build_object('lamper', coalesce((p_del->>'lamper')::boolean, true));
  end if;
  if p_del ? 'springvand' then
    if p_del->>'springvand' not in ('slukket', 'rosa', 'guld', 'regnbue') then raise exception 'Ukendt lys.'; end if;
    t := t || jsonb_build_object('springvand', p_del->>'springvand');
  end if;
  if p_del ? 'boder' then
    -- lyset på hver slags bod: {"fe-bod-mad": "rosa", ...}
    t := t || jsonb_build_object('boder', coalesce(t->'boder', '{}'::jsonb) || coalesce((select jsonb_object_agg(e.noegle, e.vaerdi)
      from jsonb_each(p_del->'boder') e(noegle, vaerdi)
      where e.noegle in ('fe-bod-mad', 'fe-bod-drinks', 'fe-bod-slik', 'fe-bod-spil') and (e.vaerdi #>> '{}') = any(lysene)), '{}'::jsonb));
  end if;
  if p_del ? 'skilt' then
    tekst := left(trim(coalesce(p_del->>'skilt', '')), 80);
    t := t || jsonb_build_object('skilt', case when tekst = '' then null else jsonb_build_object('tekst', tekst, 'tid', nu, 'af', s.navn) end);
  end if;
  if p_del ? 'nedtael' then
    t := t || jsonb_build_object('nedtael', case when coalesce((p_del->>'nedtael')::int, 0) <= 0 then 0
      else nu + least((p_del->>'nedtael')::int, 30) * 1000 end);
  end if;
  if p_del ? 'skaerm' then
    sk := p_del->'skaerm';
    id := coalesce(sk->>'id', 'midt');
    if id = 'alle' then ids := array['midt', 'venstre', 'hoejre'];
    elsif id in ('midt', 'venstre', 'hoejre') then ids := array[id];
    else raise exception 'Ukendt skærm.'; end if;
    v := nullif(sk->>'v', '');
    if v is not null and v !~ '^[A-Za-z0-9_-]{11}$' then raise exception 'Det ligner ikke et YouTube-link.'; end if;
    tekst := left(trim(coalesce(sk->>'tekst', '')), 60);
    foreach id in array ids loop
      gl := coalesce(t->'skaerme'->id, '{}'::jsonb);
      t := jsonb_set(t || jsonb_build_object('skaerme', coalesce(t->'skaerme', '{}'::jsonb)), array['skaerme', id],
        jsonb_build_object('v', v, 'tekst', tekst, 't', nu, 'n', coalesce((gl->>'n')::int, 0) + 1, 'af', s.navn), true);
    end loop;
  end if;

  insert into hv_festival (rum, tilstand, hvem) values (left(p_rum, 40), t, s.navn)
  on conflict (rum) do update set tilstand = excluded.tilstand, hvem = excluded.hvem, tid = now();
  return json_build_object('nu', nu, 'tilstand', t);
end $$;

revoke all on function public.hv_festival_hent from public;
revoke all on function public.hv_festival_saet from public;
grant execute on function public.hv_festival_hent to anon, authenticated;
grant execute on function public.hv_festival_saet to anon, authenticated;

-- 📅 Festivalprogrammet
create table if not exists public.hv_festival_program (
  id serial primary key,
  titel text not null,
  om text,
  emoji text,
  sted text not null default 'hele',
  start timestamptz not null,
  slut timestamptz,
  aflyst boolean not null default false,
  af text,
  oprettet timestamptz not null default now()
);
alter table public.hv_festival_program enable row level security;
revoke all on public.hv_festival_program from anon, authenticated;

-- Alle kan se programmet: det der er i gang/kommer, og de sidste 2 dages arrangementer
create or replace function public.hv_festival_program_hent()
returns json language sql security definer set search_path = public as $$
  select coalesce(json_agg(json_build_object('id', p.id, 'titel', p.titel, 'om', p.om, 'emoji', p.emoji, 'sted', p.sted,
    'start', p.start, 'slut', p.slut, 'aflyst', p.aflyst, 'af', p.af) order by p.start), '[]'::json)
  from (select * from hv_festival_program where coalesce(slut, start + interval '1 hour') > now() - interval '2 days'
        order by start limit 200) p;
$$;

-- Ejeren, Eventværter og Eventfolk laver eller retter et arrangement (p_id = null → nyt)
create or replace function public.hv_festival_program_gem(p_token uuid, p_id int, p_titel text, p_om text, p_emoji text,
  p_sted text, p_start timestamptz, p_slut timestamptz)
returns json language plpgsql security definer set search_path = public as $$
declare s hv_spillere; nyt int;
begin
  select * into s from hv_spillere where token = p_token;
  if s.id is null then raise exception 'Du er ikke logget ind.'; end if;
  if not hv_maa_skrive_events(s.navn) then raise exception 'Kun ejeren, Eventværter og Eventfolk kan lave festivalprogrammet.'; end if;
  if coalesce(trim(p_titel), '') = '' then raise exception 'Skriv en titel.'; end if;
  if p_start is null then raise exception 'Vælg dato og tid.'; end if;
  if p_slut is not null and p_slut <= p_start then raise exception 'Slut skal være efter start.'; end if;
  if coalesce(p_sted, 'hele') not in ('scene', 'spil', 'gaden', 'oplevelse', 'hele') then raise exception 'Ukendt sted.'; end if;
  if p_id is null then
    insert into hv_festival_program (titel, om, emoji, sted, start, slut, af)
    values (left(trim(p_titel), 60), left(trim(coalesce(p_om, '')), 300), left(coalesce(p_emoji, '🎉'), 8), coalesce(p_sted, 'hele'), p_start, p_slut, s.navn)
    returning id into nyt;
  else
    update hv_festival_program set titel = left(trim(p_titel), 60), om = left(trim(coalesce(p_om, '')), 300),
      emoji = left(coalesce(p_emoji, '🎉'), 8), sted = coalesce(p_sted, 'hele'), start = p_start, slut = p_slut, aflyst = false
    where id = p_id returning id into nyt;
    if nyt is null then raise exception 'Arrangementet findes ikke.'; end if;
  end if;
  return hv_festival_program_hent();
end $$;

-- Slet et arrangement fra programmet
create or replace function public.hv_festival_program_slet(p_token uuid, p_id int)
returns json language plpgsql security definer set search_path = public as $$
declare s hv_spillere;
begin
  select * into s from hv_spillere where token = p_token;
  if s.id is null then raise exception 'Du er ikke logget ind.'; end if;
  if not hv_maa_skrive_events(s.navn) then raise exception 'Kun ejeren, Eventværter og Eventfolk kan lave festivalprogrammet.'; end if;
  delete from hv_festival_program where id = p_id;
  return hv_festival_program_hent();
end $$;

revoke all on function public.hv_festival_program_hent from public;
revoke all on function public.hv_festival_program_gem from public;
revoke all on function public.hv_festival_program_slet from public;
grant execute on function public.hv_festival_program_hent to anon, authenticated;
grant execute on function public.hv_festival_program_gem to anon, authenticated;
grant execute on function public.hv_festival_program_slet to anon, authenticated;

-- Bygmestre og ejeren må også bygge på festivalpladsen (samme liste som før + 'festival')
create or replace function public.hv_rum_moebler_gem(p_token uuid, p_rum text, p_moebler jsonb)
returns void language plpgsql security definer set search_path = public as $$
declare s hv_spillere;
begin
  select * into s from hv_spillere where token = p_token;
  if s.id is null then raise exception 'Du er ikke logget ind.'; end if;
  if not hv_er_bygmester(s.navn) then raise exception 'Kun ejeren og Bygmestre kan bygge i de fælles rum.'; end if;
  if p_rum not in ('hal', 'hemmelig', 'biograf', 'postkontor', 'tagterrasse', 'cafe', 'spillehjoernet', 'laesehjoernet', 'museum',
                   'bioforhal', 'radio', 'lysreaktion', 'arena', 'festival') and p_rum !~ '^event[0-9]+$' and p_rum !~ '^gang[0-9]+$' then raise exception 'Man kan kun bygge i de fælles rum.'; end if;
  if jsonb_typeof(p_moebler) <> 'array' or jsonb_array_length(p_moebler) > 800 then raise exception 'For mange møbler.'; end if;
  insert into hv_rum_moebler (rum, moebler, hvem) values (p_rum, p_moebler, s.navn)
  on conflict (rum) do update set moebler = excluded.moebler, hvem = excluded.hvem, tid = now();
end $$;
revoke all on function public.hv_rum_moebler_gem from public;
grant execute on function public.hv_rum_moebler_gem to anon, authenticated;

notify pgrst, 'reload schema';

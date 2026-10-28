-- HELLO VERA, del 21: 📝 eventnoter, 🏆 vindere i højre side, 🎁 én gratis ting til vindere og fødselsdagsbørn,
-- 💎 en oversigt over hvem der har købt og vundet rares, og det nye skilt 🎪 Eventfolk.
-- Kør database-10-foedselsdage.sql FØRST. Kopiér ALT herfra → Supabase → SQL Editor → + New query → Run.
-- Må gerne køres flere gange.

create table if not exists public.hv_eventnoter (
  id bigint generated always as identity primary key,
  hvem text not null,
  event text,
  forloeb text,
  traels text,
  tid timestamptz not null default now()
);
create table if not exists public.hv_vindere (
  id bigint generated always as identity primary key,
  hvem text not null,
  event text,
  navne jsonb not null default '[]'::jsonb,   -- ["Ida", "Noah"]
  gevinst text,
  tid timestamptz not null default now()
);
-- Én række = én gratis ting, som en spiller kan vælge i shoppen (kun én gang)
create table if not exists public.hv_gevinster (
  id bigint generated always as identity primary key,
  noegle text unique not null,                 -- "v-12-ida" eller "fd-2026-ida", så man ikke får den to gange
  navn_lille text not null,
  navn text not null,
  grund text not null,                         -- "vinder" eller "foedselsdag"
  event text,
  vinder_id bigint,
  oprettet timestamptz not null default now(),
  brugt timestamptz,
  moebel text,
  moebel_navn text
);
create table if not exists public.hv_rare_log (
  id bigint generated always as identity primary key,
  navn text not null,
  moebel text not null,
  moebel_navn text,
  hvordan text not null,                       -- "koebt" eller "vundet"
  pris integer,
  tid timestamptz not null default now()
);
alter table public.hv_eventnoter enable row level security;
alter table public.hv_vindere enable row level security;
alter table public.hv_gevinster enable row level security;
alter table public.hv_rare_log enable row level security;
revoke all on public.hv_eventnoter, public.hv_vindere, public.hv_gevinster, public.hv_rare_log from anon, authenticated;

-- 🎪 Eventfolk er nu personale (Tilkald hjælp, Staff chat, læse eventnoter)
create or replace function public.hv_er_ansat(p_navn text)
returns boolean language sql stable security definer set search_path = public as $$
  select hv_er_ejer(p_navn) or exists (select 1 from hv_ansatte where navn_lille = lower(p_navn)
    and skilt in ('mod', 'staff', 'hjaelper', 'eventvaert', 'eventfolk', 'bygmester', 'support', 'content-creator'));
$$;

-- Må skrive eventnoter og vindere: ejeren, Eventværter og Eventfolk
create or replace function public.hv_maa_skrive_events(p_navn text)
returns boolean language sql stable security definer set search_path = public as $$
  select hv_er_eventvaert(p_navn) or exists (select 1 from hv_ansatte where navn_lille = lower(p_navn) and skilt = 'eventfolk');
$$;
revoke all on function public.hv_maa_skrive_events(text) from public, anon, authenticated;

-- 📝 Skriv en eventnote (ejeren, Eventværter og Eventfolk)
create or replace function public.hv_eventnote_skriv(p_token uuid, p_event text, p_forloeb text, p_traels text)
returns void language plpgsql security definer set search_path = public as $$
declare s hv_spillere;
begin
  select * into s from hv_spillere where token = p_token;
  if s.id is null then raise exception 'Du er ikke logget ind.'; end if;
  if not hv_maa_skrive_events(s.navn) then raise exception 'Kun ejeren, Eventværter og Eventfolk kan skrive eventnoter.'; end if;
  if coalesce(trim(p_forloeb), '') = '' and coalesce(trim(p_traels), '') = '' then raise exception 'Skriv hvordan eventet gik.'; end if;
  insert into hv_eventnoter (hvem, event, forloeb, traels)
  values (s.navn, left(trim(coalesce(p_event, '')), 80), left(coalesce(p_forloeb, ''), 3000), left(coalesce(p_traels, ''), 1000));
end $$;

-- Slet en eventnote (ejeren, eller den der skrev den)
create or replace function public.hv_eventnote_slet(p_token uuid, p_id bigint)
returns void language plpgsql security definer set search_path = public as $$
declare s hv_spillere;
begin
  select * into s from hv_spillere where token = p_token;
  if s.id is null then raise exception 'Du er ikke logget ind.'; end if;
  delete from hv_eventnoter where id = p_id and (hv_er_ejer(s.navn) or lower(hvem) = s.navn_lille);
  if not found then raise exception 'Du kan kun slette dine egne noter.'; end if;
end $$;

-- Alle eventnoter (ejeren og alle ansatte kan læse dem)
create or replace function public.hv_eventnoter_hent(p_token uuid)
returns json language plpgsql security definer set search_path = public as $$
declare s hv_spillere;
begin
  select * into s from hv_spillere where token = p_token;
  if s.id is null then raise exception 'Du er ikke logget ind.'; end if;
  if not hv_er_ansat(s.navn) then raise exception 'Kun ejeren og de ansatte kan læse eventnoterne.'; end if;
  return coalesce((select json_agg(json_build_object('id', id, 'hvem', hvem, 'event', event, 'forloeb', forloeb, 'traels', traels, 'tid', tid) order by id desc)
    from (select * from hv_eventnoter order by id desc limit 200) n), '[]'::json);
end $$;

-- 🏆 Skriv vinderne ind (ejeren, Eventværter og Eventfolk). Hver vinder får én gratis ting.
create or replace function public.hv_vindere_saet(p_token uuid, p_event text, p_navne text, p_gevinst text)
returns json language plpgsql security definer set search_path = public as $$
declare s hv_spillere; v_id bigint; v_navne jsonb := '[]'::jsonb; v_ukendte text[] := '{}'; n text; o hv_spillere;
begin
  select * into s from hv_spillere where token = p_token;
  if s.id is null then raise exception 'Du er ikke logget ind.'; end if;
  if not hv_maa_skrive_events(s.navn) then raise exception 'Kun ejeren, Eventværter og Eventfolk kan skrive vindere ind.'; end if;
  foreach n in array regexp_split_to_array(coalesce(p_navne, ''), '\s*[,;\n]\s*') loop
    n := trim(n);
    if n = '' then continue; end if;
    select * into o from hv_spillere where navn_lille = lower(n);
    if o.id is null then v_ukendte := v_ukendte || n; continue; end if;
    if not v_navne ? o.navn then v_navne := v_navne || to_jsonb(o.navn); end if;
  end loop;
  if array_length(v_ukendte, 1) > 0 then
    raise exception 'Der findes ingen spiller, der hedder %.', array_to_string(v_ukendte, ', ');
  end if;
  if jsonb_array_length(v_navne) = 0 then raise exception 'Skriv mindst én vinder.'; end if;
  insert into hv_vindere (hvem, event, navne, gevinst)
  values (s.navn, left(trim(coalesce(p_event, '')), 80), v_navne, left(trim(coalesce(p_gevinst, '')), 200)) returning id into v_id;
  insert into hv_gevinster (noegle, navn_lille, navn, grund, event, vinder_id)
  select 'v-' || v_id || '-' || lower(x), lower(x), x, 'vinder', left(trim(coalesce(p_event, '')), 80), v_id
  from jsonb_array_elements_text(v_navne) x
  on conflict (noegle) do nothing;
  return json_build_object('id', v_id, 'navne', v_navne);
end $$;

-- Fjern en vinder-boks (ejeren, Eventværter og Eventfolk). Gratis ting, der ikke er valgt endnu, forsvinder også.
create or replace function public.hv_vinder_slet(p_token uuid, p_id bigint)
returns void language plpgsql security definer set search_path = public as $$
declare s hv_spillere;
begin
  select * into s from hv_spillere where token = p_token;
  if s.id is null then raise exception 'Du er ikke logget ind.'; end if;
  if not hv_maa_skrive_events(s.navn) then raise exception 'Kun ejeren, Eventværter og Eventfolk kan fjerne vindere.'; end if;
  delete from hv_gevinster where vinder_id = p_id and brugt is null;
  delete from hv_vindere where id = p_id;
end $$;

-- Til alle: de nyeste vindere (fra de sidste 7 dage) og mine gratis ting, der ikke er valgt endnu.
-- Har man fødselsdag i dag, får man også en gratis ting (én om året).
create or replace function public.hv_vindere_hent(p_token uuid)
returns json language plpgsql security definer set search_path = public as $$
declare s hv_spillere; v_dag text := to_char(now() at time zone 'Europe/Copenhagen', 'MM-DD');
begin
  select * into s from hv_spillere where token = p_token;
  if s.id is null then raise exception 'Du er ikke logget ind.'; end if;
  if s.foedselsdag = v_dag then
    insert into hv_gevinster (noegle, navn_lille, navn, grund)
    values ('fd-' || to_char(now() at time zone 'Europe/Copenhagen', 'YYYY') || '-' || s.navn_lille, s.navn_lille, s.navn, 'foedselsdag')
    on conflict (noegle) do nothing;
  end if;
  return json_build_object(
    'vindere', coalesce((select json_agg(json_build_object('id', id, 'hvem', hvem, 'event', event, 'navne', navne, 'gevinst', gevinst, 'tid', tid) order by id desc)
      from (select * from hv_vindere where tid > now() - interval '7 days' order by id desc limit 5) v), '[]'::json),
    'gevinster', coalesce((select json_agg(json_build_object('id', id, 'grund', grund, 'event', event, 'oprettet', oprettet) order by id)
      from hv_gevinster where navn_lille = s.navn_lille and brugt is null), '[]'::json),
    'foedselsdag', s.foedselsdag = v_dag);
end $$;

-- 🎁 Vælg sin gratis ting. Kan kun ske én gang pr. gevinst.
create or replace function public.hv_gevinst_brug(p_token uuid, p_id bigint, p_moebel text, p_moebel_navn text, p_rare boolean)
returns void language plpgsql security definer set search_path = public as $$
declare s hv_spillere;
begin
  select * into s from hv_spillere where token = p_token;
  if s.id is null then raise exception 'Du er ikke logget ind.'; end if;
  if coalesce(p_moebel, '') = '' then raise exception 'Vælg en ting.'; end if;
  update hv_gevinster set brugt = now(), moebel = left(p_moebel, 80), moebel_navn = left(coalesce(p_moebel_navn, ''), 80)
  where id = p_id and navn_lille = s.navn_lille and brugt is null;
  if not found then raise exception 'Du har allerede valgt din gratis ting 🎁'; end if;
  if p_rare then
    insert into hv_rare_log (navn, moebel, moebel_navn, hvordan) values (s.navn, left(p_moebel, 80), left(coalesce(p_moebel_navn, ''), 80), 'vundet');
  end if;
end $$;

-- 💎 Skriv ned, at man har købt en rare i shoppen
create or replace function public.hv_rare_koebt(p_token uuid, p_moebel text, p_moebel_navn text, p_pris integer)
returns void language plpgsql security definer set search_path = public as $$
declare s hv_spillere;
begin
  select * into s from hv_spillere where token = p_token;
  if s.id is null then raise exception 'Du er ikke logget ind.'; end if;
  insert into hv_rare_log (navn, moebel, moebel_navn, hvordan, pris)
  values (s.navn, left(coalesce(p_moebel, ''), 80), left(coalesce(p_moebel_navn, ''), 80), 'koebt', p_pris);
end $$;

-- 💎 Oversigten over rares og gevinster (kun ejeren)
create or replace function public.hv_rares_oversigt(p_token uuid)
returns json language plpgsql security definer set search_path = public as $$
declare s hv_spillere;
begin
  select * into s from hv_spillere where token = p_token;
  if s.id is null then raise exception 'Du er ikke logget ind.'; end if;
  if not hv_er_ejer(s.navn) then raise exception 'Kun hotellets ejer kan se, hvem der har rares.'; end if;
  return json_build_object(
    'rares', coalesce((select json_agg(json_build_object('navn', navn, 'moebel', moebel, 'moebel_navn', moebel_navn, 'hvordan', hvordan, 'pris', pris, 'tid', tid) order by id desc)
      from (select * from hv_rare_log order by id desc limit 500) r), '[]'::json),
    'gevinster', coalesce((select json_agg(json_build_object('navn', navn, 'grund', grund, 'event', event, 'oprettet', oprettet, 'brugt', brugt, 'moebel_navn', moebel_navn) order by id desc)
      from (select * from hv_gevinster order by id desc limit 300) g), '[]'::json));
end $$;

revoke all on function public.hv_eventnote_skriv, public.hv_eventnote_slet, public.hv_eventnoter_hent, public.hv_vindere_saet,
  public.hv_vinder_slet, public.hv_vindere_hent, public.hv_gevinst_brug, public.hv_rare_koebt, public.hv_rares_oversigt from public;
grant execute on function public.hv_eventnote_skriv, public.hv_eventnote_slet, public.hv_eventnoter_hent, public.hv_vindere_saet,
  public.hv_vinder_slet, public.hv_vindere_hent, public.hv_gevinst_brug, public.hv_rare_koebt, public.hv_rares_oversigt to anon, authenticated;

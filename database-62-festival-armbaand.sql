-- HELLO VERA, del 62: 🎟 Festival-armbånd til Vera Festival
-- - Gæsterne køber et armbånd i appen "Vera Festival" (prisen bestemmer ejeren, fx 10 Glimt). 1 armbånd pr. person pr. festival.
-- - Armbåndet har en kode og en stregkode. En Festival-vagt (eller ejeren/de ansatte) scanner det ved indgangen.
-- - Uden scannet armbånd kommer man ikke længere ind end indgangen (eller kun ikke foran scenen, hvis ejeren vælger det).
-- - Ejeren, Eventværter og Eventfolk sætter pris, åbner/lukker salget, vælger hvor man skal have armbånd, og ser hvor mange der er solgt.
-- - Nyt job/skilt: Festival-vagt (scanner armbånd, tæller som ansat: løn, Staff chat, vagtskema).
-- Kør database-61-vera-festival.sql FØRST.
-- Kopiér ALT herfra → Supabase → SQL Editor → + New query → Run. Må gerne køres flere gange.

-- Indstillingerne (én række)
create table if not exists public.hv_festival_salg (
  id int primary key default 1 check (id = 1),
  pris int not null default 10,
  salg boolean not null default true,          -- kan man købe armbånd lige nu?
  kraev text not null default 'hele',          -- 'fra' = alle må komme ind, 'hele' = armbånd til hele festivalen, 'scene' = kun foran scenen
  maks int,                                    -- højst så mange armbånd (null = ingen grænse)
  runde int not null default 1,                -- festival nr. (en ny festival = nye armbånd)
  hvem text,
  tid timestamptz not null default now()
);
insert into public.hv_festival_salg (id) values (1) on conflict (id) do nothing;
alter table public.hv_festival_salg enable row level security;
revoke all on public.hv_festival_salg from anon, authenticated;

create table if not exists public.hv_festival_armbaand (
  id bigserial primary key,
  runde int not null,
  spiller_id bigint not null,
  spiller text not null,
  pris int not null default 0,
  kode text unique,
  koebt timestamptz not null default now(),
  scannet timestamptz,
  scannet_af text,
  unique (runde, spiller_id)
);
alter table public.hv_festival_armbaand enable row level security;
revoke all on public.hv_festival_armbaand from anon, authenticated;

-- Ny kode (6 tegn 0-9 og A-F, så den kan stå i en stregkode). Starter altid med F, så den ikke forveksles med en biografbillet.
create or replace function public.hv_festival_ny_kode()
returns text language plpgsql volatile set search_path = public as $$
declare k text;
begin
  loop
    k := 'F' || upper(substr(md5(random()::text || clock_timestamp()::text), 1, 5));
    exit when not exists (select 1 from hv_festival_armbaand where kode = k);
  end loop;
  return k;
end $$;

create or replace function public.hv_festival_salg_json()
returns json language sql stable security definer set search_path = public as $$
  select json_build_object('pris', s.pris, 'salg', s.salg, 'kraev', s.kraev, 'maks', s.maks, 'runde', s.runde,
    'solgt', (select count(*) from hv_festival_armbaand a where a.runde = s.runde),
    'scannet', (select count(*) from hv_festival_armbaand a where a.runde = s.runde and a.scannet is not null))
  from hv_festival_salg s where s.id = 1;
$$;

create or replace function public.hv_festival_armbaand_json(a hv_festival_armbaand)
returns json language sql stable set search_path = public as $$
  select json_build_object('id', a.id, 'runde', a.runde, 'spiller', a.spiller, 'pris', a.pris, 'kode', a.kode,
    'koebt', (extract(epoch from a.koebt) * 1000)::bigint,
    'scannet', case when a.scannet is null then null else (extract(epoch from a.scannet) * 1000)::bigint end, 'scannet_af', a.scannet_af);
$$;

-- Alle: indstillingerne + mit eget armbånd (til denne festival)
create or replace function public.hv_festival_armbaand_hent(p_token uuid)
returns json language plpgsql security definer set search_path = public as $$
declare s hv_spillere; a hv_festival_armbaand;
begin
  if p_token is not null then select * into s from hv_spillere where token = p_token; end if;
  if s.id is not null then
    select * into a from hv_festival_armbaand where spiller_id = s.id and runde = (select runde from hv_festival_salg where id = 1);
  end if;
  return json_build_object('nu', (extract(epoch from now()) * 1000)::bigint, 'salg', hv_festival_salg_json(),
    'mit', case when a.id is null then null else hv_festival_armbaand_json(a) end);
end $$;

-- Køb et armbånd
create or replace function public.hv_festival_armbaand_koeb(p_token uuid)
returns json language plpgsql security definer set search_path = public as $$
declare s hv_spillere; st hv_festival_salg; a hv_festival_armbaand;
begin
  select * into s from hv_spillere where token = p_token for update;
  if s.id is null then raise exception 'Du er ikke logget ind.'; end if;
  select * into st from hv_festival_salg where id = 1 for update;
  if not st.salg then raise exception 'Der sælges ikke armbånd lige nu.'; end if;
  if exists (select 1 from hv_festival_armbaand where spiller_id = s.id and runde = st.runde) then
    raise exception 'Du har allerede et armbånd til festivalen.';
  end if;
  if st.maks is not null and (select count(*) from hv_festival_armbaand where runde = st.runde) >= st.maks then
    raise exception 'Armbåndene er udsolgt.';
  end if;
  if coalesce(s.glimt, 0) < st.pris then raise exception 'Du har ikke nok Glimt. Et armbånd koster % Glimt.', st.pris; end if;
  insert into hv_festival_armbaand (runde, spiller_id, spiller, pris, kode)
  values (st.runde, s.id, s.navn, st.pris, hv_festival_ny_kode()) returning * into a;
  update hv_spillere set glimt = coalesce(glimt, 0) - st.pris where id = s.id returning * into s;
  return json_build_object('nu', (extract(epoch from now()) * 1000)::bigint, 'salg', hv_festival_salg_json(),
    'mit', hv_festival_armbaand_json(a), 'glimt', coalesce(s.glimt, 0), 'stella', coalesce(s.stella, 0));
end $$;

-- Ejeren, Eventværter og Eventfolk: pris, salg, hvor man skal have armbånd, højst antal, ny festival
create or replace function public.hv_festival_salg_saet(p_token uuid, p_del jsonb)
returns json language plpgsql security definer set search_path = public as $$
declare s hv_spillere;
begin
  select * into s from hv_spillere where token = p_token;
  if s.id is null then raise exception 'Du er ikke logget ind.'; end if;
  if not hv_maa_skrive_events(s.navn) then raise exception 'Kun ejeren, Eventværter og Eventfolk kan ændre armbåndene.'; end if;
  if p_del ? 'pris' then
    update hv_festival_salg set pris = greatest(0, least(10000, coalesce(round((p_del->>'pris')::numeric)::int, 10))) where id = 1;
  end if;
  if p_del ? 'salg' then update hv_festival_salg set salg = coalesce((p_del->>'salg')::boolean, true) where id = 1; end if;
  if p_del ? 'kraev' then
    if p_del->>'kraev' not in ('fra', 'hele', 'scene') then raise exception 'Ukendt valg.'; end if;
    update hv_festival_salg set kraev = p_del->>'kraev' where id = 1;
  end if;
  if p_del ? 'maks' then
    update hv_festival_salg set maks = case when coalesce(p_del->>'maks', '') = '' or (p_del->>'maks')::numeric <= 0 then null
      else least(100000, round((p_del->>'maks')::numeric)::int) end where id = 1;
  end if;
  if coalesce((p_del->>'ny')::boolean, false) then update hv_festival_salg set runde = runde + 1 where id = 1; end if;
  update hv_festival_salg set hvem = s.navn, tid = now() where id = 1;
  return hv_festival_personale(p_token);
end $$;

-- Ejeren og de ansatte (fx Festival-vagter): alle armbånd til denne festival
create or replace function public.hv_festival_personale(p_token uuid)
returns json language plpgsql security definer set search_path = public as $$
declare s hv_spillere; r int;
begin
  select * into s from hv_spillere where token = p_token;
  if s.id is null then raise exception 'Du er ikke logget ind.'; end if;
  if not (hv_er_ansat(s.navn) or hv_maa_skrive_events(s.navn)) then raise exception 'Kun ejeren og de ansatte kan se armbåndene.'; end if;
  select runde into r from hv_festival_salg where id = 1;
  return json_build_object('nu', (extract(epoch from now()) * 1000)::bigint, 'salg', hv_festival_salg_json(),
    'armbaand', coalesce((select json_agg(hv_festival_armbaand_json(a) order by a.id desc) from hv_festival_armbaand a where a.runde = r), '[]'::json),
    'glimt_ialt', (select coalesce(sum(pris), 0) from hv_festival_armbaand where runde = r));
end $$;

-- 📟 Scan et armbånd (ejeren og de ansatte)
create or replace function public.hv_festival_scan(p_token uuid, p_kode text)
returns json language plpgsql security definer set search_path = public as $$
declare s hv_spillere; a hv_festival_armbaand; v_kode text; r int;
begin
  select * into s from hv_spillere where token = p_token;
  if s.id is null then raise exception 'Du er ikke logget ind.'; end if;
  if not (hv_er_ansat(s.navn) or hv_maa_skrive_events(s.navn)) then raise exception 'Kun ejeren og de ansatte kan scanne armbånd.'; end if;
  v_kode := upper(regexp_replace(coalesce(p_kode, ''), '[^0-9A-Za-z]', '', 'g'));
  if v_kode = '' then raise exception 'Skriv eller scan armbåndets kode.'; end if;
  select * into a from hv_festival_armbaand where kode = v_kode for update;
  if a.id is null then raise exception 'Ukendt armbånd (%). Tjek koden en gang til.', v_kode; end if;
  select runde into r from hv_festival_salg where id = 1;
  if a.runde <> r then raise exception 'Armbåndet er fra en tidligere festival.'; end if;
  if a.scannet is not null then
    return json_build_object('status', 'allerede', 'armbaand', hv_festival_armbaand_json(a));
  end if;
  update hv_festival_armbaand set scannet = now(), scannet_af = s.navn where id = a.id returning * into a;
  return json_build_object('status', 'ok', 'armbaand', hv_festival_armbaand_json(a));
end $$;

-- Fortryd en scanning
create or replace function public.hv_festival_scan_fortryd(p_token uuid, p_id bigint)
returns json language plpgsql security definer set search_path = public as $$
declare s hv_spillere;
begin
  select * into s from hv_spillere where token = p_token;
  if s.id is null then raise exception 'Du er ikke logget ind.'; end if;
  if not (hv_er_ansat(s.navn) or hv_maa_skrive_events(s.navn)) then raise exception 'Kun ejeren og de ansatte kan scanne armbånd.'; end if;
  update hv_festival_armbaand set scannet = null, scannet_af = null where id = p_id;
  return json_build_object('ok', true);
end $$;

-- Fjern et armbånd og giv gæsten sine Glimt tilbage (ejeren, Eventværter og Eventfolk)
create or replace function public.hv_festival_armbaand_fjern(p_token uuid, p_id bigint)
returns json language plpgsql security definer set search_path = public as $$
declare s hv_spillere; a hv_festival_armbaand;
begin
  select * into s from hv_spillere where token = p_token;
  if s.id is null then raise exception 'Du er ikke logget ind.'; end if;
  if not hv_maa_skrive_events(s.navn) then raise exception 'Kun ejeren, Eventværter og Eventfolk kan fjerne armbånd.'; end if;
  delete from hv_festival_armbaand where id = p_id returning * into a;
  if a.id is not null and a.pris > 0 then update hv_spillere set glimt = coalesce(glimt, 0) + a.pris where id = a.spiller_id; end if;
  return hv_festival_personale(p_token);
end $$;

revoke all on function public.hv_festival_ny_kode() from public, anon, authenticated;
revoke all on function public.hv_festival_salg_json, public.hv_festival_armbaand_json from public, anon, authenticated;
revoke all on function public.hv_festival_armbaand_hent, public.hv_festival_armbaand_koeb, public.hv_festival_salg_saet, public.hv_festival_personale,
  public.hv_festival_scan, public.hv_festival_scan_fortryd, public.hv_festival_armbaand_fjern from public;
grant execute on function public.hv_festival_armbaand_hent, public.hv_festival_armbaand_koeb, public.hv_festival_salg_saet, public.hv_festival_personale,
  public.hv_festival_scan, public.hv_festival_scan_fortryd, public.hv_festival_armbaand_fjern to anon, authenticated;

-- =============================================================
--  🎟 Nyt job/skilt: Festival-vagt (tæller som ansat: løn, Staff chat, vagtskema, armbåndsscanner)
--  (samme lister som i database-47, + 'festivalvagt')
-- =============================================================
create or replace function public.hv_er_ansat(p_navn text)
returns boolean language sql stable security definer set search_path = public as $$
  select hv_er_ejer(p_navn) or exists (select 1 from hv_ansatte where navn_lille = lower(p_navn)
    and skilt in ('mod', 'staff', 'hjaelper', 'eventvaert', 'eventfolk', 'bygmester', 'support', 'content-creator', 'radiovaert', 'biografhjaelper', 'festivalvagt'));
$$;

create or replace function public.hv_ansoeg(p_token uuid, p_navn text, p_kode text, p_stilling text,
  p_alder integer, p_online text, p_tekst text, p_erfaring text)
returns json language plpgsql security definer set search_path = public, extensions as $$
declare s hv_spillere;
begin
  if p_token is not null then select * into s from hv_spillere where token = p_token; end if;
  if s.id is null then
    select * into s from hv_spillere where navn_lille = lower(trim(coalesce(p_navn, '')));
    if s.id is null then raise exception 'Der er ingen profil med navnet "%". Opret dig først.', trim(coalesce(p_navn, '')); end if;
    if s.kode_hash <> crypt(coalesce(p_kode, ''), s.kode_hash) then
      perform pg_sleep(0.5);
      raise exception 'Forkert adgangskode.';
    end if;
  end if;
  if p_stilling not in ('mod', 'staff', 'hjaelper', 'eventvaert', 'bygmester', 'support', 'content-creator', 'radiovaert', 'biografhjaelper', 'festivalvagt') then
    raise exception 'Vælg den stilling, du vil søge.';
  end if;
  if length(trim(coalesce(p_tekst, ''))) < 30 then raise exception 'Skriv lidt mere om dig selv (mindst 30 tegn).'; end if;
  if (select count(*) from hv_ansoegninger where navn = s.navn and tid > now() - interval '1 day') >= 3 then
    raise exception 'Du har allerede sendt 3 ansøgninger i dag. Prøv igen i morgen.';
  end if;
  insert into hv_ansoegninger (navn, stilling, alder, online, tekst, erfaring)
  values (s.navn, p_stilling, case when p_alder between 5 and 120 then p_alder end, left(p_online, 60),
    left(trim(p_tekst), 2000), left(trim(coalesce(p_erfaring, '')), 1000));
  return json_build_object('navn', s.navn);
end $$;

notify pgrst, 'reload schema';

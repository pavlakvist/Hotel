-- HELLO VERA, del 45: 📻 Vera-radio
-- - Nyt job/skilt "Radiovært" (tæller som ansat: løn hver mandag, Staff chat, vagtskema, Tilkald hjælp).
-- - Man kan søge jobbet fra forsiden.
-- - Radioen: det der spilles (sange, optagede snak-klip, oplæst tekst eller et live-link) styres af
--   radioværterne og ejeren, og alle der lytter hører det samme på samme tid.
-- - Musikbibliotek, playlister, radioprogrammer, gemte udsendelser, antal lyttere og beskeder til værterne.
-- Kræver at database-4 (ansatte), database-15 (ansøgninger) og database-21 (eventfolk) er kørt.
-- Kopiér ALT herfra → Supabase → SQL Editor → + New query → Run. Må gerne køres flere gange.


-- =============================================================
--  🎙 Radiovært er personale
-- =============================================================
create or replace function public.hv_er_ansat(p_navn text)
returns boolean language sql stable security definer set search_path = public as $$
  select hv_er_ejer(p_navn) or exists (select 1 from hv_ansatte where navn_lille = lower(p_navn)
    and skilt in ('mod', 'staff', 'hjaelper', 'eventvaert', 'eventfolk', 'bygmester', 'support', 'content-creator', 'radiovaert'));
$$;

-- Må styre radioen: ejeren og radioværterne
create or replace function public.hv_er_radiovaert(p_navn text)
returns boolean language sql stable security definer set search_path = public as $$
  select hv_er_ejer(p_navn) or exists (select 1 from hv_ansatte where navn_lille = lower(p_navn) and skilt = 'radiovaert');
$$;
revoke all on function public.hv_er_radiovaert(text) from public, anon, authenticated;

-- Ansøgning fra forsiden: Radiovært kan nu også vælges
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
  if p_stilling not in ('mod', 'staff', 'hjaelper', 'eventvaert', 'bygmester', 'support', 'content-creator', 'radiovaert') then
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


-- =============================================================
--  📻 Tabellerne
-- =============================================================
-- Det der sker på radioen lige nu (kun én række)
create table if not exists public.hv_radio (
  id int primary key default 1 check (id = 1),
  live boolean not null default false,
  udsendelse bigint,                    -- den udsendelse, der bliver optaget lige nu
  titel text,
  emne text,
  vaerter text,
  program bigint,
  spor jsonb,                           -- det der spiller: {type, id, titel, kunstner, url, sek, tekst}
  spor_start timestamptz,               -- hvornår det startede (rykkes ved pause)
  pauset boolean not null default false,
  pause_pos double precision not null default 0,
  koe jsonb not null default '[]'::jsonb,   -- det der kommer bagefter
  gentag boolean not null default false,
  playliste bigint,
  opdateret timestamptz not null default now()
);
insert into public.hv_radio (id) values (1) on conflict (id) do nothing;

create table if not exists public.hv_radio_musik (
  id bigint generated always as identity primary key,
  titel text not null,
  kunstner text,
  url text not null,
  sek double precision not null default 0,
  af text,
  tid timestamptz not null default now()
);
create table if not exists public.hv_radio_playlister (
  id bigint generated always as identity primary key,
  navn text not null,
  spor jsonb not null default '[]'::jsonb,   -- liste af sange: [{type:'sang', id, titel, kunstner, url, sek}]
  af text,
  tid timestamptz not null default now()
);
create table if not exists public.hv_radio_klip (
  id bigint generated always as identity primary key,
  titel text,
  data text not null,                   -- lyden som data-adresse (optaget med mikrofonen)
  sek double precision not null default 0,
  af text,
  tid timestamptz not null default now()
);
create table if not exists public.hv_radio_programmer (
  id bigint generated always as identity primary key,
  titel text not null,
  om text,
  start timestamptz not null,
  slut timestamptz,
  vaerter text,
  emne text,                            -- næste emne / noter til værterne
  af text,
  tid timestamptz not null default now()
);
create table if not exists public.hv_radio_udsendelser (
  id bigint generated always as identity primary key,
  titel text,
  emne text,
  vaerter text,
  program bigint,
  start timestamptz not null default now(),
  slut timestamptz,
  log jsonb not null default '[]'::jsonb,   -- [{t: sekunder efter start, spor, fra}] eller {t, pause:true}
  lyttere int not null default 0
);
create table if not exists public.hv_radio_lyttere (
  navn_lille text primary key,
  navn text,
  sidst timestamptz not null default now()
);
create table if not exists public.hv_radio_beskeder (
  id bigint generated always as identity primary key,
  udsendelse bigint,
  fra text not null,
  tekst text not null,
  tid timestamptz not null default now()
);
alter table public.hv_radio enable row level security;
alter table public.hv_radio_musik enable row level security;
alter table public.hv_radio_playlister enable row level security;
alter table public.hv_radio_klip enable row level security;
alter table public.hv_radio_programmer enable row level security;
alter table public.hv_radio_udsendelser enable row level security;
alter table public.hv_radio_lyttere enable row level security;
alter table public.hv_radio_beskeder enable row level security;
revoke all on public.hv_radio, public.hv_radio_musik, public.hv_radio_playlister, public.hv_radio_klip,
  public.hv_radio_programmer, public.hv_radio_udsendelser, public.hv_radio_lyttere, public.hv_radio_beskeder from anon, authenticated;


-- =============================================================
--  Hjælpere (kun til brug inde i databasen)
-- =============================================================
-- Hvem er logget ind med denne token, og må de styre radioen?
create or replace function public.hv_radio_vaert(p_token uuid)
returns hv_spillere language plpgsql stable security definer set search_path = public as $$
declare s hv_spillere;
begin
  select * into s from hv_spillere where token = p_token;
  if s.id is null then raise exception 'Du er ikke logget ind.'; end if;
  if not hv_er_radiovaert(s.navn) then raise exception 'Kun radioværter og ejeren kan styre Vera-radio.'; end if;
  return s;
end $$;

-- Skriv i optagelsen af den udsendelse, der er live lige nu
create or replace function public.hv_radio_log(p_ting jsonb)
returns void language plpgsql security definer set search_path = public as $$
declare r hv_radio; u hv_radio_udsendelser;
begin
  select * into r from hv_radio where id = 1;
  if not r.live or r.udsendelse is null then return; end if;
  select * into u from hv_radio_udsendelser where id = r.udsendelse;
  if u.id is null then return; end if;
  if jsonb_array_length(u.log) >= 2000 then return; end if;
  update hv_radio_udsendelser
    set log = log || jsonb_build_array(jsonb_build_object('t', round(extract(epoch from now() - u.start)::numeric, 1)) || p_ting)
    where id = u.id;
end $$;

-- Sæt et nyt nummer i gang (eller stilhed, når p_spor er null)
create or replace function public.hv_radio_saet_spor(p_spor jsonb, p_start timestamptz)
returns void language plpgsql security definer set search_path = public as $$
begin
  update hv_radio set spor = p_spor, spor_start = p_start, pauset = false, pause_pos = 0, opdateret = now() where id = 1;
  if p_spor is not null then perform hv_radio_log(jsonb_build_object('spor', p_spor, 'fra', greatest(0, round(extract(epoch from now() - p_start)::numeric, 1)))); end if;
end $$;

-- Når et nummer er færdigt, starter det næste i køen af sig selv (også selvom ingen vært er online)
create or replace function public.hv_radio_rul()
returns void language plpgsql security definer set search_path = public as $$
declare r hv_radio; slut timestamptz; naeste jsonb; i int := 0; pl hv_radio_playlister;
begin
  loop
    i := i + 1;
    exit when i > 60;
    select * into r from hv_radio where id = 1 for update;
    exit when r.spor is null or r.pauset;
    exit when coalesce((r.spor->>'sek')::double precision, 0) <= 0;            -- live-link: kører til nogen stopper det
    slut := r.spor_start + make_interval(secs => (r.spor->>'sek')::double precision);
    exit when slut > now();
    if jsonb_array_length(r.koe) = 0 and r.gentag and r.playliste is not null then
      select * into pl from hv_radio_playlister where id = r.playliste;
      if pl.id is not null then update hv_radio set koe = pl.spor where id = 1; r.koe := pl.spor; end if;
    end if;
    if jsonb_array_length(r.koe) = 0 then
      update hv_radio set spor = null, spor_start = null, opdateret = now() where id = 1;
      exit;
    end if;
    naeste := r.koe->0;
    update hv_radio set koe = koe - 0 where id = 1;
    -- har der været stille længe (ingen har kigget), starter det næste nummer nu
    perform hv_radio_saet_spor(naeste, case when now() - slut < interval '20 seconds' then slut else now() end);
  end loop;
end $$;
revoke all on function public.hv_radio_vaert(uuid), public.hv_radio_log(jsonb), public.hv_radio_saet_spor(jsonb, timestamptz),
  public.hv_radio_rul() from public, anon, authenticated;

-- Et "spor" må kun indeholde det, radioen kender (ingen lange data-adresser i køen)
create or replace function public.hv_radio_rens(p jsonb)
returns jsonb language plpgsql immutable as $$
declare t text := coalesce(p->>'type', 'sang');
begin
  if p is null or jsonb_typeof(p) <> 'object' then return null; end if;
  if t not in ('sang', 'klip', 'tale', 'link') then t := 'sang'; end if;
  return jsonb_strip_nulls(jsonb_build_object(
    'type', t,
    'id', p->'id',
    'titel', left(coalesce(p->>'titel', ''), 120),
    'kunstner', left(p->>'kunstner', 120),
    'url', case when t in ('sang', 'link') and coalesce(p->>'url', '') !~* '^\s*(javascript|data):' then left(p->>'url', 600) end,
    'tekst', case when t = 'tale' then left(p->>'tekst', 600) end,
    'sek', greatest(0, least(coalesce((p->>'sek')::double precision, 0), 4 * 3600)),
    'k', p->>'k'));
end $$;


-- =============================================================
--  📻 Radioens status: alle må lytte (også uden at være logget ind)
--  p_lytter = true: "jeg lytter lige nu" (tæller med i antal lyttere)
--  Værterne får også beskederne fra lytterne (efter id p_besked_efter)
-- =============================================================
create or replace function public.hv_radio_status(p_token uuid default null, p_lytter boolean default false, p_besked_efter bigint default 0)
returns json language plpgsql security definer set search_path = public as $$
declare r hv_radio; s hv_spillere; vaert boolean := false; pos double precision := 0; antal int;
begin
  perform hv_radio_rul();
  if p_token is not null then select * into s from hv_spillere where token = p_token; end if;
  if s.id is not null then
    vaert := hv_er_radiovaert(s.navn);
    if p_lytter then
      insert into hv_radio_lyttere (navn_lille, navn, sidst) values (s.navn_lille, s.navn, now())
      on conflict (navn_lille) do update set sidst = now(), navn = excluded.navn;
    else
      delete from hv_radio_lyttere where navn_lille = s.navn_lille;
    end if;
  end if;
  delete from hv_radio_lyttere where sidst < now() - interval '10 minutes';
  select count(*) into antal from hv_radio_lyttere where sidst > now() - interval '45 seconds';
  select * into r from hv_radio where id = 1;
  if r.spor is not null then
    pos := case when r.pauset then r.pause_pos else extract(epoch from now() - r.spor_start) end;
  end if;
  if r.live and r.udsendelse is not null then
    update hv_radio_udsendelser set lyttere = greatest(lyttere, antal) where id = r.udsendelse;
  end if;
  return json_build_object(
    'live', r.live, 'titel', r.titel, 'emne', r.emne, 'vaerter', r.vaerter, 'udsendelse', r.udsendelse,
    'spor', r.spor, 'pos', pos, 'pauset', r.pauset, 'gentag', r.gentag, 'playliste', r.playliste,
    'koe', (select coalesce(jsonb_agg(k), '[]'::jsonb) from (select k from jsonb_array_elements(r.koe) with ordinality a(k, n) where n <= 40) x),
    'koe_antal', jsonb_array_length(r.koe),
    'lyttere', antal,
    'vaert', vaert,
    'lytter_navne', case when vaert then (select coalesce(json_agg(navn order by navn), '[]'::json) from hv_radio_lyttere where sidst > now() - interval '45 seconds') end,
    'programmer', (select coalesce(json_agg(p order by p.start), '[]'::json) from (
        select id, titel, om, (extract(epoch from start) * 1000)::bigint as start, (extract(epoch from slut) * 1000)::bigint as slut, vaerter,
          case when vaert then emne end as emne
        from hv_radio_programmer where coalesce(slut, start + interval '2 hours') > now() order by start limit 12) p),
    'beskeder', case when vaert then (select coalesce(json_agg(b order by b.id), '[]'::json) from (
        select id, fra, tekst, (extract(epoch from tid) * 1000)::bigint as tid from hv_radio_beskeder
        where id > coalesce(p_besked_efter, 0) and (r.udsendelse is null or udsendelse = r.udsendelse or udsendelse is null)
          and tid > now() - interval '1 day' order by id desc limit 60) b) end,
    'nu', (extract(epoch from now()) * 1000)::bigint);
end $$;


-- =============================================================
--  🎛 Værternes knapper (én funktion med mange "handlinger")
-- =============================================================
create or replace function public.hv_radio_styr(p_token uuid, p_handling text, p_data jsonb default '{}'::jsonb)
returns json language plpgsql security definer set search_path = public as $$
declare s hv_spillere; r hv_radio; ny bigint; sp jsonb; pl hv_radio_playlister; i int; j int; arr jsonb; d jsonb := coalesce(p_data, '{}'::jsonb);
begin
  s := hv_radio_vaert(p_token);
  perform hv_radio_rul();
  select * into r from hv_radio where id = 1 for update;

  if p_handling = 'start_live' then
    if r.live then raise exception 'Radioen er allerede live.'; end if;
    insert into hv_radio_udsendelser (titel, emne, vaerter, program)
      values (left(coalesce(nullif(trim(d->>'titel'), ''), 'Vera-radio live'), 120), left(d->>'emne', 300),
              left(coalesce(nullif(trim(d->>'vaerter'), ''), s.navn), 200), nullif(d->>'program', '')::bigint)
      returning id into ny;
    update hv_radio set live = true, udsendelse = ny, titel = left(coalesce(nullif(trim(d->>'titel'), ''), 'Vera-radio live'), 120),
      emne = left(d->>'emne', 300), vaerter = left(coalesce(nullif(trim(d->>'vaerter'), ''), s.navn), 200),
      program = nullif(d->>'program', '')::bigint, opdateret = now() where id = 1;
    -- det, der allerede spiller, kommer med i optagelsen
    if r.spor is not null and not r.pauset then
      perform hv_radio_log(jsonb_build_object('spor', r.spor, 'fra', round(extract(epoch from now() - r.spor_start)::numeric, 1)));
    end if;
    begin insert into hv_adminlog (hvem, hvad) values (s.navn, 'Startede en live-udsendelse på Vera-radio'); exception when others then null; end;

  elsif p_handling = 'slut_live' then
    if r.udsendelse is not null then
      update hv_radio_udsendelser set slut = now() where id = r.udsendelse;
      -- en tom udsendelse (der aldrig blev spillet noget i) gemmes ikke
      delete from hv_radio_udsendelser where id = r.udsendelse and jsonb_array_length(log) = 0;
    end if;
    update hv_radio set live = false, udsendelse = null, program = null, opdateret = now() where id = 1;
    if coalesce((d->>'stop')::boolean, false) then
      update hv_radio set spor = null, spor_start = null, pauset = false, koe = '[]'::jsonb where id = 1;
    end if;

  elsif p_handling = 'emne' then
    update hv_radio set emne = left(d->>'emne', 300), titel = coalesce(left(nullif(trim(d->>'titel'), ''), 120), titel), opdateret = now() where id = 1;
    if r.udsendelse is not null then update hv_radio_udsendelser set emne = left(d->>'emne', 300) where id = r.udsendelse; end if;

  elsif p_handling = 'pause' then
    if r.spor is not null and not r.pauset then
      update hv_radio set pauset = true, pause_pos = extract(epoch from now() - spor_start), opdateret = now() where id = 1;
      perform hv_radio_log(jsonb_build_object('pause', true));
    end if;

  elsif p_handling = 'fortsaet' then
    if r.spor is not null and r.pauset then
      update hv_radio set pauset = false, spor_start = now() - make_interval(secs => r.pause_pos), opdateret = now() where id = 1;
      perform hv_radio_log(jsonb_build_object('spor', r.spor, 'fra', round(r.pause_pos::numeric, 1)));
    end if;

  elsif p_handling = 'spil' then                      -- spil nu (det der spillede, forsvinder)
    sp := hv_radio_rens(d->'spor');
    if sp is null then raise exception 'Vælg noget at spille.'; end if;
    perform hv_radio_saet_spor(sp, now());

  elsif p_handling = 'koe' then                       -- sæt bagerst i køen (eller spil straks, hvis der er stille)
    sp := hv_radio_rens(d->'spor');
    if sp is null then raise exception 'Vælg noget at sætte i kø.'; end if;
    if jsonb_array_length(r.koe) >= 300 then raise exception 'Køen er fuld (300).'; end if;
    if r.spor is null then perform hv_radio_saet_spor(sp, now());
    elsif coalesce((d->>'foerst')::boolean, false) then update hv_radio set koe = jsonb_build_array(sp) || koe, opdateret = now() where id = 1;
    else update hv_radio set koe = koe || jsonb_build_array(sp), opdateret = now() where id = 1; end if;

  elsif p_handling = 'koe_fjern' then
    i := (d->>'i')::int;
    if i is not null and i >= 0 then update hv_radio set koe = koe - i, opdateret = now() where id = 1; end if;

  elsif p_handling = 'koe_flyt' then                  -- flyt et nummer op/ned i køen
    i := (d->>'i')::int;
    if i is not null and i >= 0 and i < jsonb_array_length(r.koe) then
      sp := r.koe->i;
      r.koe := r.koe - i;
      ny := greatest(0, least(jsonb_array_length(r.koe), i + coalesce((d->>'ret')::int, -1)));
      arr := '[]'::jsonb;
      for j in 0 .. jsonb_array_length(r.koe) - 1 loop
        if j = ny then arr := arr || jsonb_build_array(sp); end if;
        arr := arr || jsonb_build_array(r.koe->j);
      end loop;
      if ny >= jsonb_array_length(r.koe) then arr := arr || jsonb_build_array(sp); end if;
      r.koe := arr;
      update hv_radio set koe = r.koe, opdateret = now() where id = 1;
    end if;

  elsif p_handling = 'koe_ryd' then
    update hv_radio set koe = '[]'::jsonb, gentag = false, playliste = null, opdateret = now() where id = 1;

  elsif p_handling = 'naeste' then
    if jsonb_array_length(r.koe) = 0 and r.gentag and r.playliste is not null then
      select * into pl from hv_radio_playlister where id = r.playliste;
      if pl.id is not null then r.koe := pl.spor; end if;
    end if;
    if jsonb_array_length(r.koe) = 0 then
      update hv_radio set spor = null, spor_start = null, pauset = false, koe = '[]'::jsonb, opdateret = now() where id = 1;
    else
      update hv_radio set koe = r.koe - 0 where id = 1;
      perform hv_radio_saet_spor(r.koe->0, now());
    end if;

  elsif p_handling = 'stop' then
    update hv_radio set spor = null, spor_start = null, pauset = false, opdateret = now() where id = 1;

  elsif p_handling = 'spil_playliste' then
    select * into pl from hv_radio_playlister where id = (d->>'id')::bigint;
    if pl.id is null then raise exception 'Den playliste findes ikke.'; end if;
    if jsonb_array_length(pl.spor) = 0 then raise exception 'Playlisten er tom.'; end if;
    sp := pl.spor;
    if coalesce((d->>'bland')::boolean, false) then
      sp := (select jsonb_agg(e order by random()) from jsonb_array_elements(pl.spor) e);
    end if;
    if coalesce((d->>'tilfoej')::boolean, false) then
      update hv_radio set koe = koe || sp, opdateret = now() where id = 1;
      if r.spor is null then perform hv_radio_styr(p_token, 'naeste', '{}'::jsonb); end if;
    else
      update hv_radio set koe = sp - 0, playliste = pl.id, gentag = coalesce((d->>'gentag')::boolean, gentag), opdateret = now() where id = 1;
      perform hv_radio_saet_spor(sp->0, now());
    end if;

  elsif p_handling = 'gentag' then
    update hv_radio set gentag = coalesce((d->>'til')::boolean, not gentag), opdateret = now() where id = 1;

  else
    raise exception 'Ukendt handling: %', p_handling;
  end if;
  return hv_radio_status(p_token, false, 2147483647);
end $$;


-- =============================================================
--  🎵 Musikbiblioteket
-- =============================================================
create or replace function public.hv_radio_musik_hent()
returns json language sql stable security definer set search_path = public as $$
  select coalesce(json_agg(m order by m.titel), '[]'::json) from (
    select id, titel, kunstner, url, sek, af, (extract(epoch from tid) * 1000)::bigint as tid from hv_radio_musik) m;
$$;
create or replace function public.hv_radio_musik_gem(p_token uuid, p_titel text, p_kunstner text, p_url text, p_sek double precision)
returns bigint language plpgsql security definer set search_path = public as $$
declare s hv_spillere; ny bigint;
begin
  s := hv_radio_vaert(p_token);
  if coalesce(trim(p_titel), '') = '' then raise exception 'Skriv sangens navn.'; end if;
  if coalesce(trim(p_url), '') = '' or p_url ~* '^\s*(javascript|data):' then raise exception 'Skriv et link til lydfilen.'; end if;
  if (select count(*) from hv_radio_musik) >= 1000 then raise exception 'Biblioteket er fuldt (1000 sange).'; end if;
  insert into hv_radio_musik (titel, kunstner, url, sek, af)
    values (left(trim(p_titel), 120), left(trim(coalesce(p_kunstner, '')), 120), left(trim(p_url), 600), greatest(0, coalesce(p_sek, 0)), s.navn)
    returning id into ny;
  return ny;
end $$;
create or replace function public.hv_radio_musik_slet(p_token uuid, p_id bigint)
returns void language plpgsql security definer set search_path = public as $$
declare s hv_spillere;
begin
  s := hv_radio_vaert(p_token);
  delete from hv_radio_musik where id = p_id;
end $$;


-- =============================================================
--  📋 Playlister
-- =============================================================
create or replace function public.hv_radio_playlister_hent(p_token uuid)
returns json language plpgsql security definer set search_path = public as $$
declare s hv_spillere;
begin
  s := hv_radio_vaert(p_token);
  return (select coalesce(json_agg(p order by p.navn), '[]'::json) from (
    select id, navn, spor, af, (extract(epoch from tid) * 1000)::bigint as tid from hv_radio_playlister) p);
end $$;
create or replace function public.hv_radio_playliste_gem(p_token uuid, p_id bigint, p_navn text, p_spor jsonb)
returns bigint language plpgsql security definer set search_path = public as $$
declare s hv_spillere; ny bigint; rene jsonb;
begin
  s := hv_radio_vaert(p_token);
  if coalesce(trim(p_navn), '') = '' then raise exception 'Giv playlisten et navn.'; end if;
  rene := (select coalesce(jsonb_agg(hv_radio_rens(e)), '[]'::jsonb) from (select e from jsonb_array_elements(coalesce(p_spor, '[]'::jsonb)) e limit 300) x);
  if p_id is null then
    insert into hv_radio_playlister (navn, spor, af) values (left(trim(p_navn), 80), rene, s.navn) returning id into ny;
  else
    update hv_radio_playlister set navn = left(trim(p_navn), 80), spor = rene, tid = now() where id = p_id returning id into ny;
    if ny is null then raise exception 'Den playliste findes ikke.'; end if;
  end if;
  return ny;
end $$;
create or replace function public.hv_radio_playliste_slet(p_token uuid, p_id bigint)
returns void language plpgsql security definer set search_path = public as $$
declare s hv_spillere;
begin
  s := hv_radio_vaert(p_token);
  delete from hv_radio_playlister where id = p_id;
  update hv_radio set playliste = null, gentag = false where playliste = p_id;
end $$;


-- =============================================================
--  🎙 Snak-klip (optaget med mikrofonen)
-- =============================================================
create or replace function public.hv_radio_klip_gem(p_token uuid, p_titel text, p_data text, p_sek double precision)
returns bigint language plpgsql security definer set search_path = public as $$
declare s hv_spillere; ny bigint;
begin
  s := hv_radio_vaert(p_token);
  if p_data is null or p_data !~ '^data:audio/' then raise exception 'Optagelsen mangler.'; end if;
  if length(p_data) > 3000000 then raise exception 'Optagelsen er for lang. Højst ca. 2 minutter.'; end if;
  insert into hv_radio_klip (titel, data, sek, af)
    values (left(coalesce(nullif(trim(p_titel), ''), 'Snak'), 120), p_data, greatest(0, coalesce(p_sek, 0)), s.navn)
    returning id into ny;
  return ny;
end $$;
create or replace function public.hv_radio_klip_hent(p_id bigint)
returns text language sql stable security definer set search_path = public as $$
  select data from hv_radio_klip where id = p_id;
$$;
create or replace function public.hv_radio_klip_liste(p_token uuid)
returns json language plpgsql security definer set search_path = public as $$
declare s hv_spillere;
begin
  s := hv_radio_vaert(p_token);
  return (select coalesce(json_agg(k order by k.id desc), '[]'::json) from (
    select id, titel, sek, af, (extract(epoch from tid) * 1000)::bigint as tid from hv_radio_klip order by id desc limit 100) k);
end $$;
create or replace function public.hv_radio_klip_slet(p_token uuid, p_id bigint)
returns void language plpgsql security definer set search_path = public as $$
declare s hv_spillere;
begin
  s := hv_radio_vaert(p_token);
  delete from hv_radio_klip where id = p_id;
end $$;


-- =============================================================
--  🗓 Radioprogrammer (planlagte udsendelser)
-- =============================================================
create or replace function public.hv_radio_program_gem(p_token uuid, p_id bigint, p_titel text, p_om text,
  p_start timestamptz, p_slut timestamptz, p_vaerter text, p_emne text)
returns bigint language plpgsql security definer set search_path = public as $$
declare s hv_spillere; ny bigint;
begin
  s := hv_radio_vaert(p_token);
  if coalesce(trim(p_titel), '') = '' then raise exception 'Giv programmet et navn.'; end if;
  if p_start is null then raise exception 'Vælg dato og tidspunkt.'; end if;
  if p_slut is not null and p_slut <= p_start then raise exception 'Programmet skal slutte efter det starter.'; end if;
  if p_id is null then
    insert into hv_radio_programmer (titel, om, start, slut, vaerter, emne, af)
      values (left(trim(p_titel), 120), left(p_om, 500), p_start, p_slut, left(p_vaerter, 200), left(p_emne, 1000), s.navn)
      returning id into ny;
  else
    update hv_radio_programmer set titel = left(trim(p_titel), 120), om = left(p_om, 500), start = p_start, slut = p_slut,
      vaerter = left(p_vaerter, 200), emne = left(p_emne, 1000) where id = p_id returning id into ny;
    if ny is null then raise exception 'Det program findes ikke.'; end if;
  end if;
  return ny;
end $$;
create or replace function public.hv_radio_program_slet(p_token uuid, p_id bigint)
returns void language plpgsql security definer set search_path = public as $$
declare s hv_spillere;
begin
  s := hv_radio_vaert(p_token);
  delete from hv_radio_programmer where id = p_id;
end $$;
-- Alle programmer (også gamle) til værterne
create or replace function public.hv_radio_programmer_hent(p_token uuid)
returns json language plpgsql security definer set search_path = public as $$
declare s hv_spillere;
begin
  s := hv_radio_vaert(p_token);
  return (select coalesce(json_agg(p order by p.start desc), '[]'::json) from (
    select id, titel, om, (extract(epoch from start) * 1000)::bigint as start, (extract(epoch from slut) * 1000)::bigint as slut,
      vaerter, emne, af from hv_radio_programmer where start > now() - interval '30 days' order by start desc limit 100) p);
end $$;


-- =============================================================
--  💾 Gemte udsendelser (alle kan høre dem igen)
-- =============================================================
create or replace function public.hv_radio_udsendelser_hent()
returns json language sql stable security definer set search_path = public as $$
  select coalesce(json_agg(u order by u.start desc), '[]'::json) from (
    select id, titel, emne, vaerter, (extract(epoch from start) * 1000)::bigint as start, (extract(epoch from slut) * 1000)::bigint as slut,
      lyttere, jsonb_array_length(log) as antal
    from hv_radio_udsendelser where slut is not null order by start desc limit 100) u;
$$;
create or replace function public.hv_radio_udsendelse_hent(p_id bigint)
returns json language sql stable security definer set search_path = public as $$
  select json_build_object('id', id, 'titel', titel, 'emne', emne, 'vaerter', vaerter,
    'start', (extract(epoch from start) * 1000)::bigint, 'slut', (extract(epoch from slut) * 1000)::bigint, 'log', log)
  from hv_radio_udsendelser where id = p_id and slut is not null;
$$;
create or replace function public.hv_radio_udsendelse_slet(p_token uuid, p_id bigint)
returns void language plpgsql security definer set search_path = public as $$
declare s hv_spillere;
begin
  s := hv_radio_vaert(p_token);
  delete from hv_radio_udsendelser where id = p_id and slut is not null;
end $$;


-- =============================================================
--  ✉️ Beskeder til værterne (kun mens radioen er live)
-- =============================================================
create or replace function public.hv_radio_besked_send(p_token uuid, p_tekst text)
returns void language plpgsql security definer set search_path = public as $$
declare s hv_spillere; r hv_radio;
begin
  select * into s from hv_spillere where token = p_token;
  if s.id is null then raise exception 'Du er ikke logget ind.'; end if;
  select * into r from hv_radio where id = 1;
  if not r.live then raise exception 'Vera-radio er ikke live lige nu. Du kan skrive, når værterne er på.'; end if;
  if coalesce(trim(p_tekst), '') = '' then raise exception 'Skriv en besked.'; end if;
  if exists (select 1 from hv_radio_beskeder where fra = s.navn and tid > now() - interval '5 seconds') then
    raise exception 'Vent lige et par sekunder, før du skriver igen.';
  end if;
  insert into hv_radio_beskeder (udsendelse, fra, tekst) values (r.udsendelse, s.navn, left(trim(p_tekst), 300));
  delete from hv_radio_beskeder where tid < now() - interval '30 days';
end $$;
-- Mine egne beskeder til radioen (så lytteren kan se, hvad de har skrevet)
create or replace function public.hv_radio_mine_beskeder(p_token uuid)
returns json language plpgsql security definer set search_path = public as $$
declare s hv_spillere;
begin
  select * into s from hv_spillere where token = p_token;
  if s.id is null then return '[]'::json; end if;
  return (select coalesce(json_agg(b order by b.id), '[]'::json) from (
    select id, tekst, (extract(epoch from tid) * 1000)::bigint as tid from hv_radio_beskeder
    where fra = s.navn and tid > now() - interval '1 day' order by id desc limit 30) b);
end $$;

grant execute on function
  public.hv_radio_status(uuid, boolean, bigint), public.hv_radio_styr(uuid, text, jsonb),
  public.hv_radio_musik_hent(), public.hv_radio_musik_gem(uuid, text, text, text, double precision), public.hv_radio_musik_slet(uuid, bigint),
  public.hv_radio_playlister_hent(uuid), public.hv_radio_playliste_gem(uuid, bigint, text, jsonb), public.hv_radio_playliste_slet(uuid, bigint),
  public.hv_radio_klip_gem(uuid, text, text, double precision), public.hv_radio_klip_hent(bigint), public.hv_radio_klip_liste(uuid), public.hv_radio_klip_slet(uuid, bigint),
  public.hv_radio_program_gem(uuid, bigint, text, text, timestamptz, timestamptz, text, text), public.hv_radio_program_slet(uuid, bigint), public.hv_radio_programmer_hent(uuid),
  public.hv_radio_udsendelser_hent(), public.hv_radio_udsendelse_hent(bigint), public.hv_radio_udsendelse_slet(uuid, bigint),
  public.hv_radio_besked_send(uuid, text), public.hv_radio_mine_beskeder(uuid)
to anon, authenticated;

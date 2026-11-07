-- HELLO VERA, del 32: 🧺 Loppemarkedet (udendørs, hver søndag)
-- Gæsterne opretter hver deres bod, stiller møbler i den og sætter en pris i Glimt ⭐ eller Stella 🔮.
-- Når nogen køber, kommer møblet i køberens Mine ting, og pengene går til sælgeren.
-- Man kan også foreslå et bytte (begge skal sige ja). Ansatte låser og åbner markedet.
-- Kopiér ALT herfra → Supabase → SQL Editor → + New query → Run. Må gerne køres flere gange.
-- Kræver at database-4 (ansatte) og database-6 (penge) er kørt.

create table if not exists public.hv_lop_status (
  id int primary key default 1 check (id = 1),
  tilstand text not null default 'lukket',          -- 'lukket', 'aaben' eller 'soendag' (åbner selv hver søndag)
  maks_annoncer int not null default 10,             -- hvor mange ting man højst kan have til salg på én gang
  hvem text,
  tid timestamptz not null default now()
);
insert into public.hv_lop_status (id) values (1) on conflict (id) do nothing;

create table if not exists public.hv_lop_boder (
  id bigint generated always as identity primary key,
  ejer text not null,
  ejer_lille text not null unique,                   -- én bod pr. gæst
  navn text not null,
  plads int not null unique,                         -- hvilken plads på markedet (0–39)
  moebler jsonb not null default '[]',               -- [{id, type, x, y, retning}]
  vaek text[] not null default '{}',                 -- møbler der er solgt eller taget hjem (kommer aldrig igen)
  oprettet timestamptz not null default now()
);

create table if not exists public.hv_lop_annoncer (
  id bigint generated always as identity primary key,
  bod_id bigint not null,
  bod_navn text,
  saelger text not null,
  saelger_lille text not null,
  moebel_id text not null,
  type text not null,
  pris int not null check (pris > 0),
  valuta text not null check (valuta in ('glimt', 'stella')),
  status text not null default 'aktiv',              -- aktiv, solgt, byttet, fjernet
  reserveret_af text,
  reserveret_til timestamptz,
  koeber text,
  koeber_lille text,
  bytte_type text,
  oprettet timestamptz not null default now(),
  solgt_tid timestamptz
);
create index if not exists hv_lop_annoncer_status on public.hv_lop_annoncer (status);
create index if not exists hv_lop_annoncer_saelger on public.hv_lop_annoncer (saelger_lille);
create index if not exists hv_lop_annoncer_koeber on public.hv_lop_annoncer (koeber_lille);

create table if not exists public.hv_lop_bytte (
  id bigint generated always as identity primary key,
  annonce_id bigint not null,
  fra text not null,
  fra_lille text not null,
  type text not null,                                -- det møbel, der bydes
  status text not null default 'venter',             -- venter, godkendt, afvist, annulleret, udloebet
  tid timestamptz not null default now(),
  svar_tid timestamptz
);

-- Møbler på vej til nogens Mine ting (købt, byttet eller taget hjem)
create table if not exists public.hv_lop_leveringer (
  id bigint generated always as identity primary key,
  til_lille text not null,
  type text not null,
  grund text,
  tid timestamptz not null default now()
);
create index if not exists hv_lop_leveringer_til on public.hv_lop_leveringer (til_lille);

alter table public.hv_lop_status enable row level security;
alter table public.hv_lop_boder enable row level security;
alter table public.hv_lop_annoncer enable row level security;
alter table public.hv_lop_bytte enable row level security;
alter table public.hv_lop_leveringer enable row level security;
revoke all on public.hv_lop_status, public.hv_lop_boder, public.hv_lop_annoncer, public.hv_lop_bytte, public.hv_lop_leveringer from anon, authenticated;


-- -------------------------------------------------------------
--  Hjælpere
-- -------------------------------------------------------------
-- Er markedet åbent lige nu? (søndag regnes efter dansk tid)
create or replace function public.hv_lop_er_aaben()
returns boolean language sql stable security definer set search_path = public as $$
  select coalesce((select tilstand = 'aaben' or (tilstand = 'soendag'
    and extract(dow from (now() at time zone 'Europe/Copenhagen')) = 0) from hv_lop_status where id = 1), false);
$$;

create or replace function public.hv_lop_mig(p_token uuid)
returns hv_spillere language plpgsql stable security definer set search_path = public as $$
declare s hv_spillere;
begin
  select * into s from hv_spillere where token = p_token;
  if s.id is null then raise exception 'Du er ikke logget ind.'; end if;
  return s;
end $$;

-- Er der en handel i gang med annoncen? (nogen er ved at købe, eller der er et bytte, der venter på svar)
create or replace function public.hv_lop_optaget(a hv_lop_annoncer)
returns boolean language sql stable security definer set search_path = public as $$
  select (a.reserveret_til is not null and a.reserveret_til > now())
      or exists (select 1 from hv_lop_bytte b where b.annonce_id = a.id and b.status = 'venter');
$$;

-- Tag et møbel ud af en bod (og husk, at det aldrig må komme tilbage)
create or replace function public.hv_lop_fjern_moebel(p_bod bigint, p_moebel text)
returns void language sql security definer set search_path = public as $$
  update hv_lop_boder set
    moebler = coalesce((select jsonb_agg(e) from jsonb_array_elements(moebler) e where e->>'id' <> p_moebel), '[]'::jsonb),
    vaek = (array_append(vaek, p_moebel))[greatest(1, coalesce(array_length(vaek, 1), 0) - 300):]
  where id = p_bod;
$$;

-- Bytteforslag, der har ventet over 2 døgn, går tilbage til den, der bød
create or replace function public.hv_lop_ryd_bytte()
returns void language plpgsql security definer set search_path = public as $$
declare b hv_lop_bytte;
begin
  for b in select * from hv_lop_bytte where status = 'venter' and tid < now() - interval '48 hours' for update skip locked loop
    update hv_lop_bytte set status = 'udloebet', svar_tid = now() where id = b.id;
    insert into hv_lop_leveringer (til_lille, type, grund) values (b.fra_lille, b.type, 'Dit bytteforslag fik ikke svar');
  end loop;
end $$;


-- -------------------------------------------------------------
--  Hent hele markedet (alle kan se boder og prisliste)
-- -------------------------------------------------------------
create or replace function public.hv_lop_hent(p_token uuid)
returns json language plpgsql security definer set search_path = public as $$
declare s hv_spillere; st hv_lop_status;
begin
  s := hv_lop_mig(p_token);
  perform hv_lop_ryd_bytte();
  select * into st from hv_lop_status where id = 1;
  return json_build_object(
    'tilstand', st.tilstand,
    'aaben', hv_lop_er_aaben(),
    'maks', st.maks_annoncer,
    'boder', coalesce((select json_agg(json_build_object('id', b.id, 'ejer', b.ejer, 'navn', b.navn, 'plads', b.plads, 'moebler', b.moebler) order by b.plads) from hv_lop_boder b), '[]'::json),
    'annoncer', coalesce((select json_agg(json_build_object('id', a.id, 'bod', a.bod_id, 'bodNavn', a.bod_navn, 'saelger', a.saelger, 'moebel', a.moebel_id,
        'type', a.type, 'pris', a.pris, 'valuta', a.valuta, 'oprettet', a.oprettet,
        'optaget', hv_lop_optaget(a), 'mig', a.reserveret_af = s.navn and a.reserveret_til > now()) order by a.oprettet desc)
      from hv_lop_annoncer a where a.status = 'aktiv'), '[]'::json),
    -- bytteforslag til mig (på mine ting) og fra mig
    'bytteInd', coalesce((select json_agg(json_build_object('id', b.id, 'annonce', a.id, 'fra', b.fra, 'type', b.type, 'minType', a.type, 'tid', b.tid) order by b.tid)
      from hv_lop_bytte b join hv_lop_annoncer a on a.id = b.annonce_id where b.status = 'venter' and a.saelger_lille = s.navn_lille), '[]'::json),
    'bytteUd', coalesce((select json_agg(json_build_object('id', b.id, 'annonce', a.id, 'til', a.saelger, 'type', b.type, 'deresType', a.type, 'tid', b.tid) order by b.tid)
      from hv_lop_bytte b join hv_lop_annoncer a on a.id = b.annonce_id where b.status = 'venter' and b.fra_lille = s.navn_lille), '[]'::json),
    -- mine gennemførte handler (de sidste 60)
    'handler', coalesce((select json_agg(h order by h.tid desc) from (
        select a.id, a.type, a.pris, a.valuta, a.status, a.bytte_type as "bytteType", a.solgt_tid as tid,
          case when a.saelger_lille = s.navn_lille then 'solgt' else 'koebt' end as hvad,
          case when a.saelger_lille = s.navn_lille then a.koeber else a.saelger end as med
        from hv_lop_annoncer a where a.status in ('solgt', 'byttet') and (a.saelger_lille = s.navn_lille or a.koeber_lille = s.navn_lille)
        order by a.solgt_tid desc limit 60) h), '[]'::json),
    'leveringer', (select count(*) from hv_lop_leveringer where til_lille = s.navn_lille)
  );
end $$;

-- Hent de møbler, der er på vej til mig (de kommer i Mine ting)
create or replace function public.hv_lop_leveringer_hent(p_token uuid)
returns json language plpgsql security definer set search_path = public as $$
declare s hv_spillere; ud json;
begin
  s := hv_lop_mig(p_token);
  with slet as (delete from hv_lop_leveringer where til_lille = s.navn_lille returning type, grund, tid)
  select coalesce(json_agg(json_build_object('type', type, 'grund', grund) order by tid), '[]'::json) into ud from slet;
  return ud;
end $$;


-- -------------------------------------------------------------
--  Boden
-- -------------------------------------------------------------
create or replace function public.hv_lop_bod_opret(p_token uuid, p_plads int, p_navn text)
returns bigint language plpgsql security definer set search_path = public as $$
declare s hv_spillere; n text; ny bigint;
begin
  s := hv_lop_mig(p_token);
  if not hv_lop_er_aaben() and not hv_er_ansat(s.navn) then raise exception '🔒 Loppemarkedet er lukket lige nu.'; end if;
  if p_plads < 0 or p_plads > 39 then raise exception 'Den plads findes ikke.'; end if;
  n := left(trim(coalesce(p_navn, '')), 24);
  if n = '' then raise exception 'Giv din bod et navn.'; end if;
  if exists (select 1 from hv_lop_boder where ejer_lille = s.navn_lille) then raise exception 'Du har allerede en bod.'; end if;
  if exists (select 1 from hv_lop_boder where plads = p_plads) then raise exception 'Den plads er taget. Vælg en anden.'; end if;
  insert into hv_lop_boder (ejer, ejer_lille, navn, plads) values (s.navn, s.navn_lille, n, p_plads) returning id into ny;
  return ny;
end $$;

create or replace function public.hv_lop_bod_navn(p_token uuid, p_navn text)
returns void language plpgsql security definer set search_path = public as $$
declare s hv_spillere; n text;
begin
  s := hv_lop_mig(p_token);
  n := left(trim(coalesce(p_navn, '')), 24);
  if n = '' then raise exception 'Giv din bod et navn.'; end if;
  update hv_lop_boder set navn = n where ejer_lille = s.navn_lille;
  update hv_lop_annoncer set bod_navn = n where saelger_lille = s.navn_lille and status = 'aktiv';
end $$;

-- Gem møblerne i min bod (stil, flyt, drej). Solgte og hjemtagne møbler kan ikke komme tilbage.
create or replace function public.hv_lop_bod_gem(p_token uuid, p_moebler jsonb)
returns json language plpgsql security definer set search_path = public as $$
declare s hv_spillere; b hv_lop_boder; ny jsonb; a hv_lop_annoncer;
begin
  s := hv_lop_mig(p_token);
  select * into b from hv_lop_boder where ejer_lille = s.navn_lille for update;
  if b.id is null then raise exception 'Du har ingen bod endnu.'; end if;
  if jsonb_typeof(p_moebler) <> 'array' or jsonb_array_length(p_moebler) > 40 then raise exception 'Der er ikke plads til så mange møbler i boden.'; end if;
  -- kun gyldige møbler, og aldrig dem, der er solgt eller taget hjem
  select coalesce(jsonb_agg(jsonb_build_object('id', left(e->>'id', 40), 'type', left(e->>'type', 60),
      'x', (e->>'x')::int, 'y', (e->>'y')::int, 'retning', coalesce((e->>'retning')::int, 0) % 4)), '[]'::jsonb) into ny
    from jsonb_array_elements(p_moebler) e
    where coalesce(e->>'id', '') <> '' and coalesce(e->>'type', '') <> '' and not ((e->>'id') = any (b.vaek));
  -- møbler med en handel i gang må ikke forsvinde
  for a in select * from hv_lop_annoncer where bod_id = b.id and status = 'aktiv' loop
    if not exists (select 1 from jsonb_array_elements(ny) e where e->>'id' = a.moebel_id) then
      if hv_lop_optaget(a) then raise exception 'Møblet er reserveret, fordi en handel er i gang.'; end if;
      update hv_lop_annoncer set status = 'fjernet' where id = a.id;
    end if;
  end loop;
  update hv_lop_boder set moebler = ny where id = b.id;
  return ny;
end $$;

-- Tag et møbel fra boden med hjem (det kommer i Mine ting). Virker også, når markedet er lukket.
create or replace function public.hv_lop_tag_hjem(p_token uuid, p_moebel text)
returns void language plpgsql security definer set search_path = public as $$
declare s hv_spillere; b hv_lop_boder; t text; a hv_lop_annoncer;
begin
  s := hv_lop_mig(p_token);
  select * into b from hv_lop_boder where ejer_lille = s.navn_lille for update;
  if b.id is null then raise exception 'Du har ingen bod.'; end if;
  select e->>'type' into t from jsonb_array_elements(b.moebler) e where e->>'id' = p_moebel;
  if t is null then return; end if;
  select * into a from hv_lop_annoncer where bod_id = b.id and moebel_id = p_moebel and status = 'aktiv' for update;
  if a.id is not null then
    if hv_lop_optaget(a) then raise exception 'Møblet er reserveret, fordi en handel er i gang.'; end if;
    update hv_lop_annoncer set status = 'fjernet' where id = a.id;
  end if;
  perform hv_lop_fjern_moebel(b.id, p_moebel);
  insert into hv_lop_leveringer (til_lille, type, grund) values (s.navn_lille, t, 'Taget hjem fra din bod');
end $$;

-- Nedlæg en bod: alle møbler går hjem til ejeren. Ejeren af hotellet og ansatte kan nedlægge andres boder.
create or replace function public.hv_lop_bod_slet(p_token uuid, p_bod bigint)
returns void language plpgsql security definer set search_path = public as $$
declare s hv_spillere; b hv_lop_boder; e jsonb; a hv_lop_annoncer; bb hv_lop_bytte;
begin
  s := hv_lop_mig(p_token);
  if p_bod is null then select * into b from hv_lop_boder where ejer_lille = s.navn_lille for update;
  else select * into b from hv_lop_boder where id = p_bod for update; end if;
  if b.id is null then return; end if;
  if b.ejer_lille <> s.navn_lille and not hv_er_ansat(s.navn) then raise exception 'Du kan kun nedlægge din egen bod.'; end if;
  for a in select * from hv_lop_annoncer where bod_id = b.id and status = 'aktiv' for update loop
    if a.reserveret_til > now() then raise exception 'Vent lidt: nogen er ved at købe noget i boden.'; end if;
    for bb in select * from hv_lop_bytte where annonce_id = a.id and status = 'venter' loop
      update hv_lop_bytte set status = 'afvist', svar_tid = now() where id = bb.id;
      insert into hv_lop_leveringer (til_lille, type, grund) values (bb.fra_lille, bb.type, 'Boden blev lukket, så dit bytte gik tilbage');
    end loop;
    update hv_lop_annoncer set status = 'fjernet' where id = a.id;
  end loop;
  for e in select * from jsonb_array_elements(b.moebler) loop
    insert into hv_lop_leveringer (til_lille, type, grund) values (b.ejer_lille, e->>'type', 'Fra din bod på loppemarkedet');
  end loop;
  delete from hv_lop_boder where id = b.id;
  if b.ejer_lille <> s.navn_lille then
    begin insert into hv_adminlog (hvem, hvad) values (s.navn, 'Nedlagde boden "' || b.navn || '" (' || b.ejer || ') på loppemarkedet'); exception when others then null; end;
  end if;
end $$;


-- -------------------------------------------------------------
--  Annoncer: sæt til salg, ændr pris, fjern
-- -------------------------------------------------------------
create or replace function public.hv_lop_saelg(p_token uuid, p_moebel text, p_pris int, p_valuta text)
returns bigint language plpgsql security definer set search_path = public as $$
declare s hv_spillere; b hv_lop_boder; t text; a hv_lop_annoncer; maks int; ny bigint;
begin
  s := hv_lop_mig(p_token);
  if p_pris is null or p_pris < 1 or p_pris > 1000000 then raise exception 'Prisen skal være mellem 1 og 1.000.000.'; end if;
  if p_valuta not in ('glimt', 'stella') then raise exception 'Vælg Glimt eller Stella.'; end if;
  select * into b from hv_lop_boder where ejer_lille = s.navn_lille;
  if b.id is null then raise exception 'Du har ingen bod endnu.'; end if;
  -- man kan kun sælge det, der står i ens egen bod
  select e->>'type' into t from jsonb_array_elements(b.moebler) e where e->>'id' = p_moebel;
  if t is null then raise exception 'Du kan kun sælge møbler, der står i din egen bod.'; end if;
  select * into a from hv_lop_annoncer where bod_id = b.id and moebel_id = p_moebel and status = 'aktiv' for update;
  if a.id is not null then
    if hv_lop_optaget(a) then raise exception 'Prisen kan ikke ændres, mens en handel er i gang.'; end if;
    update hv_lop_annoncer set pris = p_pris, valuta = p_valuta where id = a.id;
    return a.id;
  end if;
  select maks_annoncer into maks from hv_lop_status where id = 1;
  if (select count(*) from hv_lop_annoncer where saelger_lille = s.navn_lille and status = 'aktiv') >= coalesce(maks, 10) then
    raise exception 'Du kan højst have % ting til salg på én gang.', coalesce(maks, 10);
  end if;
  insert into hv_lop_annoncer (bod_id, bod_navn, saelger, saelger_lille, moebel_id, type, pris, valuta)
    values (b.id, b.navn, s.navn, s.navn_lille, p_moebel, t, p_pris, p_valuta) returning id into ny;
  return ny;
end $$;

create or replace function public.hv_lop_pris(p_token uuid, p_id bigint, p_pris int, p_valuta text)
returns void language plpgsql security definer set search_path = public as $$
declare s hv_spillere; a hv_lop_annoncer;
begin
  s := hv_lop_mig(p_token);
  if p_pris is null or p_pris < 1 or p_pris > 1000000 then raise exception 'Prisen skal være mellem 1 og 1.000.000.'; end if;
  if p_valuta not in ('glimt', 'stella') then raise exception 'Vælg Glimt eller Stella.'; end if;
  select * into a from hv_lop_annoncer where id = p_id and status = 'aktiv' for update;
  if a.id is null or a.saelger_lille <> s.navn_lille then raise exception 'Annoncen findes ikke længere.'; end if;
  if hv_lop_optaget(a) then raise exception 'Prisen kan ikke ændres, mens en handel er i gang.'; end if;
  update hv_lop_annoncer set pris = p_pris, valuta = p_valuta where id = a.id;
end $$;

-- Fjern annoncen (møblet bliver stående i boden, men er ikke til salg længere)
create or replace function public.hv_lop_fjern(p_token uuid, p_id bigint)
returns void language plpgsql security definer set search_path = public as $$
declare s hv_spillere; a hv_lop_annoncer;
begin
  s := hv_lop_mig(p_token);
  select * into a from hv_lop_annoncer where id = p_id and status = 'aktiv' for update;
  if a.id is null then return; end if;
  if a.saelger_lille <> s.navn_lille and not hv_er_ansat(s.navn) then raise exception 'Du kan kun fjerne dine egne annoncer.'; end if;
  if hv_lop_optaget(a) then raise exception 'Annoncen kan ikke fjernes, mens en handel er i gang.'; end if;
  update hv_lop_annoncer set status = 'fjernet' where id = a.id;
end $$;


-- -------------------------------------------------------------
--  Køb: først reserveres møblet (så ingen andre kan købe det), så betaler man
-- -------------------------------------------------------------
create or replace function public.hv_lop_reserver(p_token uuid, p_id bigint)
returns void language plpgsql security definer set search_path = public as $$
declare s hv_spillere; a hv_lop_annoncer;
begin
  s := hv_lop_mig(p_token);
  if not hv_lop_er_aaben() then raise exception '🔒 Loppemarkedet er lukket. Kom igen på søndag!'; end if;
  select * into a from hv_lop_annoncer where id = p_id for update;
  if a.id is null or a.status <> 'aktiv' then raise exception 'Den er desværre solgt.'; end if;
  if a.saelger_lille = s.navn_lille then raise exception 'Du kan ikke købe dine egne ting.'; end if;
  if a.reserveret_til > now() and a.reserveret_af <> s.navn then raise exception 'Nogen er ved at købe den lige nu. Prøv igen om lidt.'; end if;
  if exists (select 1 from hv_lop_bytte where annonce_id = a.id and status = 'venter') then raise exception 'Der er et bytte i gang med den. Prøv igen senere.'; end if;
  update hv_lop_annoncer set reserveret_af = s.navn, reserveret_til = now() + interval '90 seconds' where id = a.id;
end $$;

create or replace function public.hv_lop_frigiv(p_token uuid, p_id bigint)
returns void language plpgsql security definer set search_path = public as $$
declare s hv_spillere;
begin
  s := hv_lop_mig(p_token);
  update hv_lop_annoncer set reserveret_af = null, reserveret_til = null where id = p_id and reserveret_af = s.navn;
end $$;

create or replace function public.hv_lop_koeb(p_token uuid, p_id bigint)
returns json language plpgsql security definer set search_path = public as $$
declare s hv_spillere; a hv_lop_annoncer; k hv_spillere; har int;
begin
  s := hv_lop_mig(p_token);
  if not hv_lop_er_aaben() then raise exception '🔒 Loppemarkedet er lukket. Kom igen på søndag!'; end if;
  select * into a from hv_lop_annoncer where id = p_id for update;
  if a.id is null or a.status <> 'aktiv' then raise exception 'Den er desværre solgt.'; end if;
  if a.saelger_lille = s.navn_lille then raise exception 'Du kan ikke købe dine egne ting.'; end if;
  if a.reserveret_til > now() and a.reserveret_af <> s.navn then raise exception 'Nogen er ved at købe den lige nu.'; end if;
  if exists (select 1 from hv_lop_bytte where annonce_id = a.id and status = 'venter') then raise exception 'Der er et bytte i gang med den.'; end if;
  select * into k from hv_spillere where id = s.id for update;
  har := case when a.valuta = 'glimt' then coalesce(k.glimt, 0) else coalesce(k.stella, 0) end;
  if har < a.pris and not hv_er_ejer(k.navn) then
    raise exception 'Du har ikke råd. Den koster % %.', a.pris, case when a.valuta = 'glimt' then 'Glimt' else 'Stella' end;
  end if;
  -- betalingen går fra køberen til sælgeren
  if a.valuta = 'glimt' then
    update hv_spillere set glimt = greatest(0, coalesce(glimt, 0) - a.pris) where id = k.id returning * into k;
    update hv_spillere set glimt = coalesce(glimt, 100) + a.pris where navn_lille = a.saelger_lille;
  else
    update hv_spillere set stella = greatest(0, coalesce(stella, 0) - a.pris) where id = k.id returning * into k;
    update hv_spillere set stella = coalesce(stella, 5) + a.pris where navn_lille = a.saelger_lille;
  end if;
  update hv_lop_annoncer set status = 'solgt', koeber = s.navn, koeber_lille = s.navn_lille, solgt_tid = now(),
    reserveret_af = null, reserveret_til = null where id = a.id;
  perform hv_lop_fjern_moebel(a.bod_id, a.moebel_id);
  insert into hv_lop_leveringer (til_lille, type, grund) values (s.navn_lille, a.type, 'Købt på loppemarkedet');
  return json_build_object('glimt', k.glimt, 'stella', k.stella, 'type', a.type);
end $$;


-- -------------------------------------------------------------
--  Bytte: man byder et af sine egne møbler. Sælgeren skal sige ja.
--  Det bydte møbel er "i hånden" hos serveren, indtil der er svar.
-- -------------------------------------------------------------
create or replace function public.hv_lop_byd_bytte(p_token uuid, p_id bigint, p_type text)
returns bigint language plpgsql security definer set search_path = public as $$
declare s hv_spillere; a hv_lop_annoncer; ny bigint;
begin
  s := hv_lop_mig(p_token);
  if not hv_lop_er_aaben() then raise exception '🔒 Loppemarkedet er lukket. Kom igen på søndag!'; end if;
  if coalesce(p_type, '') = '' then raise exception 'Vælg et møbel at bytte med.'; end if;
  select * into a from hv_lop_annoncer where id = p_id for update;
  if a.id is null or a.status <> 'aktiv' then raise exception 'Den er desværre solgt.'; end if;
  if a.saelger_lille = s.navn_lille then raise exception 'Du kan ikke bytte med dig selv.'; end if;
  if hv_lop_optaget(a) then raise exception 'Der er allerede en handel i gang med den. Prøv igen senere.'; end if;
  if (select count(*) from hv_lop_bytte where fra_lille = s.navn_lille and status = 'venter') >= 5 then
    raise exception 'Du har allerede 5 bytteforslag, der venter på svar.';
  end if;
  insert into hv_lop_bytte (annonce_id, fra, fra_lille, type) values (a.id, s.navn, s.navn_lille, left(p_type, 60)) returning id into ny;
  return ny;
end $$;

create or replace function public.hv_lop_bytte_svar(p_token uuid, p_bytte bigint, p_ja boolean)
returns void language plpgsql security definer set search_path = public as $$
declare s hv_spillere; b hv_lop_bytte; a hv_lop_annoncer;
begin
  s := hv_lop_mig(p_token);
  select * into b from hv_lop_bytte where id = p_bytte for update;
  if b.id is null or b.status <> 'venter' then raise exception 'Bytteforslaget findes ikke længere.'; end if;
  select * into a from hv_lop_annoncer where id = b.annonce_id for update;
  if a.saelger_lille <> s.navn_lille then raise exception 'Det er ikke dit bytte at svare på.'; end if;
  if not p_ja or a.status <> 'aktiv' then
    update hv_lop_bytte set status = 'afvist', svar_tid = now() where id = b.id;
    insert into hv_lop_leveringer (til_lille, type, grund) values (b.fra_lille, b.type, a.saelger || ' sagde nej tak til dit bytte');
    return;
  end if;
  -- begge har sagt ja: møblerne skifter ejer
  update hv_lop_bytte set status = 'godkendt', svar_tid = now() where id = b.id;
  update hv_lop_annoncer set status = 'byttet', koeber = b.fra, koeber_lille = b.fra_lille, bytte_type = b.type, solgt_tid = now(),
    reserveret_af = null, reserveret_til = null where id = a.id;
  perform hv_lop_fjern_moebel(a.bod_id, a.moebel_id);
  insert into hv_lop_leveringer (til_lille, type, grund) values (b.fra_lille, a.type, 'Byttet med ' || a.saelger || ' på loppemarkedet');
  insert into hv_lop_leveringer (til_lille, type, grund) values (a.saelger_lille, b.type, 'Byttet med ' || b.fra || ' på loppemarkedet');
  -- andre bud på samme ting går tilbage
  update hv_lop_bytte set status = 'afvist', svar_tid = now() where annonce_id = a.id and status = 'venter';
end $$;

create or replace function public.hv_lop_bytte_annuller(p_token uuid, p_bytte bigint)
returns void language plpgsql security definer set search_path = public as $$
declare s hv_spillere; b hv_lop_bytte;
begin
  s := hv_lop_mig(p_token);
  select * into b from hv_lop_bytte where id = p_bytte for update;
  if b.id is null or b.status <> 'venter' or b.fra_lille <> s.navn_lille then return; end if;
  update hv_lop_bytte set status = 'annulleret', svar_tid = now() where id = b.id;
  insert into hv_lop_leveringer (til_lille, type, grund) values (b.fra_lille, b.type, 'Dit bytteforslag er trukket tilbage');
end $$;


-- -------------------------------------------------------------
--  Ansatte låser og åbner markedet. Ejeren bestemmer, hvor mange annoncer man må have.
-- -------------------------------------------------------------
create or replace function public.hv_lop_status_saet(p_token uuid, p_tilstand text, p_maks int)
returns void language plpgsql security definer set search_path = public as $$
declare s hv_spillere;
begin
  s := hv_lop_mig(p_token);
  if not hv_er_ansat(s.navn) then raise exception 'Kun ejeren og de ansatte kan låse og åbne loppemarkedet.'; end if;
  if p_tilstand is not null then
    if p_tilstand not in ('lukket', 'aaben', 'soendag') then raise exception 'Ukendt valg.'; end if;
    update hv_lop_status set tilstand = p_tilstand, hvem = s.navn, tid = now() where id = 1;
    begin insert into hv_adminlog (hvem, hvad) values (s.navn, case p_tilstand when 'aaben' then 'Åbnede loppemarkedet'
      when 'lukket' then 'Låste loppemarkedet' else 'Satte loppemarkedet til at åbne hver søndag' end); exception when others then null; end;
  end if;
  if p_maks is not null then
    if not hv_er_ejer(s.navn) then raise exception 'Kun ejeren kan ændre antallet af annoncer.'; end if;
    update hv_lop_status set maks_annoncer = greatest(1, least(p_maks, 100)) where id = 1;
  end if;
end $$;

revoke all on function public.hv_lop_er_aaben, public.hv_lop_mig, public.hv_lop_optaget, public.hv_lop_fjern_moebel, public.hv_lop_ryd_bytte from public, anon, authenticated;
revoke all on function public.hv_lop_hent, public.hv_lop_leveringer_hent, public.hv_lop_bod_opret, public.hv_lop_bod_navn, public.hv_lop_bod_gem,
  public.hv_lop_tag_hjem, public.hv_lop_bod_slet, public.hv_lop_saelg, public.hv_lop_pris, public.hv_lop_fjern, public.hv_lop_reserver,
  public.hv_lop_frigiv, public.hv_lop_koeb, public.hv_lop_byd_bytte, public.hv_lop_bytte_svar, public.hv_lop_bytte_annuller, public.hv_lop_status_saet from public;
grant execute on function public.hv_lop_hent, public.hv_lop_leveringer_hent, public.hv_lop_bod_opret, public.hv_lop_bod_navn, public.hv_lop_bod_gem,
  public.hv_lop_tag_hjem, public.hv_lop_bod_slet, public.hv_lop_saelg, public.hv_lop_pris, public.hv_lop_fjern, public.hv_lop_reserver,
  public.hv_lop_frigiv, public.hv_lop_koeb, public.hv_lop_byd_bytte, public.hv_lop_bytte_svar, public.hv_lop_bytte_annuller, public.hv_lop_status_saet to anon, authenticated;
notify pgrst, 'reload schema';

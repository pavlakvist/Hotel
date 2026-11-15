-- HELLO VERA, del 56: ❓ Hotel-quiz
-- Hver 10. minut (ejeren kan ændre det) kommer et spørgsmål op på HELE hotellet.
-- Man svarer ved at skrive  :S  og svaret i chatten, fx  :S 56
-- Den første med det rigtige svar vinder 2 Glimt ⭐ (ejeren kan ændre præmien).
-- Serveren bestemmer alt (hvornår, hvilket spørgsmål, hvem der var først), så man ikke kan snyde.
-- Mutede, frosne og bannede spillere kan ikke se eller svare på spørgsmålene.
-- Regnestykker laves af serveren selv. Alle de andre spørgsmål står i js/hotel-quiz-spoergsmaal.js
-- og bliver sendt hertil af sig selv, når ejeren er inde på hotellet.
--
-- Kopiér ALT herfra → Supabase → SQL Editor → + New query → Run. Må gerne køres flere gange.

-- Indstillinger (kun én række)
create table if not exists public.hv_quiz_ind (
  id integer primary key default 1 check (id = 1),
  til boolean not null default true,      -- er quizzen slået til?
  minutter integer not null default 10,   -- hvor tit kommer et spørgsmål
  aaben integer not null default 3,       -- hvor mange minutter man har til at svare
  praemie integer not null default 2,     -- Glimt til vinderen
  regne integer not null default 35,      -- hvor mange procent af spørgsmålene er regnestykker
  opdateret timestamptz not null default now()
);
insert into public.hv_quiz_ind (id) values (1) on conflict (id) do nothing;

-- Spørgsmålene fra js/hotel-quiz-spoergsmaal.js
create table if not exists public.hv_quiz_spm (
  id bigint generated always as identity primary key,
  spoergsmaal text not null unique,
  svar text[] not null,
  aktiv boolean not null default true,    -- false = ikke på listen længere
  brugt boolean not null default false    -- true = allerede stillet i denne runde af listen
);

-- Hvert spørgsmål, der er blevet stillet
create table if not exists public.hv_quiz_runde (
  id bigint generated always as identity primary key,
  spm_id bigint,
  spoergsmaal text not null,
  svar text[] not null,
  start timestamptz not null default now(),
  slut timestamptz not null,
  praemie integer not null default 2,
  vinder text,
  vinder_id bigint,
  vundet timestamptz
);
create index if not exists hv_quiz_runde_start on public.hv_quiz_runde (start desc);

-- Hvor mange gange hver spiller har svaret på et spørgsmål (højst 5, så man ikke kan gætte løs)
create table if not exists public.hv_quiz_forsoeg (
  runde_id bigint not null,
  spiller_id bigint not null,
  antal integer not null default 0,
  primary key (runde_id, spiller_id)
);

alter table public.hv_quiz_ind enable row level security;
alter table public.hv_quiz_spm enable row level security;
alter table public.hv_quiz_runde enable row level security;
alter table public.hv_quiz_forsoeg enable row level security;
revoke all on public.hv_quiz_ind, public.hv_quiz_spm, public.hv_quiz_runde, public.hv_quiz_forsoeg from anon, authenticated;

-- Er spilleren mutet, frosset eller bannet lige nu?
create or replace function public.hv_quiz_straffet(p_navn text)
returns boolean language plpgsql stable security definer set search_path = public as $$
declare d jsonb; nu bigint := (extract(epoch from now()) * 1000)::bigint;
begin
  if hv_er_ejer(p_navn) then return false; end if;
  select data into d from hv_straffe where navn_lille = lower(p_navn);
  if d is null then return false; end if;
  return coalesce((d->>'bannet')::boolean, false)
    or coalesce((d->>'bannetTil')::numeric, 0) > nu
    or coalesce((d->>'frysTil')::numeric, 0) > nu
    or coalesce((d->>'timeoutTil')::numeric, 0) > nu;
exception when others then return false;
end $$;

-- Gør et svar "rent", så store/små bogstaver, mellemrum, tegn og "en/et/den/det" ikke betyder noget
create or replace function public.hv_quiz_rens(p_tekst text)
returns text language plpgsql immutable set search_path = public as $$
declare t text := lower(trim(coalesce(p_tekst, '')));
begin
  t := regexp_replace(t, '^(en|et|den|det|de|i|på|the|a|an)\s+', '');
  t := replace(t, ',', '.');
  t := regexp_replace(t, '\.0+$', '');
  t := regexp_replace(t, '[^a-z0-9æøåäöüéè.]', '', 'g');
  t := regexp_replace(t, '\.$', '');
  t := regexp_replace(t, '(grader|kr|kroner|stk)$', '');
  return t;
end $$;

-- Lav et nyt spørgsmål (bruges kun inde i serveren)
create or replace function public.hv_quiz_ny_runde(p_ind hv_quiz_ind)
returns void language plpgsql security definer set search_path = public as $$
declare q hv_quiz_spm; a integer; b integer; v integer; tekst text; slag integer;
begin
  -- luk det gamle spørgsmål, hvis det stadig er åbent
  update hv_quiz_runde set slut = now() where slut > now() and vinder is null;

  if random() * 100 >= p_ind.regne then
    select * into q from hv_quiz_spm where aktiv and not brugt order by random() limit 1;
    if q.id is null then
      -- alle spørgsmål er brugt: bland forfra
      update hv_quiz_spm set brugt = false where aktiv;
      select * into q from hv_quiz_spm where aktiv order by random() limit 1;
    end if;
  end if;

  if q.id is not null then
    update hv_quiz_spm set brugt = true where id = q.id;
    insert into hv_quiz_runde (spm_id, spoergsmaal, svar, slut, praemie)
    values (q.id, q.spoergsmaal, q.svar, now() + make_interval(mins => p_ind.aaben), p_ind.praemie);
    return;
  end if;

  -- 🧮 Regnestykke, som serveren selv finder på
  slag := floor(random() * 4)::integer;
  if slag = 0 then
    a := 11 + floor(random() * 89)::integer; b := 11 + floor(random() * 89)::integer; v := a + b;
    tekst := 'Hvad er ' || a || ' + ' || b || '?';
  elsif slag = 1 then
    a := 30 + floor(random() * 70)::integer; b := 5 + floor(random() * (a - 5))::integer; v := a - b;
    tekst := 'Hvad er ' || a || ' − ' || b || '?';
  elsif slag = 2 then
    a := 3 + floor(random() * 10)::integer; b := 3 + floor(random() * 10)::integer; v := a * b;
    tekst := 'Hvad er ' || a || ' × ' || b || '?';
  else
    b := 2 + floor(random() * 9)::integer; v := 2 + floor(random() * 11)::integer; a := b * v;
    tekst := 'Hvad er ' || a || ' : ' || b || '?';
  end if;
  insert into hv_quiz_runde (spoergsmaal, svar, slut, praemie)
  values ('🧮 ' || tekst, array[v::text], now() + make_interval(mins => p_ind.aaben), p_ind.praemie);
end $$;

-- Det aktuelle spørgsmål som JSON (svaret er kun med, når spørgsmålet er slut)
create or replace function public.hv_quiz_json(r hv_quiz_runde)
returns json language sql stable security definer set search_path = public as $$
  select case when r.id is null then null else json_build_object(
    'id', r.id,
    'spoergsmaal', r.spoergsmaal,
    'start', (extract(epoch from r.start) * 1000)::bigint,
    'slut', (extract(epoch from r.slut) * 1000)::bigint,
    'praemie', r.praemie,
    'vinder', r.vinder,
    'vundet', (extract(epoch from r.vundet) * 1000)::bigint,
    'svar', case when r.vinder is not null or r.slut <= now() then r.svar[1] end
  ) end;
$$;

-- Alle spillere spørger hvert 4. sekund: "Er der et spørgsmål?"
-- Er det tid til et nyt, laver serveren det her (kun én gang, selvom mange spørger på samme tid).
create or replace function public.hv_quiz_hent(p_token uuid)
returns json language plpgsql security definer set search_path = public as $$
declare s hv_spillere; ind hv_quiz_ind; r hv_quiz_runde; straf boolean;
begin
  select * into s from hv_spillere where token = p_token;
  if s.id is null then raise exception 'Du er ikke logget ind.'; end if;
  select * into ind from hv_quiz_ind where id = 1;
  select * into r from hv_quiz_runde order by id desc limit 1;

  if ind.til and (r.id is null or now() >= r.start + make_interval(mins => ind.minutter)) then
    -- lås, så kun én laver det nye spørgsmål
    select * into ind from hv_quiz_ind where id = 1 for update;
    select * into r from hv_quiz_runde order by id desc limit 1;
    if ind.til and (r.id is null or now() >= r.start + make_interval(mins => ind.minutter)) then
      perform hv_quiz_ny_runde(ind);
      select * into r from hv_quiz_runde order by id desc limit 1;
    end if;
  end if;

  straf := hv_quiz_straffet(s.navn);
  return json_build_object(
    'til', ind.til,
    'minutter', ind.minutter,
    'praemie', ind.praemie,
    'nu', (extract(epoch from now()) * 1000)::bigint,
    'naeste', case when ind.til and r.id is not null then (extract(epoch from r.start + make_interval(mins => ind.minutter)) * 1000)::bigint end,
    'straf', straf,
    'runde', case when straf then null else hv_quiz_json(r) end);
end $$;

-- :S svar
create or replace function public.hv_quiz_svar(p_token uuid, p_runde bigint, p_svar text)
returns json language plpgsql security definer set search_path = public as $$
declare s hv_spillere; r hv_quiz_runde; n integer; rigtig boolean; vandt hv_quiz_runde;
begin
  select * into s from hv_spillere where token = p_token;
  if s.id is null then raise exception 'Du er ikke logget ind.'; end if;
  if hv_quiz_straffet(s.navn) then raise exception 'Du kan ikke svare på quizzen, mens du er mutet, frosset eller bannet.'; end if;
  if length(trim(coalesce(p_svar, ''))) = 0 then raise exception 'Skriv dit svar efter :S, fx :S 42'; end if;

  if p_runde is null then
    select * into r from hv_quiz_runde order by id desc limit 1;
  else
    select * into r from hv_quiz_runde where id = p_runde;
  end if;
  if r.id is null then return json_build_object('ok', false, 'hvorfor', 'intet'); end if;
  if r.vinder is not null then return json_build_object('ok', false, 'hvorfor', 'for_sent', 'vinder', r.vinder); end if;
  if r.slut <= now() then return json_build_object('ok', false, 'hvorfor', 'lukket'); end if;

  insert into hv_quiz_forsoeg (runde_id, spiller_id, antal) values (r.id, s.id, 1)
  on conflict (runde_id, spiller_id) do update set antal = hv_quiz_forsoeg.antal + 1
  returning antal into n;
  if n > 5 then return json_build_object('ok', false, 'hvorfor', 'for_mange'); end if;

  rigtig := hv_quiz_rens(p_svar) <> '' and exists (select 1 from unnest(r.svar) x where hv_quiz_rens(x) = hv_quiz_rens(p_svar));
  if not rigtig then return json_build_object('ok', false, 'hvorfor', 'forkert', 'tilbage', 5 - n); end if;

  -- Kun den første får præmien (where vinder is null gør, at to på samme tid ikke begge kan vinde)
  update hv_quiz_runde set vinder = s.navn, vinder_id = s.id, vundet = now()
  where id = r.id and vinder is null and slut > now() returning * into vandt;
  if vandt.id is null then
    select * into r from hv_quiz_runde where id = r.id;
    return json_build_object('ok', false, 'hvorfor', 'for_sent', 'vinder', r.vinder);
  end if;

  update hv_spillere set glimt = coalesce(glimt, 0) + vandt.praemie where id = s.id returning * into s;
  return json_build_object('ok', true, 'praemie', vandt.praemie, 'svar', vandt.svar[1],
    'glimt', coalesce(s.glimt, 0), 'stella', coalesce(s.stella, 0));
end $$;

-- Ejeren: slå til/fra, interval, svartid, præmie og hvor mange regnestykker
create or replace function public.hv_quiz_indstil(p_token uuid, p_til boolean, p_minutter integer, p_aaben integer, p_praemie integer, p_regne integer)
returns void language plpgsql security definer set search_path = public as $$
declare s hv_spillere;
begin
  select * into s from hv_spillere where token = p_token;
  if s.id is null then raise exception 'Du er ikke logget ind.'; end if;
  if not hv_er_ejer(s.navn) then raise exception 'Kun hotellets ejer kan ændre quizzen.'; end if;
  update hv_quiz_ind set
    til = coalesce(p_til, til),
    minutter = least(greatest(coalesce(p_minutter, minutter), 1), 1440),
    aaben = least(greatest(coalesce(p_aaben, aaben), 1), 60),
    praemie = least(greatest(coalesce(p_praemie, praemie), 0), 100),
    regne = least(greatest(coalesce(p_regne, regne), 0), 100),
    opdateret = now()
  where id = 1;
  -- svartiden må ikke være længere end tiden mellem spørgsmålene
  update hv_quiz_ind set aaben = least(aaben, minutter) where id = 1;
end $$;

-- Ejeren: stil et nyt spørgsmål med det samme
create or replace function public.hv_quiz_nu(p_token uuid)
returns void language plpgsql security definer set search_path = public as $$
declare s hv_spillere; ind hv_quiz_ind;
begin
  select * into s from hv_spillere where token = p_token;
  if s.id is null then raise exception 'Du er ikke logget ind.'; end if;
  if not hv_er_ejer(s.navn) then raise exception 'Kun hotellets ejer kan stille et spørgsmål.'; end if;
  select * into ind from hv_quiz_ind where id = 1 for update;
  perform hv_quiz_ny_runde(ind);
end $$;

-- Ejeren: sender listen fra js/hotel-quiz-spoergsmaal.js til serveren (sker af sig selv)
-- p_liste = [["Spørgsmål", "Svar", "Andet rigtigt svar", ...], ...]
create or replace function public.hv_quiz_spm_saet(p_token uuid, p_liste json)
returns json language plpgsql security definer set search_path = public as $$
declare s hv_spillere; e json; spm text; svar text[];
begin
  select * into s from hv_spillere where token = p_token;
  if s.id is null then raise exception 'Du er ikke logget ind.'; end if;
  if not hv_er_ejer(s.navn) then raise exception 'Kun hotellets ejer kan ændre spørgsmålene.'; end if;
  if json_typeof(p_liste) <> 'array' then raise exception 'Listen skal være en liste.'; end if;
  update hv_quiz_spm set aktiv = false;
  for e in select * from json_array_elements(p_liste) loop
    if json_typeof(e) <> 'array' or json_array_length(e) < 2 then continue; end if;
    spm := left(trim(e->>0), 300);
    select array_agg(left(trim(x), 100)) into svar from json_array_elements_text(e) with ordinality as t(x, i) where i > 1 and trim(x) <> '';
    if spm = '' or svar is null then continue; end if;
    insert into hv_quiz_spm (spoergsmaal, svar, aktiv) values (spm, svar, true)
    on conflict (spoergsmaal) do update set svar = excluded.svar, aktiv = true;
  end loop;
  return json_build_object('antal', (select count(*) from hv_quiz_spm where aktiv));
end $$;

-- Ejeren: alt til Ejerpanel → ❓ Hotel-quiz
create or replace function public.hv_quiz_ejer(p_token uuid)
returns json language plpgsql security definer set search_path = public as $$
declare s hv_spillere; ind hv_quiz_ind;
begin
  select * into s from hv_spillere where token = p_token;
  if s.id is null then raise exception 'Du er ikke logget ind.'; end if;
  if not hv_er_ejer(s.navn) then raise exception 'Kun hotellets ejer kan se quizzen.'; end if;
  select * into ind from hv_quiz_ind where id = 1;
  return json_build_object(
    'til', ind.til, 'minutter', ind.minutter, 'aaben', ind.aaben, 'praemie', ind.praemie, 'regne', ind.regne,
    'spm', (select count(*) from hv_quiz_spm where aktiv),
    'brugt', (select count(*) from hv_quiz_spm where aktiv and brugt),
    'stillet', (select count(*) from hv_quiz_runde),
    'vundet', (select count(*) from hv_quiz_runde where vinder is not null),
    'glimt_ud', (select coalesce(sum(praemie), 0) from hv_quiz_runde where vinder is not null),
    'top', coalesce((select json_agg(t) from (select vinder as navn, count(*) as antal, sum(praemie) as glimt
        from hv_quiz_runde where vinder is not null group by vinder order by count(*) desc, max(vundet) limit 10) t), '[]'::json),
    'seneste', coalesce((select json_agg(x order by x.id desc) from (select id, spoergsmaal, svar[1] as svar, vinder, praemie,
        (extract(epoch from start) * 1000)::bigint as start, (extract(epoch from slut) * 1000)::bigint as slut,
        (extract(epoch from vundet) * 1000)::bigint as vundet
        from hv_quiz_runde order by id desc limit 30) x), '[]'::json));
end $$;

revoke all on function public.hv_quiz_straffet(text), public.hv_quiz_ny_runde(hv_quiz_ind), public.hv_quiz_json(hv_quiz_runde)
  from public, anon, authenticated;
revoke all on function public.hv_quiz_hent(uuid), public.hv_quiz_svar(uuid, bigint, text),
  public.hv_quiz_indstil(uuid, boolean, integer, integer, integer, integer), public.hv_quiz_nu(uuid),
  public.hv_quiz_spm_saet(uuid, json), public.hv_quiz_ejer(uuid) from public;
grant execute on function public.hv_quiz_hent(uuid), public.hv_quiz_svar(uuid, bigint, text),
  public.hv_quiz_indstil(uuid, boolean, integer, integer, integer, integer), public.hv_quiz_nu(uuid),
  public.hv_quiz_spm_saet(uuid, json), public.hv_quiz_ejer(uuid), public.hv_quiz_rens(text) to anon, authenticated;

-- HELLO VERA, del 46: 🎬 Vera-cinema — biografens program, arrangementer og billetter
-- - Ejeren og de ansatte lægger film og arrangementer i programmet (Ejerpanel → 🎟 Vera-cinema).
-- - Gæsterne køber billet i appen Vera-cinema på telefonen: skriv navn, vælg sæde, 1 Glimt pr. billet.
-- - Kun 1 billet pr. person pr. visning. Når alle 32 sæder er taget, er der udsolgt.
-- Kopiér ALT herfra → Supabase → SQL Editor → + New query → Run. Må gerne køres flere gange.

-- 1) Programmet: film og arrangementer
create table if not exists public.hv_cinema_visninger (
  id bigint generated always as identity primary key,
  type text not null default 'film' check (type in ('film', 'event')),
  titel text not null,
  tekst text not null default '',
  start timestamptz not null,
  varighed integer not null default 120 check (varighed between 5 and 600),   -- minutter
  youtube text not null default '',
  plakat text not null default '🎬',
  farve text not null default '#7a1b2b',
  pris integer not null default 1 check (pris between 0 and 1000),
  oprettet_af text not null default '',
  oprettet timestamptz not null default now()
);
create index if not exists hv_cinema_visninger_start on public.hv_cinema_visninger (start);

-- 2) Billetterne: ét sæde kan kun sælges én gang, og én person kan kun have én billet pr. visning
create table if not exists public.hv_cinema_billetter (
  id bigint generated always as identity primary key,
  visning_id bigint not null references public.hv_cinema_visninger (id) on delete cascade,
  saede text not null check (saede ~ '^[A-D][1-8]$'),
  navn text not null,                 -- det navn, gæsten skrev i appen
  spiller_id bigint not null,
  spiller text not null,              -- profilens navn
  pris integer not null default 1,
  tid timestamptz not null default now(),
  unique (visning_id, saede),
  unique (visning_id, spiller_id)
);

alter table public.hv_cinema_visninger enable row level security;
alter table public.hv_cinema_billetter enable row level security;
revoke all on public.hv_cinema_visninger, public.hv_cinema_billetter from anon, authenticated;

-- Én visning som json
create or replace function public.hv_cinema_json(v hv_cinema_visninger)
returns json language sql stable security definer set search_path = public as $$
  select json_build_object('id', v.id, 'type', v.type, 'titel', v.titel, 'tekst', v.tekst,
    'start', (extract(epoch from v.start) * 1000)::bigint, 'varighed', v.varighed, 'youtube', v.youtube,
    'plakat', v.plakat, 'farve', v.farve, 'pris', v.pris,
    'optaget', coalesce((select json_agg(b.saede order by b.saede) from hv_cinema_billetter b where b.visning_id = v.id), '[]'::json));
$$;

-- 3) Programmet til appen (alle kan se det; med token får man også sine egne billetter)
create or replace function public.hv_cinema_hent(p_token uuid)
returns json language plpgsql security definer set search_path = public as $$
declare s hv_spillere;
begin
  if p_token is not null then select * into s from hv_spillere where token = p_token; end if;
  return json_build_object(
    'nu', (extract(epoch from now()) * 1000)::bigint,
    'program', coalesce((select json_agg(hv_cinema_json(v) order by v.start)
      from hv_cinema_visninger v where v.start + make_interval(mins => v.varighed) > now()), '[]'::json),
    'mine', case when s.id is null then '[]'::json else coalesce((select json_agg(json_build_object(
        'id', b.id, 'visning_id', b.visning_id, 'saede', b.saede, 'navn', b.navn, 'tid', (extract(epoch from b.tid) * 1000)::bigint,
        'titel', v.titel, 'type', v.type, 'plakat', v.plakat, 'farve', v.farve, 'start', (extract(epoch from v.start) * 1000)::bigint,
        'varighed', v.varighed) order by v.start)
      from hv_cinema_billetter b join hv_cinema_visninger v on v.id = b.visning_id
      where b.spiller_id = s.id and v.start + make_interval(mins => v.varighed) > now() - interval '1 day'), '[]'::json) end
  );
end $$;

-- 4) Køb en billet: 1 Glimt (visningens pris), ét sæde, én billet pr. person
create or replace function public.hv_cinema_book(p_token uuid, p_visning bigint, p_saede text, p_navn text)
returns json language plpgsql security definer set search_path = public as $$
declare s hv_spillere; v hv_cinema_visninger; b hv_cinema_billetter;
begin
  select * into s from hv_spillere where token = p_token for update;      -- ét køb ad gangen pr. spiller
  if s.id is null then raise exception 'Du er ikke logget ind.'; end if;
  select * into v from hv_cinema_visninger where id = p_visning for update; -- ét køb ad gangen pr. visning
  if v.id is null then raise exception 'Visningen findes ikke mere.'; end if;
  if v.start <= now() then raise exception 'Visningen er allerede startet, så der kan ikke købes billetter mere.'; end if;
  p_saede := upper(trim(coalesce(p_saede, '')));
  if p_saede !~ '^[A-D][1-8]$' then raise exception 'Vælg et sæde.'; end if;
  p_navn := left(trim(coalesce(p_navn, '')), 30);
  if p_navn = '' then raise exception 'Skriv dit navn på billetten.'; end if;
  if exists (select 1 from hv_cinema_billetter where visning_id = v.id and spiller_id = s.id) then
    raise exception 'Du har allerede en billet til denne visning. Man kan kun købe 1 billet pr. person.';
  end if;
  if (select count(*) from hv_cinema_billetter where visning_id = v.id) >= 32 then
    raise exception 'Der er udsolgt. Alle pladser er taget.';
  end if;
  if exists (select 1 from hv_cinema_billetter where visning_id = v.id and saede = p_saede) then
    raise exception 'Sæde % er lige blevet taget. Vælg et andet.', p_saede;
  end if;
  if coalesce(s.glimt, 0) < v.pris then raise exception 'Du har ikke nok Glimt. En billet koster %.', v.pris; end if;

  insert into hv_cinema_billetter (visning_id, saede, navn, spiller_id, spiller, pris)
  values (v.id, p_saede, p_navn, s.id, s.navn, v.pris) returning * into b;
  update hv_spillere set glimt = coalesce(glimt, 0) - v.pris where id = s.id returning * into s;
  return json_build_object('id', b.id, 'saede', b.saede, 'glimt', coalesce(s.glimt, 0), 'stella', coalesce(s.stella, 0));
end $$;

-- 5) Afbestil sin egen billet (før visningen starter) og få sin Glimt tilbage
create or replace function public.hv_cinema_afbestil(p_token uuid, p_visning bigint)
returns json language plpgsql security definer set search_path = public as $$
declare s hv_spillere; v hv_cinema_visninger; b hv_cinema_billetter;
begin
  select * into s from hv_spillere where token = p_token for update;
  if s.id is null then raise exception 'Du er ikke logget ind.'; end if;
  select * into v from hv_cinema_visninger where id = p_visning;
  if v.id is null then raise exception 'Visningen findes ikke mere.'; end if;
  if v.start <= now() then raise exception 'Visningen er startet, så billetten kan ikke afbestilles.'; end if;
  delete from hv_cinema_billetter where visning_id = v.id and spiller_id = s.id returning * into b;
  if b.id is null then raise exception 'Du har ingen billet til denne visning.'; end if;
  update hv_spillere set glimt = coalesce(glimt, 0) + b.pris where id = s.id returning * into s;
  return json_build_object('glimt', coalesce(s.glimt, 0), 'stella', coalesce(s.stella, 0));
end $$;

-- 6) Til ejeren og de ansatte: hele programmet (også de sidste 30 dage) og alle billetter med navne
create or replace function public.hv_cinema_personale(p_token uuid)
returns json language plpgsql security definer set search_path = public as $$
declare s hv_spillere;
begin
  select * into s from hv_spillere where token = p_token;
  if s.id is null then raise exception 'Du er ikke logget ind.'; end if;
  if not hv_er_ansat(s.navn) then raise exception 'Kun ejeren og de ansatte kan se bookingerne.'; end if;
  return json_build_object(
    'nu', (extract(epoch from now()) * 1000)::bigint,
    'program', coalesce((select json_agg(hv_cinema_json(v) order by v.start)
      from hv_cinema_visninger v where v.start > now() - interval '30 days'), '[]'::json),
    'billetter', coalesce((select json_agg(json_build_object('id', b.id, 'visning_id', b.visning_id, 'saede', b.saede,
        'navn', b.navn, 'spiller', b.spiller, 'pris', b.pris, 'tid', (extract(epoch from b.tid) * 1000)::bigint) order by b.id desc)
      from hv_cinema_billetter b join hv_cinema_visninger v on v.id = b.visning_id where v.start > now() - interval '30 days'), '[]'::json),
    'solgt_ialt', (select count(*) from hv_cinema_billetter),
    'glimt_ialt', (select coalesce(sum(pris), 0) from hv_cinema_billetter)
  );
end $$;

-- 7) Læg en film/et arrangement i programmet eller ret det (p_id = null → ny)
create or replace function public.hv_cinema_gem(p_token uuid, p_id bigint, p_data json)
returns json language plpgsql security definer set search_path = public as $$
declare s hv_spillere; v hv_cinema_visninger;
  v_type text := coalesce(p_data->>'type', 'film');
  v_titel text := left(trim(coalesce(p_data->>'titel', '')), 60);
  v_start timestamptz;
begin
  select * into s from hv_spillere where token = p_token;
  if s.id is null then raise exception 'Du er ikke logget ind.'; end if;
  if not hv_er_ansat(s.navn) then raise exception 'Kun ejeren og de ansatte kan lave biografens program.'; end if;
  if v_type not in ('film', 'event') then v_type := 'film'; end if;
  if v_titel = '' then raise exception 'Skriv en titel.'; end if;
  begin v_start := to_timestamp((p_data->>'start')::bigint / 1000.0);
  exception when others then raise exception 'Vælg dato og klokkeslæt.'; end;
  if v_start is null then raise exception 'Vælg dato og klokkeslæt.'; end if;
  if p_id is null then
    insert into hv_cinema_visninger (type, titel, tekst, start, varighed, youtube, plakat, farve, pris, oprettet_af)
    values (v_type, v_titel, left(coalesce(p_data->>'tekst', ''), 600), v_start,
      least(600, greatest(5, coalesce((p_data->>'varighed')::integer, 120))), left(coalesce(p_data->>'youtube', ''), 300),
      left(coalesce(nullif(p_data->>'plakat', ''), '🎬'), 8), left(coalesce(nullif(p_data->>'farve', ''), '#7a1b2b'), 20),
      least(1000, greatest(0, coalesce((p_data->>'pris')::integer, 1))), s.navn)
    returning * into v;
  else
    update hv_cinema_visninger set type = v_type, titel = v_titel, tekst = left(coalesce(p_data->>'tekst', ''), 600), start = v_start,
      varighed = least(600, greatest(5, coalesce((p_data->>'varighed')::integer, 120))), youtube = left(coalesce(p_data->>'youtube', ''), 300),
      plakat = left(coalesce(nullif(p_data->>'plakat', ''), '🎬'), 8), farve = left(coalesce(nullif(p_data->>'farve', ''), '#7a1b2b'), 20),
      pris = least(1000, greatest(0, coalesce((p_data->>'pris')::integer, 1)))
    where id = p_id returning * into v;
    if v.id is null then raise exception 'Visningen findes ikke mere.'; end if;
  end if;
  return hv_cinema_json(v);
end $$;

-- 8) Aflys en visning: alle med billet får deres Glimt tilbage
create or replace function public.hv_cinema_slet(p_token uuid, p_id bigint)
returns json language plpgsql security definer set search_path = public as $$
declare s hv_spillere; v hv_cinema_visninger; n integer := 0;
begin
  select * into s from hv_spillere where token = p_token;
  if s.id is null then raise exception 'Du er ikke logget ind.'; end if;
  if not hv_er_ansat(s.navn) then raise exception 'Kun ejeren og de ansatte kan aflyse.'; end if;
  select * into v from hv_cinema_visninger where id = p_id for update;
  if v.id is null then return json_build_object('tilbage', 0); end if;
  if v.start > now() then   -- kun penge tilbage, hvis visningen ikke har været
    update hv_spillere p set glimt = coalesce(p.glimt, 0) + b.pris from hv_cinema_billetter b where b.visning_id = v.id and b.spiller_id = p.id;
    get diagnostics n = row_count;
  end if;
  delete from hv_cinema_visninger where id = v.id;
  return json_build_object('tilbage', n);
end $$;

-- 9) Fjern én billet (fx ved en fejl). Gæsten får sin Glimt tilbage.
create or replace function public.hv_cinema_billet_fjern(p_token uuid, p_billet bigint)
returns json language plpgsql security definer set search_path = public as $$
declare s hv_spillere; b hv_cinema_billetter;
begin
  select * into s from hv_spillere where token = p_token;
  if s.id is null then raise exception 'Du er ikke logget ind.'; end if;
  if not hv_er_ansat(s.navn) then raise exception 'Kun ejeren og de ansatte kan fjerne billetter.'; end if;
  delete from hv_cinema_billetter where id = p_billet returning * into b;
  if b.id is null then raise exception 'Billetten findes ikke mere.'; end if;
  update hv_spillere set glimt = coalesce(glimt, 0) + b.pris where id = b.spiller_id;
  return json_build_object('ok', true);
end $$;

revoke all on function public.hv_cinema_json(hv_cinema_visninger) from public, anon, authenticated;
revoke all on function public.hv_cinema_hent, public.hv_cinema_book, public.hv_cinema_afbestil, public.hv_cinema_personale,
  public.hv_cinema_gem, public.hv_cinema_slet, public.hv_cinema_billet_fjern from public;
grant execute on function public.hv_cinema_hent, public.hv_cinema_book, public.hv_cinema_afbestil, public.hv_cinema_personale,
  public.hv_cinema_gem, public.hv_cinema_slet, public.hv_cinema_billet_fjern to anon, authenticated;

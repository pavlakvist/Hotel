-- HELLO VERA, del 42: 💱 Vekselbørs for Glimt ⭐ og Stella 🔮 + Hotellets økonomi i Ejerpanelet
-- Fast kurs for alle: 4 Glimt = 1 Stella (begge veje).
-- Kør database-6-penge.sql FØRST (det har du allerede gjort).
-- Kopiér ALT herfra → Supabase → SQL Editor → + New query → Run. Må gerne køres flere gange.
-- Bruger de Glimt og Stella, der allerede står på hver spiller (hv_spillere.glimt og .stella).

-- 1) Alle vekslinger gemmes her for altid
create table if not exists public.hv_veksler (
  id bigint generated always as identity primary key,
  spiller_id bigint not null,
  navn text not null,
  navn_lille text not null,
  fra text not null check (fra in ('glimt', 'stella')),
  beloeb integer not null check (beloeb > 0),
  til text not null check (til in ('glimt', 'stella')),
  modtaget integer not null check (modtaget > 0),
  glimt_foer integer not null, stella_foer integer not null,
  glimt_efter integer not null check (glimt_efter >= 0),
  stella_efter integer not null check (stella_efter >= 0),
  noegle uuid not null unique,          -- samme nøgle to gange = samme veksling (dobbeltklik)
  tid timestamptz not null default now()
);
create index if not exists hv_veksler_spiller on public.hv_veksler (navn_lille, id desc);
create index if not exists hv_veksler_tid on public.hv_veksler (tid);

-- 2) Hvor mange penge der var i hotellet hver dag (til grafen "Udvikling over tid")
create table if not exists public.hv_oekonomi_dag (
  dato date primary key,
  glimt bigint not null, stella bigint not null,           -- hos spillerne (ejerne er ikke talt med)
  ejer_glimt bigint not null default 0, ejer_stella bigint not null default 0,
  spillere integer not null default 0
);

alter table public.hv_veksler enable row level security;
alter table public.hv_oekonomi_dag enable row level security;
revoke all on public.hv_veksler, public.hv_oekonomi_dag from anon, authenticated;

-- Pengene må aldrig gå i minus
update public.hv_spillere set glimt = 0 where glimt < 0;
update public.hv_spillere set stella = 0 where stella < 0;
do $$ begin
  alter table public.hv_spillere add constraint hv_spillere_glimt_ikke_minus check (glimt is null or glimt >= 0);
exception when duplicate_object then null; end $$;
do $$ begin
  alter table public.hv_spillere add constraint hv_spillere_stella_ikke_minus check (stella is null or stella >= 0);
exception when duplicate_object then null; end $$;

-- Gem dagens tal (bruges kun af serveren selv)
create or replace function public.hv_oekonomi_gem_dag()
returns void language plpgsql security definer set search_path = public as $$
begin
  insert into hv_oekonomi_dag (dato, glimt, stella, ejer_glimt, ejer_stella, spillere)
  select (now() at time zone 'Europe/Copenhagen')::date,
    coalesce(sum(glimt) filter (where not hv_er_ejer(navn)), 0), coalesce(sum(stella) filter (where not hv_er_ejer(navn)), 0),
    coalesce(sum(glimt) filter (where hv_er_ejer(navn)), 0), coalesce(sum(stella) filter (where hv_er_ejer(navn)), 0),
    count(*) filter (where not hv_er_ejer(navn))
  from hv_spillere
  on conflict (dato) do update set glimt = excluded.glimt, stella = excluded.stella,
    ejer_glimt = excluded.ejer_glimt, ejer_stella = excluded.ejer_stella, spillere = excluded.spillere;
end $$;
select public.hv_oekonomi_gem_dag();

-- 3) Veksl. p_fra = 'glimt' eller 'stella', p_beloeb = hvor meget man giver,
--    p_noegle = et unikt nummer fra knappen, så et dobbeltklik ikke veksler to gange.
create or replace function public.hv_veksl(p_token uuid, p_fra text, p_beloeb integer, p_noegle uuid)
returns json language plpgsql security definer set search_path = public as $$
declare
  KURS constant integer := 4;            -- 4 Glimt = 1 Stella
  s hv_spillere; v hv_veksler; v_faar integer; v_til text;
begin
  if p_noegle is null then raise exception 'Prøv igen (mangler nøgle).'; end if;
  select * into s from hv_spillere where token = p_token for update;   -- én veksling ad gangen pr. spiller
  if s.id is null then raise exception 'Du er ikke logget ind.'; end if;

  -- Er den allerede lavet (dobbeltklik eller genindlæst side)? Så svar med den samme igen.
  select * into v from hv_veksler where noegle = p_noegle;
  if v.id is not null then
    if v.spiller_id <> s.id then raise exception 'Prøv igen.'; end if;
    return json_build_object('id', v.id, 'allerede', true, 'fra', v.fra, 'beloeb', v.beloeb, 'til', v.til, 'modtaget', v.modtaget,
      'glimt', s.glimt, 'stella', s.stella);
  end if;

  p_fra := lower(trim(coalesce(p_fra, '')));
  if p_fra not in ('glimt', 'stella') then raise exception 'Vælg Glimt eller Stella.'; end if;
  if p_beloeb is null or p_beloeb <= 0 then raise exception 'Skriv et beløb over 0.'; end if;
  if p_beloeb > 10000000 then raise exception 'Det er vist lige i overkanten 😅'; end if;

  if p_fra = 'glimt' then
    if p_beloeb % KURS <> 0 then raise exception 'Glimt veksles 4 ad gangen (4 Glimt = 1 Stella).'; end if;
    v_til := 'stella'; v_faar := p_beloeb / KURS;
    if coalesce(s.glimt, 0) < p_beloeb then raise exception 'Du har ikke nok Glimt. Du har %.', coalesce(s.glimt, 0); end if;
  else
    v_til := 'glimt'; v_faar := p_beloeb * KURS;
    if coalesce(s.stella, 0) < p_beloeb then raise exception 'Du har ikke nok Stella. Du har %.', coalesce(s.stella, 0); end if;
  end if;

  insert into hv_veksler (spiller_id, navn, navn_lille, fra, beloeb, til, modtaget, glimt_foer, stella_foer, glimt_efter, stella_efter, noegle)
  values (s.id, s.navn, s.navn_lille, p_fra, p_beloeb, v_til, v_faar, coalesce(s.glimt, 0), coalesce(s.stella, 0),
    coalesce(s.glimt, 0) + case when p_fra = 'glimt' then -p_beloeb else v_faar end,
    coalesce(s.stella, 0) + case when p_fra = 'stella' then -p_beloeb else v_faar end,
    p_noegle)
  returning * into v;

  update hv_spillere set glimt = v.glimt_efter, stella = v.stella_efter where id = s.id;
  perform hv_oekonomi_gem_dag();

  return json_build_object('id', v.id, 'allerede', false, 'fra', v.fra, 'beloeb', v.beloeb, 'til', v.til, 'modtaget', v.modtaget,
    'glimt', v.glimt_efter, 'stella', v.stella_efter);
end $$;

-- Én veksling som json (bruges af de næste to)
create or replace function public.hv_veksling_json(v hv_veksler)
returns json language sql immutable as $$
  select json_build_object('id', v.id, 'spiller_id', v.spiller_id, 'navn', v.navn, 'fra', v.fra, 'beloeb', v.beloeb,
    'til', v.til, 'modtaget', v.modtaget, 'glimt_foer', v.glimt_foer, 'stella_foer', v.stella_foer,
    'glimt_efter', v.glimt_efter, 'stella_efter', v.stella_efter, 'tid', (extract(epoch from v.tid) * 1000)::bigint);
$$;

-- 4) En spillers vekslinger. Almindelige spillere ser kun deres egne, ejeren kan se alles.
create or replace function public.hv_veksler_spiller(p_token uuid, p_navn text)
returns json language plpgsql security definer set search_path = public as $$
declare s hv_spillere; o hv_spillere;
begin
  select * into s from hv_spillere where token = p_token;
  if s.id is null then raise exception 'Du er ikke logget ind.'; end if;
  if p_navn is null or trim(p_navn) = '' or lower(trim(p_navn)) = s.navn_lille then o := s;
  else
    if not hv_er_ejer(s.navn) then raise exception 'Du kan kun se dine egne vekslinger.'; end if;
    select * into o from hv_spillere where navn_lille = lower(trim(p_navn));
    if o.id is null then raise exception 'Der findes ingen spiller, der hedder %.', trim(p_navn); end if;
  end if;
  return json_build_object('navn', o.navn, 'id', o.id, 'glimt', coalesce(o.glimt, 0), 'stella', coalesce(o.stella, 0),
    'antal', (select count(*) from hv_veksler where spiller_id = o.id),
    'liste', coalesce((select json_agg(hv_veksling_json(x) order by x.id desc)
      from (select * from hv_veksler where spiller_id = o.id order by id desc limit 200) x), '[]'::json));
end $$;

-- 5) Hotellets økonomi (kun ejeren)
create or replace function public.hv_oekonomi(p_token uuid)
returns json language plpgsql security definer set search_path = public as $$
declare s hv_spillere; v_idag date := (now() at time zone 'Europe/Copenhagen')::date;
begin
  select * into s from hv_spillere where token = p_token;
  if s.id is null then raise exception 'Du er ikke logget ind.'; end if;
  if not hv_er_ejer(s.navn) then raise exception 'Kun hotellets ejer kan se økonomien.'; end if;
  perform hv_oekonomi_gem_dag();
  return json_build_object(
    'kurs', 4,
    'glimt', (select coalesce(sum(glimt), 0) from hv_spillere where not hv_er_ejer(navn)),
    'stella', (select coalesce(sum(stella), 0) from hv_spillere where not hv_er_ejer(navn)),
    'ejer_glimt', (select coalesce(sum(glimt), 0) from hv_spillere where hv_er_ejer(navn)),
    'ejer_stella', (select coalesce(sum(stella), 0) from hv_spillere where hv_er_ejer(navn)),
    'spillere', (select count(*) from hv_spillere where not hv_er_ejer(navn)),
    'antal', (select count(*) from hv_veksler),
    'vekslere', (select count(distinct spiller_id) from hv_veksler),
    'g_til_s_glimt', (select coalesce(sum(beloeb), 0) from hv_veksler where fra = 'glimt'),
    'g_til_s_stella', (select coalesce(sum(modtaget), 0) from hv_veksler where fra = 'glimt'),
    's_til_g_stella', (select coalesce(sum(beloeb), 0) from hv_veksler where fra = 'stella'),
    's_til_g_glimt', (select coalesce(sum(modtaget), 0) from hv_veksler where fra = 'stella'),
    'idag', (select count(*) from hv_veksler where (tid at time zone 'Europe/Copenhagen')::date = v_idag),
    'seneste', coalesce((select json_agg(hv_veksling_json(x) order by x.id desc)
      from (select * from hv_veksler order by id desc limit 40) x), '[]'::json),
    -- de sidste 30 dage: penge i hotellet + hvor meget der blev vekslet
    'dage', coalesce((select json_agg(json_build_object('dato', d.dato, 'glimt', o.glimt, 'stella', o.stella,
        'antal', coalesce(v.antal, 0), 'g_ud', coalesce(v.g_ud, 0), 's_ud', coalesce(v.s_ud, 0)) order by d.dato)
      from generate_series(v_idag - 29, v_idag, interval '1 day') as g(dag)
      cross join lateral (select g.dag::date as dato) d
      left join hv_oekonomi_dag o on o.dato = d.dato
      left join (select (tid at time zone 'Europe/Copenhagen')::date as dato, count(*) as antal,
          sum(beloeb) filter (where fra = 'glimt') as g_ud, sum(beloeb) filter (where fra = 'stella') as s_ud
        from hv_veksler group by 1) v on v.dato = d.dato), '[]'::json)
  );
end $$;

-- 6) Sikkerhed: den gamle "byt"-regel (50 Glimt = 1 Stella) kunne bruges til at lave penge,
--    nu hvor kursen er 4. Almindelige spillere kan derfor kun BRUGE penge her.
--    At veksle sker kun i vekselbørsen (hv_veksl), hvor det bliver skrevet ned. Ejeren kan stadig alt.
create or replace function public.hv_penge_aendr(p_token uuid, p_glimt integer, p_stella integer)
returns json language plpgsql security definer set search_path = public as $$
declare s hv_spillere;
begin
  select * into s from hv_spillere where token = p_token for update;
  if s.id is null then raise exception 'Du er ikke logget ind.'; end if;
  p_glimt := coalesce(p_glimt, 0); p_stella := coalesce(p_stella, 0);
  if not hv_er_ejer(s.navn) then
    if p_glimt > 0 or p_stella > 0 then
      if p_glimt < 0 or p_stella < 0 then raise exception 'Brug 💱 Vekselbørsen for at veksle (4 Glimt = 1 Stella).'; end if;
      raise exception 'Du kan ikke lave penge selv 😉';
    end if;
    if coalesce(s.glimt, 0) + p_glimt < 0 or coalesce(s.stella, 0) + p_stella < 0 then raise exception 'Du har ikke råd.'; end if;
  end if;
  update hv_spillere set glimt = greatest(0, coalesce(glimt, 0) + p_glimt), stella = greatest(0, coalesce(stella, 0) + p_stella)
  where id = s.id returning * into s;
  return json_build_object('glimt', s.glimt, 'stella', s.stella);
end $$;

revoke all on function public.hv_veksl, public.hv_veksler_spiller, public.hv_oekonomi, public.hv_oekonomi_gem_dag,
  public.hv_veksling_json, public.hv_penge_aendr from public;
grant execute on function public.hv_veksl, public.hv_veksler_spiller, public.hv_oekonomi, public.hv_penge_aendr to anon, authenticated;

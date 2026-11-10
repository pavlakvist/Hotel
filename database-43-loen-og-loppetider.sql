-- HELLO VERA, del 43: 💼 Løn til de ansatte hver mandag + ⏰ åbningstider på loppemarkedet
-- Kræver at database-4 (ansatte), database-5 (adminlog), database-6 (penge) og database-32 (loppemarked) er kørt.
-- Kopiér ALT herfra → Supabase → SQL Editor → + New query → Run. Må gerne køres flere gange.


-- =============================================================
--  💼 LØN: hver mandag (dansk tid) får alle ansatte et beløb Glimt
--  - Ejeren slår lønnen til/fra og bestemmer beløbet (Ejerpanel → Personale → 💼 Løn).
--  - Lønnen gives kun til dem, der har et personale-skilt, når den udbetales.
--    Fyrer man nogen, får de altså ingen løn igen fra det øjeblik.
--  - Ejerne selv får ikke løn (de kan give sig selv penge).
--  - Lønnen udbetales første gang nogen er inde på hotellet om mandagen (eller senere i ugen),
--    og kun én gang pr. ansat pr. uge.
-- =============================================================
create table if not exists public.hv_loen_indstil (
  id int primary key default 1 check (id = 1),
  til boolean not null default true,
  beloeb int not null default 100,
  hvem text,
  tid timestamptz not null default now()
);
insert into public.hv_loen_indstil (id) values (1) on conflict (id) do nothing;

create table if not exists public.hv_loen_udbetalt (
  id bigint generated always as identity primary key,
  navn text not null,
  navn_lille text not null,
  skilt text,
  uge date not null,                                 -- mandagen i den uge, lønnen hører til
  beloeb int not null,
  tid timestamptz not null default now(),
  unique (navn_lille, uge)
);
alter table public.hv_loen_indstil enable row level security;
alter table public.hv_loen_udbetalt enable row level security;
revoke all on public.hv_loen_indstil, public.hv_loen_udbetalt from anon, authenticated;

-- Mandagen i denne uge (dansk tid)
create or replace function public.hv_loen_uge()
returns date language sql stable as $$
  select date_trunc('week', now() at time zone 'Europe/Copenhagen')::date;
$$;

-- Udbetal denne uges løn til alle, der er ansat lige nu og ikke har fået den endnu
create or replace function public.hv_loen_udbetal()
returns int language plpgsql security definer set search_path = public as $$
declare ind hv_loen_indstil; a record; antal int := 0; v_uge date := hv_loen_uge(); ny bigint;
begin
  select * into ind from hv_loen_indstil where id = 1;
  if ind.id is null or not ind.til or ind.beloeb <= 0 then return 0; end if;
  for a in select * from hv_ansatte where hv_er_ansat(navn) and not hv_er_ejer(navn) loop
    ny := null;
    insert into hv_loen_udbetalt (navn, navn_lille, skilt, uge, beloeb)
      values (a.navn, a.navn_lille, a.skilt, v_uge, ind.beloeb)
      on conflict (navn_lille, uge) do nothing returning id into ny;
    if ny is not null then
      update hv_spillere set glimt = coalesce(glimt, 100) + ind.beloeb where navn_lille = a.navn_lille;
      antal := antal + 1;
    end if;
  end loop;
  if antal > 0 then
    begin insert into hv_adminlog (hvem, hvad) values ('Hotellet', '💼 Ugens løn: ' || ind.beloeb || ' Glimt til ' || antal || ' ansatte'); exception when others then null; end;
  end if;
  return antal;
end $$;

-- Kaldes af alle spillere jævnligt. Udbetaler ugens løn (hvis den ikke er givet) og svarer,
-- om JEG har fået løn i denne uge.
create or replace function public.hv_loen_tjek(p_token uuid)
returns json language plpgsql security definer set search_path = public as $$
declare s hv_spillere; u hv_loen_udbetalt;
begin
  select * into s from hv_spillere where token = p_token;
  if s.id is null then raise exception 'Du er ikke logget ind.'; end if;
  perform hv_loen_udbetal();
  select * into u from hv_loen_udbetalt where navn_lille = s.navn_lille and uge = hv_loen_uge();
  return json_build_object('uge', hv_loen_uge(), 'fik', coalesce(u.beloeb, 0), 'tid', u.tid);
end $$;

-- Ejeren: slå til/fra og sæt beløbet (null = lad være som det er)
create or replace function public.hv_loen_saet(p_token uuid, p_til boolean, p_beloeb int)
returns void language plpgsql security definer set search_path = public as $$
declare s hv_spillere;
begin
  select * into s from hv_spillere where token = p_token;
  if s.id is null then raise exception 'Du er ikke logget ind.'; end if;
  if not hv_er_ejer(s.navn) then raise exception 'Kun hotellets ejer kan ændre lønnen.'; end if;
  if p_beloeb is not null and (p_beloeb < 1 or p_beloeb > 100000) then raise exception 'Lønnen skal være mellem 1 og 100.000 Glimt.'; end if;
  update hv_loen_indstil set til = coalesce(p_til, til), beloeb = coalesce(p_beloeb, beloeb), hvem = s.navn, tid = now() where id = 1;
  begin insert into hv_adminlog (hvem, hvad) values (s.navn, case
    when p_til is false then '💼 Slog ugens løn FRA'
    when p_til is true then '💼 Slog ugens løn TIL'
    else '💼 Satte ugens løn til ' || p_beloeb || ' Glimt' end); exception when others then null; end;
end $$;

-- Ejeren: alt om lønnen (indstillinger, ansatte lige nu, de seneste udbetalinger)
create or replace function public.hv_loen_hent(p_token uuid)
returns json language plpgsql security definer set search_path = public as $$
declare s hv_spillere; ind hv_loen_indstil;
begin
  select * into s from hv_spillere where token = p_token;
  if s.id is null then raise exception 'Du er ikke logget ind.'; end if;
  if not hv_er_ejer(s.navn) then raise exception 'Kun hotellets ejer kan se lønnen.'; end if;
  select * into ind from hv_loen_indstil where id = 1;
  return json_build_object(
    'til', ind.til, 'beloeb', ind.beloeb, 'uge', hv_loen_uge(),
    'ansatte', coalesce((select json_agg(json_build_object('navn', a.navn, 'skilt', a.skilt,
        'fik', (select u.beloeb from hv_loen_udbetalt u where u.navn_lille = a.navn_lille and u.uge = hv_loen_uge()),
        'ialt', (select coalesce(sum(u.beloeb), 0) from hv_loen_udbetalt u where u.navn_lille = a.navn_lille)) order by a.navn)
      from hv_ansatte a where hv_er_ansat(a.navn) and not hv_er_ejer(a.navn)), '[]'::json),
    'seneste', coalesce((select json_agg(x) from (select u.navn, u.skilt, u.beloeb, u.uge, u.tid from hv_loen_udbetalt u order by u.tid desc limit 40) x), '[]'::json)
  );
end $$;

revoke all on function public.hv_loen_uge, public.hv_loen_udbetal from public, anon, authenticated;
revoke all on function public.hv_loen_tjek, public.hv_loen_saet, public.hv_loen_hent from public;
grant execute on function public.hv_loen_tjek, public.hv_loen_saet, public.hv_loen_hent to anon, authenticated;


-- =============================================================
--  ⏰ LOPPEMARKEDET: åbningstider
--  Ny tilstand 'tider': markedet åbner og lukker selv efter de tider, der står i "tider".
--  tider = liste af { "dag": -1 (hver dag) eller 0–6 (0 = søndag, 1 = mandag …), "fra": "12:00", "til": "18:00" }
-- =============================================================
alter table public.hv_lop_status add column if not exists tider jsonb not null default '[]'::jsonb;

-- Er markedet åbent lige nu? (dansk tid)
create or replace function public.hv_lop_er_aaben()
returns boolean language sql stable security definer set search_path = public as $$
  select coalesce((
    select st.tilstand = 'aaben'
      or (st.tilstand = 'soendag' and extract(dow from (now() at time zone 'Europe/Copenhagen')) = 0)
      or (st.tilstand = 'tider' and exists (
        select 1 from jsonb_array_elements(st.tider) e
        where ((e->>'dag')::int = -1 or (e->>'dag')::int = extract(dow from (now() at time zone 'Europe/Copenhagen')))
          and (now() at time zone 'Europe/Copenhagen')::time >= (e->>'fra')::time
          and ((e->>'til') = '24:00' or (now() at time zone 'Europe/Copenhagen')::time < (e->>'til')::time)))
    from hv_lop_status st where st.id = 1), false);
$$;

-- Åben / lås / hver søndag / efter tider (samme som før, nu også 'tider')
create or replace function public.hv_lop_status_saet(p_token uuid, p_tilstand text, p_maks int)
returns void language plpgsql security definer set search_path = public as $$
declare s hv_spillere;
begin
  s := hv_lop_mig(p_token);
  if not hv_er_ansat(s.navn) then raise exception 'Kun ejeren og de ansatte kan låse og åbne loppemarkedet.'; end if;
  if p_tilstand is not null then
    if p_tilstand not in ('lukket', 'aaben', 'soendag', 'tider') then raise exception 'Ukendt valg.'; end if;
    update hv_lop_status set tilstand = p_tilstand, hvem = s.navn, tid = now() where id = 1;
    begin insert into hv_adminlog (hvem, hvad) values (s.navn, case p_tilstand when 'aaben' then 'Åbnede loppemarkedet'
      when 'lukket' then 'Låste loppemarkedet' when 'tider' then 'Satte loppemarkedet til at åbne efter tidspunkter'
      else 'Satte loppemarkedet til at åbne hver søndag' end); exception when others then null; end;
  end if;
  if p_maks is not null then
    if not hv_er_ejer(s.navn) then raise exception 'Kun ejeren kan ændre antallet af annoncer.'; end if;
    update hv_lop_status set maks_annoncer = greatest(1, least(p_maks, 100)) where id = 1;
  end if;
end $$;

-- Gem åbningstiderne (ejeren og de ansatte). Sætter også markedet til at følge tiderne.
create or replace function public.hv_lop_tider_saet(p_token uuid, p_tider jsonb)
returns void language plpgsql security definer set search_path = public as $$
declare s hv_spillere; e jsonb; d int;
begin
  s := hv_lop_mig(p_token);
  if not hv_er_ansat(s.navn) then raise exception 'Kun ejeren og de ansatte kan ændre åbningstiderne.'; end if;
  if p_tider is null or jsonb_typeof(p_tider) <> 'array' then raise exception 'Ugyldige tider.'; end if;
  if jsonb_array_length(p_tider) > 21 then raise exception 'Højst 21 tidspunkter.'; end if;
  for e in select * from jsonb_array_elements(p_tider) loop
    d := (e->>'dag')::int;
    if d < -1 or d > 6 then raise exception 'Ukendt dag.'; end if;
    if coalesce(e->>'fra', '') !~ '^([01][0-9]|2[0-3]):[0-5][0-9]$' then raise exception 'Skriv "fra" som fx 12:00.'; end if;
    if coalesce(e->>'til', '') !~ '^(([01][0-9]|2[0-3]):[0-5][0-9]|24:00)$' then raise exception 'Skriv "til" som fx 18:00.'; end if;
    if e->>'til' <> '24:00' and (e->>'til')::time <= (e->>'fra')::time then raise exception 'Lukketiden skal være efter åbningstiden (%–%).', e->>'fra', e->>'til'; end if;
  end loop;
  update hv_lop_status set tider = p_tider, tilstand = 'tider', hvem = s.navn, tid = now() where id = 1;
  begin insert into hv_adminlog (hvem, hvad) values (s.navn, 'Ændrede loppemarkedets åbningstider (' || jsonb_array_length(p_tider) || ' tidspunkter)'); exception when others then null; end;
end $$;

-- Hent åbningstiderne (alle, der er logget ind, så navigatøren kan vise "Åbner lørdag kl. 12")
create or replace function public.hv_lop_tider_hent(p_token uuid)
returns json language plpgsql security definer set search_path = public as $$
declare s hv_spillere; st hv_lop_status;
begin
  s := hv_lop_mig(p_token);
  select * into st from hv_lop_status where id = 1;
  return json_build_object('tider', coalesce(st.tider, '[]'::jsonb), 'tilstand', st.tilstand, 'aaben', hv_lop_er_aaben(),
    'nu', to_char(now() at time zone 'Europe/Copenhagen', 'YYYY-MM-DD"T"HH24:MI:SS'));
end $$;

revoke all on function public.hv_lop_er_aaben from public, anon, authenticated;
revoke all on function public.hv_lop_status_saet, public.hv_lop_tider_saet, public.hv_lop_tider_hent from public;
grant execute on function public.hv_lop_status_saet, public.hv_lop_tider_saet, public.hv_lop_tider_hent to anon, authenticated;
notify pgrst, 'reload schema';

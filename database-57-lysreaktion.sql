-- HELLO VERA, del 57: 💡 Lysreaktion — rummet med det lysende gulv
-- - Ejeren, Eventværter og Eventfolk styrer lyset fra Event-appen på telefonen:
--   tænd/sluk, tempo, farver og spillet "Lysreaktion": felter lyser i én farve, og den, der ikke når et ledigt felt,
--   er ude. Der er ét felt mindre hver runde (7, 6, 5 … 1). Den sidste tilbage vinder.
-- - Serveren holder styr på lyset, så alle i rummet ser det samme gulv, og afgør hvem der kom først på hvert felt.
-- - Ejeren og Bygmestre kan også flytte møblerne i rummet.
-- Kør database-21-eventnoter-vindere.sql FØRST (den laver hv_maa_skrive_events). Det er den allerede.
-- Kopiér ALT herfra → Supabase → SQL Editor → + New query → Run. Må gerne køres flere gange.

create table if not exists public.hv_lys (
  rum text primary key,
  tilstand jsonb not null default '{}'::jsonb,
  hvem text,
  tid timestamptz not null default now()
);
alter table public.hv_lys enable row level security;
revoke all on public.hv_lys from anon, authenticated;

drop function if exists public.hv_lys_ny_runde(jsonb, numeric);

-- (intern) en ny runde: N tilfældige felter på dansegulvet i én farve.
-- N = én færre end sidste runde (først højst 7), og altid mindst én færre end antal spillere, der er med.
create or replace function public.hv_lys_runde(t jsonb)
returns jsonb language plpgsql as $$
declare x0 int := coalesce((t->>'x0')::int, 0); y0 int := coalesce((t->>'y0')::int, 0);
  b int := greatest(1, coalesce((t->>'b')::int, 6)); d int := greatest(1, coalesce((t->>'d')::int, 6));
  med int := jsonb_array_length(coalesce(t->'med', '[]'::jsonb)); n int; felter jsonb;
begin
  n := least(7, med - 1, coalesce((t->>'antal')::int - 1, 7));
  if (t->>'fase') = 'omgang' then n := coalesce((t->>'antal')::int, n); end if;   -- runden tages om: samme antal felter
  n := greatest(1, n);
  select coalesce(jsonb_agg(jsonb_build_array(fx, fy)), '[]'::jsonb) into felter from (
    select x0 + gx as fx, y0 + gy as fy from generate_series(0, b - 1) gx, generate_series(0, d - 1) gy
    order by random() limit n) f;
  return t || jsonb_build_object('fase', 'runde', 'runde', coalesce((t->>'runde')::int, 0) + 1, 'antal', n, 'felter', felter,
    'optaget', '{}'::jsonb, 'ude_nu', '[]'::jsonb, 'farve', floor(random() * 8)::int,
    'rstart', (extract(epoch from now()) * 1000 + 4000)::bigint);
end $$;
revoke all on function public.hv_lys_runde from public;

-- (intern) runden er slut: de spillere, der ikke står på et felt, er ude
create or replace function public.hv_lys_afgoer(t jsonb)
returns jsonb language plpgsql as $$
declare tilbage jsonb; ude jsonb;
begin
  select coalesce(jsonb_agg(v), '[]'::jsonb) into tilbage from jsonb_each_text(coalesce(t->'optaget', '{}'::jsonb)) e(k, v);
  if jsonb_array_length(tilbage) = 0 then
    -- ingen nåede et felt: ingen ryger ud, runden tages om
    return t || jsonb_build_object('fase', 'omgang', 'ude_nu', '[]'::jsonb);
  end if;
  select coalesce(jsonb_agg(m), '[]'::jsonb) into ude from jsonb_array_elements_text(coalesce(t->'med', '[]'::jsonb)) m
    where not tilbage ? m;
  t := t || jsonb_build_object('med', tilbage, 'ude_nu', ude, 'ude', coalesce(t->'ude', '[]'::jsonb) || ude);
  if jsonb_array_length(tilbage) <= 1 then
    return t || jsonb_build_object('fase', 'vinder', 'vinder', tilbage->>0);
  end if;
  return t || jsonb_build_object('fase', 'slut_runde');
end $$;
revoke all on function public.hv_lys_afgoer from public;

-- Alle kan se lyset i et rum (og få serverens ur med, så alle viser det samme)
create or replace function public.hv_lys_hent(p_rum text)
returns json language plpgsql security definer set search_path = public as $$
declare r hv_lys; t jsonb; nu bigint := (extract(epoch from now()) * 1000)::bigint;
begin
  select * into r from hv_lys where rum = p_rum;
  if r.rum is null then return json_build_object('nu', nu, 'tilstand', '{}'::json); end if;
  t := r.tilstand;
  -- spillet: er tiden gået? Så er runden slut, og de, der ikke står på et felt, er ude
  if t->>'tilstand' = 'spil' and t->>'fase' = 'runde' and nu > (t->>'rstart')::bigint + coalesce((t->>'sek')::int, 7) * 1000 then
    select * into r from hv_lys where rum = p_rum for update;
    t := r.tilstand;
    if t->>'fase' = 'runde' and nu > (t->>'rstart')::bigint + coalesce((t->>'sek')::int, 7) * 1000 then
      t := hv_lys_afgoer(t);
      update hv_lys set tilstand = t, tid = now() where rum = p_rum;
    end if;
  end if;
  return json_build_object('nu', nu, 'tilstand', t);
end $$;

-- Ejeren, Eventværter og Eventfolk styrer lyset (fra Event-appen)
-- Spillet (tilstand 'spil') har en handling:
--   'tilmeld'  p_tilstand.spillere = navnene i rummet (ansatte og ejeren kommer ikke med)
--   'runde'    start næste runde (felterne bliver én færre)
--   'forfra'   alle de tilmeldte er med igen fra runde 1
--   'tempo'    skift tempo (tid til at finde et felt)
create or replace function public.hv_lys_saet(p_token uuid, p_rum text, p_tilstand jsonb)
returns json language plpgsql security definer set search_path = public as $$
declare s hv_spillere; gl jsonb; t jsonb; tilst text := coalesce(p_tilstand->>'tilstand', 'sluk');
  handling text := coalesce(p_tilstand->>'handling', ''); spillere jsonb;
begin
  select * into s from hv_spillere where token = p_token;
  if s.id is null then raise exception 'Du er ikke logget ind.'; end if;
  if not hv_maa_skrive_events(s.navn) then raise exception 'Kun ejeren, Eventværter og Eventfolk kan styre lyset.'; end if;
  if tilst not in ('sluk', 'et', 'disko', 'boelge', 'spil') then raise exception 'Ukendt lys.'; end if;
  select tilstand into gl from hv_lys where rum = p_rum for update;
  gl := coalesce(gl, '{}'::jsonb);
  t := jsonb_build_object(
    'tilstand', tilst,
    'tempo', least(greatest(coalesce((p_tilstand->>'tempo')::int, 3), 1), 5),
    'farve', left(coalesce(p_tilstand->>'farve', 'alle'), 10),
    'seed', floor(random() * 1000000)::int,
    'start', (extract(epoch from now()) * 1000)::bigint,
    'x0', least(greatest(coalesce((p_tilstand->>'x0')::int, 0), 0), 40), 'y0', least(greatest(coalesce((p_tilstand->>'y0')::int, 0), 0), 40),
    'b', least(greatest(coalesce((p_tilstand->>'b')::int, 6), 1), 30), 'd', least(greatest(coalesce((p_tilstand->>'d')::int, 6), 1), 30),
    'hvem', s.navn);
  if tilst = 'spil' then
    t := t || jsonb_build_object('sek', (array[14, 11, 9, 7, 5])[(t->>'tempo')::int]);
    if gl->>'tilstand' = 'spil' and handling <> 'tilmeld' then
      -- spillet fortsætter: behold deltagerne og runden
      t := (gl - 'tilstand' - 'tempo' - 'sek' - 'hvem' - 'x0' - 'y0' - 'b' - 'd' - 'seed' - 'start') || (t - 'farve');
    else
      if handling <> 'tilmeld' then raise exception 'Tryk først på 👥 Tilmeld spillerne i rummet.'; end if;
    end if;
    if handling = 'tilmeld' then
      select coalesce(jsonb_agg(distinct left(n, 40)), '[]'::jsonb) into spillere
      from jsonb_array_elements_text(case when jsonb_typeof(p_tilstand->'spillere') = 'array' then p_tilstand->'spillere' else '[]'::jsonb end) n
      where not hv_maa_skrive_events(n);
      if jsonb_array_length(spillere) > 60 then raise exception 'For mange spillere.'; end if;
      t := t || jsonb_build_object('fase', 'klar', 'deltagere', spillere, 'med', spillere, 'ude', '[]'::jsonb, 'ude_nu', '[]'::jsonb,
        'runde', 0, 'antal', null, 'felter', '[]'::jsonb, 'optaget', '{}'::jsonb, 'vinder', null);
    elsif handling = 'forfra' then
      t := t || jsonb_build_object('fase', 'klar', 'med', coalesce(t->'deltagere', '[]'::jsonb), 'ude', '[]'::jsonb, 'ude_nu', '[]'::jsonb,
        'runde', 0, 'antal', null, 'felter', '[]'::jsonb, 'optaget', '{}'::jsonb, 'vinder', null);
    elsif handling = 'runde' then
      if t->>'fase' = 'runde' then raise exception 'Runden er ikke slut endnu.'; end if;
      if t->>'fase' = 'vinder' then raise exception 'Spillet er slut. Tryk på 🔄 Start forfra.'; end if;
      if jsonb_array_length(coalesce(t->'med', '[]'::jsonb)) < 2 then raise exception 'Der skal være mindst 2 spillere med.'; end if;
      t := hv_lys_runde(t);
    end if;
  end if;
  insert into hv_lys (rum, tilstand, hvem) values (left(p_rum, 40), t, s.navn)
  on conflict (rum) do update set tilstand = excluded.tilstand, hvem = excluded.hvem, tid = now();
  return json_build_object('nu', (extract(epoch from now()) * 1000)::bigint, 'tilstand', t);
end $$;

-- En spiller står på et lysende felt: den første på feltet får det (serverens ur afgør det).
-- Når alle felterne er taget, er runden slut med det samme.
create or replace function public.hv_lys_ramt(p_token uuid, p_rum text, p_runde integer, p_x integer, p_y integer)
returns json language plpgsql security definer set search_path = public as $$
declare s hv_spillere; r hv_lys; t jsonb; nu bigint := (extract(epoch from now()) * 1000)::bigint; noegle text := p_x || ',' || p_y;
begin
  select * into s from hv_spillere where token = p_token;
  if s.id is null then raise exception 'Du er ikke logget ind.'; end if;
  select * into r from hv_lys where rum = p_rum for update;
  if r.rum is null then return json_build_object('ok', false); end if;
  t := r.tilstand;
  if t->>'tilstand' <> 'spil' or t->>'fase' <> 'runde' or (t->>'runde')::int <> p_runde or nu < (t->>'rstart')::bigint
     or nu > (t->>'rstart')::bigint + coalesce((t->>'sek')::int, 7) * 1000
     or not (coalesce(t->'med', '[]'::jsonb) ? s.navn)
     or not (coalesce(t->'felter', '[]'::jsonb) @> jsonb_build_array(jsonb_build_array(p_x, p_y)))
     or coalesce(t->'optaget', '{}'::jsonb) ? noegle
     or exists (select 1 from jsonb_each_text(coalesce(t->'optaget', '{}'::jsonb)) e(k, v) where v = s.navn) then
    return json_build_object('ok', false, 'tilstand', t, 'nu', nu);
  end if;
  t := jsonb_set(t, array['optaget', noegle], to_jsonb(s.navn), true);
  if (select count(*) from jsonb_object_keys(t->'optaget')) >= jsonb_array_length(t->'felter') then
    t := hv_lys_afgoer(t);
  end if;
  update hv_lys set tilstand = t, tid = now() where rum = p_rum;
  return json_build_object('ok', true, 'tilstand', t, 'nu', nu);
end $$;

revoke all on function public.hv_lys_hent, public.hv_lys_saet, public.hv_lys_ramt from public;
grant execute on function public.hv_lys_hent, public.hv_lys_saet, public.hv_lys_ramt to anon, authenticated;

-- Bygmestre og ejeren må også bygge i Lysreaktion (og i forhallen og radiostudiet)
create or replace function public.hv_rum_moebler_gem(p_token uuid, p_rum text, p_moebler jsonb)
returns void language plpgsql security definer set search_path = public as $$
declare s hv_spillere;
begin
  select * into s from hv_spillere where token = p_token;
  if s.id is null then raise exception 'Du er ikke logget ind.'; end if;
  if not hv_er_bygmester(s.navn) then raise exception 'Kun ejeren og Bygmestre kan bygge i de fælles rum.'; end if;
  if p_rum not in ('hal', 'hemmelig', 'biograf', 'postkontor', 'tagterrasse', 'cafe', 'spillehjoernet', 'laesehjoernet', 'museum',
                   'bioforhal', 'radio', 'lysreaktion') and p_rum !~ '^event[0-9]+$' and p_rum !~ '^gang[0-9]+$' then raise exception 'Man kan kun bygge i de fælles rum.'; end if;
  if jsonb_typeof(p_moebler) <> 'array' or jsonb_array_length(p_moebler) > 800 then raise exception 'For mange møbler.'; end if;
  insert into hv_rum_moebler (rum, moebler, hvem) values (p_rum, p_moebler, s.navn)
  on conflict (rum) do update set moebler = excluded.moebler, hvem = excluded.hvem, tid = now();
end $$;
revoke all on function public.hv_rum_moebler_gem from public;
grant execute on function public.hv_rum_moebler_gem to anon, authenticated;

notify pgrst, 'reload schema';

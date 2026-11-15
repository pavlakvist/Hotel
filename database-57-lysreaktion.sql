-- HELLO VERA, del 57: 💡 Lysreaktion — rummet med det lysende gulv
-- - Ejeren, Eventværter og Eventfolk styrer lyset fra Event-appen på telefonen:
--   tænd/sluk, tempo, farver og spillet "Lysreaktion" (et felt lyser op, den første der står på det, får et point).
-- - Serveren holder styr på lyset, så alle i rummet ser det samme gulv, og afgør hvem der var hurtigst.
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

-- (intern) et tilfældigt felt på dansegulvet og en tilfældig farve til næste runde
create or replace function public.hv_lys_ny_runde(t jsonb, p_pause numeric)
returns jsonb language plpgsql as $$
declare x0 int := coalesce((t->>'x0')::int, 0); y0 int := coalesce((t->>'y0')::int, 0);
  b int := greatest(1, coalesce((t->>'b')::int, 6)); d int := greatest(1, coalesce((t->>'d')::int, 6));
  fx int; fy int; gl jsonb := t->'felt'; n int := 0;
begin
  loop
    fx := x0 + floor(random() * b)::int; fy := y0 + floor(random() * d)::int;
    n := n + 1;
    exit when n > 8 or gl is null or (gl->>0)::int is distinct from fx or (gl->>1)::int is distinct from fy;
  end loop;
  return t || jsonb_build_object('runde', coalesce((t->>'runde')::int, 0) + 1, 'felt', jsonb_build_array(fx, fy),
    'farve', floor(random() * 8)::int, 'rstart', (extract(epoch from now()) * 1000 + p_pause * 1000)::bigint);
end $$;
revoke all on function public.hv_lys_ny_runde from public;

-- Alle kan se lyset i et rum (og få serverens ur med, så alle viser det samme)
create or replace function public.hv_lys_hent(p_rum text)
returns json language plpgsql security definer set search_path = public as $$
declare r hv_lys; t jsonb; nu bigint := (extract(epoch from now()) * 1000)::bigint; frist bigint;
begin
  select * into r from hv_lys where rum = p_rum;
  if r.rum is null then return json_build_object('nu', nu, 'tilstand', '{}'::json); end if;
  t := r.tilstand;
  -- spillet: er tiden gået, uden at nogen nåede feltet? Så hopper lyset videre
  if t->>'tilstand' = 'spil' and t ? 'rstart' then
    frist := (t->>'rstart')::bigint + coalesce((t->>'sek')::int, 7) * 1000;
    if nu > frist then
      t := hv_lys_ny_runde(t || jsonb_build_object('sidst', jsonb_build_object('runde', (t->>'runde')::int, 'navn', null)), 1.5);
      update hv_lys set tilstand = t, tid = now() where rum = p_rum;
    end if;
  end if;
  return json_build_object('nu', nu, 'tilstand', t);
end $$;

-- Ejeren, Eventværter og Eventfolk styrer lyset (fra Event-appen)
create or replace function public.hv_lys_saet(p_token uuid, p_rum text, p_tilstand jsonb)
returns json language plpgsql security definer set search_path = public as $$
declare s hv_spillere; gl jsonb; t jsonb; tilst text := coalesce(p_tilstand->>'tilstand', 'sluk');
begin
  select * into s from hv_spillere where token = p_token;
  if s.id is null then raise exception 'Du er ikke logget ind.'; end if;
  if not hv_maa_skrive_events(s.navn) then raise exception 'Kun ejeren, Eventværter og Eventfolk kan styre lyset.'; end if;
  if tilst not in ('sluk', 'et', 'disko', 'boelge', 'spil') then raise exception 'Ukendt lys.'; end if;
  select tilstand into gl from hv_lys where rum = p_rum;
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
    t := t || jsonb_build_object('sek', (array[12, 9, 7, 5, 3])[(t->>'tempo')::int],
      -- pointene bliver, når man bare skifter tempo; "nulstil" starter forfra
      'point', case when (p_tilstand->>'nulstil') = 'true' or gl->>'tilstand' is distinct from 'spil' then '{}'::jsonb else coalesce(gl->'point', '{}'::jsonb) end,
      'runde', case when (p_tilstand->>'nulstil') = 'true' or gl->>'tilstand' is distinct from 'spil' then 0 else coalesce((gl->>'runde')::int, 0) end);
    t := hv_lys_ny_runde(t, 3);
  end if;
  insert into hv_lys (rum, tilstand, hvem) values (left(p_rum, 40), t, s.navn)
  on conflict (rum) do update set tilstand = excluded.tilstand, hvem = excluded.hvem, tid = now();
  return json_build_object('nu', (extract(epoch from now()) * 1000)::bigint, 'tilstand', t);
end $$;

-- En spiller står på det lysende felt: den første får pointet (serverens ur afgør det)
create or replace function public.hv_lys_ramt(p_token uuid, p_rum text, p_runde integer, p_x integer, p_y integer)
returns json language plpgsql security definer set search_path = public as $$
declare s hv_spillere; r hv_lys; t jsonb; nu bigint := (extract(epoch from now()) * 1000)::bigint;
begin
  select * into s from hv_spillere where token = p_token;
  if s.id is null then raise exception 'Du er ikke logget ind.'; end if;
  select * into r from hv_lys where rum = p_rum for update;
  if r.rum is null then return json_build_object('ok', false); end if;
  t := r.tilstand;
  if t->>'tilstand' <> 'spil' or (t->>'runde')::int <> p_runde or nu < (t->>'rstart')::bigint
     or (t->'felt'->>0)::int <> p_x or (t->'felt'->>1)::int <> p_y then
    return json_build_object('ok', false);
  end if;
  t := jsonb_set(t, array['point', s.navn], to_jsonb(coalesce((t->'point'->>s.navn)::int, 0) + 1), true);
  t := t || jsonb_build_object('sidst', jsonb_build_object('runde', p_runde, 'navn', s.navn, 'ms', nu - (t->>'rstart')::bigint, 'felt', t->'felt'));
  t := hv_lys_ny_runde(t, 2.5);
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

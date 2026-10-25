-- HELLO VERA, del 7: Bygmester. Møblerne i de fælles rum (Velkomsthallen, event-rum, hemmelig etage)
-- ligger på serveren, så alle ser dem. Kun ejeren og Bygmestre kan ændre dem.
-- Kør database-4-personale.sql FØRST. Kopiér ALT herfra → Supabase → SQL Editor → + New query → Run.
-- Må gerne køres flere gange.
create table if not exists public.hv_rum_moebler (
  rum text primary key,
  moebler jsonb not null,
  hvem text,
  tid timestamptz not null default now()
);
alter table public.hv_rum_moebler enable row level security;
revoke all on public.hv_rum_moebler from anon, authenticated;

create or replace function public.hv_er_bygmester(p_navn text)
returns boolean language sql stable security definer set search_path = public as $$
  select hv_er_ejer(p_navn) or exists (select 1 from hv_ansatte where navn_lille = lower(p_navn) and skilt = 'bygmester');
$$;
revoke all on function public.hv_er_bygmester(text) from public, anon, authenticated;

-- Alle kan se møblerne i de fælles rum
create or replace function public.hv_rum_moebler_hent(p_token uuid)
returns json language plpgsql security definer set search_path = public as $$
declare s hv_spillere;
begin
  select * into s from hv_spillere where token = p_token;
  if s.id is null then raise exception 'Du er ikke logget ind.'; end if;
  return coalesce((select json_object_agg(rum, moebler) from hv_rum_moebler), '{}'::json);
end $$;

-- Kun ejeren og Bygmestre kan bygge, og kun i de fælles rum
create or replace function public.hv_rum_moebler_gem(p_token uuid, p_rum text, p_moebler jsonb)
returns void language plpgsql security definer set search_path = public as $$
declare s hv_spillere;
begin
  select * into s from hv_spillere where token = p_token;
  if s.id is null then raise exception 'Du er ikke logget ind.'; end if;
  if not hv_er_bygmester(s.navn) then raise exception 'Kun ejeren og Bygmestre kan bygge i de fælles rum.'; end if;
  if p_rum not in ('hal', 'hemmelig') and p_rum !~ '^event[0-9]+$' then raise exception 'Man kan kun bygge i de fælles rum.'; end if;
  if jsonb_typeof(p_moebler) <> 'array' or jsonb_array_length(p_moebler) > 800 then raise exception 'For mange møbler.'; end if;
  insert into hv_rum_moebler (rum, moebler, hvem) values (p_rum, p_moebler, s.navn)
  on conflict (rum) do update set moebler = excluded.moebler, hvem = excluded.hvem, tid = now();
end $$;

revoke all on function public.hv_rum_moebler_hent, public.hv_rum_moebler_gem from public;
grant execute on function public.hv_rum_moebler_hent, public.hv_rum_moebler_gem to anon, authenticated;

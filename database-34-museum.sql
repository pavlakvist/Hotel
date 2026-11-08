-- HELLO VERA, del 34: 🏛 Hotellets Museum
-- - Museumsskiltene gemmes på serveren, så alle spillere ser de samme skilte.
--   Kun ejeren kan oprette, rette, flytte og slette skilte.
-- - Ejeren og Bygmestre kan flytte møblerne i museet (rummet hedder 'museum').
-- Kopiér ALT herfra → Supabase → SQL Editor → + New query → Run. Må gerne køres flere gange.

-- Skiltene (én række med en liste af skilte)
create table if not exists public.hv_museum (
  id integer primary key default 1 check (id = 1),
  skilte jsonb not null default '[]'::jsonb,
  hvem text,
  tid timestamptz not null default now()
);
alter table public.hv_museum enable row level security;
revoke all on public.hv_museum from anon, authenticated;

-- Alle kan læse skiltene (null = ingen har gemt endnu, så bruger hotellet sine egne)
create or replace function public.hv_museum_hent()
returns jsonb language sql security definer set search_path = public as $$
  select skilte from hv_museum where id = 1;
$$;
revoke all on function public.hv_museum_hent from public;
grant execute on function public.hv_museum_hent to anon, authenticated;

-- Kun ejeren gemmer skiltene
create or replace function public.hv_museum_gem(p_token uuid, p_skilte jsonb)
returns void language plpgsql security definer set search_path = public as $$
declare s hv_spillere;
begin
  select * into s from hv_spillere where token = p_token;
  if s.id is null then raise exception 'Du er ikke logget ind.'; end if;
  if not hv_er_ejer(s.navn) then raise exception 'Kun hotellets ejer kan lave museumsskilte.'; end if;
  if jsonb_typeof(p_skilte) <> 'array' or jsonb_array_length(p_skilte) > 500 then raise exception 'For mange skilte.'; end if;
  if length(p_skilte::text) > 300000 then raise exception 'Skiltene fylder for meget.'; end if;
  insert into hv_museum (id, skilte, hvem) values (1, p_skilte, s.navn)
  on conflict (id) do update set skilte = excluded.skilte, hvem = excluded.hvem, tid = now();
end $$;
revoke all on function public.hv_museum_gem from public;
grant execute on function public.hv_museum_gem to anon, authenticated;

-- Bygmestre og ejeren må også bygge i museet
create or replace function public.hv_rum_moebler_gem(p_token uuid, p_rum text, p_moebler jsonb)
returns void language plpgsql security definer set search_path = public as $$
declare s hv_spillere;
begin
  select * into s from hv_spillere where token = p_token;
  if s.id is null then raise exception 'Du er ikke logget ind.'; end if;
  if not hv_er_bygmester(s.navn) then raise exception 'Kun ejeren og Bygmestre kan bygge i de fælles rum.'; end if;
  if p_rum not in ('hal', 'hemmelig', 'biograf', 'postkontor', 'tagterrasse', 'cafe', 'spillehjoernet', 'laesehjoernet', 'museum') and p_rum !~ '^event[0-9]+$' and p_rum !~ '^gang[0-9]+$' then raise exception 'Man kan kun bygge i de fælles rum.'; end if;
  if jsonb_typeof(p_moebler) <> 'array' or jsonb_array_length(p_moebler) > 800 then raise exception 'For mange møbler.'; end if;
  insert into hv_rum_moebler (rum, moebler, hvem) values (p_rum, p_moebler, s.navn)
  on conflict (rum) do update set moebler = excluded.moebler, hvem = excluded.hvem, tid = now();
end $$;
revoke all on function public.hv_rum_moebler_gem from public;
grant execute on function public.hv_rum_moebler_gem to anon, authenticated;

notify pgrst, 'reload schema';

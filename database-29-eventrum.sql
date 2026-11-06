-- HELLO VERA, del 29: Omdøb og opret event-rum 🎉 + max antal personer i rummene 👥
-- Ejeren og Eventværter kan give event-rummene nye navne, oprette nye event-rum,
-- slette dem de selv har oprettet og bestemme, hvor mange der må være i et event-rum.
-- Ejeren kan også bestemme max antal i hotellets andre offentlige rum.
-- Ansatte og ejeren kommer altid ind, også når rummet er fyldt.
-- Kopiér ALT herfra → Supabase → SQL Editor → + New query → Run. Må gerne køres flere gange.

create table if not exists public.hv_rum_indstillinger (
  rum text primary key,
  navn text,
  maks int,
  ny boolean not null default false,        -- et event-rum, som nogen har oprettet
  slettet boolean not null default false,
  hvem text,
  tid timestamptz not null default now()
);
alter table public.hv_rum_indstillinger enable row level security;
revoke all on public.hv_rum_indstillinger from anon, authenticated;

-- Hent alle rummenes navne og max antal (alle må se dem)
create or replace function public.hv_rum_indst_hent()
returns json language sql stable security definer set search_path = public as $$
  select coalesce(json_object_agg(rum, json_build_object('navn', navn, 'maks', maks, 'ny', ny, 'slettet', slettet)), '{}'::json)
  from hv_rum_indstillinger;
$$;

-- Ret navn og/eller max antal i et rum
create or replace function public.hv_rum_indst_gem(p_token uuid, p_rum text, p_navn text, p_maks int)
returns void language plpgsql security definer set search_path = public as $$
declare s hv_spillere; n text;
begin
  select * into s from hv_spillere where token = p_token;
  if s.id is null then raise exception 'Du er ikke logget ind.'; end if;
  if p_rum ~ '^event[0-9]+$' then
    if not hv_er_eventvaert(s.navn) then raise exception 'Kun ejeren og Eventværter kan ændre event-rummene.'; end if;
  else
    if not hv_er_ejer(s.navn) then raise exception 'Kun ejeren kan ændre hotellets rum.'; end if;
    if p_navn is not null then raise exception 'Kun event-rum kan få nye navne.'; end if;
  end if;
  n := nullif(left(trim(coalesce(p_navn, '')), 30), '');
  if p_maks is not null and (p_maks < 1 or p_maks > 200) then raise exception 'Max antal skal være mellem 1 og 200.'; end if;
  insert into hv_rum_indstillinger (rum, navn, maks, hvem) values (left(p_rum, 40), n, p_maks, s.navn)
  on conflict (rum) do update set navn = coalesce(n, hv_rum_indstillinger.navn), maks = coalesce(p_maks, hv_rum_indstillinger.maks), hvem = s.navn, tid = now();
  begin insert into hv_adminlog (hvem, hvad) values (s.navn, 'Ændrede rummet ' || coalesce(n, p_rum) || coalesce(' (max ' || p_maks || ')', '')); exception when others then null; end;
end $$;

-- Opret et nyt event-rum. Giver rummets id tilbage (event5, event6 …)
create or replace function public.hv_event_rum_opret(p_token uuid, p_navn text, p_maks int)
returns text language plpgsql security definer set search_path = public as $$
declare s hv_spillere; nr int; id text; n text;
begin
  select * into s from hv_spillere where token = p_token;
  if s.id is null then raise exception 'Du er ikke logget ind.'; end if;
  if not hv_er_eventvaert(s.navn) then raise exception 'Kun ejeren og Eventværter kan oprette event-rum.'; end if;
  n := nullif(left(trim(coalesce(p_navn, '')), 30), '');
  if n is null then raise exception 'Skriv et navn til rummet.'; end if;
  if (select count(*) from hv_rum_indstillinger where ny and not slettet) >= 30 then raise exception 'Der er allerede 30 nye event-rum.'; end if;
  select greatest(4, coalesce(max(substring(rum from 6)::int), 4)) + 1 into nr from hv_rum_indstillinger where rum ~ '^event[0-9]+$';
  id := 'event' || nr;
  insert into hv_rum_indstillinger (rum, navn, maks, ny, hvem) values (id, n, least(greatest(coalesce(p_maks, 40), 1), 200), true, s.navn);
  begin insert into hv_adminlog (hvem, hvad) values (s.navn, 'Oprettede event-rummet ' || n); exception when others then null; end;
  return id;
end $$;

-- Slet et event-rum, som nogen har oprettet (Event rum 1–4 kan ikke slettes)
create or replace function public.hv_event_rum_slet(p_token uuid, p_rum text)
returns void language plpgsql security definer set search_path = public as $$
declare s hv_spillere;
begin
  select * into s from hv_spillere where token = p_token;
  if s.id is null then raise exception 'Du er ikke logget ind.'; end if;
  if not hv_er_eventvaert(s.navn) then raise exception 'Kun ejeren og Eventværter kan slette event-rum.'; end if;
  update hv_rum_indstillinger set slettet = true, hvem = s.navn, tid = now() where rum = p_rum and ny;
  if not found then raise exception 'Det rum kan ikke slettes.'; end if;
  begin insert into hv_adminlog (hvem, hvad) values (s.navn, 'Slettede event-rummet ' || p_rum); exception when others then null; end;
end $$;

revoke all on function public.hv_rum_indst_hent, public.hv_rum_indst_gem, public.hv_event_rum_opret, public.hv_event_rum_slet from public;
grant execute on function public.hv_rum_indst_hent, public.hv_rum_indst_gem, public.hv_event_rum_opret, public.hv_event_rum_slet to anon, authenticated;
notify pgrst, 'reload schema';

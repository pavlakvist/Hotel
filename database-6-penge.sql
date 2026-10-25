-- HELLO VERA, del 6: Glimt ⭐ og Stella 🔮 på serveren, så ejeren kan give (og tage) penge til alle.
-- Kør database-5-mod.sql FØRST. Kopiér ALT herfra → Supabase → SQL Editor → + New query → Run.
-- Må gerne køres flere gange.
alter table public.hv_spillere add column if not exists glimt integer;
alter table public.hv_spillere add column if not exists stella integer;

-- Hent mine penge. Første gang tages det beløb med, man havde på sin computer (dog højst 5000 Glimt og 50 Stella).
create or replace function public.hv_penge_hent(p_token uuid, p_glimt integer, p_stella integer)
returns json language plpgsql security definer set search_path = public as $$
declare s hv_spillere;
begin
  select * into s from hv_spillere where token = p_token;
  if s.id is null then raise exception 'Du er ikke logget ind.'; end if;
  if s.glimt is null or s.stella is null then
    update hv_spillere set
      glimt = coalesce(glimt, least(greatest(coalesce(p_glimt, 100), 0), case when hv_er_ejer(s.navn) then 100000000 else 5000 end)),
      stella = coalesce(stella, least(greatest(coalesce(p_stella, 5), 0), case when hv_er_ejer(s.navn) then 100000000 else 50 end))
    where id = s.id returning * into s;
  end if;
  return json_build_object('glimt', s.glimt, 'stella', s.stella);
end $$;

-- Brug eller byt penge. Almindelige spillere kan kun bruge penge eller bytte 50 Glimt = 1 Stella,
-- ikke lave nye. Ejeren kan alt.
create or replace function public.hv_penge_aendr(p_token uuid, p_glimt integer, p_stella integer)
returns json language plpgsql security definer set search_path = public as $$
declare s hv_spillere;
begin
  select * into s from hv_spillere where token = p_token for update;
  if s.id is null then raise exception 'Du er ikke logget ind.'; end if;
  p_glimt := coalesce(p_glimt, 0); p_stella := coalesce(p_stella, 0);
  if not hv_er_ejer(s.navn) then
    if p_glimt + 50 * p_stella > 0 then raise exception 'Du kan ikke lave penge selv 😉'; end if;
    if coalesce(s.glimt, 0) + p_glimt < 0 or coalesce(s.stella, 0) + p_stella < 0 then raise exception 'Du har ikke råd.'; end if;
  end if;
  update hv_spillere set glimt = greatest(0, coalesce(glimt, 0) + p_glimt), stella = greatest(0, coalesce(stella, 0) + p_stella)
  where id = s.id returning * into s;
  return json_build_object('glimt', s.glimt, 'stella', s.stella);
end $$;

-- Ejeren giver (eller tager med minus) penge til en spiller
create or replace function public.hv_penge_giv(p_token uuid, p_navn text, p_glimt integer, p_stella integer)
returns json language plpgsql security definer set search_path = public as $$
declare s hv_spillere; o hv_spillere;
begin
  select * into s from hv_spillere where token = p_token;
  if s.id is null then raise exception 'Du er ikke logget ind.'; end if;
  if not hv_er_ejer(s.navn) then raise exception 'Kun hotellets ejer kan give penge.'; end if;
  update hv_spillere set glimt = greatest(0, coalesce(glimt, 100) + coalesce(p_glimt, 0)),
    stella = greatest(0, coalesce(stella, 5) + coalesce(p_stella, 0))
  where navn_lille = lower(trim(coalesce(p_navn, ''))) returning * into o;
  if o.id is null then raise exception 'Der findes ingen spiller, der hedder %.', p_navn; end if;
  return json_build_object('navn', o.navn, 'glimt', o.glimt, 'stella', o.stella);
end $$;

-- Alle spilleres penge (kun ejeren)
create or replace function public.hv_penge_alle(p_token uuid)
returns json language plpgsql security definer set search_path = public as $$
declare s hv_spillere;
begin
  select * into s from hv_spillere where token = p_token;
  if s.id is null then raise exception 'Du er ikke logget ind.'; end if;
  if not hv_er_ejer(s.navn) then raise exception 'Kun hotellets ejer kan se alles penge.'; end if;
  return coalesce((select json_object_agg(navn, json_build_object('glimt', coalesce(glimt, 100), 'stella', coalesce(stella, 5))) from hv_spillere), '{}'::json);
end $$;

revoke all on function public.hv_penge_hent, public.hv_penge_aendr, public.hv_penge_giv, public.hv_penge_alle from public;
grant execute on function public.hv_penge_hent, public.hv_penge_aendr, public.hv_penge_giv, public.hv_penge_alle to anon, authenticated;

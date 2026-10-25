-- HELLO VERA, del 14: Ejeren giver Glimt ⭐ eller Stella 🔮 til ALLE spillere på én gang 🎉
-- Kør database-6-penge.sql FØRST. Kopiér ALT herfra → Supabase → SQL Editor → + New query → Run.
-- Må gerne køres flere gange.

-- Giv alle spillere (undtagen ejerne selv) det samme beløb. Svarer med, hvor mange der fik noget.
create or replace function public.hv_penge_giv_alle(p_token uuid, p_glimt integer, p_stella integer)
returns integer language plpgsql security definer set search_path = public as $$
declare s hv_spillere; v_antal integer;
begin
  select * into s from hv_spillere where token = p_token;
  if s.id is null then raise exception 'Du er ikke logget ind.'; end if;
  if not hv_er_ejer(s.navn) then raise exception 'Kun hotellets ejer kan give penge til alle.'; end if;
  p_glimt := greatest(coalesce(p_glimt, 0), 0); p_stella := greatest(coalesce(p_stella, 0), 0);
  if p_glimt = 0 and p_stella = 0 then return 0; end if;
  if p_glimt > 1000000 or p_stella > 100000 then raise exception 'Det er vist lige i overkanten 😅'; end if;
  update hv_spillere set glimt = coalesce(glimt, 100) + p_glimt, stella = coalesce(stella, 5) + p_stella
  where not hv_er_ejer(navn);
  get diagnostics v_antal = row_count;
  insert into hv_adminlog (hvem, hvad) values (s.navn, 'Gav ' || case when p_glimt > 0 then p_glimt || ' Glimt' else p_stella || ' Stella' end
    || ' til alle spillere (' || v_antal || ')');
  return v_antal;
end $$;

revoke all on function public.hv_penge_giv_alle from public;
grant execute on function public.hv_penge_giv_alle to anon, authenticated;

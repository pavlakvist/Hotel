-- HELLO VERA, del 18: Slet en bruger 🗑
-- Kun hotellets ejer kan slette en profil (Ejerpanel → 🗑 Slet bruger). Ejere kan ikke slettes.
-- Profilen, lejligheden, venner, private beskeder, likes, skilt og straffe slettes. Chatlog, rapporter og
-- Administratorlog bliver, så man stadig kan se, hvad der skete. Navnet bliver ledigt igen.
-- Kopiér ALT herfra → Supabase → SQL Editor → + New query → Run. Må gerne køres flere gange.
create or replace function public.hv_bruger_slet(p_token uuid, p_navn text)
returns text language plpgsql security definer set search_path = public as $$
declare s hv_spillere; o hv_spillere; v text; t text[];
begin
  select * into s from hv_spillere where token = p_token;
  if s.id is null then raise exception 'Du er ikke logget ind.'; end if;
  if not hv_er_ejer(s.navn) then raise exception 'Kun hotellets ejer kan slette brugere.'; end if;
  select * into o from hv_spillere where navn_lille = lower(trim(p_navn));
  if o.id is null then raise exception 'Der er ingen bruger med det navn.'; end if;
  if hv_er_ejer(o.navn) then raise exception 'Ejeren kan ikke slettes.'; end if;
  v := o.navn_lille;
  -- alt det, der hører til brugeren (tabeller, der ikke findes endnu, springes over)
  foreach t slice 1 in array array[
    ['hv_lejligheder', 'ejer_lille'], ['hv_doerklokke', 'til_lille'], ['hv_doerklokke', 'fra_lille'],
    ['hv_venner', 'a'], ['hv_venner', 'b'], ['hv_anmodninger', 'fra'], ['hv_anmodninger', 'til'],
    ['hv_beskeder', 'fra'], ['hv_beskeder', 'til'], ['hv_mentions', 'til'], ['hv_likes', 'fra'], ['hv_likes', 'til'],
    ['hv_forhold', 'fra'], ['hv_forhold', 'til'], ['hv_ansatte', 'navn_lille'], ['hv_straffe', 'navn_lille'],
    ['hv_staff_adgang', 'navn_lille'], ['hv_ansoegninger', 'navn'], ['hv_hjaelp', 'navn']]
  loop
    if to_regclass('public.' || t[1]) is not null then
      execute format('delete from public.%I where lower(%I) = $1', t[1], t[2]) using v;
    end if;
  end loop;
  delete from hv_spillere where id = o.id;
  insert into hv_adminlog (hvem, hvad) values (s.navn, 'Slettede brugeren ' || o.navn);
  return o.navn;
end $$;

revoke all on function public.hv_bruger_slet from public;
grant execute on function public.hv_bruger_slet to anon, authenticated;
notify pgrst, 'reload schema';

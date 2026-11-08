-- HELLO VERA, del 33: 🗑 Slet historik i staff chatten.
-- - Kun ejeren kan slette. Ejeren sletter den samtale, der er åben:
--   Fælles chat (alt i den fælles chat) eller en privat samtale med én ansat.
-- - Beskederne forsvinder også hos de andre ansatte (inden for 3 sekunder).
-- Kør database-13-staff.sql FØRST. Kopiér ALT herfra → Supabase → SQL Editor → + New query → Run.
-- Må gerne køres flere gange.

-- Ejeren sletter en samtale (p_samtale tom = fælles chat, ellers navnet på den ansatte)
create or replace function public.hv_staff_slet(p_token uuid, p_samtale text)
returns integer language plpgsql security definer set search_path = public as $$
declare s hv_spillere; v_antal integer; v_hvem text := lower(trim(coalesce(p_samtale, '')));
begin
  select * into s from hv_spillere where token = p_token;
  if s.id is null then raise exception 'Du er ikke logget ind.'; end if;
  if not hv_er_ejer(s.navn) then raise exception 'Kun ejeren kan slette historikken i staff chatten.'; end if;
  if v_hvem = '' then
    delete from hv_staff_chat where til is null;
  else
    delete from hv_staff_chat where til is not null and (
      (lower(fra) = s.navn_lille and lower(til) = v_hvem) or (lower(fra) = v_hvem and lower(til) = s.navn_lille));
  end if;
  get diagnostics v_antal = row_count;
  begin insert into hv_adminlog (hvem, hvad) values (s.navn, 'Slettede historikken i staff chatten (' ||
    case when v_hvem = '' then 'fælles chat' else 'samtale med ' || trim(p_samtale) end || ', ' || v_antal || ' beskeder)');
  exception when others then null; end;
  return v_antal;
end $$;

-- Hent staff chatten: nu også med 'ids' (de beskeder, der stadig findes), så slettede forsvinder hos alle
create or replace function public.hv_staff_hent(p_token uuid, p_efter bigint)
returns json language plpgsql security definer set search_path = public as $$
declare s hv_spillere;
begin
  select * into s from hv_spillere where token = p_token;
  if s.id is null then raise exception 'Du er ikke logget ind.'; end if;
  if not hv_er_ansat(s.navn) then raise exception 'Kun ansatte kan se staff chatten.'; end if;
  return json_build_object(
    'beskeder', coalesce((select json_agg(c order by c.id) from (select id, fra, til, tekst,
        (extract(epoch from tid) * 1000)::bigint as tid from hv_staff_chat
        where id > coalesce(p_efter, 0) and (til is null or lower(fra) = s.navn_lille or lower(til) = s.navn_lille)
        order by id desc limit 300) c), '[]'::json),
    'ids', coalesce((select json_agg(c.id) from (select id from hv_staff_chat
        where til is null or lower(fra) = s.navn_lille or lower(til) = s.navn_lille
        order by id desc limit 400) c), '[]'::json),
    'maaSeBeskeder', hv_maa_se_beskeder(s.navn),
    'adgang', coalesce((select json_agg(json_build_object('navn', navn, 'beskeder', beskeder, 'beder', beder))
        from hv_staff_adgang where hv_er_ejer(s.navn) or navn_lille = s.navn_lille), '[]'::json));
end $$;

revoke all on function public.hv_staff_slet, public.hv_staff_hent from public;
grant execute on function public.hv_staff_slet, public.hv_staff_hent to anon, authenticated;

-- HELLO VERA, del 47: 👕 Tøjlag på profilen (js/toej-lag.js)
-- Gemmer dit tøjvalg (fx den røde T-shirt) på din profil, så det følger dig,
-- når du logger ud og ind igen, også på en anden computer.
-- De andre spillere ser tøjet via udseendet, som allerede sendes med hv_puls.
-- Kopiér ALT herfra → Supabase → SQL Editor → + New query → Run. Må gerne køres flere gange.

-- 1) En ny kolonne på profilerne. Eksisterende kolonner røres ikke.
alter table public.hv_spillere add column if not exists toej jsonb not null default '{}'::jsonb;

-- 2) Hent mit tøjvalg
create or replace function public.hv_toej_hent(p_token uuid)
returns jsonb language plpgsql security definer set search_path = public as $$
declare s hv_spillere;
begin
  select * into s from hv_spillere where token = p_token;
  if s.id is null then raise exception 'Du er ikke logget ind.'; end if;
  return coalesce(s.toej, '{}'::jsonb);
end $$;

-- 3) Gem mit tøjvalg (kun tøj, der findes i spillet; ellers = intet tøj)
create or replace function public.hv_toej_gem(p_token uuid, p_toej jsonb)
returns jsonb language plpgsql security definer set search_path = public as $$
declare s hv_spillere; v_overdel text;
begin
  select * into s from hv_spillere where token = p_token;
  if s.id is null then raise exception 'Du er ikke logget ind.'; end if;
  v_overdel := p_toej ->> 'overdel';
  if v_overdel is not null and v_overdel not in ('tshirt-roed') then v_overdel := null; end if;
  update hv_spillere set toej = jsonb_build_object('overdel', v_overdel) where id = s.id;
  return jsonb_build_object('overdel', v_overdel);
end $$;

grant execute on function public.hv_toej_hent(uuid) to anon, authenticated;
grant execute on function public.hv_toej_gem(uuid, jsonb) to anon, authenticated;

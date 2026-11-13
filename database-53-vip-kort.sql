-- HELLO VERA, del 53: 👑🪪 VIP kan designe sit eget spillerkort
-- (baggrund, mønster, rammer, skrift, titel, ekstra bokse, klistermærker og effekter).
-- Kør database-52-vip.sql FØRST. Kopiér ALT herfra → Supabase → SQL Editor → + New query → Run.
-- Må gerne køres flere gange.

alter table public.hv_vip add column if not exists kort jsonb;

-- Gem mit kort-design (kun VIP og ejeren). Designet er en lille json-tekst.
create or replace function public.hv_vip_kort_saet(p_token uuid, p_kort jsonb)
returns json language plpgsql security definer set search_path = public as $$
declare s hv_spillere;
begin
  select * into s from hv_spillere where token = p_token;
  if s.id is null then raise exception 'Du er ikke logget ind.'; end if;
  if not hv_er_vip(s.navn) then raise exception 'Kun VIP kan designe deres kort 👑'; end if;
  if p_kort is not null and jsonb_typeof(p_kort) <> 'object' then raise exception 'Forkert design.'; end if;
  if p_kort is not null and length(p_kort::text) > 12000 then raise exception 'Designet er for stort. Fjern lidt tekst eller nogle klistermærker.'; end if;
  insert into hv_vip (spiller_id, navn, navn_lille, hvordan, givet_af, kort)
  values (s.id, s.navn, s.navn_lille, 'ejer', s.navn, p_kort)
  on conflict (spiller_id) do update set kort = p_kort;
  return json_build_object('ok', true);
end $$;

-- Hent en spillers kort-design (alle kan se det). Kun hvis spilleren er VIP lige nu.
create or replace function public.hv_vip_kort(p_token uuid, p_navn text)
returns json language plpgsql security definer set search_path = public as $$
declare v hv_vip;
begin
  if not exists (select 1 from hv_spillere where token = p_token) then raise exception 'Du er ikke logget ind.'; end if;
  select * into v from hv_vip where navn_lille = lower(trim(coalesce(p_navn, '')));
  if v.spiller_id is null or not hv_er_vip(v.navn) then return json_build_object('vip', hv_er_vip(p_navn), 'kort', null); end if;
  return json_build_object('vip', true, 'kort', v.kort);
end $$;

revoke all on function public.hv_vip_kort_saet, public.hv_vip_kort from public, anon, authenticated;
grant execute on function public.hv_vip_kort_saet, public.hv_vip_kort to anon, authenticated;
notify pgrst, 'reload schema';

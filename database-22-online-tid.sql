-- HELLO VERA, del 22: hvor længe har spilleren været online? 🟢
-- Spillerkortet viser "Online i 23 min" under "Medlem siden".
-- Kopiér ALT herfra → Supabase → SQL Editor → + New query → Run. Må gerne køres flere gange.
alter table public.hv_spillere add column if not exists online_siden timestamptz;

-- Hver gang spillet siger "jeg er her" (sidst_set), tjekker vi, om spilleren lige er kommet online.
-- Har man været væk i mere end 2 minutter (eller logget ud), starter uret forfra.
create or replace function public.hv_online_ur()
returns trigger language plpgsql set search_path = public as $$
begin
  if new.sidst_set is null then
    new.online_siden := null;
  elsif old.sidst_set is null or old.sidst_set < now() - interval '2 minutes' or new.online_siden is null then
    new.online_siden := now();
  end if;
  return new;
end $$;

drop trigger if exists hv_online_ur on public.hv_spillere;
create trigger hv_online_ur before update of sidst_set on public.hv_spillere
  for each row execute function public.hv_online_ur();

-- Er spilleren online, og hvor mange sekunder har spilleren været det?
create or replace function public.hv_online_tid(p_token uuid, p_navn text)
returns json language plpgsql security definer set search_path = public as $$
declare s hv_spillere; o hv_spillere;
begin
  select * into s from hv_spillere where token = p_token;
  if s.id is null then raise exception 'Du er ikke logget ind.'; end if;
  select * into o from hv_spillere where navn_lille = lower(trim(p_navn));
  if o.id is null then return null; end if;
  return json_build_object(
    'online', coalesce(o.sidst_set > now() - interval '20 seconds', false),
    'sekunder', case when o.online_siden is null then null else floor(extract(epoch from now() - o.online_siden))::int end,
    'sidst', case when o.sidst_set is null then null else floor(extract(epoch from now() - o.sidst_set))::int end
  );
end $$;

revoke all on function public.hv_online_tid from public;
grant execute on function public.hv_online_tid to anon, authenticated;
notify pgrst, 'reload schema';

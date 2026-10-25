-- HELLO VERA, del 12: bannerets farve, pynt og dato 🎨. Ejeren og Eventværter kan vælge farve,
-- pynt (stjerner, hjerter, balloner …) og en dato til banneret, og alle ser det.
-- Kør database-5-mod.sql FØRST. Kopiér ALT herfra → Supabase → SQL Editor → + New query → Run.
-- Må gerne køres flere gange.
alter table public.hv_nyheder add column if not exists stil jsonb;

create or replace function public.hv_nyheder_hent(p_token uuid)
returns json language plpgsql security definer set search_path = public as $$
declare s hv_spillere;
begin
  select * into s from hv_spillere where token = p_token;
  if s.id is null then raise exception 'Du er ikke logget ind.'; end if;
  return coalesce((select json_agg(n order by n.id) from (select id, titel, tekst, banner, hvem, stil,
      (extract(epoch from tid) * 1000)::bigint as tid from hv_nyheder order by id desc limit 50) n), '[]'::json);
end $$;

-- Den gamle udgave uden stil fjernes, så der kun er én
drop function if exists public.hv_nyhed_send(uuid, text, text, boolean);
create or replace function public.hv_nyhed_send(p_token uuid, p_titel text, p_tekst text, p_banner boolean, p_stil jsonb default null)
returns bigint language plpgsql security definer set search_path = public as $$
declare s hv_spillere; v_id bigint;
begin
  select * into s from hv_spillere where token = p_token;
  if s.id is null then raise exception 'Du er ikke logget ind.'; end if;
  if not hv_er_eventvaert(s.navn) then raise exception 'Kun ejeren og Eventværter kan udsende nyheder.'; end if;
  if length(trim(coalesce(p_titel, ''))) = 0 then raise exception 'Nyheden skal have en overskrift.'; end if;
  if p_stil is not null and (jsonb_typeof(p_stil) <> 'object' or length(p_stil::text) > 300) then raise exception 'Forkert stil på banneret.'; end if;
  insert into hv_nyheder (titel, tekst, banner, hvem, stil) values (left(p_titel, 60), left(p_tekst, 200), coalesce(p_banner, true), s.navn, p_stil)
  returning id into v_id;
  return v_id;
end $$;

revoke all on function public.hv_nyheder_hent, public.hv_nyhed_send from public;
grant execute on function public.hv_nyheder_hent, public.hv_nyhed_send to anon, authenticated;

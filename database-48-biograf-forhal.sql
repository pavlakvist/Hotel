-- HELLO VERA, del 48: 🍿 Biografens forhal
-- - Kiosken i forhallen sælger popcorn, sodavand og slik for 1 Glimt.
-- - Salget gemmes, så ejeren og de ansatte kan se det i Ejerpanel → 🎟 Vera-cinema.
-- Kør database-46-cinema.sql og database-47-cinema-scan.sql FØRST.
-- Kopiér ALT herfra → Supabase → SQL Editor → + New query → Run. Må gerne køres flere gange.

create table if not exists public.hv_cinema_kiosk_salg (
  id bigint generated always as identity primary key,
  spiller_id bigint,
  navn text,
  vare text not null,
  pris integer not null default 1,
  tid timestamptz not null default now()
);
alter table public.hv_cinema_kiosk_salg enable row level security;
revoke all on public.hv_cinema_kiosk_salg from anon, authenticated;
create index if not exists hv_cinema_kiosk_salg_tid on public.hv_cinema_kiosk_salg (tid);

create or replace function public.hv_cinema_kiosk(p_token uuid, p_vare text)
returns json language plpgsql security definer set search_path = public as $$
declare s hv_spillere; v_pris integer := 1;
begin
  select * into s from hv_spillere where token = p_token;
  if s.id is null then raise exception 'Du er ikke logget ind.'; end if;
  if p_vare not in ('popcorn', 'sodavand', 'slik') then raise exception 'Det sælger kiosken ikke.'; end if;
  if coalesce(s.glimt, 0) < v_pris then raise exception 'Du har ikke nok Glimt. Det koster % Glimt.', v_pris; end if;
  if (select count(*) from hv_cinema_kiosk_salg where spiller_id = s.id and tid > now() - interval '3 seconds') > 0 then
    raise exception 'Vent lige et øjeblik.';
  end if;
  update hv_spillere set glimt = coalesce(glimt, 0) - v_pris where id = s.id returning * into s;
  insert into hv_cinema_kiosk_salg (spiller_id, navn, vare, pris) values (s.id, s.navn, p_vare, v_pris);
  return json_build_object('vare', p_vare, 'glimt', coalesce(s.glimt, 0), 'stella', coalesce(s.stella, 0));
end $$;
revoke all on function public.hv_cinema_kiosk(uuid, text) from public;
grant execute on function public.hv_cinema_kiosk(uuid, text) to anon, authenticated;

-- Ejeren og de ansatte: hvad er der solgt i dag og i alt?
create or replace function public.hv_cinema_kiosk_status(p_token uuid)
returns json language plpgsql security definer set search_path = public as $$
declare s hv_spillere;
begin
  select * into s from hv_spillere where token = p_token;
  if s.id is null then raise exception 'Du er ikke logget ind.'; end if;
  if not hv_er_ansat(s.navn) then raise exception 'Kun ejeren og de ansatte kan se kiosken.'; end if;
  return json_build_object(
    'idag', (select coalesce(json_object_agg(vare, n), '{}'::json) from (select vare, count(*) n from hv_cinema_kiosk_salg where tid > date_trunc('day', now()) group by vare) x),
    'ialt', (select count(*) from hv_cinema_kiosk_salg),
    'glimt_ialt', (select coalesce(sum(pris), 0) from hv_cinema_kiosk_salg),
    'seneste', (select coalesce(json_agg(r order by r.tid desc), '[]'::json) from (select navn, vare, extract(epoch from tid) * 1000 as tid from hv_cinema_kiosk_salg order by tid desc limit 15) r));
end $$;
revoke all on function public.hv_cinema_kiosk_status(uuid) from public;
grant execute on function public.hv_cinema_kiosk_status(uuid) to anon, authenticated;

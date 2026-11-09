-- HELLO VERA, del 36: 🐍 Snake på telefonen — hotellets topliste
-- - Hver spiller har sin bedste score. Toplisten viser de 10 bedste.
-- Kopiér ALT herfra → Supabase → SQL Editor → + New query → Run. Må gerne køres flere gange.

create table if not exists public.hv_snake (
  navn text primary key,
  point integer not null default 0,
  tid timestamptz not null default now()
);
alter table public.hv_snake enable row level security;
revoke all on public.hv_snake from anon, authenticated;

-- Gem en score (kun hvis den er bedre end den gamle)
create or replace function public.hv_snake_gem(p_token uuid, p_point integer)
returns void language plpgsql security definer set search_path = public as $$
declare s hv_spillere; v integer := least(greatest(coalesce(p_point, 0), 0), 500);
begin
  select * into s from hv_spillere where token = p_token;
  if s.id is null then raise exception 'Du er ikke logget ind.'; end if;
  insert into hv_snake (navn, point, tid) values (s.navn, v, now())
  on conflict (navn) do update set point = excluded.point, tid = now() where hv_snake.point < excluded.point;
end $$;

-- De 10 bedste
create or replace function public.hv_snake_top()
returns json language sql stable security definer set search_path = public as $$
  select coalesce(json_agg(json_build_object('navn', navn, 'point', point) order by point desc, tid), '[]'::json)
  from (select navn, point, tid from hv_snake where point > 0 order by point desc, tid limit 10) t;
$$;

grant execute on function public.hv_snake_gem(uuid, integer) to anon, authenticated;
grant execute on function public.hv_snake_top() to anon, authenticated;

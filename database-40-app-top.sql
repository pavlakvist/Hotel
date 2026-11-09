-- HELLO VERA, del 40: 🔥 Toplisten i App Butikken (hvilke spil spillerne har hentet mest)
-- Kræver del 38 (database-38-spil-med-venner.sql). Telefonen fortæller selv serveren, hvilke spil man har hentet.
-- Kopiér ALT herfra → Supabase → SQL Editor → + New query → Run. Må gerne køres flere gange.

create or replace function public.hv_spil_top()
returns json language sql stable security definer set search_path = public as $$
  select coalesce(json_agg(json_build_object('spil', spil, 'antal', antal) order by antal desc), '[]'::json)
  from (select spil, count(*)::int as antal from hv_spil_hentet group by spil) t;
$$;
grant execute on function public.hv_spil_top() to anon, authenticated;
notify pgrst, 'reload schema';

-- HELLO VERA, del 8: forsiden kan vise, hvor mange gæster der er online (uden at man er logget ind).
-- Kopiér ALT herfra → Supabase → SQL Editor → + New query → Run. Må gerne køres flere gange.
create or replace function public.hv_antal_online()
returns integer language sql stable security definer set search_path = public as $$
  select count(*)::integer from hv_spillere where sidst_set > now() - interval '20 seconds';
$$;
revoke all on function public.hv_antal_online() from public;
grant execute on function public.hv_antal_online() to anon, authenticated;

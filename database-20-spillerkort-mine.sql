-- HELLO VERA, del 20: dine ❤️ hjerter og 🙂 smileyer står på DIT eget spillerkort.
-- Før stod de på kortet hos den, man gav dem til. Nu viser hvert kort, hvem spilleren selv har givet hjerte/smiley.
-- Kopiér ALT herfra → Supabase → SQL Editor → + New query → Run. Må gerne køres flere gange.
create or replace function public.hv_spillerkort(p_token uuid, p_navn text)
returns json language plpgsql security definer set search_path = public as $$
declare s hv_spillere; o hv_spillere;
begin
  select * into s from hv_spillere where token = p_token;
  if s.id is null then raise exception 'Du er ikke logget ind.'; end if;
  select * into o from hv_spillere where navn_lille = lower(trim(p_navn));
  if o.id is null then return null; end if;
  return json_build_object(
    'navn', o.navn,
    'motto', o.motto,
    'oprettet', o.oprettet,
    'foedselsdag', to_jsonb(o) ->> 'foedselsdag',
    'givet', true,
    -- dem, spilleren selv har givet hjerte/smiley
    'hjerte', coalesce((select json_agg(x.navn order by f.tid desc) from hv_forhold f join hv_spillere x on x.navn_lille = f.til
                        where f.fra = o.navn_lille and f.slags = 'hjerte'), '[]'::json),
    'smiley', coalesce((select json_agg(x.navn order by f.tid desc) from hv_forhold f join hv_spillere x on x.navn_lille = f.til
                        where f.fra = o.navn_lille and f.slags = 'smiley'), '[]'::json),
    -- har JEG givet denne spiller hjerte/smiley? (så knapperne ved, om der skal stå Fjern)
    'mitHjerte', exists (select 1 from hv_forhold where fra = s.navn_lille and til = o.navn_lille and slags = 'hjerte'),
    'mitSmiley', exists (select 1 from hv_forhold where fra = s.navn_lille and til = o.navn_lille and slags = 'smiley')
  );
end $$;

revoke all on function public.hv_spillerkort from public;
grant execute on function public.hv_spillerkort to anon, authenticated;
notify pgrst, 'reload schema';

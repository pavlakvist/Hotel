-- HELLO VERA, del 60: ✨ Vera arena får flere lys og effekter
-- - Nye lys på scenen: Søgelys, Disko, Puls, Farveskift og Stroboskop.
-- - Effekter, der kan tændes og slukkes: røg, konfetti, sæbebobler, flammer, fyrværkeri, snefald, hjerter og glitter.
-- Kør database-58-vera-arena.sql FØRST (det har du allerede gjort).
-- Kopiér ALT herfra → Supabase → SQL Editor → + New query → Run. Må gerne køres flere gange.

create or replace function public.hv_arena_saet(p_token uuid, p_rum text, p_del jsonb)
returns json language plpgsql security definer set search_path = public as $$
declare s hv_spillere; t jsonb; nu bigint := (extract(epoch from now()) * 1000)::bigint;
  sk jsonb; id text; ids text[]; gl jsonb; v text; tekst text;
begin
  select * into s from hv_spillere where token = p_token;
  if s.id is null then raise exception 'Du er ikke logget ind.'; end if;
  if not hv_maa_skrive_events(s.navn) then raise exception 'Kun ejeren, Eventværter og Eventfolk kan styre Vera arena.'; end if;
  select tilstand into t from hv_arena where rum = p_rum for update;
  t := coalesce(t, '{}'::jsonb);

  if p_del ? 'bane' then
    if coalesce(p_del->>'bane', '') !~ '^[a-z0-9-]{1,40}$' then raise exception 'Ukendt bane.'; end if;
    t := t || jsonb_build_object('bane', p_del->>'bane', 'baneTid', nu, 'baneAf', s.navn);
  end if;
  if p_del ? 'scene' then
    if p_del->>'scene' not in ('slukket', 'varm', 'show', 'spots', 'disko', 'puls', 'regnbue', 'strobe') then raise exception 'Ukendt lys.'; end if;
    t := t || jsonb_build_object('scene', p_del->>'scene');
  end if;
  if p_del ? 'effekter' then
    -- kun de kendte effekter, og kun "tændt" (true) gemmes
    t := t || jsonb_build_object('effekter', coalesce((select jsonb_object_agg(e.noegle, true) from jsonb_each(p_del->'effekter') e(noegle, vaerdi)
      where e.noegle in ('roeg', 'konfetti', 'bobler', 'ild', 'fyrvaerkeri', 'sne', 'hjerter', 'glitter') and e.vaerdi = 'true'::jsonb), '{}'::jsonb));
  end if;
  if p_del ? 'skilt' then
    tekst := left(trim(coalesce(p_del->>'skilt', '')), 80);
    t := t || jsonb_build_object('skilt', case when tekst = '' then null else jsonb_build_object('tekst', tekst, 'tid', nu, 'af', s.navn) end);
  end if;
  if p_del ? 'nedtael' then
    t := t || jsonb_build_object('nedtael', case when coalesce((p_del->>'nedtael')::int, 0) <= 0 then 0
      else nu + least((p_del->>'nedtael')::int, 30) * 1000 end);
  end if;
  if p_del ? 'skaerm' then
    sk := p_del->'skaerm';
    id := coalesce(sk->>'id', 'midt');
    if id = 'alle' then ids := array['midt', 'venstre', 'hoejre'];
    elsif id in ('midt', 'venstre', 'hoejre') then ids := array[id];
    else raise exception 'Ukendt skærm.'; end if;
    v := nullif(sk->>'v', '');
    if v is not null and v !~ '^[A-Za-z0-9_-]{11}$' then raise exception 'Det ligner ikke et YouTube-link.'; end if;
    tekst := left(trim(coalesce(sk->>'tekst', '')), 60);
    foreach id in array ids loop
      gl := coalesce(t->'skaerme'->id, '{}'::jsonb);
      t := jsonb_set(t || jsonb_build_object('skaerme', coalesce(t->'skaerme', '{}'::jsonb)), array['skaerme', id],
        jsonb_build_object('v', v, 'tekst', tekst, 't', nu, 'n', coalesce((gl->>'n')::int, 0) + 1, 'af', s.navn), true);
    end loop;
  end if;

  insert into hv_arena (rum, tilstand, hvem) values (left(p_rum, 40), t, s.navn)
  on conflict (rum) do update set tilstand = excluded.tilstand, hvem = excluded.hvem, tid = now();
  return json_build_object('nu', nu, 'tilstand', t);
end $$;

revoke all on function public.hv_arena_saet from public;
grant execute on function public.hv_arena_saet to anon, authenticated;

-- Bygmestre og ejeren må også bygge i Vera arena (og i forhallen, radiostudiet og Lysreaktion)
create or replace function public.hv_rum_moebler_gem(p_token uuid, p_rum text, p_moebler jsonb)
returns void language plpgsql security definer set search_path = public as $$
declare s hv_spillere;
begin
  select * into s from hv_spillere where token = p_token;
  if s.id is null then raise exception 'Du er ikke logget ind.'; end if;
  if not hv_er_bygmester(s.navn) then raise exception 'Kun ejeren og Bygmestre kan bygge i de fælles rum.'; end if;
  if p_rum not in ('hal', 'hemmelig', 'biograf', 'postkontor', 'tagterrasse', 'cafe', 'spillehjoernet', 'laesehjoernet', 'museum',
                   'bioforhal', 'radio', 'lysreaktion', 'arena') and p_rum !~ '^event[0-9]+$' and p_rum !~ '^gang[0-9]+$' then raise exception 'Man kan kun bygge i de fælles rum.'; end if;
  if jsonb_typeof(p_moebler) <> 'array' or jsonb_array_length(p_moebler) > 800 then raise exception 'For mange møbler.'; end if;
  insert into hv_rum_moebler (rum, moebler, hvem) values (p_rum, p_moebler, s.navn)
  on conflict (rum) do update set moebler = excluded.moebler, hvem = excluded.hvem, tid = now();
end $$;
revoke all on function public.hv_rum_moebler_gem from public;
grant execute on function public.hv_rum_moebler_gem to anon, authenticated;

notify pgrst, 'reload schema';

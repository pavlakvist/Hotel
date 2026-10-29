-- HELLO VERA, del 25: den der rapporterer får en privat besked,
-- når nogen kigger på sagen, og igen når sagen er løst.
-- Kør database-5-mod.sql FØRST. Kopiér ALT herfra → Supabase → SQL Editor → + New query → Run.
-- Må gerne køres flere gange.

alter table public.hv_rapporter add column if not exists kigger text;
alter table public.hv_rapporter add column if not exists kigger_tid timestamptz;
alter table public.hv_rapporter add column if not exists loest_sendt boolean not null default false;

-- p_slags = 'kigger' (nogen kigger på sagen) eller 'loest' (sagen er løst)
-- Beskeden sendes kun én gang pr. slags, og kun ejeren og MOD kan gøre det.
create or replace function public.hv_rapport_besked(p_token uuid, p_id bigint, p_slags text)
returns json language plpgsql security definer set search_path = public as $$
declare s hv_spillere; r hv_rapporter; o hv_spillere; tekst text;
begin
  select * into s from hv_spillere where token = p_token;
  if s.id is null then raise exception 'Du er ikke logget ind.'; end if;
  if not hv_er_mod(s.navn) then raise exception 'Kun ejeren og MOD kan behandle rapporter.'; end if;
  select * into r from hv_rapporter where id = p_id;
  if r.id is null then raise exception 'Rapporten findes ikke.'; end if;

  if p_slags = 'kigger' then
    if r.kigger is not null then return json_build_object('sendt', false, 'kigger', r.kigger); end if;
    update hv_rapporter set kigger = s.navn, kigger_tid = now() where id = p_id;
    tekst := '👀 Hej ' || r.fra || '! Tak for din rapport om "' || coalesce(r.grund, 'Andet') || '"'
      || case when coalesce(r.hvem, '') <> '' then ' (' || r.hvem || ')' else '' end
      || '. Jeg kigger på sagen nu. Du kan skrive til mig her, hvis du vil fortælle mere.';
  elsif p_slags = 'loest' then
    if r.loest_sendt then return json_build_object('sendt', false, 'kigger', r.kigger); end if;
    update hv_rapporter set loest_sendt = true, kigger = coalesce(kigger, s.navn) where id = p_id;
    tekst := '✅ Hej ' || r.fra || '! Din rapport om "' || coalesce(r.grund, 'Andet') || '"'
      || case when coalesce(r.hvem, '') <> '' then ' (' || r.hvem || ')' else '' end
      || ' er nu løst. Tusind tak fordi du sagde det, det hjælper hotellet! 💚';
  else
    raise exception 'Ukendt slags: %', p_slags;
  end if;

  -- beskeden kommer fra den ansatte, så man kan svare tilbage
  select * into o from hv_spillere where navn_lille = lower(r.fra);
  if o.id is not null and o.navn_lille <> s.navn_lille then
    insert into hv_beskeder (fra, til, tekst) values (s.navn, o.navn, left(tekst, 500));
  end if;
  return json_build_object('sendt', true, 'kigger', coalesce(r.kigger, s.navn));
end $$;

-- Hvem kigger på hvilke rapporter (vises i panelet)
create or replace function public.hv_rapport_kiggere(p_token uuid)
returns json language plpgsql security definer set search_path = public as $$
declare s hv_spillere;
begin
  select * into s from hv_spillere where token = p_token;
  if s.id is null then raise exception 'Du er ikke logget ind.'; end if;
  if not hv_er_mod(s.navn) then return '{}'::json; end if;
  return coalesce((select json_object_agg(id, json_build_object('kigger', kigger, 'loestSendt', loest_sendt))
    from (select id, kigger, loest_sendt from hv_rapporter where kigger is not null or loest_sendt order by id desc limit 200) x), '{}'::json);
end $$;

grant execute on function public.hv_rapport_besked(uuid, bigint, text) to anon, authenticated;
grant execute on function public.hv_rapport_kiggere(uuid) to anon, authenticated;

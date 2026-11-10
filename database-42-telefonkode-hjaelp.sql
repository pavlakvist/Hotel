-- HELLO VERA, del 42: 🔢 Telefonkode – slå fra, glemt kode og hjælp fra personalet
-- - Man kan slå sin telefonkode fra igen (kræver den nuværende kode).
-- - "Glemt kode?" sender en privat besked til hotellets ejer: "Navn har glemt sin telefonkode".
-- - Ejeren, MODs og Hjælpere kan se koderne, sende koden til spilleren i en privat besked
--   eller nulstille (fjerne) koden. Kun ejeren kan give 3 nye skift.
-- Kræver del 39 (telefonkode). Kopiér ALT herfra → Supabase → SQL Editor → + New query → Run.
-- Må gerne køres flere gange.

alter table public.hv_telefon_kode add column if not exists glemt timestamptz;   -- hvornår spilleren sidst trykkede "Glemt kode?"

-- Må hjælpe med telefonkoder: ejeren, MODs og Hjælpere
create or replace function public.hv_er_kodehjaelper(p_navn text)
returns boolean language sql stable security definer set search_path = public as $$
  select hv_er_ejer(p_navn) or exists (select 1 from hv_ansatte where navn_lille = lower(p_navn) and skilt in ('mod', 'hjaelper'));
$$;
revoke all on function public.hv_er_kodehjaelper(text) from public, anon, authenticated;

-- 🔓 Slå min kode fra (kræver den nuværende kode)
create or replace function public.hv_tlfkode_fjern(p_token uuid, p_kode text)
returns json language plpgsql security definer set search_path = public as $$
declare s hv_spillere; k hv_telefon_kode;
begin
  select * into s from hv_spillere where token = p_token;
  if s.id is null then raise exception 'Du er ikke logget ind.'; end if;
  select * into k from hv_telefon_kode where navn_lille = s.navn_lille;
  if k.navn_lille is null then return json_build_object('har', false, 'skift', 0); end if;
  if coalesce(p_kode, '') <> k.kode then raise exception 'Den nuværende kode er forkert.'; end if;
  delete from hv_telefon_kode where navn_lille = s.navn_lille;
  return json_build_object('har', false, 'skift', 0);
end $$;

-- 🆘 Glemt kode: sender en privat besked til hotellets ejer(e)
create or replace function public.hv_tlfkode_glemt(p_token uuid)
returns int language plpgsql security definer set search_path = public as $$
declare s hv_spillere; k hv_telefon_kode; n int := 0; e record;
begin
  select * into s from hv_spillere where token = p_token;
  if s.id is null then raise exception 'Du er ikke logget ind.'; end if;
  select * into k from hv_telefon_kode where navn_lille = s.navn_lille;
  if k.navn_lille is null then raise exception 'Du har ingen telefonkode.'; end if;
  if k.glemt is not null and k.glemt > now() - interval '10 minutes' then
    raise exception 'Du har allerede sagt det til ejeren. Vent lidt, så får du hjælp.';
  end if;
  update hv_telefon_kode set glemt = now() where navn_lille = s.navn_lille;
  for e in select x.navn from hv_ejere j join hv_spillere x on x.navn_lille = j.navn_lille where x.id <> s.id loop
    insert into hv_beskeder (fra, til, tekst)
      values (s.navn, e.navn, '📱 ' || s.navn || ' har glemt sin telefonkode. Se den eller nulstil den i telefonen: Indstillinger → 🎖 Hjælp med telefonkoder.');
    n := n + 1;
  end loop;
  return n;
end $$;

-- 🎖 Alles koder (ejeren, MODs og Hjælpere)
create or replace function public.hv_tlfkode_alle(p_token uuid)
returns json language plpgsql stable security definer set search_path = public as $$
declare s hv_spillere;
begin
  select * into s from hv_spillere where token = p_token;
  if s.id is null or not hv_er_kodehjaelper(s.navn) then raise exception 'Kun ejeren, MODs og Hjælpere kan se telefonkoderne.'; end if;
  return coalesce((select json_agg(json_build_object('navn', navn, 'kode', kode, 'skift', skift,
    'glemt', case when glemt is null then null else (extract(epoch from glemt) * 1000)::bigint end,
    'opdateret', (extract(epoch from opdateret) * 1000)::bigint) order by (glemt is null), glemt desc, lower(navn)) from hv_telefon_kode), '[]'::json);
end $$;

-- 🎖 'send' = send koden til spilleren i en privat besked, 'fjern' = nulstil koden,
--    'skift' = giv 3 nye skift (kun ejeren)
create or replace function public.hv_tlfkode_ejer(p_token uuid, p_navn text, p_hvad text)
returns void language plpgsql security definer set search_path = public as $$
declare s hv_spillere; k hv_telefon_kode;
begin
  select * into s from hv_spillere where token = p_token;
  if s.id is null or not hv_er_kodehjaelper(s.navn) then raise exception 'Kun ejeren, MODs og Hjælpere kan det.'; end if;
  select * into k from hv_telefon_kode where navn_lille = lower(p_navn);
  if k.navn_lille is null then raise exception '% har ingen telefonkode.', p_navn; end if;
  if p_hvad = 'skift' then
    if not hv_er_ejer(s.navn) then raise exception 'Kun hotellets ejer kan give nye skift.'; end if;
    update hv_telefon_kode set skift = 0, opdateret = now() where navn_lille = k.navn_lille;
  elsif p_hvad = 'fjern' then
    delete from hv_telefon_kode where navn_lille = k.navn_lille;
    if k.navn_lille <> s.navn_lille then
      insert into hv_beskeder (fra, til, tekst) values (s.navn, k.navn, '📱 Din telefonkode er nulstillet. Du kan åbne telefonen uden kode og lave en ny i Indstillinger.');
    end if;
  elsif p_hvad = 'send' then
    update hv_telefon_kode set glemt = null where navn_lille = k.navn_lille;
    if k.navn_lille <> s.navn_lille then
      insert into hv_beskeder (fra, til, tekst) values (s.navn, k.navn, '📱 Din telefonkode er ' || k.kode || '. Husk den godt 🙂');
    end if;
  end if;
end $$;

grant execute on function public.hv_tlfkode_fjern(uuid, text) to anon, authenticated;
grant execute on function public.hv_tlfkode_glemt(uuid) to anon, authenticated;
grant execute on function public.hv_tlfkode_alle(uuid) to anon, authenticated;
grant execute on function public.hv_tlfkode_ejer(uuid, text, text) to anon, authenticated;
notify pgrst, 'reload schema';

-- HELLO VERA, del 39: 🔢 Kode til telefonen
-- - Hver spiller kan lave en 6-cifret kode til sin telefon i Indstillinger.
-- - Koden kan skiftes højst 3 gange. Hotellets ejer kan se alles koder i Ejerpanelet
--   (hvis nogen glemmer den) og give 3 nye skift eller fjerne koden.
-- Kopiér ALT herfra → Supabase → SQL Editor → + New query → Run. Må gerne køres flere gange.

create table if not exists public.hv_telefon_kode (
  navn_lille text primary key,
  navn text not null,
  kode text not null,
  skift int not null default 0,          -- hvor mange gange koden er skiftet
  opdateret timestamptz not null default now()
);
alter table public.hv_telefon_kode enable row level security;
revoke all on public.hv_telefon_kode from anon, authenticated;

-- 📱 Min egen kode (så telefonen kan låses op)
create or replace function public.hv_tlfkode_min(p_token uuid)
returns json language plpgsql stable security definer set search_path = public as $$
declare s hv_spillere; k hv_telefon_kode;
begin
  select * into s from hv_spillere where token = p_token;
  if s.id is null then raise exception 'Du er ikke logget ind.'; end if;
  select * into k from hv_telefon_kode where navn_lille = s.navn_lille;
  if k.navn_lille is null then return json_build_object('har', false, 'skift', 0); end if;
  return json_build_object('har', true, 'kode', k.kode, 'skift', k.skift);
end $$;

-- 🔢 Lav eller skift koden (skift kræver den gamle kode og højst 3 skift – ejeren har ingen grænse)
create or replace function public.hv_tlfkode_saet(p_token uuid, p_gammel text, p_ny text)
returns json language plpgsql security definer set search_path = public as $$
declare s hv_spillere; k hv_telefon_kode;
begin
  select * into s from hv_spillere where token = p_token;
  if s.id is null then raise exception 'Du er ikke logget ind.'; end if;
  if coalesce(p_ny, '') !~ '^[0-9]{6}$' then raise exception 'Koden skal være 6 tal.'; end if;
  select * into k from hv_telefon_kode where navn_lille = s.navn_lille;
  if k.navn_lille is null then
    insert into hv_telefon_kode (navn_lille, navn, kode) values (s.navn_lille, s.navn, p_ny);
    return json_build_object('har', true, 'kode', p_ny, 'skift', 0);
  end if;
  if coalesce(p_gammel, '') <> k.kode then raise exception 'Den nuværende kode er forkert.'; end if;
  if k.skift >= 3 and not hv_er_ejer(s.navn) then
    raise exception 'Du har brugt dine 3 skift. Spørg hotellets ejer om flere.';
  end if;
  update hv_telefon_kode set kode = p_ny, skift = k.skift + 1, navn = s.navn, opdateret = now() where navn_lille = s.navn_lille;
  return json_build_object('har', true, 'kode', p_ny, 'skift', k.skift + 1);
end $$;

-- 👑 Ejeren ser alles koder
create or replace function public.hv_tlfkode_alle(p_token uuid)
returns json language plpgsql stable security definer set search_path = public as $$
declare s hv_spillere;
begin
  select * into s from hv_spillere where token = p_token;
  if s.id is null or not hv_er_ejer(s.navn) then raise exception 'Kun hotellets ejer kan se telefonkoderne.'; end if;
  return coalesce((select json_agg(json_build_object('navn', navn, 'kode', kode, 'skift', skift,
    'opdateret', (extract(epoch from opdateret) * 1000)::bigint) order by lower(navn)) from hv_telefon_kode), '[]'::json);
end $$;

-- 👑 Ejeren giver 3 nye skift ('skift') eller fjerner koden ('fjern')
create or replace function public.hv_tlfkode_ejer(p_token uuid, p_navn text, p_hvad text)
returns void language plpgsql security definer set search_path = public as $$
declare s hv_spillere;
begin
  select * into s from hv_spillere where token = p_token;
  if s.id is null or not hv_er_ejer(s.navn) then raise exception 'Kun hotellets ejer kan det.'; end if;
  if p_hvad = 'skift' then update hv_telefon_kode set skift = 0, opdateret = now() where navn_lille = lower(p_navn);
  elsif p_hvad = 'fjern' then delete from hv_telefon_kode where navn_lille = lower(p_navn);
  end if;
end $$;

grant execute on function public.hv_tlfkode_min(uuid) to anon, authenticated;
grant execute on function public.hv_tlfkode_saet(uuid, text, text) to anon, authenticated;
grant execute on function public.hv_tlfkode_alle(uuid) to anon, authenticated;
grant execute on function public.hv_tlfkode_ejer(uuid, text, text) to anon, authenticated;
notify pgrst, 'reload schema';

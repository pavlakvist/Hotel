-- HELLO VERA, del 19: Det fælles fotoalbum 🖼️
-- Billeder fra kameraet kan lægges i et album, som alle på hotellet kan se.
-- Man kan slette sine egne billeder. Ejeren og MOD kan slette alle.
-- Kopiér ALT herfra → Supabase → SQL Editor → + New query → Run. Må gerne køres flere gange.
create table if not exists public.hv_album (
  id bigint generated always as identity primary key,
  navn text not null,
  navn_lille text not null,
  billede text not null,          -- data:image/jpeg;base64,…
  tekst text,
  rum text,
  tid timestamptz not null default now()
);
create index if not exists hv_album_tid on public.hv_album (id desc);
alter table public.hv_album enable row level security;
revoke all on public.hv_album from anon, authenticated;

-- Læg et billede i albummet
create or replace function public.hv_album_send(p_token uuid, p_billede text, p_tekst text, p_rum text)
returns bigint language plpgsql security definer set search_path = public as $$
declare s hv_spillere; ny bigint;
begin
  select * into s from hv_spillere where token = p_token;
  if s.id is null then raise exception 'Du er ikke logget ind.'; end if;
  if p_billede is null or left(p_billede, 23) <> 'data:image/jpeg;base64,' then raise exception 'Det er ikke et billede.'; end if;
  if length(p_billede) > 400000 then raise exception 'Billedet er for stort.'; end if;
  if exists (select 1 from hv_album where navn_lille = s.navn_lille and tid > now() - interval '15 seconds') then
    raise exception 'Vent lidt, før du lægger et nyt billede i albummet.';
  end if;
  insert into hv_album (navn, navn_lille, billede, tekst, rum)
  values (s.navn, s.navn_lille, p_billede, left(nullif(trim(p_tekst), ''), 120), left(p_rum, 60)) returning id into ny;
  return ny;
end $$;

-- Hent billeder (de nyeste først, 24 ad gangen). p_foer = hent dem før dette id.
create or replace function public.hv_album_hent(p_token uuid, p_foer bigint)
returns json language plpgsql security definer set search_path = public as $$
declare s hv_spillere;
begin
  select * into s from hv_spillere where token = p_token;
  if s.id is null then raise exception 'Du er ikke logget ind.'; end if;
  return coalesce((select json_agg(json_build_object('id', a.id, 'navn', a.navn, 'billede', a.billede, 'tekst', a.tekst, 'rum', a.rum, 'tid', a.tid) order by a.id desc)
    from (select * from hv_album where p_foer is null or id < p_foer order by id desc limit 24) a), '[]'::json);
end $$;

-- Slet et billede (sit eget, eller alle hvis man er ejer eller MOD)
create or replace function public.hv_album_slet(p_token uuid, p_id bigint)
returns void language plpgsql security definer set search_path = public as $$
declare s hv_spillere; a hv_album;
begin
  select * into s from hv_spillere where token = p_token;
  if s.id is null then raise exception 'Du er ikke logget ind.'; end if;
  select * into a from hv_album where id = p_id;
  if a.id is null then return; end if;
  if a.navn_lille <> s.navn_lille and not hv_er_ejer(s.navn) and not hv_er_mod(s.navn) then
    raise exception 'Du kan kun slette dine egne billeder.';
  end if;
  delete from hv_album where id = p_id;
  if a.navn_lille <> s.navn_lille then
    insert into hv_adminlog (hvem, hvad) values (s.navn, 'Slettede et billede fra albummet (lagt op af ' || a.navn || ')');
  end if;
end $$;

revoke all on function public.hv_album_send, public.hv_album_hent, public.hv_album_slet from public;
grant execute on function public.hv_album_send, public.hv_album_hent, public.hv_album_slet to anon, authenticated;
notify pgrst, 'reload schema';

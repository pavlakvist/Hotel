-- HELLO VERA, del 16: Lejlighederne 🏢
-- - Det første rum, man får (ens eget værelse), er ens lejlighed med et husnummer på en sal (2.–11. sal, 10 etager med 10 lejligheder på hver).
--   Man vælger selv sal og husnummer, og to kan ikke have det samme. Andre rum er almindelige rum.
-- - Rummene og møblerne ligger på serveren, så alle kan gå ind ad døren og besøge hinanden.
-- - Kun ejeren af lejligheden kan ændre den. Låst = kun ejeren (og hotellets ejer), kode = man skal kende koden.
-- - Gangene på hver sal er fælles rum, som ejeren og Bygmestre kan pynte.
-- Kør database-7-bygmester.sql FØRST. Kopiér ALT herfra → Supabase → SQL Editor → + New query → Run.
-- Må gerne køres flere gange.
create table if not exists public.hv_lejligheder (
  id text primary key,                 -- hjem-<navn>
  ejer text not null,
  ejer_lille text not null,
  navn text not null,
  sal integer not null check (sal between 2 and 11),
  nr integer not null check (nr between 1 and 10),
  data jsonb not null default '{}'::jsonb,   -- form, størrelse, farver, dør, beskrivelse …
  adgang text not null default 'aaben',     -- aaben, laast, kode
  kode_hash text,
  moebler jsonb not null default '[]'::jsonb,
  tid timestamptz not null default now(),
  unique (sal, nr)
);
alter table public.hv_lejligheder drop constraint if exists hv_lejligheder_sal_check;
alter table public.hv_lejligheder add constraint hv_lejligheder_sal_check check (sal between 2 and 11);
alter table public.hv_lejligheder drop constraint if exists hv_lejligheder_nr_check;
alter table public.hv_lejligheder add constraint hv_lejligheder_nr_check check (nr between 1 and 10);
alter table public.hv_lejligheder enable row level security;
revoke all on public.hv_lejligheder from anon, authenticated;

-- Alle lejligheder (uden møbler og koder), så gangene kan vise døre og navneskilte
create or replace function public.hv_lej_alle(p_token uuid)
returns json language plpgsql security definer set search_path = public as $$
declare s hv_spillere;
begin
  select * into s from hv_spillere where token = p_token;
  if s.id is null then raise exception 'Du er ikke logget ind.'; end if;
  return coalesce((select json_agg(json_build_object('id', id, 'ejer', ejer, 'navn', navn, 'sal', sal, 'nr', nr,
    'adgang', adgang, 'data', data) order by sal, nr) from hv_lejligheder), '[]'::json);
end $$;

-- Gem min lejlighed. Første gang skal man vælge sal og husnummer; bagefter kan man flytte.
create or replace function public.hv_lej_gem(p_token uuid, p_id text, p_navn text, p_sal integer, p_nr integer,
  p_data jsonb, p_adgang text, p_kode text)
returns json language plpgsql security definer set search_path = public, extensions as $$
declare s hv_spillere; l hv_lejligheder; v_sal integer; v_nr integer; anden text;
begin
  select * into s from hv_spillere where token = p_token;
  if s.id is null then raise exception 'Du er ikke logget ind.'; end if;
  if p_id is distinct from 'hjem-' || s.navn_lille then raise exception 'Det er ikke din lejlighed.'; end if;
  select * into l from hv_lejligheder where id = p_id;
  v_sal := coalesce(p_sal, l.sal); v_nr := coalesce(p_nr, l.nr);
  if v_sal is null or v_nr is null then raise exception 'Vælg en sal og et husnummer.'; end if;
  if v_sal not between 2 and 11 or v_nr not between 1 and 10 then raise exception 'Det husnummer findes ikke.'; end if;
  select ejer into anden from hv_lejligheder where sal = v_sal and nr = v_nr and id <> p_id;
  if anden is not null then raise exception 'Husnummer % er allerede taget af %.', v_sal * 100 + v_nr, anden; end if;
  insert into hv_lejligheder (id, ejer, ejer_lille, navn, sal, nr, data, adgang)
  values (p_id, s.navn, s.navn_lille, left(coalesce(nullif(trim(p_navn), ''), s.navn || 's lejlighed'), 30), v_sal, v_nr,
    coalesce(p_data, '{}'::jsonb), coalesce(p_adgang, 'aaben'))
  on conflict (id) do update set navn = excluded.navn, sal = excluded.sal, nr = excluded.nr,
    data = coalesce(p_data, hv_lejligheder.data), adgang = coalesce(p_adgang, hv_lejligheder.adgang), tid = now();
  if p_kode is not null and length(p_kode) >= 3 then
    update hv_lejligheder set kode_hash = crypt(p_kode, gen_salt('bf')) where id = p_id;
  end if;
  return json_build_object('id', p_id, 'sal', v_sal, 'nr', v_nr);
end $$;

-- Slet en lejlighed (kun hotellets ejer, fx hvis en spiller er væk)
create or replace function public.hv_lej_slet(p_token uuid, p_id text)
returns void language plpgsql security definer set search_path = public as $$
declare s hv_spillere;
begin
  select * into s from hv_spillere where token = p_token;
  if s.id is null then raise exception 'Du er ikke logget ind.'; end if;
  delete from hv_lejligheder where id = p_id and hv_er_ejer(s.navn);
end $$;

-- Møblerne i min lejlighed
create or replace function public.hv_lej_moebler_gem(p_token uuid, p_id text, p_moebler jsonb)
returns void language plpgsql security definer set search_path = public as $$
declare s hv_spillere;
begin
  select * into s from hv_spillere where token = p_token;
  if s.id is null then raise exception 'Du er ikke logget ind.'; end if;
  if jsonb_typeof(p_moebler) <> 'array' or jsonb_array_length(p_moebler) > 800 then raise exception 'For mange møbler.'; end if;
  update hv_lejligheder set moebler = p_moebler, tid = now() where id = p_id and ejer_lille = s.navn_lille;
end $$;

-- Hent én lejlighed med møbler (når man går ind)
create or replace function public.hv_lej_hent(p_token uuid, p_id text)
returns json language plpgsql security definer set search_path = public as $$
declare s hv_spillere; l hv_lejligheder;
begin
  select * into s from hv_spillere where token = p_token;
  if s.id is null then raise exception 'Du er ikke logget ind.'; end if;
  select * into l from hv_lejligheder where id = p_id;
  if l.id is null then return null; end if;
  return json_build_object('id', l.id, 'ejer', l.ejer, 'navn', l.navn, 'sal', l.sal, 'nr', l.nr, 'adgang', l.adgang,
    'data', l.data, 'moebler', l.moebler, 'harKode', l.kode_hash is not null);
end $$;

-- Er koden til lejligheden rigtig?
create or replace function public.hv_lej_kode(p_token uuid, p_id text, p_kode text)
returns boolean language plpgsql security definer set search_path = public, extensions as $$
declare s hv_spillere; l hv_lejligheder;
begin
  select * into s from hv_spillere where token = p_token;
  if s.id is null then raise exception 'Du er ikke logget ind.'; end if;
  select * into l from hv_lejligheder where id = p_id;
  if l.id is null or l.kode_hash is null then return false; end if;
  if l.kode_hash = crypt(coalesce(p_kode, ''), l.kode_hash) then return true; end if;
  perform pg_sleep(0.4);
  return false;
end $$;

-- Gangene (gang2 … gang11) er fælles rum, som ejeren og Bygmestre må pynte
create or replace function public.hv_rum_moebler_gem(p_token uuid, p_rum text, p_moebler jsonb)
returns void language plpgsql security definer set search_path = public as $$
declare s hv_spillere;
begin
  select * into s from hv_spillere where token = p_token;
  if s.id is null then raise exception 'Du er ikke logget ind.'; end if;
  if not hv_er_bygmester(s.navn) then raise exception 'Kun ejeren og Bygmestre kan bygge i de fælles rum.'; end if;
  if p_rum not in ('hal', 'hemmelig') and p_rum !~ '^event[0-9]+$' and p_rum !~ '^gang[0-9]+$' then raise exception 'Man kan kun bygge i de fælles rum.'; end if;
  if jsonb_typeof(p_moebler) <> 'array' or jsonb_array_length(p_moebler) > 800 then raise exception 'For mange møbler.'; end if;
  insert into hv_rum_moebler (rum, moebler, hvem) values (p_rum, p_moebler, s.navn)
  on conflict (rum) do update set moebler = excluded.moebler, hvem = excluded.hvem, tid = now();
end $$;

revoke all on function public.hv_lej_alle, public.hv_lej_gem, public.hv_lej_slet, public.hv_lej_moebler_gem,
  public.hv_lej_hent, public.hv_lej_kode, public.hv_rum_moebler_gem from public;
grant execute on function public.hv_lej_alle, public.hv_lej_gem, public.hv_lej_slet, public.hv_lej_moebler_gem,
  public.hv_lej_hent, public.hv_lej_kode, public.hv_rum_moebler_gem to anon, authenticated;

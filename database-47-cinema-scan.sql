-- HELLO VERA, del 47: 📟 Billetscanner til Vera-cinema
-- - Hver billet får en kode (fx 3F9A1C) og en stregkode i appen.
-- - Ejeren og de ansatte scanner billetten ved indgangen. Først derefter kan gæsten sætte sig.
-- - Nyt job/skilt: Biograf medhjælper (må scanne billetter og tæller som ansat).
-- Kør database-46-cinema.sql FØRST (det har du allerede gjort).
-- Kopiér ALT herfra → Supabase → SQL Editor → + New query → Run. Må gerne køres flere gange.

alter table public.hv_cinema_billetter add column if not exists kode text;
alter table public.hv_cinema_billetter add column if not exists scannet timestamptz;
alter table public.hv_cinema_billetter add column if not exists scannet_af text;

-- Ny billet = ny kode (6 tegn 0-9 og A-F, så den kan stå i en stregkode)
create or replace function public.hv_cinema_ny_kode()
returns text language plpgsql volatile set search_path = public as $$
declare k text;
begin
  loop
    k := upper(substr(md5(random()::text || clock_timestamp()::text), 1, 6));
    exit when not exists (select 1 from hv_cinema_billetter where kode = k);
  end loop;
  return k;
end $$;
create or replace function public.hv_cinema_kode_trigger()
returns trigger language plpgsql set search_path = public as $$
begin
  if new.kode is null then new.kode := hv_cinema_ny_kode(); end if;
  return new;
end $$;
drop trigger if exists hv_cinema_kode on public.hv_cinema_billetter;
create trigger hv_cinema_kode before insert on public.hv_cinema_billetter for each row execute function public.hv_cinema_kode_trigger();
update public.hv_cinema_billetter set kode = public.hv_cinema_ny_kode() where kode is null;
create unique index if not exists hv_cinema_billetter_kode on public.hv_cinema_billetter (kode);

-- Programmet til appen: nu også med kode og om billetten er scannet
create or replace function public.hv_cinema_hent(p_token uuid)
returns json language plpgsql security definer set search_path = public as $$
declare s hv_spillere;
begin
  if p_token is not null then select * into s from hv_spillere where token = p_token; end if;
  return json_build_object(
    'nu', (extract(epoch from now()) * 1000)::bigint,
    'program', coalesce((select json_agg(hv_cinema_json(v) order by v.start)
      from hv_cinema_visninger v where v.start + make_interval(mins => v.varighed) > now()), '[]'::json),
    'mine', case when s.id is null then '[]'::json else coalesce((select json_agg(json_build_object(
        'id', b.id, 'visning_id', b.visning_id, 'saede', b.saede, 'navn', b.navn, 'tid', (extract(epoch from b.tid) * 1000)::bigint,
        'kode', b.kode, 'scannet', case when b.scannet is null then null else (extract(epoch from b.scannet) * 1000)::bigint end, 'scannet_af', b.scannet_af,
        'titel', v.titel, 'type', v.type, 'plakat', v.plakat, 'farve', v.farve, 'start', (extract(epoch from v.start) * 1000)::bigint,
        'varighed', v.varighed) order by v.start)
      from hv_cinema_billetter b join hv_cinema_visninger v on v.id = b.visning_id
      where b.spiller_id = s.id and v.start + make_interval(mins => v.varighed) > now() - interval '1 day'), '[]'::json) end
  );
end $$;

-- Til ejeren og de ansatte: nu også kode og scanning
create or replace function public.hv_cinema_personale(p_token uuid)
returns json language plpgsql security definer set search_path = public as $$
declare s hv_spillere;
begin
  select * into s from hv_spillere where token = p_token;
  if s.id is null then raise exception 'Du er ikke logget ind.'; end if;
  if not hv_er_ansat(s.navn) then raise exception 'Kun ejeren og de ansatte kan se bookingerne.'; end if;
  return json_build_object(
    'nu', (extract(epoch from now()) * 1000)::bigint,
    'program', coalesce((select json_agg(hv_cinema_json(v) order by v.start)
      from hv_cinema_visninger v where v.start > now() - interval '30 days'), '[]'::json),
    'billetter', coalesce((select json_agg(json_build_object('id', b.id, 'visning_id', b.visning_id, 'saede', b.saede,
        'navn', b.navn, 'spiller', b.spiller, 'pris', b.pris, 'tid', (extract(epoch from b.tid) * 1000)::bigint,
        'kode', b.kode, 'scannet', case when b.scannet is null then null else (extract(epoch from b.scannet) * 1000)::bigint end,
        'scannet_af', b.scannet_af) order by b.id desc)
      from hv_cinema_billetter b join hv_cinema_visninger v on v.id = b.visning_id where v.start > now() - interval '30 days'), '[]'::json),
    'solgt_ialt', (select count(*) from hv_cinema_billetter),
    'glimt_ialt', (select coalesce(sum(pris), 0) from hv_cinema_billetter)
  );
end $$;

-- 📟 Scan en billet (ejeren og de ansatte). p_kode = koden på billetten (eller fra stregkoden).
create or replace function public.hv_cinema_scan(p_token uuid, p_kode text)
returns json language plpgsql security definer set search_path = public as $$
declare s hv_spillere; b hv_cinema_billetter; v hv_cinema_visninger; v_kode text;
begin
  select * into s from hv_spillere where token = p_token;
  if s.id is null then raise exception 'Du er ikke logget ind.'; end if;
  if not hv_er_ansat(s.navn) then raise exception 'Kun ejeren og de ansatte kan scanne billetter.'; end if;
  v_kode := upper(regexp_replace(coalesce(p_kode, ''), '[^0-9A-Za-z]', '', 'g'));
  if v_kode = '' then raise exception 'Skriv eller scan billettens kode.'; end if;
  select * into b from hv_cinema_billetter where kode = v_kode for update;
  if b.id is null then raise exception 'Ukendt billet (%). Tjek koden en gang til.', v_kode; end if;
  select * into v from hv_cinema_visninger where id = b.visning_id;
  if v.start + make_interval(mins => v.varighed) < now() then raise exception 'Billetten er udløbet. Visningen er slut.'; end if;
  if b.scannet is not null then
    return json_build_object('status', 'allerede', 'id', b.id, 'saede', b.saede, 'navn', b.navn, 'spiller', b.spiller,
      'titel', v.titel, 'visning_id', v.id, 'start', (extract(epoch from v.start) * 1000)::bigint,
      'scannet', (extract(epoch from b.scannet) * 1000)::bigint, 'scannet_af', b.scannet_af);
  end if;
  update hv_cinema_billetter set scannet = now(), scannet_af = s.navn where id = b.id returning * into b;
  return json_build_object('status', 'ok', 'id', b.id, 'saede', b.saede, 'navn', b.navn, 'spiller', b.spiller,
    'titel', v.titel, 'visning_id', v.id, 'start', (extract(epoch from v.start) * 1000)::bigint,
    'scannet', (extract(epoch from b.scannet) * 1000)::bigint, 'scannet_af', b.scannet_af);
end $$;

-- Fortryd en scanning (fx hvis man scannede den forkerte)
create or replace function public.hv_cinema_scan_fortryd(p_token uuid, p_billet bigint)
returns json language plpgsql security definer set search_path = public as $$
declare s hv_spillere;
begin
  select * into s from hv_spillere where token = p_token;
  if s.id is null then raise exception 'Du er ikke logget ind.'; end if;
  if not hv_er_ansat(s.navn) then raise exception 'Kun ejeren og de ansatte kan scanne billetter.'; end if;
  update hv_cinema_billetter set scannet = null, scannet_af = null where id = p_billet;
  return json_build_object('ok', true);
end $$;

revoke all on function public.hv_cinema_ny_kode(), public.hv_cinema_kode_trigger() from public, anon, authenticated;
revoke all on function public.hv_cinema_hent, public.hv_cinema_personale, public.hv_cinema_scan, public.hv_cinema_scan_fortryd from public;
grant execute on function public.hv_cinema_hent, public.hv_cinema_personale, public.hv_cinema_scan, public.hv_cinema_scan_fortryd to anon, authenticated;

-- =============================================================
--  🍿 Nyt job/skilt: Biograf medhjælper (tæller som ansat: løn, Staff chat, vagtskema, billetscanner)
-- =============================================================
create or replace function public.hv_er_ansat(p_navn text)
returns boolean language sql stable security definer set search_path = public as $$
  select hv_er_ejer(p_navn) or exists (select 1 from hv_ansatte where navn_lille = lower(p_navn)
    and skilt in ('mod', 'staff', 'hjaelper', 'eventvaert', 'eventfolk', 'bygmester', 'support', 'content-creator', 'radiovaert', 'biografhjaelper'));
$$;

create or replace function public.hv_ansoeg(p_token uuid, p_navn text, p_kode text, p_stilling text,
  p_alder integer, p_online text, p_tekst text, p_erfaring text)
returns json language plpgsql security definer set search_path = public, extensions as $$
declare s hv_spillere;
begin
  if p_token is not null then select * into s from hv_spillere where token = p_token; end if;
  if s.id is null then
    select * into s from hv_spillere where navn_lille = lower(trim(coalesce(p_navn, '')));
    if s.id is null then raise exception 'Der er ingen profil med navnet "%". Opret dig først.', trim(coalesce(p_navn, '')); end if;
    if s.kode_hash <> crypt(coalesce(p_kode, ''), s.kode_hash) then
      perform pg_sleep(0.5);
      raise exception 'Forkert adgangskode.';
    end if;
  end if;
  if p_stilling not in ('mod', 'staff', 'hjaelper', 'eventvaert', 'bygmester', 'support', 'content-creator', 'radiovaert', 'biografhjaelper') then
    raise exception 'Vælg den stilling, du vil søge.';
  end if;
  if length(trim(coalesce(p_tekst, ''))) < 30 then raise exception 'Skriv lidt mere om dig selv (mindst 30 tegn).'; end if;
  if (select count(*) from hv_ansoegninger where navn = s.navn and tid > now() - interval '1 day') >= 3 then
    raise exception 'Du har allerede sendt 3 ansøgninger i dag. Prøv igen i morgen.';
  end if;
  insert into hv_ansoegninger (navn, stilling, alder, online, tekst, erfaring)
  values (s.navn, p_stilling, case when p_alder between 5 and 120 then p_alder end, left(p_online, 60),
    left(trim(p_tekst), 2000), left(trim(coalesce(p_erfaring, '')), 1000));
  return json_build_object('navn', s.navn);
end $$;

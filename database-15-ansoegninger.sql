-- HELLO VERA, del 15: Ansøg om at være staff 🎖️
-- - Fra forsiden kan alle spillere sende en ansøgning (med brugernavn + adgangskode, eller logget ind).
-- - Kun ejeren kan læse ansøgningerne (Ejerpanel → 📝 Ansøgninger).
-- Kopiér ALT herfra → Supabase → SQL Editor → + New query → Run. Må gerne køres flere gange.
create table if not exists public.hv_ansoegninger (
  id bigint generated always as identity primary key,
  navn text not null,               -- spillerens navn
  stilling text not null,           -- fx mod, hjaelper, eventvaert
  alder integer,
  online text,                      -- hvor tit man er online
  tekst text not null,              -- beskriv dig selv
  erfaring text,
  status text not null default 'ny',   -- ny, set, godkendt, afvist
  tid timestamptz not null default now()
);
alter table public.hv_ansoegninger enable row level security;
revoke all on public.hv_ansoegninger from anon, authenticated;

-- Send en ansøgning. Enten med token (logget ind) eller med brugernavn + adgangskode.
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
  if p_stilling not in ('mod', 'staff', 'hjaelper', 'eventvaert', 'bygmester', 'support', 'content-creator') then
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

-- Alle ansøgninger (kun ejeren)
create or replace function public.hv_ansoegninger_hent(p_token uuid)
returns json language plpgsql security definer set search_path = public as $$
declare s hv_spillere;
begin
  select * into s from hv_spillere where token = p_token;
  if s.id is null then raise exception 'Du er ikke logget ind.'; end if;
  if not hv_er_ejer(s.navn) then raise exception 'Kun ejeren kan se ansøgningerne.'; end if;
  return coalesce((select json_agg(a order by a.id desc) from (select id, navn, stilling, alder, online, tekst, erfaring, status,
      (extract(epoch from tid) * 1000)::bigint as tid from hv_ansoegninger order by id desc limit 300) a), '[]'::json);
end $$;

-- Ejeren ændrer status (set/godkendt/afvist) eller sletter en ansøgning
create or replace function public.hv_ansoegning_ret(p_token uuid, p_id bigint, p_status text, p_slet boolean)
returns void language plpgsql security definer set search_path = public as $$
declare s hv_spillere;
begin
  select * into s from hv_spillere where token = p_token;
  if s.id is null then raise exception 'Du er ikke logget ind.'; end if;
  if not hv_er_ejer(s.navn) then raise exception 'Kun ejeren kan ændre ansøgningerne.'; end if;
  if coalesce(p_slet, false) then delete from hv_ansoegninger where id = p_id; return; end if;
  if p_status not in ('ny', 'set', 'godkendt', 'afvist') then raise exception 'Ukendt status.'; end if;
  update hv_ansoegninger set status = p_status where id = p_id;
end $$;

revoke all on function public.hv_ansoeg, public.hv_ansoegninger_hent, public.hv_ansoegning_ret from public;
grant execute on function public.hv_ansoeg, public.hv_ansoegninger_hent, public.hv_ansoegning_ret to anon, authenticated;

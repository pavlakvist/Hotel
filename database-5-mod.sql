-- HELLO VERA, del 5: mod-panel og eventvært-panel. Straffe, rapporter, administratorlog, chatlogs og nyheder fælles for alle.
-- Kør database-4-personale.sql FØRST. Kopiér ALT herfra → Supabase → SQL Editor → + New query → Run.
-- Må gerne køres flere gange.

-- Er spilleren ejer eller MOD?
create or replace function public.hv_er_mod(p_navn text)
returns boolean language sql stable security definer set search_path = public as $$
  select hv_er_ejer(p_navn) or exists (select 1 from hv_ansatte where navn_lille = lower(p_navn) and skilt = 'mod');
$$;
revoke all on function public.hv_er_mod(text) from public, anon, authenticated;

-- Er spilleren ejer eller Eventvært?
create or replace function public.hv_er_eventvaert(p_navn text)
returns boolean language sql stable security definer set search_path = public as $$
  select hv_er_ejer(p_navn) or exists (select 1 from hv_ansatte where navn_lille = lower(p_navn) and skilt = 'eventvaert');
$$;
revoke all on function public.hv_er_eventvaert(text) from public, anon, authenticated;

create table if not exists public.hv_straffe (
  navn_lille text primary key,
  navn text not null,
  data jsonb not null,
  tid timestamptz not null default now()
);
create table if not exists public.hv_rapporter (
  id bigint generated always as identity primary key,
  fra text not null,
  hvem text,
  grund text,
  tekst text,
  tid text,
  oprettet timestamptz not null default now(),
  behandlet boolean not null default false,
  behandlet_tid timestamptz
);
create table if not exists public.hv_adminlog (
  id bigint generated always as identity primary key,
  hvem text not null,
  hvad text not null,
  tid timestamptz not null default now()
);
alter table public.hv_straffe enable row level security;
alter table public.hv_rapporter enable row level security;
alter table public.hv_adminlog enable row level security;
revoke all on public.hv_straffe, public.hv_rapporter, public.hv_adminlog from anon, authenticated;

-- Straffe: kun ejeren og MOD kan give dem, og ingen kan straffe ejeren
create or replace function public.hv_straf_saet(p_token uuid, p_navn text, p_data jsonb)
returns void language plpgsql security definer set search_path = public as $$
declare s hv_spillere;
begin
  select * into s from hv_spillere where token = p_token;
  if s.id is null then raise exception 'Du er ikke logget ind.'; end if;
  if not hv_er_mod(s.navn) then raise exception 'Kun ejeren og MOD kan give straffe.'; end if;
  if hv_er_ejer(p_navn) then raise exception 'Hotellets ejer kan ikke straffes 😉'; end if;
  insert into hv_straffe (navn_lille, navn, data) values (lower(trim(p_navn)), trim(p_navn), p_data)
  on conflict (navn_lille) do update set data = excluded.data, navn = excluded.navn, tid = now();
end $$;

-- Alle kan se straffene (de vises over hovedet, og man skal selv kunne mærke dem)
create or replace function public.hv_straffe_hent(p_token uuid)
returns json language plpgsql security definer set search_path = public as $$
declare s hv_spillere;
begin
  select * into s from hv_spillere where token = p_token;
  if s.id is null then raise exception 'Du er ikke logget ind.'; end if;
  -- noter og historik er kun for ejeren og MOD
  if hv_er_mod(s.navn) then
    return coalesce((select json_object_agg(navn, data) from hv_straffe), '{}'::json);
  end if;
  return coalesce((select json_object_agg(navn, data - 'note' - 'historik') from hv_straffe), '{}'::json);
end $$;

-- Alle kan sende en rapport
create or replace function public.hv_rapport_send(p_token uuid, p_hvem text, p_grund text, p_tekst text, p_tid text)
returns void language plpgsql security definer set search_path = public as $$
declare s hv_spillere;
begin
  select * into s from hv_spillere where token = p_token;
  if s.id is null then raise exception 'Du er ikke logget ind.'; end if;
  insert into hv_rapporter (fra, hvem, grund, tekst, tid) values (s.navn, left(p_hvem, 40), left(p_grund, 80), left(p_tekst, 1000), left(p_tid, 40));
end $$;

create or replace function public.hv_rapport_behandl(p_token uuid, p_id bigint, p_behandlet boolean)
returns void language plpgsql security definer set search_path = public as $$
declare s hv_spillere;
begin
  select * into s from hv_spillere where token = p_token;
  if s.id is null then raise exception 'Du er ikke logget ind.'; end if;
  if not hv_er_mod(s.navn) then raise exception 'Kun ejeren og MOD kan behandle rapporter.'; end if;
  update hv_rapporter set behandlet = p_behandlet, behandlet_tid = case when p_behandlet then now() end where id = p_id;
end $$;

create or replace function public.hv_adminlog_skriv(p_token uuid, p_hvad text)
returns void language plpgsql security definer set search_path = public as $$
declare s hv_spillere;
begin
  select * into s from hv_spillere where token = p_token;
  if s.id is null then raise exception 'Du er ikke logget ind.'; end if;
  if not (hv_er_mod(s.navn) or hv_er_eventvaert(s.navn)) then return; end if;
  insert into hv_adminlog (hvem, hvad) values (s.navn, left(p_hvad, 500));
end $$;

-- Alt det, mod-panelet skal vise (kun ejeren og MOD)
create or replace function public.hv_mod_data(p_token uuid)
returns json language plpgsql security definer set search_path = public as $$
declare s hv_spillere;
begin
  select * into s from hv_spillere where token = p_token;
  if s.id is null then raise exception 'Du er ikke logget ind.'; end if;
  if not hv_er_mod(s.navn) then raise exception 'Kun ejeren og MOD kan åbne panelet.'; end if;
  return json_build_object(
    'chat', coalesce((select json_agg(c order by c.id) from (select id, navn, rum, tekst,
        (extract(epoch from tid) * 1000)::bigint as tid from hv_chat order by id desc limit 500) c), '[]'::json),
    'beskeder', coalesce((select json_agg(b order by b.id) from (select id, fra, til, tekst,
        (extract(epoch from tid) * 1000)::bigint as tid from hv_beskeder order by id desc limit 500) b), '[]'::json),
    'rapporter', coalesce((select json_agg(r order by r.id) from (select id, fra, hvem, grund, tekst, tid, behandlet,
        (extract(epoch from behandlet_tid) * 1000)::bigint as "behandletTid" from hv_rapporter order by id desc limit 200) r), '[]'::json),
    'adminlog', coalesce((select json_agg(a order by a.id) from (select id, hvem, hvad,
        (extract(epoch from tid) * 1000)::bigint as tid from hv_adminlog order by id desc limit 300) a), '[]'::json));
end $$;

-- MOD må skrive privat til alle (fx advarsler), ikke kun til venner
create or replace function public.hv_besked_send(p_token uuid, p_til text, p_tekst text)
returns void language plpgsql security definer set search_path = public as $$
declare s hv_spillere; o hv_spillere;
begin
  select * into s from hv_spillere where token = p_token;
  if s.id is null then raise exception 'Du er ikke logget ind.'; end if;
  select * into o from hv_spillere where navn_lille = lower(trim(coalesce(p_til, '')));
  if o.id is null then raise exception 'Der findes ingen spiller, der hedder %.', p_til; end if;
  if not exists (select 1 from hv_venner where a = s.navn_lille and b = o.navn_lille)
     and not hv_er_mod(s.navn) and not hv_er_mod(o.navn) then
    raise exception 'I skal være venner for at skrive sammen.';
  end if;
  if length(trim(coalesce(p_tekst, ''))) = 0 then return; end if;
  insert into hv_beskeder (fra, til, tekst) values (s.navn, o.navn, left(p_tekst, 500));
  delete from hv_beskeder where tid < now() - interval '30 days';
end $$;

-- MOD må også låse event-rum
create or replace function public.hv_event_laas_saet(p_token uuid, p_rum text, p_laast boolean)
returns void language plpgsql security definer set search_path = public as $$
declare s hv_spillere;
begin
  select * into s from hv_spillere where token = p_token;
  if s.id is null then raise exception 'Du er ikke logget ind.'; end if;
  if not (hv_er_mod(s.navn) or exists (select 1 from hv_ansatte where navn_lille = s.navn_lille and skilt = 'eventvaert')) then
    raise exception 'Kun ejeren, MOD og Eventværter kan låse event-rum.';
  end if;
  insert into hv_event_laas (rum, laast) values (left(p_rum, 40), coalesce(p_laast, false))
  on conflict (rum) do update set laast = excluded.laast;
end $$;

-- Nyheder og banner (Events og nyheder): alle kan se dem, ejeren og Eventværter kan skrive
create table if not exists public.hv_nyheder (
  id bigint generated always as identity primary key,
  titel text not null,
  tekst text,
  banner boolean not null default true,
  hvem text,
  tid timestamptz not null default now()
);
alter table public.hv_nyheder enable row level security;
revoke all on public.hv_nyheder from anon, authenticated;

create or replace function public.hv_nyheder_hent(p_token uuid)
returns json language plpgsql security definer set search_path = public as $$
declare s hv_spillere;
begin
  select * into s from hv_spillere where token = p_token;
  if s.id is null then raise exception 'Du er ikke logget ind.'; end if;
  return coalesce((select json_agg(n order by n.id) from (select id, titel, tekst, banner, hvem,
      (extract(epoch from tid) * 1000)::bigint as tid from hv_nyheder order by id desc limit 50) n), '[]'::json);
end $$;

create or replace function public.hv_nyhed_send(p_token uuid, p_titel text, p_tekst text, p_banner boolean)
returns bigint language plpgsql security definer set search_path = public as $$
declare s hv_spillere; v_id bigint;
begin
  select * into s from hv_spillere where token = p_token;
  if s.id is null then raise exception 'Du er ikke logget ind.'; end if;
  if not hv_er_eventvaert(s.navn) then raise exception 'Kun ejeren og Eventværter kan udsende nyheder.'; end if;
  if length(trim(coalesce(p_titel, ''))) = 0 then raise exception 'Nyheden skal have en overskrift.'; end if;
  insert into hv_nyheder (titel, tekst, banner, hvem) values (left(p_titel, 60), left(p_tekst, 200), coalesce(p_banner, true), s.navn)
  returning id into v_id;
  return v_id;
end $$;

create or replace function public.hv_nyhed_ret(p_token uuid, p_id bigint, p_banner boolean, p_slet boolean)
returns void language plpgsql security definer set search_path = public as $$
declare s hv_spillere;
begin
  select * into s from hv_spillere where token = p_token;
  if s.id is null then raise exception 'Du er ikke logget ind.'; end if;
  if not hv_er_eventvaert(s.navn) then raise exception 'Kun ejeren og Eventværter kan ændre nyheder.'; end if;
  if p_slet then delete from hv_nyheder where id = p_id;
  else update hv_nyheder set banner = coalesce(p_banner, banner) where id = p_id; end if;
end $$;

-- Bannede spillere kan ikke være på hotellet
create or replace function public.hv_er_bannet(p_navn text)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from hv_straffe where navn_lille = lower(p_navn) and (
    coalesce((data->>'bannet')::boolean, false) or coalesce((data->>'bannetTil')::bigint, 0) > (extract(epoch from now()) * 1000)));
$$;
revoke all on function public.hv_er_bannet(text) from public, anon, authenticated;

create or replace function public.hv_log_ind(p_navn text, p_kode text)
returns json language plpgsql security definer set search_path = public, extensions as $$
declare s hv_spillere;
begin
  select * into s from hv_spillere where navn_lille = lower(trim(coalesce(p_navn, '')));
  if s.id is null then
    raise exception 'Der er ingen profil med navnet "%". Tryk Opret mig nederst.', trim(p_navn);
  end if;
  if s.kode_hash <> crypt(coalesce(p_kode, ''), s.kode_hash) then
    perform pg_sleep(0.5);
    raise exception 'Forkert adgangskode. Prøv igen.';
  end if;
  if hv_er_bannet(s.navn) then raise exception '⛔ Du er bannet fra hotellet.'; end if;
  if s.token is null then
    update hv_spillere set token = gen_random_uuid() where id = s.id returning token into s.token;
  end if;
  return json_build_object('navn', s.navn, 'token', s.token);
end $$;

revoke all on function public.hv_straf_saet, public.hv_straffe_hent, public.hv_rapport_send, public.hv_rapport_behandl,
  public.hv_adminlog_skriv, public.hv_mod_data, public.hv_nyheder_hent, public.hv_nyhed_send, public.hv_nyhed_ret from public;
grant execute on function public.hv_straf_saet, public.hv_straffe_hent, public.hv_rapport_send, public.hv_rapport_behandl,
  public.hv_adminlog_skriv, public.hv_mod_data, public.hv_nyheder_hent, public.hv_nyhed_send, public.hv_nyhed_ret to anon, authenticated;

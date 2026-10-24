-- HELLO VERA, del 3: venneanmodninger (den anden skal sige ja, før I bliver venner) @-beskeder og likes (4 om dagen, ejeren har uendeligt).
-- Kør database-2-venner.sql FØRST, hvis du ikke har gjort det.
-- Kopiér ALT herfra og indsæt i Supabase → SQL Editor → Run.
create table if not exists public.hv_anmodninger (
  fra text not null,
  til text not null,
  tid timestamptz not null default now(),
  primary key (fra, til)
);
alter table public.hv_anmodninger enable row level security;
revoke all on public.hv_anmodninger from anon, authenticated;

-- "Tilføj ven": sender en anmodning. Har den anden allerede spurgt dig, bliver I venner med det samme.
create or replace function public.hv_ven_tilfoej(p_token uuid, p_navn text)
returns json language plpgsql security definer set search_path = public as $$
declare s hv_spillere; o hv_spillere;
begin
  select * into s from hv_spillere where token = p_token;
  if s.id is null then raise exception 'Du er ikke logget ind.'; end if;
  select * into o from hv_spillere where navn_lille = lower(trim(coalesce(p_navn, '')));
  if o.id is null then raise exception 'Der findes ingen spiller, der hedder %.', p_navn; end if;
  if o.id = s.id then raise exception 'Du kan ikke blive ven med dig selv.'; end if;
  if exists (select 1 from hv_venner where a = s.navn_lille and b = o.navn_lille) then
    return json_build_object('navn', o.navn, 'status', 'venner');
  end if;
  if exists (select 1 from hv_anmodninger where fra = o.navn_lille and til = s.navn_lille) then
    insert into hv_venner (a, b) values (s.navn_lille, o.navn_lille), (o.navn_lille, s.navn_lille) on conflict do nothing;
    delete from hv_anmodninger where (fra = o.navn_lille and til = s.navn_lille) or (fra = s.navn_lille and til = o.navn_lille);
    insert into hv_beskeder (fra, til, tekst) values (s.navn, o.navn, '💚 Jeg har sagt ja til din venneanmodning!');
    return json_build_object('navn', o.navn, 'status', 'venner');
  end if;
  insert into hv_anmodninger (fra, til) values (s.navn_lille, o.navn_lille) on conflict do nothing;
  return json_build_object('navn', o.navn, 'status', 'sendt');
end $$;

-- Svar på en anmodning: ja (I bliver venner) eller nej
create or replace function public.hv_ven_svar(p_token uuid, p_navn text, p_ja boolean)
returns void language plpgsql security definer set search_path = public as $$
declare s hv_spillere; o hv_spillere;
begin
  select * into s from hv_spillere where token = p_token;
  if s.id is null then raise exception 'Du er ikke logget ind.'; end if;
  select * into o from hv_spillere where navn_lille = lower(trim(coalesce(p_navn, '')));
  if o.id is null then raise exception 'Der findes ingen spiller, der hedder %.', p_navn; end if;
  if not exists (select 1 from hv_anmodninger where fra = o.navn_lille and til = s.navn_lille) then return; end if;
  delete from hv_anmodninger where (fra = o.navn_lille and til = s.navn_lille) or (fra = s.navn_lille and til = o.navn_lille);
  if p_ja then
    insert into hv_venner (a, b) values (s.navn_lille, o.navn_lille), (o.navn_lille, s.navn_lille) on conflict do nothing;
    insert into hv_beskeder (fra, til, tekst) values (s.navn, o.navn, '💚 Jeg har sagt ja til din venneanmodning!');
  end if;
end $$;

-- Hvem har spurgt mig, og hvem har jeg spurgt?
create or replace function public.hv_anmodninger_hent(p_token uuid)
returns json language plpgsql security definer set search_path = public as $$
declare s hv_spillere;
begin
  select * into s from hv_spillere where token = p_token;
  if s.id is null then raise exception 'Du er ikke logget ind.'; end if;
  return json_build_object(
    'tilMig', coalesce((select json_agg(o.navn order by a.tid) from hv_anmodninger a join hv_spillere o on o.navn_lille = a.fra where a.til = s.navn_lille), '[]'::json),
    'fraMig', coalesce((select json_agg(o.navn order by a.tid) from hv_anmodninger a join hv_spillere o on o.navn_lille = a.til where a.fra = s.navn_lille), '[]'::json));
end $$;

-- Fjern ven fjerner også gamle anmodninger
create or replace function public.hv_ven_fjern(p_token uuid, p_navn text)
returns void language plpgsql security definer set search_path = public as $$
declare s hv_spillere;
begin
  select * into s from hv_spillere where token = p_token;
  if s.id is null then raise exception 'Du er ikke logget ind.'; end if;
  delete from hv_venner where (a = s.navn_lille and b = lower(p_navn)) or (b = s.navn_lille and a = lower(p_navn));
  delete from hv_anmodninger where (fra = s.navn_lille and til = lower(p_navn)) or (til = s.navn_lille and fra = lower(p_navn));
end $$;

-- @-beskeder (mentions) mellem rigtige spillere, på tværs af rum
create table if not exists public.hv_mentions (
  id bigint generated always as identity primary key,
  fra text not null,
  til text not null,
  tekst text not null,
  rum text,
  tid timestamptz not null default now()
);
create index if not exists hv_mentions_til on public.hv_mentions (til, id);
alter table public.hv_mentions enable row level security;
revoke all on public.hv_mentions from anon, authenticated;

create or replace function public.hv_mention_send(p_token uuid, p_til text, p_tekst text, p_rum text)
returns void language plpgsql security definer set search_path = public as $$
declare s hv_spillere; o hv_spillere;
begin
  select * into s from hv_spillere where token = p_token;
  if s.id is null then raise exception 'Du er ikke logget ind.'; end if;
  select * into o from hv_spillere where navn_lille = lower(trim(coalesce(p_til, '')));
  if o.id is null then raise exception 'Der er ingen, der hedder % på hotellet.', p_til; end if;
  if length(trim(coalesce(p_tekst, ''))) = 0 then return; end if;
  insert into hv_mentions (fra, til, tekst, rum) values (s.navn, o.navn, left(p_tekst, 300), left(p_rum, 80));
  delete from hv_mentions where tid < now() - interval '30 days';
end $$;

create or replace function public.hv_mentions_hent(p_token uuid, p_efter bigint)
returns json language plpgsql security definer set search_path = public as $$
declare s hv_spillere;
begin
  select * into s from hv_spillere where token = p_token;
  if s.id is null then raise exception 'Du er ikke logget ind.'; end if;
  return coalesce((select json_agg(m order by m.id) from
    (select id, fra, tekst, rum, tid from hv_mentions where til = s.navn and id > coalesce(p_efter, 0) order by id limit 50) m), '[]'::json);
end $$;

-- Likes: hver spiller kan give 4 om dagen, hotellets ejere uendeligt mange
create table if not exists public.hv_likes (
  id bigint generated always as identity primary key,
  fra text not null,
  til text not null,
  tid timestamptz not null default now()
);
create index if not exists hv_likes_fra on public.hv_likes (fra, tid);
create index if not exists hv_likes_til on public.hv_likes (lower(til));
alter table public.hv_likes enable row level security;
revoke all on public.hv_likes from anon, authenticated;

create or replace function public.hv_likes_tilbage(s hv_spillere)
returns int language sql stable security definer set search_path = public as $$
  select case when exists (select 1 from hv_ejere where navn_lille = s.navn_lille) then null
    else greatest(0, 4 - (select count(*)::int from hv_likes where fra = s.navn
      and tid >= (date_trunc('day', now() at time zone 'Europe/Copenhagen') at time zone 'Europe/Copenhagen'))) end;
$$;

create or replace function public.hv_like(p_token uuid, p_til text)
returns json language plpgsql security definer set search_path = public as $$
declare s hv_spillere; v_tilbage int;
begin
  select * into s from hv_spillere where token = p_token;
  if s.id is null then raise exception 'Du er ikke logget ind.'; end if;
  if trim(coalesce(p_til, '')) !~ '^[a-zA-ZæøåÆØÅ0-9_-]{2,16}$' then raise exception 'Ukendt navn.'; end if;
  if lower(trim(p_til)) = s.navn_lille then raise exception 'Du kan ikke like dig selv 😉'; end if;
  v_tilbage := hv_likes_tilbage(s);
  if v_tilbage is not null and v_tilbage <= 0 then
    raise exception 'Du har brugt dine 4 likes i dag. Du får nye i morgen! 🌙';
  end if;
  insert into hv_likes (fra, til) values (s.navn, trim(p_til));
  return json_build_object('tilbage', hv_likes_tilbage(s),
    'antal', (select count(*) from hv_likes where lower(til) = lower(trim(p_til))));
end $$;

create or replace function public.hv_like_info(p_token uuid, p_navn text)
returns json language plpgsql security definer set search_path = public as $$
declare s hv_spillere;
begin
  select * into s from hv_spillere where token = p_token;
  if s.id is null then raise exception 'Du er ikke logget ind.'; end if;
  return json_build_object('tilbage', hv_likes_tilbage(s),
    'antal', (select count(*) from hv_likes where lower(til) = lower(trim(coalesce(p_navn, '')))));
end $$;

revoke all on function public.hv_likes_tilbage(hv_spillere) from public, anon, authenticated;
revoke all on function public.hv_like, public.hv_like_info from public;
grant execute on function public.hv_like, public.hv_like_info to anon, authenticated;

revoke all on function public.hv_ven_svar, public.hv_anmodninger_hent, public.hv_mention_send, public.hv_mentions_hent from public;
grant execute on function public.hv_ven_svar, public.hv_anmodninger_hent, public.hv_mention_send, public.hv_mentions_hent to anon, authenticated;

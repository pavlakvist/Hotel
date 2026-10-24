-- HELLO VERA, del 4: ansatte (skilte over hovedet), 🚨 Tilkald hjælp og låste event-rum, fælles for alle.
-- Kopiér ALT herfra og indsæt i Supabase → SQL Editor → + New query → Run. Må gerne køres flere gange.
create table if not exists public.hv_ansatte (
  navn_lille text primary key,
  navn text not null,
  skilt text not null,
  tid timestamptz not null default now()
);
create table if not exists public.hv_hjaelp (
  id text primary key,
  navn text not null,
  rum text,
  rum_navn text,
  tid timestamptz not null default now()
);
create table if not exists public.hv_event_laas (
  rum text primary key,
  laast boolean not null default false
);
alter table public.hv_ansatte enable row level security;
alter table public.hv_hjaelp enable row level security;
alter table public.hv_event_laas enable row level security;
revoke all on public.hv_ansatte, public.hv_hjaelp, public.hv_event_laas from anon, authenticated;

-- Er spilleren ejer? Er spilleren ansat (skilte der tæller som personale)?
create or replace function public.hv_er_ejer(p_navn text)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from hv_ejere where navn_lille = lower(p_navn));
$$;
create or replace function public.hv_er_ansat(p_navn text)
returns boolean language sql stable security definer set search_path = public as $$
  select hv_er_ejer(p_navn) or exists (select 1 from hv_ansatte where navn_lille = lower(p_navn)
    and skilt in ('mod', 'staff', 'hjaelper', 'eventvaert', 'bygmester', 'support', 'content-creator'));
$$;

-- Ejeren giver et skilt (eller fyrer med p_skilt = null)
create or replace function public.hv_ansaet(p_token uuid, p_navn text, p_skilt text)
returns void language plpgsql security definer set search_path = public as $$
declare s hv_spillere;
begin
  select * into s from hv_spillere where token = p_token;
  if s.id is null then raise exception 'Du er ikke logget ind.'; end if;
  if not hv_er_ejer(s.navn) then raise exception 'Kun hotellets ejer kan ansætte.'; end if;
  if p_skilt is null or p_skilt = '' then
    delete from hv_ansatte where navn_lille = lower(trim(p_navn));
  else
    insert into hv_ansatte (navn_lille, navn, skilt) values (lower(trim(p_navn)), trim(p_navn), left(p_skilt, 40))
    on conflict (navn_lille) do update set skilt = excluded.skilt, navn = excluded.navn, tid = now();
  end if;
end $$;

-- Tilkald hjælp (kun ansatte og ejeren)
create or replace function public.hv_hjaelp_kald(p_token uuid, p_id text, p_rum text, p_rum_navn text)
returns void language plpgsql security definer set search_path = public as $$
declare s hv_spillere;
begin
  select * into s from hv_spillere where token = p_token;
  if s.id is null then raise exception 'Du er ikke logget ind.'; end if;
  if not hv_er_ansat(s.navn) then raise exception 'Kun ansatte kan tilkalde hjælp.'; end if;
  delete from hv_hjaelp where tid < now() - interval '10 minutes';
  insert into hv_hjaelp (id, navn, rum, rum_navn) values (left(p_id, 40), s.navn, left(p_rum, 80), left(p_rum_navn, 80))
  on conflict (id) do nothing;
end $$;

-- "Jeg tager den" / "Klaret, annullér"
create or replace function public.hv_hjaelp_fjern(p_token uuid, p_id text)
returns void language plpgsql security definer set search_path = public as $$
declare s hv_spillere;
begin
  select * into s from hv_spillere where token = p_token;
  if s.id is null then raise exception 'Du er ikke logget ind.'; end if;
  if not hv_er_ansat(s.navn) then raise exception 'Kun ansatte kan klare en alarm.'; end if;
  delete from hv_hjaelp where id = p_id;
end $$;

-- Lås / åbn et event-rum (ejeren og Eventværter)
create or replace function public.hv_event_laas_saet(p_token uuid, p_rum text, p_laast boolean)
returns void language plpgsql security definer set search_path = public as $$
declare s hv_spillere;
begin
  select * into s from hv_spillere where token = p_token;
  if s.id is null then raise exception 'Du er ikke logget ind.'; end if;
  if not (hv_er_ejer(s.navn) or exists (select 1 from hv_ansatte where navn_lille = s.navn_lille and skilt = 'eventvaert')) then
    raise exception 'Kun ejeren og Eventværter kan låse event-rum.';
  end if;
  insert into hv_event_laas (rum, laast) values (left(p_rum, 40), coalesce(p_laast, false))
  on conflict (rum) do update set laast = excluded.laast;
end $$;

-- Alt på én gang: skilte, låste rum og (for ansatte) alarmer
create or replace function public.hv_personale_hent(p_token uuid)
returns json language plpgsql security definer set search_path = public as $$
declare s hv_spillere;
begin
  select * into s from hv_spillere where token = p_token;
  if s.id is null then raise exception 'Du er ikke logget ind.'; end if;
  return json_build_object(
    'ansatte', coalesce((select json_object_agg(navn, skilt) from hv_ansatte), '{}'::json),
    'eventLaas', coalesce((select json_object_agg(rum, laast) from hv_event_laas), '{}'::json),
    'alarmer', case when hv_er_ansat(s.navn) then coalesce((select json_agg(json_build_object('id', id, 'navn', navn,
        'rum', rum, 'rumNavn', rum_navn, 'tid', (extract(epoch from tid) * 1000)::bigint) order by tid)
      from hv_hjaelp where tid > now() - interval '10 minutes'), '[]'::json) else '[]'::json end);
end $$;

revoke all on function public.hv_er_ejer(text), public.hv_er_ansat(text) from public, anon, authenticated;
revoke all on function public.hv_ansaet, public.hv_hjaelp_kald, public.hv_hjaelp_fjern, public.hv_event_laas_saet, public.hv_personale_hent from public;
grant execute on function public.hv_ansaet, public.hv_hjaelp_kald, public.hv_hjaelp_fjern, public.hv_event_laas_saet, public.hv_personale_hent to anon, authenticated;

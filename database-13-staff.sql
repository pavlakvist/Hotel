-- HELLO VERA, del 13: Staff chat 💬 og adgang til private beskeder 🔒.
-- - Alle ansatte (og ejeren) kan skrive i en fælles staff chat og privat til hinanden.
-- - Fanen "Private beskeder" er låst for ansatte. Ejeren giver adgang med et flueben,
--   og en ansat kan bede om adgang.
-- Kør database-5-mod.sql FØRST. Kopiér ALT herfra → Supabase → SQL Editor → + New query → Run.
-- Må gerne køres flere gange.
create table if not exists public.hv_staff_chat (
  id bigint generated always as identity primary key,
  fra text not null,            -- navnet på den, der skriver
  til text,                     -- null = fælles chat, ellers navnet på modtageren
  tekst text not null,
  tid timestamptz not null default now()
);
create index if not exists hv_staff_chat_id on public.hv_staff_chat (id);
alter table public.hv_staff_chat enable row level security;
revoke all on public.hv_staff_chat from anon, authenticated;

create table if not exists public.hv_staff_adgang (
  navn_lille text primary key,
  navn text not null,
  beskeder boolean not null default false,   -- må se spillernes private beskeder
  beder boolean not null default false,      -- har bedt om adgang
  tid timestamptz not null default now()
);
alter table public.hv_staff_adgang enable row level security;
revoke all on public.hv_staff_adgang from anon, authenticated;

-- Må personen se spillernes private beskeder? (ejeren altid)
create or replace function public.hv_maa_se_beskeder(p_navn text)
returns boolean language sql stable security definer set search_path = public as $$
  select hv_er_ejer(p_navn) or (hv_er_ansat(p_navn) and exists (
    select 1 from hv_staff_adgang where navn_lille = lower(p_navn) and beskeder));
$$;
revoke all on function public.hv_maa_se_beskeder(text) from public, anon, authenticated;

-- Skriv i staff chatten (p_til tom = fælles chat)
create or replace function public.hv_staff_send(p_token uuid, p_til text, p_tekst text)
returns bigint language plpgsql security definer set search_path = public as $$
declare s hv_spillere; o hv_spillere; v_id bigint;
begin
  select * into s from hv_spillere where token = p_token;
  if s.id is null then raise exception 'Du er ikke logget ind.'; end if;
  if not hv_er_ansat(s.navn) then raise exception 'Kun ansatte kan skrive i staff chatten.'; end if;
  if length(trim(coalesce(p_tekst, ''))) = 0 then return null; end if;
  if coalesce(trim(p_til), '') <> '' then
    select * into o from hv_spillere where navn_lille = lower(trim(p_til));
    if o.id is null or not hv_er_ansat(o.navn) then raise exception '% er ikke ansat.', p_til; end if;
  end if;
  insert into hv_staff_chat (fra, til, tekst) values (s.navn, o.navn, left(p_tekst, 300)) returning id into v_id;
  delete from hv_staff_chat where tid < now() - interval '30 days';
  return v_id;
end $$;

-- Hent staff chatten (kun det, man selv må se) og hvem der har adgang til private beskeder
create or replace function public.hv_staff_hent(p_token uuid, p_efter bigint)
returns json language plpgsql security definer set search_path = public as $$
declare s hv_spillere;
begin
  select * into s from hv_spillere where token = p_token;
  if s.id is null then raise exception 'Du er ikke logget ind.'; end if;
  if not hv_er_ansat(s.navn) then raise exception 'Kun ansatte kan se staff chatten.'; end if;
  return json_build_object(
    'beskeder', coalesce((select json_agg(c order by c.id) from (select id, fra, til, tekst,
        (extract(epoch from tid) * 1000)::bigint as tid from hv_staff_chat
        where id > coalesce(p_efter, 0) and (til is null or lower(fra) = s.navn_lille or lower(til) = s.navn_lille)
        order by id desc limit 300) c), '[]'::json),
    'maaSeBeskeder', hv_maa_se_beskeder(s.navn),
    'adgang', coalesce((select json_agg(json_build_object('navn', navn, 'beskeder', beskeder, 'beder', beder))
        from hv_staff_adgang where hv_er_ejer(s.navn) or navn_lille = s.navn_lille), '[]'::json));
end $$;

-- En ansat beder om adgang til private beskeder
create or replace function public.hv_staff_bed(p_token uuid)
returns void language plpgsql security definer set search_path = public as $$
declare s hv_spillere;
begin
  select * into s from hv_spillere where token = p_token;
  if s.id is null then raise exception 'Du er ikke logget ind.'; end if;
  if not hv_er_ansat(s.navn) then raise exception 'Kun ansatte kan bede om adgang.'; end if;
  insert into hv_staff_adgang (navn_lille, navn, beder) values (s.navn_lille, s.navn, true)
  on conflict (navn_lille) do update set beder = true, tid = now();
end $$;

-- Ejeren giver eller tager adgangen
create or replace function public.hv_staff_adgang_saet(p_token uuid, p_navn text, p_beskeder boolean)
returns void language plpgsql security definer set search_path = public as $$
declare s hv_spillere; o hv_spillere;
begin
  select * into s from hv_spillere where token = p_token;
  if s.id is null then raise exception 'Du er ikke logget ind.'; end if;
  if not hv_er_ejer(s.navn) then raise exception 'Kun ejeren kan give adgang til private beskeder.'; end if;
  select * into o from hv_spillere where navn_lille = lower(trim(p_navn));
  if o.id is null then raise exception 'Der findes ingen spiller, der hedder %.', p_navn; end if;
  insert into hv_staff_adgang (navn_lille, navn, beskeder, beder) values (o.navn_lille, o.navn, coalesce(p_beskeder, false), false)
  on conflict (navn_lille) do update set beskeder = coalesce(p_beskeder, false), beder = false, tid = now();
end $$;

-- Spillernes private beskeder til ansatte, der har fået adgang (MOD får dem også med hv_mod_data)
create or replace function public.hv_beskeder_alle(p_token uuid)
returns json language plpgsql security definer set search_path = public as $$
declare s hv_spillere;
begin
  select * into s from hv_spillere where token = p_token;
  if s.id is null then raise exception 'Du er ikke logget ind.'; end if;
  if not hv_maa_se_beskeder(s.navn) then raise exception 'Du har ikke adgang til private beskeder.'; end if;
  return coalesce((select json_agg(b order by b.id) from (select id, fra, til, tekst,
      (extract(epoch from tid) * 1000)::bigint as tid from hv_beskeder order by id desc limit 500) b), '[]'::json);
end $$;

-- MOD-panelets data: de private beskeder kommer kun med, hvis man har fået adgang
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
    'beskeder', case when hv_maa_se_beskeder(s.navn) then coalesce((select json_agg(b order by b.id) from (select id, fra, til, tekst,
        (extract(epoch from tid) * 1000)::bigint as tid from hv_beskeder order by id desc limit 500) b), '[]'::json) else '[]'::json end,
    'rapporter', coalesce((select json_agg(r order by r.id) from (select id, fra, hvem, grund, tekst, tid, behandlet,
        (extract(epoch from behandlet_tid) * 1000)::bigint as "behandletTid" from hv_rapporter order by id desc limit 200) r), '[]'::json),
    'adminlog', coalesce((select json_agg(a order by a.id) from (select id, hvem, hvad,
        (extract(epoch from tid) * 1000)::bigint as tid from hv_adminlog order by id desc limit 300) a), '[]'::json));
end $$;

revoke all on function public.hv_staff_send, public.hv_staff_hent, public.hv_staff_bed, public.hv_staff_adgang_saet, public.hv_beskeder_alle, public.hv_mod_data from public;
grant execute on function public.hv_staff_send, public.hv_staff_hent, public.hv_staff_bed, public.hv_staff_adgang_saet, public.hv_beskeder_alle, public.hv_mod_data to anon, authenticated;

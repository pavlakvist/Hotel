-- HELLO VERA, del 37: 🐤 Peep — hotellets eget sociale netværk inde i telefonen
-- - Alle kan skrive opslag (med farve og humør), like ❤️ og kommentere.
-- - Man kan slette sine egne opslag og kommentarer. Ejeren og MOD kan slette alt.
-- - Hver spiller har en lille profiltekst (bio).
-- Kopiér ALT herfra → Supabase → SQL Editor → + New query → Run. Må gerne køres flere gange.

create table if not exists public.hv_peep_opslag (
  id bigint generated always as identity primary key,
  navn text not null,
  tekst text not null,
  stil jsonb,                                   -- {"farve": "solnedgang", "humoer": "😊 glad"}
  tid timestamptz not null default now()
);
create table if not exists public.hv_peep_likes (
  opslag_id bigint not null references public.hv_peep_opslag(id) on delete cascade,
  navn text not null,
  tid timestamptz not null default now(),
  primary key (opslag_id, navn)
);
create table if not exists public.hv_peep_kommentarer (
  id bigint generated always as identity primary key,
  opslag_id bigint not null references public.hv_peep_opslag(id) on delete cascade,
  navn text not null,
  tekst text not null,
  tid timestamptz not null default now()
);
create table if not exists public.hv_peep_profil (
  navn text primary key,
  bio text not null default ''
);
create index if not exists hv_peep_opslag_tid on public.hv_peep_opslag (tid desc);
create index if not exists hv_peep_kom_opslag on public.hv_peep_kommentarer (opslag_id);
alter table public.hv_peep_opslag enable row level security;
alter table public.hv_peep_likes enable row level security;
alter table public.hv_peep_kommentarer enable row level security;
alter table public.hv_peep_profil enable row level security;
revoke all on public.hv_peep_opslag, public.hv_peep_likes, public.hv_peep_kommentarer, public.hv_peep_profil from anon, authenticated;

-- ✍️ Skriv et opslag (højst ét hvert 15. sekund)
create or replace function public.hv_peep_send(p_token uuid, p_tekst text, p_stil jsonb default null)
returns bigint language plpgsql security definer set search_path = public as $$
declare s hv_spillere; v_id bigint;
begin
  select * into s from hv_spillere where token = p_token;
  if s.id is null then raise exception 'Du er ikke logget ind.'; end if;
  if coalesce(trim(p_tekst), '') = '' then raise exception 'Skriv noget først.'; end if;
  if exists (select 1 from hv_peep_opslag where navn = s.navn and tid > now() - interval '15 seconds') then
    raise exception 'Vent lidt, før du peeper igen 🐤';
  end if;
  insert into hv_peep_opslag (navn, tekst, stil)
  values (s.navn, left(trim(p_tekst), 400),
    case when jsonb_typeof(p_stil) = 'object' then jsonb_build_object('farve', left(coalesce(p_stil->>'farve', ''), 20), 'humoer', left(coalesce(p_stil->>'humoer', ''), 30)) end)
  returning id into v_id;
  return v_id;
end $$;

-- 📰 Hent de nyeste opslag (eller én spillers opslag) med likes og kommentarer
create or replace function public.hv_peep_hent(p_navn text default null)
returns json language sql stable security definer set search_path = public as $$
  select coalesce(json_agg(json_build_object(
      'id', o.id, 'navn', o.navn, 'tekst', o.tekst, 'stil', o.stil, 'tid', o.tid,
      'likes', coalesce((select json_agg(l.navn order by l.tid) from hv_peep_likes l where l.opslag_id = o.id), '[]'::json),
      'kommentarer', coalesce((select json_agg(json_build_object('id', k.id, 'navn', k.navn, 'tekst', k.tekst, 'tid', k.tid) order by k.tid)
                               from hv_peep_kommentarer k where k.opslag_id = o.id), '[]'::json)
    ) order by o.tid desc), '[]'::json)
  from (select * from hv_peep_opslag where p_navn is null or lower(navn) = lower(p_navn) order by tid desc limit 60) o;
$$;

-- ❤️ Like / fjern like
create or replace function public.hv_peep_like(p_token uuid, p_id bigint)
returns boolean language plpgsql security definer set search_path = public as $$
declare s hv_spillere;
begin
  select * into s from hv_spillere where token = p_token;
  if s.id is null then raise exception 'Du er ikke logget ind.'; end if;
  if exists (select 1 from hv_peep_likes where opslag_id = p_id and navn = s.navn) then
    delete from hv_peep_likes where opslag_id = p_id and navn = s.navn;
    return false;
  end if;
  insert into hv_peep_likes (opslag_id, navn) values (p_id, s.navn) on conflict do nothing;
  return true;
end $$;

-- 💬 Kommentér
create or replace function public.hv_peep_kommenter(p_token uuid, p_id bigint, p_tekst text)
returns bigint language plpgsql security definer set search_path = public as $$
declare s hv_spillere; v_id bigint;
begin
  select * into s from hv_spillere where token = p_token;
  if s.id is null then raise exception 'Du er ikke logget ind.'; end if;
  if coalesce(trim(p_tekst), '') = '' then raise exception 'Skriv en kommentar først.'; end if;
  if not exists (select 1 from hv_peep_opslag where id = p_id) then raise exception 'Opslaget findes ikke længere.'; end if;
  if exists (select 1 from hv_peep_kommentarer where navn = s.navn and tid > now() - interval '3 seconds') then
    raise exception 'Vent lidt 🐤';
  end if;
  insert into hv_peep_kommentarer (opslag_id, navn, tekst) values (p_id, s.navn, left(trim(p_tekst), 200)) returning id into v_id;
  return v_id;
end $$;

-- 🗑 Slet et opslag eller en kommentar (sin egen, eller alt hvis man er ejer/MOD)
create or replace function public.hv_peep_slet(p_token uuid, p_id bigint, p_kommentar boolean default false)
returns void language plpgsql security definer set search_path = public as $$
declare s hv_spillere; v_navn text;
begin
  select * into s from hv_spillere where token = p_token;
  if s.id is null then raise exception 'Du er ikke logget ind.'; end if;
  if p_kommentar then select navn into v_navn from hv_peep_kommentarer where id = p_id;
  else select navn into v_navn from hv_peep_opslag where id = p_id; end if;
  if v_navn is null then return; end if;
  if v_navn <> s.navn and not hv_er_mod(s.navn) then raise exception 'Du kan kun slette dine egne.'; end if;
  if p_kommentar then delete from hv_peep_kommentarer where id = p_id;
  else delete from hv_peep_opslag where id = p_id; end if;
end $$;

-- 👤 Profiltekst
create or replace function public.hv_peep_bio(p_token uuid, p_bio text)
returns void language plpgsql security definer set search_path = public as $$
declare s hv_spillere;
begin
  select * into s from hv_spillere where token = p_token;
  if s.id is null then raise exception 'Du er ikke logget ind.'; end if;
  insert into hv_peep_profil (navn, bio) values (s.navn, left(trim(coalesce(p_bio, '')), 150))
  on conflict (navn) do update set bio = excluded.bio;
end $$;
create or replace function public.hv_peep_profil_hent(p_navn text)
returns json language sql stable security definer set search_path = public as $$
  select json_build_object(
    'bio', coalesce((select bio from hv_peep_profil where lower(navn) = lower(p_navn)), ''),
    'opslag', (select count(*) from hv_peep_opslag where lower(navn) = lower(p_navn)),
    'likes', (select count(*) from hv_peep_likes l join hv_peep_opslag o on o.id = l.opslag_id where lower(o.navn) = lower(p_navn)));
$$;

grant execute on function public.hv_peep_send(uuid, text, jsonb), public.hv_peep_hent(text), public.hv_peep_like(uuid, bigint),
  public.hv_peep_kommenter(uuid, bigint, text), public.hv_peep_slet(uuid, bigint, boolean), public.hv_peep_bio(uuid, text),
  public.hv_peep_profil_hent(text) to anon, authenticated;

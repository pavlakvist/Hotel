-- HELLO VERA, del 2: venner, private beskeder, liste over alle spillere og zzz når man sover.
-- Kopiér ALT herfra og indsæt i Supabase → SQL Editor → Run (ligesom sidst).
alter table public.hv_spillere add column if not exists aktiv timestamptz not null default now();

create table if not exists public.hv_venner (
  a text not null,
  b text not null,
  oprettet timestamptz not null default now(),
  primary key (a, b)
);
create table if not exists public.hv_beskeder (
  id bigint generated always as identity primary key,
  fra text not null,
  til text not null,
  tekst text not null,
  tid timestamptz not null default now()
);
create index if not exists hv_beskeder_til on public.hv_beskeder (til, id);
alter table public.hv_venner enable row level security;
alter table public.hv_beskeder enable row level security;
revoke all on public.hv_venner, public.hv_beskeder from anon, authenticated;

-- Tilføj en ven (begge bliver venner med det samme, og den anden får en besked)
create or replace function public.hv_ven_tilfoej(p_token uuid, p_navn text)
returns json language plpgsql security definer set search_path = public as $$
declare s hv_spillere; o hv_spillere;
begin
  select * into s from hv_spillere where token = p_token;
  if s.id is null then raise exception 'Du er ikke logget ind.'; end if;
  select * into o from hv_spillere where navn_lille = lower(trim(coalesce(p_navn, '')));
  if o.id is null then raise exception 'Der findes ingen spiller, der hedder %.', p_navn; end if;
  if o.id = s.id then raise exception 'Du kan ikke blive ven med dig selv.'; end if;
  if not exists (select 1 from hv_venner where a = s.navn_lille and b = o.navn_lille) then
    insert into hv_venner (a, b) values (s.navn_lille, o.navn_lille), (o.navn_lille, s.navn_lille) on conflict do nothing;
    insert into hv_beskeder (fra, til, tekst) values (s.navn, o.navn, '💚 Jeg har tilføjet dig som ven!');
  end if;
  return json_build_object('navn', o.navn);
end $$;

create or replace function public.hv_ven_fjern(p_token uuid, p_navn text)
returns void language plpgsql security definer set search_path = public as $$
declare s hv_spillere;
begin
  select * into s from hv_spillere where token = p_token;
  if s.id is null then raise exception 'Du er ikke logget ind.'; end if;
  delete from hv_venner where (a = s.navn_lille and b = lower(p_navn)) or (b = s.navn_lille and a = lower(p_navn));
end $$;

-- Send en privat besked (kun til venner)
create or replace function public.hv_besked_send(p_token uuid, p_til text, p_tekst text)
returns void language plpgsql security definer set search_path = public as $$
declare s hv_spillere; o hv_spillere;
begin
  select * into s from hv_spillere where token = p_token;
  if s.id is null then raise exception 'Du er ikke logget ind.'; end if;
  select * into o from hv_spillere where navn_lille = lower(trim(coalesce(p_til, '')));
  if o.id is null then raise exception 'Der findes ingen spiller, der hedder %.', p_til; end if;
  if not exists (select 1 from hv_venner where a = s.navn_lille and b = o.navn_lille)
     and not exists (select 1 from hv_ejere where navn_lille = s.navn_lille) then
    raise exception 'I skal være venner for at skrive sammen.';
  end if;
  if length(trim(coalesce(p_tekst, ''))) = 0 then return; end if;
  insert into hv_beskeder (fra, til, tekst) values (s.navn, o.navn, left(p_tekst, 500));
  delete from hv_beskeder where tid < now() - interval '30 days';
end $$;

-- Pulsen får to nye ting med: dine venner og nye private beskeder til dig
drop function if exists public.hv_puls(uuid, text, real, real, text, jsonb, jsonb, jsonb, bigint);
create or replace function public.hv_puls(p_token uuid, p_rum text, p_x real, p_y real, p_retning text,
  p_sidder jsonb, p_figur jsonb, p_boble jsonb, p_efter bigint, p_besked_efter bigint default null)
returns json language plpgsql security definer set search_path = public as $$
declare s hv_spillere; v_sidste bigint;
begin
  select * into s from hv_spillere where token = p_token;
  if s.id is null then raise exception 'Du er ikke logget ind.'; end if;
  update hv_spillere set sidst_set = now(), rum = left(p_rum, 80), x = p_x, y = p_y, retning = left(p_retning, 20),
    sidder = p_sidder, figur = coalesce(p_figur, figur), boble = coalesce(p_boble, boble),
    -- har man flyttet sig, er man vågen
    aktiv = case when s.sidst_set is null or s.rum is distinct from p_rum or abs(coalesce(s.x, 0) - p_x) > 0.01
      or abs(coalesce(s.y, 0) - p_y) > 0.01 or s.sidder is distinct from p_sidder then now() else s.aktiv end
  where id = s.id;
  select coalesce(max(id), 0) into v_sidste from hv_chat;
  return json_build_object(
    'mig', s.navn,
    'spillere', coalesce((select json_agg(json_build_object('navn', o.navn, 'rum', o.rum, 'x', o.x, 'y', o.y,
        'retning', o.retning, 'sidder', o.sidder, 'figur', o.figur, 'boble', o.boble,
        'sover', o.aktiv < now() - interval '5 minutes'))
      from hv_spillere o where o.id <> s.id and o.sidst_set > now() - interval '20 seconds'), '[]'::json),
    'chat', case when p_efter is null then '[]'::json else coalesce((select json_agg(c order by c.id) from
        (select id, navn, tekst, boble from hv_chat where rum = p_rum and id > p_efter and navn <> s.navn order by id limit 50) c), '[]'::json) end,
    'sidste', v_sidste,
    'venner', coalesce((select json_agg(json_build_object('navn', o.navn, 'rum', o.rum,
        'online', coalesce(o.sidst_set > now() - interval '20 seconds', false)))
      from hv_venner v join hv_spillere o on o.navn_lille = v.b where v.a = s.navn_lille), '[]'::json),
    'beskeder', coalesce((select json_agg(m order by m.id) from
        (select id, fra, tekst, tid from hv_beskeder where til = s.navn and id > coalesce(p_besked_efter, 0) order by id limit 50) m), '[]'::json));
end $$;

-- Chat vækker en sovende spiller
create or replace function public.hv_chat_send(p_token uuid, p_rum text, p_tekst text, p_boble jsonb)
returns void language plpgsql security definer set search_path = public as $$
declare s hv_spillere;
begin
  select * into s from hv_spillere where token = p_token;
  if s.id is null then raise exception 'Du er ikke logget ind.'; end if;
  if length(trim(coalesce(p_tekst, ''))) = 0 then return; end if;
  insert into hv_chat (rum, navn, tekst, boble) values (left(p_rum, 80), s.navn, left(p_tekst, 300), p_boble);
  update hv_spillere set aktiv = now() where id = s.id;
  delete from hv_chat where tid < now() - interval '2 days';
end $$;

-- Alle profiler på hotellet (til ejerpanelet og søgning)
create or replace function public.hv_alle_spillere(p_token uuid)
returns json language plpgsql security definer set search_path = public as $$
declare s hv_spillere;
begin
  select * into s from hv_spillere where token = p_token;
  if s.id is null then raise exception 'Du er ikke logget ind.'; end if;
  return coalesce((select json_agg(json_build_object('navn', o.navn, 'oprettet', o.oprettet, 'sidst', o.sidst_set,
      'online', coalesce(o.sidst_set > now() - interval '20 seconds', false)) order by o.navn_lille)
    from hv_spillere o), '[]'::json);
end $$;

revoke all on function public.hv_ven_tilfoej, public.hv_ven_fjern, public.hv_besked_send, public.hv_alle_spillere,
  public.hv_puls(uuid, text, real, real, text, jsonb, jsonb, jsonb, bigint, bigint) from public;
grant execute on function public.hv_ven_tilfoej, public.hv_ven_fjern, public.hv_besked_send, public.hv_alle_spillere,
  public.hv_puls(uuid, text, real, real, text, jsonb, jsonb, jsonb, bigint, bigint) to anon, authenticated;

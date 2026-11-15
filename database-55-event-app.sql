-- HELLO VERA, del 55: 🎪 Event-appen på telefonen (for Eventfolk, Eventværter og ejeren)
-- - 📅 Planlagte events (titel, tekst, emoji, rum, dato og tidspunkt, længde, leg og hvem der står for det)
-- - 💬 Team-chat kun for Eventfolk, Eventværter og ejeren
-- - 🏆 Alle tidligere vindere og præmier (bruger hv_vindere og hv_gevinster fra del 21)
-- Kør database-21-eventnoter-vindere.sql og database-35-event-reklame.sql FØRST.
-- Kopiér ALT herfra → Supabase → SQL Editor → + New query → Run. Må gerne køres flere gange.

create table if not exists public.hv_event_plan (
  id bigint generated always as identity primary key,
  hvem text not null,                          -- hvem der oprettede det
  titel text not null,
  tekst text,
  emoji text,
  rum text,
  rum_navn text,
  start timestamptz not null,
  minutter integer not null default 30,
  leg text,                                    -- id fra legene i appen, fx "quiz"
  ansvarlig text,                              -- hvem der står for eventet
  startet timestamptz,                         -- hvornår det blev startet (event-skiltet sendt ud)
  reklame_id bigint,
  aflyst boolean not null default false,
  oprettet timestamptz not null default now()
);
create table if not exists public.hv_event_chat (
  id bigint generated always as identity primary key,
  navn text not null,
  tekst text not null,
  tid timestamptz not null default now()
);
alter table public.hv_event_plan enable row level security;
alter table public.hv_event_chat enable row level security;
revoke all on public.hv_event_plan, public.hv_event_chat from anon, authenticated;

-- Hvem må bruge appen? Ejeren, Eventværter og Eventfolk (samme som hv_maa_skrive_events fra del 21)
create or replace function public.hv_eventapp_spiller(p_token uuid)
returns hv_spillere language plpgsql stable security definer set search_path = public as $$
declare s hv_spillere;
begin
  select * into s from hv_spillere where token = p_token;
  if s.id is null then raise exception 'Du er ikke logget ind.'; end if;
  if not hv_maa_skrive_events(s.navn) then raise exception 'Kun ejeren, Eventværter og Eventfolk kan bruge Event-appen.'; end if;
  return s;
end $$;
revoke all on function public.hv_eventapp_spiller(uuid) from public, anon, authenticated;

-- 📅 Hent planlagte events (kommende + dem fra de sidste 14 dage)
create or replace function public.hv_eventplan_hent(p_token uuid)
returns json language plpgsql security definer set search_path = public as $$
declare s hv_spillere;
begin
  s := hv_eventapp_spiller(p_token);
  return coalesce((select json_agg(json_build_object('id', id, 'hvem', hvem, 'titel', titel, 'tekst', tekst, 'emoji', emoji,
      'rum', rum, 'rum_navn', rum_navn, 'start', start, 'minutter', minutter, 'leg', leg, 'ansvarlig', ansvarlig,
      'startet', startet, 'reklame_id', reklame_id, 'aflyst', aflyst, 'oprettet', oprettet) order by start)
    from hv_event_plan where start > now() - interval '14 days'), '[]'::json);
end $$;

-- 📅 Opret (p_id = null) eller ret et planlagt event
create or replace function public.hv_eventplan_gem(p_token uuid, p_id bigint, p_titel text, p_tekst text, p_emoji text,
  p_rum text, p_rum_navn text, p_start timestamptz, p_minutter integer, p_leg text, p_ansvarlig text)
returns json language plpgsql security definer set search_path = public as $$
declare s hv_spillere; v_id bigint; v_min integer := least(greatest(coalesce(p_minutter, 30), 5), 240);
begin
  s := hv_eventapp_spiller(p_token);
  if coalesce(trim(p_titel), '') = '' then raise exception 'Skriv hvad eventet hedder.'; end if;
  if p_start is null then raise exception 'Vælg dato og tidspunkt.'; end if;
  if p_id is null then
    if p_start < now() - interval '10 minutes' then raise exception 'Tidspunktet er allerede gået.'; end if;
    insert into hv_event_plan (hvem, titel, tekst, emoji, rum, rum_navn, start, minutter, leg, ansvarlig)
    values (s.navn, left(trim(p_titel), 60), left(trim(coalesce(p_tekst, '')), 300), left(coalesce(p_emoji, ''), 12),
      left(coalesce(p_rum, ''), 40), left(coalesce(p_rum_navn, ''), 60), p_start, v_min, left(coalesce(p_leg, ''), 30),
      left(trim(coalesce(p_ansvarlig, '')), 40))
    returning id into v_id;
  else
    update hv_event_plan set titel = left(trim(p_titel), 60), tekst = left(trim(coalesce(p_tekst, '')), 300),
      emoji = left(coalesce(p_emoji, ''), 12), rum = left(coalesce(p_rum, ''), 40), rum_navn = left(coalesce(p_rum_navn, ''), 60),
      start = p_start, minutter = v_min, leg = left(coalesce(p_leg, ''), 30), ansvarlig = left(trim(coalesce(p_ansvarlig, '')), 40),
      aflyst = false
    where id = p_id returning id into v_id;
    if v_id is null then raise exception 'Eventet findes ikke længere.'; end if;
  end if;
  delete from hv_event_plan where start < now() - interval '60 days';
  return json_build_object('id', v_id);
end $$;

-- ❌ Aflys (p_aflys = true), ↩ genåbn (false) eller 🗑 slet (p_slet = true) et planlagt event
create or replace function public.hv_eventplan_aflys(p_token uuid, p_id bigint, p_aflys boolean default true, p_slet boolean default false)
returns void language plpgsql security definer set search_path = public as $$
declare s hv_spillere;
begin
  s := hv_eventapp_spiller(p_token);
  if p_slet then delete from hv_event_plan where id = p_id;
  else update hv_event_plan set aflyst = coalesce(p_aflys, true) where id = p_id; end if;
end $$;

-- ▶ Eventet er startet (event-skiltet er sendt ud med hv_reklame_send)
create or replace function public.hv_eventplan_startet(p_token uuid, p_id bigint, p_reklame_id bigint)
returns void language plpgsql security definer set search_path = public as $$
declare s hv_spillere;
begin
  s := hv_eventapp_spiller(p_token);
  update hv_event_plan set startet = now(), reklame_id = p_reklame_id, aflyst = false where id = p_id;
end $$;

-- 💬 Team-chat: hent (de sidste 150, eller kun dem efter p_efter)
create or replace function public.hv_eventchat_hent(p_token uuid, p_efter bigint default null)
returns json language plpgsql security definer set search_path = public as $$
declare s hv_spillere;
begin
  s := hv_eventapp_spiller(p_token);
  return coalesce((select json_agg(json_build_object('id', id, 'navn', navn, 'tekst', tekst, 'tid', tid) order by id)
    from (select * from hv_event_chat where p_efter is null or id > p_efter order by id desc limit 150) x), '[]'::json);
end $$;

-- 💬 Team-chat: skriv
create or replace function public.hv_eventchat_send(p_token uuid, p_tekst text)
returns json language plpgsql security definer set search_path = public as $$
declare s hv_spillere; v_id bigint;
begin
  s := hv_eventapp_spiller(p_token);
  if coalesce(trim(p_tekst), '') = '' then raise exception 'Skriv en besked.'; end if;
  insert into hv_event_chat (navn, tekst) values (s.navn, left(trim(p_tekst), 500)) returning id into v_id;
  delete from hv_event_chat where tid < now() - interval '90 days';
  return json_build_object('id', v_id);
end $$;

-- 🏆 Alle tidligere vindere og præmier (også ældre end 7 dage), og om de har valgt deres gratis ting
create or replace function public.hv_eventapp_resultater(p_token uuid)
returns json language plpgsql security definer set search_path = public as $$
declare s hv_spillere;
begin
  s := hv_eventapp_spiller(p_token);
  return coalesce((select json_agg(json_build_object('id', v.id, 'hvem', v.hvem, 'event', v.event, 'navne', v.navne,
      'gevinst', v.gevinst, 'tid', v.tid,
      'valgt', coalesce((select json_agg(json_build_object('navn', g.navn, 'brugt', g.brugt, 'moebel_navn', g.moebel_navn))
        from hv_gevinster g where g.vinder_id = v.id), '[]'::json)) order by v.tid desc)
    from (select * from hv_vindere order by tid desc limit 200) v), '[]'::json);
end $$;

revoke all on function public.hv_eventplan_hent, public.hv_eventplan_gem, public.hv_eventplan_aflys, public.hv_eventplan_startet,
  public.hv_eventchat_hent, public.hv_eventchat_send, public.hv_eventapp_resultater from public;
grant execute on function public.hv_eventplan_hent, public.hv_eventplan_gem, public.hv_eventplan_aflys, public.hv_eventplan_startet,
  public.hv_eventchat_hent, public.hv_eventchat_send, public.hv_eventapp_resultater to anon, authenticated;

notify pgrst, 'reload schema';

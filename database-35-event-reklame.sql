-- HELLO VERA, del 35: 🎪 Event-reklame med Følg-knap
-- - Ejeren, Eventværter og Eventfolk kan sende et stort skilt ud midt på skærmen hos alle:
--   "Pall holder Quiz!" med farve, emoji, effekt og en ➡ Følg-knap, der tager spilleren hen til rummet.
-- - Skiltet forsvinder af sig selv, når tiden er gået, eller når man trykker "⏹ Stop eventet".
-- Kør database-21-eventnoter-vindere.sql FØRST (den laver hv_maa_skrive_events).
-- Kopiér ALT herfra → Supabase → SQL Editor → + New query → Run. Må gerne køres flere gange.

create table if not exists public.hv_event_reklamer (
  id bigint generated always as identity primary key,
  hvem text not null,
  event text not null,
  tekst text,
  rum text,
  rum_navn text,
  stil jsonb,                                  -- {"farve": "guld", "emoji": "🎉", "effekt": "konfetti"}
  tid timestamptz not null default now(),
  slut timestamptz not null
);
alter table public.hv_event_reklamer enable row level security;
revoke all on public.hv_event_reklamer from anon, authenticated;

-- 📣 Send en event-reklame ud til alle (ejeren, Eventværter og Eventfolk)
create or replace function public.hv_reklame_send(p_token uuid, p_event text, p_tekst text, p_rum text, p_rum_navn text,
  p_stil jsonb default null, p_minutter integer default 30)
returns json language plpgsql security definer set search_path = public as $$
declare s hv_spillere; v_id bigint; v_min integer := least(greatest(coalesce(p_minutter, 30), 1), 240);
begin
  select * into s from hv_spillere where token = p_token;
  if s.id is null then raise exception 'Du er ikke logget ind.'; end if;
  if not hv_maa_skrive_events(s.navn) then raise exception 'Kun ejeren, Eventværter og Eventfolk kan sende event-reklamer.'; end if;
  if coalesce(trim(p_event), '') = '' then raise exception 'Skriv hvad du holder.'; end if;
  insert into hv_event_reklamer (hvem, event, tekst, rum, rum_navn, stil, slut)
  values (s.navn, left(trim(p_event), 60), left(trim(coalesce(p_tekst, '')), 160), left(coalesce(p_rum, ''), 40), left(coalesce(p_rum_navn, ''), 60),
    case when jsonb_typeof(p_stil) = 'object' then jsonb_build_object('farve', left(coalesce(p_stil->>'farve', ''), 20),
      'emoji', left(coalesce(p_stil->>'emoji', ''), 12), 'effekt', left(coalesce(p_stil->>'effekt', ''), 20)) end,
    now() + make_interval(mins => v_min))
  returning id into v_id;
  delete from hv_event_reklamer where slut < now() - interval '2 days';
  return json_build_object('id', v_id);
end $$;

-- ⏹ Stop et event (ejeren, Eventværter og Eventfolk): skiltet forsvinder hos alle
create or replace function public.hv_reklame_stop(p_token uuid, p_id bigint)
returns void language plpgsql security definer set search_path = public as $$
declare s hv_spillere;
begin
  select * into s from hv_spillere where token = p_token;
  if s.id is null then raise exception 'Du er ikke logget ind.'; end if;
  if not hv_maa_skrive_events(s.navn) then raise exception 'Kun ejeren, Eventværter og Eventfolk kan stoppe events.'; end if;
  update hv_event_reklamer set slut = now() where id = p_id;
end $$;

-- Alle kan se de events, der er i gang lige nu
create or replace function public.hv_reklamer_hent()
returns json language sql stable security definer set search_path = public as $$
  select coalesce(json_agg(json_build_object('id', id, 'hvem', hvem, 'event', event, 'tekst', tekst, 'rum', rum,
    'rum_navn', rum_navn, 'stil', stil, 'tid', tid, 'slut', slut) order by tid desc), '[]'::json)
  from hv_event_reklamer where slut > now();
$$;

revoke all on function public.hv_reklame_send, public.hv_reklame_stop, public.hv_reklamer_hent from public;
grant execute on function public.hv_reklame_send, public.hv_reklame_stop, public.hv_reklamer_hent to anon, authenticated;

notify pgrst, 'reload schema';

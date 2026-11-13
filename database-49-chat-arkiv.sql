-- HELLO VERA, del 49: 📚 Chat-arkiv
-- - Alt hvad der bliver skrevet højt i rummene, gemmes nu FOR ALTID (før blev det slettet efter 2 dage).
-- - Ejeren (og MOD) kan søge i hele arkivet i Ejerpanel → 💬 Chatlogs, også 10 år tilbage.
-- Kopiér ALT herfra → Supabase → SQL Editor → + New query → Run. Må gerne køres flere gange.

-- 1) Chatten sendes som før, men gamle beskeder bliver IKKE længere slettet
create or replace function public.hv_chat_send(p_token uuid, p_rum text, p_tekst text, p_boble jsonb)
returns void language plpgsql security definer set search_path = public as $$
declare s hv_spillere;
begin
  select * into s from hv_spillere where token = p_token;
  if s.id is null then raise exception 'Du er ikke logget ind.'; end if;
  if length(trim(coalesce(p_tekst, ''))) = 0 then return; end if;
  insert into hv_chat (rum, navn, tekst, boble) values (left(p_rum, 80), s.navn, left(p_tekst, 300), p_boble);
  update hv_spillere set aktiv = now() where id = s.id;
  -- (her stod før: delete from hv_chat where tid < now() - interval '2 days')
end $$;

-- 2) "Register" så søgningen går hurtigt, selv når der er mange års beskeder
create index if not exists hv_chat_tid on public.hv_chat (tid);
create index if not exists hv_chat_navn_id on public.hv_chat (lower(navn), id);

-- 3) Søg i hele arkivet (kun ejeren og MOD)
--    Alle felter er valgfri. p_foer = hent beskeder der er ÆLDRE end denne (til "Vis ældre").
create or replace function public.hv_chatlog_soeg(p_token uuid, p_navn text default null, p_rum text default null,
  p_dato date default null, p_soeg text default null, p_foer bigint default null, p_antal int default 200)
returns json language plpgsql security definer set search_path = public as $$
declare s hv_spillere; v_fra timestamptz; v_til timestamptz;
begin
  select * into s from hv_spillere where token = p_token;
  if s.id is null then raise exception 'Du er ikke logget ind.'; end if;
  if not hv_er_mod(s.navn) then raise exception 'Kun ejeren og MOD kan se chat-arkivet.'; end if;
  if p_dato is not null then
    v_fra := p_dato::timestamp at time zone 'Europe/Copenhagen';
    v_til := (p_dato + 1)::timestamp at time zone 'Europe/Copenhagen';
  end if;
  return json_build_object(
    'linjer', coalesce((select json_agg(c order by c.id desc) from (
        select id, navn, rum, tekst, (extract(epoch from tid) * 1000)::bigint as tid from hv_chat
        where (coalesce(p_navn, '') = '' or lower(navn) = lower(p_navn))
          and (coalesce(p_rum, '') = '' or rum = p_rum)
          and (v_fra is null or (tid >= v_fra and tid < v_til))
          and (coalesce(p_soeg, '') = '' or strpos(lower(tekst), lower(p_soeg)) > 0)
          and (p_foer is null or id < p_foer)
        order by id desc limit least(greatest(coalesce(p_antal, 200), 1), 500)) c), '[]'::json),
    'aeldste', (select (extract(epoch from min(tid)) * 1000)::bigint from hv_chat),
    'i_alt', (select count(*) from hv_chat),
    'rum', coalesce((select json_agg(r order by r) from (select distinct rum as r from hv_chat where rum is not null) x), '[]'::json));
end $$;

revoke all on function public.hv_chatlog_soeg(uuid, text, text, date, text, bigint, int) from public;
grant execute on function public.hv_chatlog_soeg(uuid, text, text, date, text, bigint, int) to anon, authenticated;
grant execute on function public.hv_chat_send(uuid, text, text, jsonb) to anon, authenticated;

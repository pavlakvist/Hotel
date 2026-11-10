-- HELLO VERA, del 41: ✉️ Vera-Mail (app fra App Butik i telefonen)
-- - Gæsterne sender mails til hinanden med emne og tekst.
-- - Indbakke og Sendt, ulæste mails, slet. Ejeren kan sende til "alle".
-- Kopiér ALT herfra → Supabase → SQL Editor → + New query → Run. Må gerne køres flere gange.

create table if not exists public.hv_mails (
  id bigint generated always as identity primary key,
  fra text not null,
  fra_lille text not null,
  til text not null,
  til_lille text not null,
  emne text not null default '',
  tekst text not null,
  laest boolean not null default false,
  slet_fra boolean not null default false,   -- afsenderen har slettet den (fra Sendt)
  slet_til boolean not null default false,   -- modtageren har slettet den (fra Indbakke)
  tid timestamptz not null default now()
);
create index if not exists hv_mails_til on public.hv_mails (til_lille, id desc);
create index if not exists hv_mails_fra on public.hv_mails (fra_lille, id desc);
alter table public.hv_mails enable row level security;
revoke all on public.hv_mails from anon, authenticated;

-- ✉️ Send en mail (p_til = navnet på en gæst, eller "alle" for ejeren)
create or replace function public.hv_mail_send(p_token uuid, p_til text, p_emne text, p_tekst text)
returns bigint language plpgsql security definer set search_path = public as $$
declare s hv_spillere; m hv_spillere; ny bigint; v_emne text;
begin
  select * into s from hv_spillere where token = p_token;
  if s.id is null then raise exception 'Du er ikke logget ind.'; end if;
  if length(trim(coalesce(p_tekst, ''))) = 0 then raise exception 'Mailen er tom.'; end if;
  if length(p_tekst) > 3000 then raise exception 'Mailen er for lang (højst 3000 tegn).'; end if;
  v_emne := left(trim(coalesce(p_emne, '')), 80);
  if lower(trim(coalesce(p_til, ''))) = 'alle' and not hv_er_ejer(s.navn) then raise exception 'Kun hotellets ejer kan sende mails til alle.'; end if;
  if exists (select 1 from hv_mails where fra_lille = s.navn_lille and tid > now() - interval '5 seconds') then
    raise exception 'Vent lidt, før du sender en mail igen.';
  end if;
  -- 👑 ejeren kan sende til alle på hotellet
  if lower(trim(coalesce(p_til, ''))) = 'alle' then
    insert into hv_mails (fra, fra_lille, til, til_lille, emne, tekst, slet_fra)
      select s.navn, s.navn_lille, x.navn, x.navn_lille, v_emne, p_tekst, true from hv_spillere x where x.id <> s.id;
    insert into hv_mails (fra, fra_lille, til, til_lille, emne, tekst, slet_til, laest)
      values (s.navn, s.navn_lille, 'Alle på hotellet', '*alle*', v_emne, p_tekst, true, true) returning id into ny;
    return ny;
  end if;
  select * into m from hv_spillere where navn_lille = lower(trim(coalesce(p_til, '')));
  if m.id is null then raise exception 'Der findes ingen gæst, der hedder %.', p_til; end if;
  if m.id = s.id then raise exception 'Du kan ikke sende en mail til dig selv.'; end if;
  if (select count(*) from hv_mails where til_lille = m.navn_lille and not slet_til) >= 300 then
    raise exception '%s indbakke er fuld.', m.navn;
  end if;
  insert into hv_mails (fra, fra_lille, til, til_lille, emne, tekst)
    values (s.navn, s.navn_lille, m.navn, m.navn_lille, v_emne, p_tekst) returning id into ny;
  update hv_spillere set aktiv = now() where id = s.id;
  return ny;
end $$;

-- 📥 Mine mails: indbakke og sendt (de nyeste 100 af hver)
create or replace function public.hv_mail_hent(p_token uuid)
returns json language plpgsql security definer set search_path = public as $$
declare s hv_spillere;
begin
  select * into s from hv_spillere where token = p_token;
  if s.id is null then raise exception 'Du er ikke logget ind.'; end if;
  return json_build_object(
    'ind', coalesce((select json_agg(json_build_object('id', b.id, 'fra', b.fra, 'emne', b.emne, 'tekst', b.tekst, 'laest', b.laest,
        'tid', (extract(epoch from b.tid) * 1000)::bigint) order by b.id desc)
      from (select * from hv_mails where til_lille = s.navn_lille and not slet_til order by id desc limit 100) b), '[]'::json),
    'sendt', coalesce((select json_agg(json_build_object('id', b.id, 'til', b.til, 'emne', b.emne, 'tekst', b.tekst, 'laest', b.laest,
        'tid', (extract(epoch from b.tid) * 1000)::bigint) order by b.id desc)
      from (select * from hv_mails where fra_lille = s.navn_lille and not slet_fra order by id desc limit 100) b), '[]'::json));
end $$;

-- 👀 Jeg har læst en mail
create or replace function public.hv_mail_laest(p_token uuid, p_id bigint)
returns void language plpgsql security definer set search_path = public as $$
declare s hv_spillere;
begin
  select * into s from hv_spillere where token = p_token;
  if s.id is null then raise exception 'Du er ikke logget ind.'; end if;
  update hv_mails set laest = true where id = p_id and til_lille = s.navn_lille;
end $$;

-- 🗑 Slet en mail (fra min indbakke eller fra Sendt). Er den slettet begge steder, forsvinder den helt.
create or replace function public.hv_mail_slet(p_token uuid, p_id bigint)
returns void language plpgsql security definer set search_path = public as $$
declare s hv_spillere;
begin
  select * into s from hv_spillere where token = p_token;
  if s.id is null then raise exception 'Du er ikke logget ind.'; end if;
  update hv_mails set slet_til = true where id = p_id and til_lille = s.navn_lille;
  update hv_mails set slet_fra = true where id = p_id and fra_lille = s.navn_lille;
  delete from hv_mails where id = p_id and slet_til and slet_fra;
end $$;

grant execute on function public.hv_mail_send(uuid, text, text, text) to anon, authenticated;
grant execute on function public.hv_mail_hent(uuid) to anon, authenticated;
grant execute on function public.hv_mail_laest(uuid, bigint) to anon, authenticated;
grant execute on function public.hv_mail_slet(uuid, bigint) to anon, authenticated;
notify pgrst, 'reload schema';

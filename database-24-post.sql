-- HELLO VERA, del 24: Postkontoret ✉️
-- På postkontoret skriver man breve til de andre på hotellet (man vælger selv papir, skrift og klistermærker).
-- Brevet havner i modtagerens postkasse ude på gangen ved deres lejlighedsdør.
-- Kopiér ALT herfra → Supabase → SQL Editor → + New query → Run. Må gerne køres flere gange.
create table if not exists public.hv_breve (
  id bigint generated always as identity primary key,
  fra text not null,
  fra_lille text not null,
  til text not null,
  til_lille text not null,
  tekst text not null,
  papir jsonb not null default '{}'::jsonb,   -- farve, skrift og klistermærker
  laest boolean not null default false,
  tid timestamptz not null default now()
);
create index if not exists hv_breve_til on public.hv_breve (til_lille, id desc);
alter table public.hv_breve enable row level security;
revoke all on public.hv_breve from anon, authenticated;

-- Send et brev
create or replace function public.hv_brev_send(p_token uuid, p_til text, p_tekst text, p_papir jsonb)
returns bigint language plpgsql security definer set search_path = public as $$
declare s hv_spillere; m hv_spillere; ny bigint;
begin
  select * into s from hv_spillere where token = p_token;
  if s.id is null then raise exception 'Du er ikke logget ind.'; end if;
  select * into m from hv_spillere where navn_lille = lower(trim(coalesce(p_til, '')));
  if m.id is null then raise exception 'Der bor ingen på hotellet, der hedder %.', p_til; end if;
  if length(trim(coalesce(p_tekst, ''))) = 0 then raise exception 'Brevet er tomt.'; end if;
  if length(p_tekst) > 1500 then raise exception 'Brevet er for langt (højst 1500 tegn).'; end if;
  if exists (select 1 from hv_breve where fra_lille = s.navn_lille and tid > now() - interval '10 seconds') then
    raise exception 'Vent lidt, før du sender et brev igen.';
  end if;
  if (select count(*) from hv_breve where til_lille = m.navn_lille) >= 200 then
    raise exception '%s postkasse er fuld.', m.navn;
  end if;
  insert into hv_breve (fra, fra_lille, til, til_lille, tekst, papir)
  values (s.navn, s.navn_lille, m.navn, m.navn_lille, p_tekst,
    case when jsonb_typeof(p_papir) = 'object' and length(p_papir::text) < 2000 then p_papir else '{}'::jsonb end)
  returning id into ny;
  update hv_spillere set aktiv = now() where id = s.id;
  return ny;
end $$;

-- Breve i min postkasse (de nyeste først)
create or replace function public.hv_brev_hent(p_token uuid)
returns json language plpgsql security definer set search_path = public as $$
declare s hv_spillere;
begin
  select * into s from hv_spillere where token = p_token;
  if s.id is null then raise exception 'Du er ikke logget ind.'; end if;
  return coalesce((select json_agg(json_build_object('id', b.id, 'fra', b.fra, 'tekst', b.tekst, 'papir', b.papir,
      'laest', b.laest, 'tid', b.tid) order by b.id desc)
    from (select * from hv_breve where til_lille = s.navn_lille order by id desc limit 100) b), '[]'::json);
end $$;

-- Jeg har læst et brev
create or replace function public.hv_brev_laest(p_token uuid, p_id bigint)
returns void language plpgsql security definer set search_path = public as $$
declare s hv_spillere;
begin
  select * into s from hv_spillere where token = p_token;
  if s.id is null then raise exception 'Du er ikke logget ind.'; end if;
  update hv_breve set laest = true where id = p_id and til_lille = s.navn_lille;
end $$;

-- Smid et brev ud
create or replace function public.hv_brev_slet(p_token uuid, p_id bigint)
returns void language plpgsql security definer set search_path = public as $$
declare s hv_spillere;
begin
  select * into s from hv_spillere where token = p_token;
  if s.id is null then raise exception 'Du er ikke logget ind.'; end if;
  delete from hv_breve where id = p_id and til_lille = s.navn_lille;
end $$;

revoke all on function public.hv_brev_send, public.hv_brev_hent, public.hv_brev_laest, public.hv_brev_slet from public;
grant execute on function public.hv_brev_send, public.hv_brev_hent, public.hv_brev_laest, public.hv_brev_slet to anon, authenticated;

-- Ejeren og Bygmestre må flytte møblerne på postkontoret (ligesom i biografen), så alle ser det samme
create or replace function public.hv_rum_moebler_gem(p_token uuid, p_rum text, p_moebler jsonb)
returns void language plpgsql security definer set search_path = public as $$
declare s hv_spillere;
begin
  select * into s from hv_spillere where token = p_token;
  if s.id is null then raise exception 'Du er ikke logget ind.'; end if;
  if not hv_er_bygmester(s.navn) then raise exception 'Kun ejeren og Bygmestre kan bygge i de fælles rum.'; end if;
  if p_rum not in ('hal', 'hemmelig', 'biograf', 'postkontor') and p_rum !~ '^event[0-9]+$' and p_rum !~ '^gang[0-9]+$' then raise exception 'Man kan kun bygge i de fælles rum.'; end if;
  if jsonb_typeof(p_moebler) <> 'array' or jsonb_array_length(p_moebler) > 800 then raise exception 'For mange møbler.'; end if;
  insert into hv_rum_moebler (rum, moebler, hvem) values (p_rum, p_moebler, s.navn)
  on conflict (rum) do update set moebler = excluded.moebler, hvem = excluded.hvem, tid = now();
end $$;
revoke all on function public.hv_rum_moebler_gem from public;
grant execute on function public.hv_rum_moebler_gem to anon, authenticated;
notify pgrst, 'reload schema';

-- HELLO VERA, del 17: Dørklokke 🔔
-- Ude i gangen kan man ringe på en lejlighedsdør. Den der bor der, får besked om hvem der ringer
-- og kan trykke "Luk op" (så kommer gæsten ind, også hvis døren er låst) eller "Ikke nu".
-- Kør database-16-lejligheder.sql FØRST. Kopiér ALT herfra → Supabase → SQL Editor → + New query → Run.
-- Må gerne køres flere gange.
create table if not exists public.hv_doerklokke (
  id bigserial primary key,
  lej_id text not null,
  til_lille text not null,      -- den der bor der
  fra text not null,            -- den der ringer
  fra_lille text not null,
  svar text,                    -- null = ikke svaret, 'ja' = lukket op, 'nej' = ikke nu
  tid timestamptz not null default now()
);
alter table public.hv_doerklokke enable row level security;
revoke all on public.hv_doerklokke from anon, authenticated;

-- Ring på
create or replace function public.hv_lej_ring(p_token uuid, p_id text)
returns bigint language plpgsql security definer set search_path = public as $$
declare s hv_spillere; l hv_lejligheder; ny bigint;
begin
  select * into s from hv_spillere where token = p_token;
  if s.id is null then raise exception 'Du er ikke logget ind.'; end if;
  select * into l from hv_lejligheder where id = p_id;
  if l.id is null then raise exception 'Der bor ingen her.'; end if;
  if l.ejer_lille = s.navn_lille then raise exception 'Det er din egen dør.'; end if;
  if exists (select 1 from hv_doerklokke where lej_id = p_id and fra_lille = s.navn_lille and tid > now() - interval '5 seconds') then
    raise exception 'Vent lidt, før du ringer igen.';
  end if;
  delete from hv_doerklokke where tid < now() - interval '1 hour';
  insert into hv_doerklokke (lej_id, til_lille, fra, fra_lille) values (p_id, l.ejer_lille, s.navn, s.navn_lille) returning id into ny;
  return ny;
end $$;

-- Hvem ringer på hos mig, og har nogen svaret på mine ringninger?
create or replace function public.hv_lej_klokke(p_token uuid)
returns json language plpgsql security definer set search_path = public as $$
declare s hv_spillere;
begin
  select * into s from hv_spillere where token = p_token;
  if s.id is null then raise exception 'Du er ikke logget ind.'; end if;
  return json_build_object(
    'ringer', coalesce((select json_agg(json_build_object('id', k.id, 'fra', k.fra, 'lej', k.lej_id) order by k.id)
      from hv_doerklokke k where k.til_lille = s.navn_lille and k.svar is null and k.tid > now() - interval '2 minutes'), '[]'::json),
    'svar', coalesce((select json_agg(json_build_object('id', k.id, 'lej', k.lej_id, 'svar', k.svar) order by k.id)
      from hv_doerklokke k where k.fra_lille = s.navn_lille and k.svar is not null and k.tid > now() - interval '2 minutes'), '[]'::json));
end $$;

-- Luk op (ja) eller ikke nu (nej)
create or replace function public.hv_lej_ring_svar(p_token uuid, p_ring bigint, p_ja boolean)
returns void language plpgsql security definer set search_path = public as $$
declare s hv_spillere;
begin
  select * into s from hv_spillere where token = p_token;
  if s.id is null then raise exception 'Du er ikke logget ind.'; end if;
  update hv_doerklokke set svar = case when p_ja then 'ja' else 'nej' end where id = p_ring and til_lille = s.navn_lille;
end $$;

revoke all on function public.hv_lej_ring, public.hv_lej_klokke, public.hv_lej_ring_svar from public;
grant execute on function public.hv_lej_ring, public.hv_lej_klokke, public.hv_lej_ring_svar to anon, authenticated;
notify pgrst, 'reload schema';

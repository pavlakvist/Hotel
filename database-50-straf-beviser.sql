-- HELLO VERA, del 50: ⚖️ Straf med beviser fra chatloggen
-- - Ejeren og MOD kan sætte ✅ ved beskeder i Ejerpanel → 💬 Chatlogs og give en straf med dem som bevis.
-- - Det bliver til en straf-rapport, som ejeren og ALLE ansatte kan se i fanen ⚖️ Straf-rapporter.
-- - Beviserne kopieres direkte fra serverens chat-arkiv, så de ikke kan laves om.
-- Kør database-49-chat-arkiv.sql FØRST.
-- Kopiér ALT herfra → Supabase → SQL Editor → + New query → Run. Må gerne køres flere gange.

create table if not exists public.hv_straf_rapporter (
  id bigint generated always as identity primary key,
  navn text not null,                       -- hvem fik straffen
  handling text not null,                   -- fx "Mute (1 time)"
  grund text,
  beviser jsonb not null default '[]',      -- de beskeder, der blev sat ✅ ved
  af text not null,                         -- hvem gav straffen
  tid timestamptz not null default now()
);
create index if not exists hv_straf_rapporter_navn on public.hv_straf_rapporter (lower(navn), id);
alter table public.hv_straf_rapporter enable row level security;
revoke all on public.hv_straf_rapporter from anon, authenticated;

-- Gem en straf-rapport (kun ejeren og MOD). p_ids = id'erne på bevis-beskederne i hv_chat.
create or replace function public.hv_straf_rapport_gem(p_token uuid, p_navn text, p_handling text, p_grund text, p_ids bigint[])
returns bigint language plpgsql security definer set search_path = public as $$
declare s hv_spillere; v_id bigint;
begin
  select * into s from hv_spillere where token = p_token;
  if s.id is null then raise exception 'Du er ikke logget ind.'; end if;
  if not hv_er_mod(s.navn) then raise exception 'Kun ejeren og MOD kan give straffe.'; end if;
  if coalesce(trim(p_navn), '') = '' then raise exception 'Vælg hvem der skal have straffen.'; end if;
  if coalesce(array_length(p_ids, 1), 0) > 100 then raise exception 'Højst 100 beviser ad gangen.'; end if;
  insert into hv_straf_rapporter (navn, handling, grund, beviser, af)
  values (left(trim(p_navn), 40), left(coalesce(p_handling, ''), 80), left(coalesce(p_grund, ''), 200),
    coalesce((select jsonb_agg(jsonb_build_object('id', c.id, 'navn', c.navn, 'rum', c.rum, 'tekst', c.tekst,
        'tid', (extract(epoch from c.tid) * 1000)::bigint) order by c.id)
      from hv_chat c where c.id = any(coalesce(p_ids, '{}'))), '[]'::jsonb),
    s.navn)
  returning id into v_id;
  insert into hv_adminlog (hvem, hvad) values (s.navn, left('Straf-rapport: ' || p_handling || ' til ' || p_navn ||
    coalesce(' (' || coalesce(array_length(p_ids, 1), 0) || ' beviser)', ''), 500));
  return v_id;
end $$;

-- Hent straf-rapporterne (ejeren og alle ansatte)
create or replace function public.hv_straf_rapporter_hent(p_token uuid)
returns json language plpgsql security definer set search_path = public as $$
declare s hv_spillere;
begin
  select * into s from hv_spillere where token = p_token;
  if s.id is null then raise exception 'Du er ikke logget ind.'; end if;
  if not hv_er_ansat(s.navn) then raise exception 'Kun ejeren og de ansatte kan se straf-rapporterne.'; end if;
  return coalesce((select json_agg(r order by r.id desc) from (
    select id, navn, handling, grund, beviser, af, (extract(epoch from tid) * 1000)::bigint as tid
    from hv_straf_rapporter order by id desc limit 500) r), '[]'::json);
end $$;

-- Slet en straf-rapport (kun ejeren)
create or replace function public.hv_straf_rapport_slet(p_token uuid, p_id bigint)
returns void language plpgsql security definer set search_path = public as $$
declare s hv_spillere;
begin
  select * into s from hv_spillere where token = p_token;
  if s.id is null then raise exception 'Du er ikke logget ind.'; end if;
  if not hv_er_ejer(s.navn) then raise exception 'Kun ejeren kan slette straf-rapporter.'; end if;
  delete from hv_straf_rapporter where id = p_id;
end $$;

revoke all on function public.hv_straf_rapport_gem(uuid, text, text, text, bigint[]),
  public.hv_straf_rapporter_hent(uuid), public.hv_straf_rapport_slet(uuid, bigint) from public;
grant execute on function public.hv_straf_rapport_gem(uuid, text, text, text, bigint[]),
  public.hv_straf_rapporter_hent(uuid), public.hv_straf_rapport_slet(uuid, bigint) to anon, authenticated;

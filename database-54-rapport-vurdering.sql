-- HELLO VERA, del 54: 🚩 Vurdér rapporter – "Løst" eller "Misbrug af rapport-knappen"
-- Når ejeren eller en MOD lukker en rapport, vælger de, hvordan den endte:
--   ✅ Løst     = rapporten var rigtig. Den der rapporterede får en tak-besked.
--   🚫 Misbrug  = rapporten var ikke en rigtig sag (fx for sjov eller for at drille).
--                 Den der rapporterede får en venlig besked om, hvad knappen er til.
-- Kør database-5-mod.sql og database-25-rapport-beskeder.sql FØRST.
-- Kopiér ALT herfra → Supabase → SQL Editor → + New query → Run. Må gerne køres flere gange.

alter table public.hv_rapporter add column if not exists udfald text;       -- 'loest' eller 'misbrug'
alter table public.hv_rapporter add column if not exists udfald_af text;    -- hvem der vurderede den

-- p_udfald = 'loest', 'misbrug' eller '' (= åbn rapporten igen)
create or replace function public.hv_rapport_udfald(p_token uuid, p_id bigint, p_udfald text)
returns json language plpgsql security definer set search_path = public as $$
declare s hv_spillere; r hv_rapporter; o hv_spillere; tekst text;
begin
  select * into s from hv_spillere where token = p_token;
  if s.id is null then raise exception 'Du er ikke logget ind.'; end if;
  if not hv_er_mod(s.navn) then raise exception 'Kun ejeren og MOD kan vurdere rapporter.'; end if;
  select * into r from hv_rapporter where id = p_id;
  if r.id is null then raise exception 'Rapporten findes ikke.'; end if;

  if coalesce(p_udfald, '') = '' then
    update hv_rapporter set behandlet = false, behandlet_tid = null, udfald = null, udfald_af = null where id = p_id;
    insert into hv_adminlog (hvem, hvad) values (s.navn, left('Rapport åbnet igen: ' || coalesce(r.grund, '') || ' (fra ' || r.fra || ')', 500));
    return json_build_object('udfald', null);
  end if;
  if p_udfald not in ('loest', 'misbrug') then raise exception 'Ukendt valg: %', p_udfald; end if;

  update hv_rapporter set behandlet = true, behandlet_tid = now(), udfald = p_udfald, udfald_af = s.navn,
    kigger = coalesce(kigger, s.navn) where id = p_id;
  insert into hv_adminlog (hvem, hvad) values (s.navn, left(
    case when p_udfald = 'loest' then 'Rapport løst: ' else 'Rapport lukket som misbrug: ' end
    || coalesce(r.grund, '') || ' (fra ' || r.fra || coalesce(' om ' || nullif(r.hvem, ''), '') || ')', 500));

  -- besked til den der rapporterede (kun én gang)
  if not r.loest_sendt then
    if p_udfald = 'loest' then
      tekst := '✅ Hej ' || r.fra || '! Din rapport om "' || coalesce(r.grund, 'Andet') || '"'
        || case when coalesce(r.hvem, '') <> '' then ' (' || r.hvem || ')' else '' end
        || ' er nu løst. Tusind tak fordi du sagde det, det hjælper hotellet! 💚';
    else
      tekst := '🚩 Hej ' || r.fra || '. Vi har kigget på din rapport om "' || coalesce(r.grund, 'Andet') || '"'
        || case when coalesce(r.hvem, '') <> '' then ' (' || r.hvem || ')' else '' end
        || ', og den er lukket, fordi det ikke var en rigtig sag. Rapportér-knappen er kun til rigtige problemer'
        || ' som mobning, trusler, snyd eller grimme ord. Bruger man den for sjov, kan man få en straf.';
    end if;
    update hv_rapporter set loest_sendt = true where id = p_id;
    select * into o from hv_spillere where navn_lille = lower(r.fra);
    if o.id is not null and o.navn_lille <> s.navn_lille then
      insert into hv_beskeder (fra, til, tekst) values (s.navn, o.navn, left(tekst, 500));
    end if;
  end if;
  return json_build_object('udfald', p_udfald, 'af', s.navn);
end $$;

-- Hvem kigger på hvilke rapporter, og hvordan de endte (vises i panelet hvert 5. sekund)
create or replace function public.hv_rapport_kiggere(p_token uuid)
returns json language plpgsql security definer set search_path = public as $$
declare s hv_spillere;
begin
  select * into s from hv_spillere where token = p_token;
  if s.id is null then raise exception 'Du er ikke logget ind.'; end if;
  if not hv_er_mod(s.navn) then return '{}'::json; end if;
  return coalesce((select json_object_agg(id, json_build_object('kigger', kigger, 'loestSendt', loest_sendt,
      'udfald', udfald, 'udfaldAf', udfald_af))
    from (select id, kigger, loest_sendt, udfald, udfald_af from hv_rapporter
          where kigger is not null or loest_sendt or udfald is not null order by id desc limit 300) x), '{}'::json);
end $$;

revoke all on function public.hv_rapport_udfald(uuid, bigint, text) from public;
grant execute on function public.hv_rapport_udfald(uuid, bigint, text) to anon, authenticated;
grant execute on function public.hv_rapport_kiggere(uuid) to anon, authenticated;

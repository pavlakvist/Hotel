-- HELLO VERA, del 54: 🚩 Vurdér rapporter – "Løst" eller "Misbrug af rapport-knappen"
-- Når ejeren eller en MOD lukker en rapport, vælger de, hvordan den endte:
--   ✅ Løst     = rapporten var rigtig. Den der rapporterede får en tak-besked.
--   🚫 Misbrug  = rapporten var ikke en rigtig sag (fx for sjov eller for at drille).
--                 Den der rapporterede får en venlig besked om, hvad knappen er til.
--   3. gang misbrug: spilleren får automatisk en advarsel: "gør du det igen, bliver du mutet i 60 min".
--   4. gang (og flere): spilleren bliver automatisk mutet i 60 minutter (det almindelige mute-system).
-- Kør database-5-mod.sql og database-25-rapport-beskeder.sql FØRST.
-- Kopiér ALT herfra → Supabase → SQL Editor → + New query → Run. Må gerne køres flere gange.

alter table public.hv_rapporter add column if not exists udfald text;       -- 'loest' eller 'misbrug'
alter table public.hv_rapporter add column if not exists udfald_af text;    -- hvem der vurderede den
alter table public.hv_rapporter add column if not exists misbrug_talt boolean not null default false;  -- talt med i 3/4-reglen

-- p_udfald = 'loest', 'misbrug' eller '' (= åbn rapporten igen)
create or replace function public.hv_rapport_udfald(p_token uuid, p_id bigint, p_udfald text)
returns json language plpgsql security definer set search_path = public as $$
declare s hv_spillere; r hv_rapporter; o hv_spillere; tekst text;
  antal int := 0; advaret boolean := false; mutet boolean := false; d jsonb; til bigint;
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

  -- 🚫 Misbrug tælles: 3. gang = advarsel, 4. gang og derefter = mute i 60 minutter
  if p_udfald = 'misbrug' and not r.misbrug_talt and coalesce(r.fra, '') <> '' and not hv_er_ejer(r.fra) then
    update hv_rapporter set misbrug_talt = true where id = p_id;
    select count(*) into antal from hv_rapporter where lower(fra) = lower(r.fra) and udfald = 'misbrug';
    select * into o from hv_spillere where navn_lille = lower(r.fra);
    if antal = 3 then
      advaret := true;
      if o.id is not null then
        insert into hv_beskeder (fra, til, tekst) values (s.navn, o.navn, left('⚠️ Hej ' || r.fra
          || '. Du har nu misbrugt rapport-knappen 3 gange. Hvis du gør det igen, bliver du automatisk mutet i 60 minutter.', 500));
      end if;
    elsif antal >= 4 then
      mutet := true;
      til := ((extract(epoch from now()) + 3600) * 1000)::bigint;
      select data into d from hv_straffe where navn_lille = lower(r.fra);
      d := coalesce(d, jsonb_build_object('bannet', false, 'timeoutTil', 0, 'historik', '[]'::jsonb, 'note', ''));
      d := d || jsonb_build_object('timeoutTil', til, 'fra', s.navn, 'fraTid', (extract(epoch from now()) * 1000)::bigint)
            || jsonb_build_object('historik', coalesce(d->'historik', '[]'::jsonb) || jsonb_build_array(jsonb_build_object(
                 'handling', 'Mute (1 time)', 'grund', 'Misbrugt rapport-knappen ' || antal || ' gange (automatisk)',
                 'tid', (extract(epoch from now()) * 1000)::bigint)));
      insert into hv_straffe (navn_lille, navn, data) values (lower(r.fra), r.fra, d)
      on conflict (navn_lille) do update set data = excluded.data, tid = now();
      insert into hv_adminlog (hvem, hvad) values (s.navn, left('Automatisk mute (1 time) til ' || r.fra
        || ': misbrugt rapport-knappen ' || antal || ' gange', 500));
      if o.id is not null then
        insert into hv_beskeder (fra, til, tekst) values (s.navn, o.navn, left('🔇 ' || r.fra
          || ', du har misbrugt rapport-knappen ' || antal || ' gange og er nu mutet i 60 minutter.', 500));
      end if;
    end if;
  end if;
  return json_build_object('udfald', p_udfald, 'af', s.navn, 'antal', antal, 'advaret', advaret, 'mutet', mutet);
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

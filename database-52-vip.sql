-- HELLO VERA, del 52: 👑 VIP-medlemskab
-- VIP koster 1000 Glimt (eller 200 kr med rigtige penge, når betaling er slået til).
-- Man er VIP FOR EVIGT, når man har betalt én gang. Ejeren er altid VIP.
-- Kør database-6-penge.sql og database-42-vekselboers.sql FØRST (det har du allerede gjort).
-- Kopiér ALT herfra → Supabase → SQL Editor → + New query → Run. Må gerne køres flere gange.

-- 1) Hvem er VIP, og hvordan ser deres navn ud
create table if not exists public.hv_vip (
  spiller_id bigint primary key,
  navn text not null,
  navn_lille text not null unique,
  aktiv boolean not null default true,
  hvordan text not null default 'glimt',      -- glimt, penge eller ejer (= givet af ejeren)
  givet_af text,
  siden timestamptz not null default now(),
  ikon text not null default '👑',             -- ikonet foran navnet
  farve text not null default '#7a1f2e',       -- navnets farve
  kant text not null default '#d9a441',        -- kanten om navneskiltet
  effekt text not null default 'glimmer',      -- ingen, glimmer, regnbue, hjerter
  sidste_gave date                             -- mandagen i den uge, hvor ugens gave blev hentet
);

-- 2) Alt hvad der sker med VIP gemmes for altid (køb, gaver, ejeren giver/fjerner)
create table if not exists public.hv_vip_log (
  id bigint generated always as identity primary key,
  spiller_id bigint not null,
  navn text not null,
  hvad text not null,               -- koeb_glimt, koeb_penge, givet, fjernet, velkomstgave, ugegave
  glimt integer not null default 0, -- + = fik, - = betalte
  stella integer not null default 0,
  kroner integer not null default 0,
  af text,
  noegle uuid unique,               -- samme nøgle to gange = samme køb (dobbeltklik)
  tid timestamptz not null default now()
);
create index if not exists hv_vip_log_tid on public.hv_vip_log (id desc);

-- 3) Betaling med rigtige penge (forberedt, men slået FRA indtil du har valgt betalingsfirma)
create table if not exists public.hv_vip_betaling (
  id bigint generated always as identity primary key,
  spiller_id bigint not null,
  navn text not null,
  udbyder text not null,                       -- fx stripe eller mobilepay
  reference text not null unique,              -- betalingsfirmaets nummer for betalingen
  kroner integer not null,
  status text not null default 'venter' check (status in ('venter', 'betalt', 'annulleret')),
  oprettet timestamptz not null default now(),
  betalt timestamptz
);

-- Indstillinger: pris, gaver og om rigtige penge er slået til
create table if not exists public.hv_vip_indstilling (
  id integer primary key default 1 check (id = 1),
  pris_glimt integer not null default 1000,
  pris_kroner integer not null default 200,
  betaling_til boolean not null default false,     -- sæt til true, når betalingsfirmaet er klar
  velkomst_stella integer not null default 50,     -- velkomstgave
  velkomst_glimt integer not null default 0
);
insert into public.hv_vip_indstilling (id) values (1) on conflict (id) do nothing;

alter table public.hv_vip enable row level security;
alter table public.hv_vip_log enable row level security;
alter table public.hv_vip_betaling enable row level security;
alter table public.hv_vip_indstilling enable row level security;
revoke all on public.hv_vip, public.hv_vip_log, public.hv_vip_betaling, public.hv_vip_indstilling from anon, authenticated;

-- Er spilleren VIP? (ejeren er det altid)
create or replace function public.hv_er_vip(p_navn text)
returns boolean language sql stable security definer set search_path = public as $$
  select hv_er_ejer(p_navn) or exists (select 1 from hv_vip where navn_lille = lower(p_navn) and aktiv);
$$;

-- Mandagen i denne uge (dansk tid). Ugens gave kan hentes fra mandag.
create or replace function public.hv_vip_uge()
returns date language sql stable as $$
  select date_trunc('week', now() at time zone 'Europe/Copenhagen')::date;
$$;

-- Gør en spiller til VIP (bruges af køb, betaling og ejeren). Giver velkomstgaven første gang.
create or replace function public.hv_vip_saet(p_spiller hv_spillere, p_hvordan text, p_af text)
returns boolean language plpgsql security definer set search_path = public as $$
declare v hv_vip; ind hv_vip_indstilling; ny boolean;
begin
  select * into ind from hv_vip_indstilling where id = 1;
  select * into v from hv_vip where spiller_id = p_spiller.id for update;
  ny := v.spiller_id is null or not exists (select 1 from hv_vip_log where spiller_id = p_spiller.id and hvad = 'velkomstgave');
  if v.spiller_id is null then
    insert into hv_vip (spiller_id, navn, navn_lille, hvordan, givet_af) values (p_spiller.id, p_spiller.navn, p_spiller.navn_lille, p_hvordan, p_af);
  else
    update hv_vip set aktiv = true, hvordan = p_hvordan, givet_af = p_af, siden = case when aktiv then siden else now() end,
      navn = p_spiller.navn, navn_lille = p_spiller.navn_lille where spiller_id = p_spiller.id;
  end if;
  if ny then
    update hv_spillere set glimt = coalesce(glimt, 0) + ind.velkomst_glimt, stella = coalesce(stella, 0) + ind.velkomst_stella where id = p_spiller.id;
    insert into hv_vip_log (spiller_id, navn, hvad, glimt, stella, af) values (p_spiller.id, p_spiller.navn, 'velkomstgave', ind.velkomst_glimt, ind.velkomst_stella, p_af);
  end if;
  return ny;
end $$;

-- Én VIP's navnestil som json
create or replace function public.hv_vip_json(v hv_vip)
returns json language sql immutable as $$
  select json_build_object('navn', v.navn, 'ikon', v.ikon, 'farve', v.farve, 'kant', v.kant, 'effekt', v.effekt);
$$;

-- 4) Mig og VIP: er jeg VIP, hvad koster det, er ugens gave klar?
create or replace function public.hv_vip_mig(p_token uuid)
returns json language plpgsql security definer set search_path = public as $$
declare s hv_spillere; v hv_vip; ind hv_vip_indstilling; er boolean;
begin
  select * into s from hv_spillere where token = p_token;
  if s.id is null then raise exception 'Du er ikke logget ind.'; end if;
  select * into ind from hv_vip_indstilling where id = 1;
  select * into v from hv_vip where spiller_id = s.id;
  er := hv_er_vip(s.navn);
  return json_build_object('vip', er, 'ejer', hv_er_ejer(s.navn),
    'siden', case when v.aktiv then (extract(epoch from v.siden) * 1000)::bigint end,
    'hvordan', case when v.aktiv then v.hvordan end,
    'stil', case when v.spiller_id is not null then hv_vip_json(v) end,
    'gave_klar', er and (v.sidste_gave is null or v.sidste_gave < hv_vip_uge()),
    'pris_glimt', ind.pris_glimt, 'pris_kroner', ind.pris_kroner, 'betaling_til', ind.betaling_til,
    'velkomst_stella', ind.velkomst_stella, 'velkomst_glimt', ind.velkomst_glimt,
    'glimt', coalesce(s.glimt, 0), 'stella', coalesce(s.stella, 0));
end $$;

-- 5) Køb VIP for Glimt. p_noegle = unikt nummer fra knappen, så et dobbeltklik ikke køber to gange.
create or replace function public.hv_vip_koeb_glimt(p_token uuid, p_noegle uuid)
returns json language plpgsql security definer set search_path = public as $$
declare s hv_spillere; ind hv_vip_indstilling; gammel hv_vip_log;
begin
  if p_noegle is null then raise exception 'Prøv igen (mangler nøgle).'; end if;
  select * into s from hv_spillere where token = p_token for update;
  if s.id is null then raise exception 'Du er ikke logget ind.'; end if;
  select * into gammel from hv_vip_log where noegle = p_noegle;
  if gammel.id is not null then
    return json_build_object('ok', true, 'allerede', true, 'glimt', s.glimt, 'stella', s.stella);
  end if;
  if hv_er_vip(s.navn) then raise exception 'Du er allerede VIP 👑'; end if;
  select * into ind from hv_vip_indstilling where id = 1;
  if coalesce(s.glimt, 0) < ind.pris_glimt then
    raise exception 'Du har ikke nok Glimt. VIP koster % Glimt, og du har %.', ind.pris_glimt, coalesce(s.glimt, 0);
  end if;
  update hv_spillere set glimt = glimt - ind.pris_glimt where id = s.id returning * into s;
  insert into hv_vip_log (spiller_id, navn, hvad, glimt, af, noegle) values (s.id, s.navn, 'koeb_glimt', -ind.pris_glimt, s.navn, p_noegle);
  perform hv_vip_saet(s, 'glimt', s.navn);
  select * into s from hv_spillere where id = s.id;
  if to_regprocedure('public.hv_oekonomi_gem_dag()') is not null then perform hv_oekonomi_gem_dag(); end if;
  return json_build_object('ok', true, 'allerede', false, 'glimt', s.glimt, 'stella', s.stella,
    'velkomst_stella', ind.velkomst_stella, 'velkomst_glimt', ind.velkomst_glimt);
end $$;

-- 6) Hent ugens VIP-gave (fra mandag, én gang om ugen). En lille overraskelse: Glimt eller Stella.
create or replace function public.hv_vip_ugegave(p_token uuid)
returns json language plpgsql security definer set search_path = public as $$
declare s hv_spillere; v hv_vip; g integer := 0; st integer := 0;
begin
  select * into s from hv_spillere where token = p_token for update;
  if s.id is null then raise exception 'Du er ikke logget ind.'; end if;
  if not hv_er_vip(s.navn) then raise exception 'Ugens gave er kun for VIP 👑'; end if;
  select * into v from hv_vip where spiller_id = s.id for update;
  if v.spiller_id is null then          -- ejeren uden VIP-række
    insert into hv_vip (spiller_id, navn, navn_lille, hvordan, givet_af) values (s.id, s.navn, s.navn_lille, 'ejer', s.navn) returning * into v;
  end if;
  if v.sidste_gave is not null and v.sidste_gave >= hv_vip_uge() then
    raise exception 'Du har allerede fået denne uges gave. Næste gave kommer på mandag 🎁';
  end if;
  if random() < 0.6 then g := 50 + floor(random() * 101)::integer; else st := 5 + floor(random() * 11)::integer; end if;
  update hv_vip set sidste_gave = hv_vip_uge() where spiller_id = s.id;
  update hv_spillere set glimt = coalesce(glimt, 0) + g, stella = coalesce(stella, 0) + st where id = s.id returning * into s;
  insert into hv_vip_log (spiller_id, navn, hvad, glimt, stella, af) values (s.id, s.navn, 'ugegave', g, st, s.navn);
  return json_build_object('glimt_fik', g, 'stella_fik', st, 'glimt', s.glimt, 'stella', s.stella);
end $$;

-- 7) Skift navnets udseende (kun VIP og ejeren)
create or replace function public.hv_vip_stil(p_token uuid, p_ikon text, p_farve text, p_kant text, p_effekt text)
returns json language plpgsql security definer set search_path = public as $$
declare s hv_spillere; v hv_vip;
begin
  select * into s from hv_spillere where token = p_token;
  if s.id is null then raise exception 'Du er ikke logget ind.'; end if;
  if not hv_er_vip(s.navn) then raise exception 'Kun VIP kan ændre deres navn 👑'; end if;
  p_ikon := coalesce(nullif(trim(p_ikon), ''), '👑');
  if char_length(p_ikon) > 4 then raise exception 'Vælg ét ikon.'; end if;
  if p_farve !~ '^#[0-9a-fA-F]{6}$' or p_kant !~ '^#[0-9a-fA-F]{6}$' then raise exception 'Ukendt farve.'; end if;
  if p_effekt not in ('ingen', 'glimmer', 'regnbue', 'hjerter', 'stjerner') then raise exception 'Ukendt effekt.'; end if;
  insert into hv_vip (spiller_id, navn, navn_lille, hvordan, givet_af, ikon, farve, kant, effekt)
  values (s.id, s.navn, s.navn_lille, 'ejer', s.navn, p_ikon, p_farve, p_kant, p_effekt)
  on conflict (spiller_id) do update set ikon = p_ikon, farve = p_farve, kant = p_kant, effekt = p_effekt
  returning * into v;
  return hv_vip_json(v);
end $$;

-- 8) Alle VIP'ers navnestil (så alle kan se de flotte navne). Ejerne er med, hvis de har valgt en stil.
create or replace function public.hv_vip_alle(p_token uuid)
returns json language plpgsql security definer set search_path = public as $$
begin
  if not exists (select 1 from hv_spillere where token = p_token) then raise exception 'Du er ikke logget ind.'; end if;
  return coalesce((select json_agg(hv_vip_json(v)) from hv_vip v where v.aktiv or hv_er_ejer(v.navn)), '[]'::json);
end $$;

-- 9) Ejerpanel: alle VIP'er, historik og tal (kun ejeren)
create or replace function public.hv_vip_ejer(p_token uuid)
returns json language plpgsql security definer set search_path = public as $$
declare s hv_spillere;
begin
  select * into s from hv_spillere where token = p_token;
  if s.id is null then raise exception 'Du er ikke logget ind.'; end if;
  if not hv_er_ejer(s.navn) then raise exception 'Kun hotellets ejer kan se VIP-listen.'; end if;
  return json_build_object(
    'indstilling', (select row_to_json(i) from hv_vip_indstilling i where id = 1),
    'antal', (select count(*) from hv_vip where aktiv and not hv_er_ejer(navn)),
    'glimt_ind', (select coalesce(-sum(glimt), 0) from hv_vip_log where hvad = 'koeb_glimt'),
    'kroner_ind', (select coalesce(sum(kroner), 0) from hv_vip_log where hvad = 'koeb_penge'),
    'gaver', (select count(*) from hv_vip_log where hvad = 'ugegave'),
    'vip', coalesce((select json_agg(json_build_object('navn', v.navn, 'id', v.spiller_id, 'aktiv', v.aktiv, 'hvordan', v.hvordan,
        'givet_af', v.givet_af, 'siden', (extract(epoch from v.siden) * 1000)::bigint, 'ikon', v.ikon, 'farve', v.farve, 'kant', v.kant,
        'effekt', v.effekt, 'ejer', hv_er_ejer(v.navn)) order by v.aktiv desc, v.siden desc) from hv_vip v), '[]'::json),
    'log', coalesce((select json_agg(json_build_object('navn', l.navn, 'hvad', l.hvad, 'glimt', l.glimt, 'stella', l.stella,
        'kroner', l.kroner, 'af', l.af, 'tid', (extract(epoch from l.tid) * 1000)::bigint) order by l.id desc)
      from (select * from hv_vip_log order by id desc limit 60) l), '[]'::json));
end $$;

-- 10) Ejeren giver eller fjerner VIP (p_giv = true giver, false fjerner)
create or replace function public.hv_vip_giv(p_token uuid, p_navn text, p_giv boolean)
returns json language plpgsql security definer set search_path = public as $$
declare s hv_spillere; o hv_spillere;
begin
  select * into s from hv_spillere where token = p_token;
  if s.id is null then raise exception 'Du er ikke logget ind.'; end if;
  if not hv_er_ejer(s.navn) then raise exception 'Kun hotellets ejer kan give og fjerne VIP.'; end if;
  select * into o from hv_spillere where navn_lille = lower(trim(coalesce(p_navn, '')));
  if o.id is null then raise exception 'Der findes ingen spiller, der hedder %.', trim(p_navn); end if;
  if hv_er_ejer(o.navn) then raise exception 'Ejeren er altid VIP 👑'; end if;
  if p_giv then
    perform hv_vip_saet(o, 'ejer', s.navn);
    insert into hv_vip_log (spiller_id, navn, hvad, af) values (o.id, o.navn, 'givet', s.navn);
  else
    update hv_vip set aktiv = false where spiller_id = o.id and aktiv;
    if not found then raise exception '% er ikke VIP.', o.navn; end if;
    insert into hv_vip_log (spiller_id, navn, hvad, af) values (o.id, o.navn, 'fjernet', s.navn);
  end if;
  return json_build_object('navn', o.navn, 'vip', p_giv);
end $$;

-- 11) Rigtige penge (FORBEREDT, virker først når betaling_til = true og betalingsfirmaet er sat op)
--     Spilleren starter en betaling. Selve betalingssiden laves af betalingsfirmaet.
create or replace function public.hv_vip_betaling_start(p_token uuid, p_udbyder text)
returns json language plpgsql security definer set search_path = public as $$
declare s hv_spillere; ind hv_vip_indstilling; ref text;
begin
  select * into s from hv_spillere where token = p_token;
  if s.id is null then raise exception 'Du er ikke logget ind.'; end if;
  select * into ind from hv_vip_indstilling where id = 1;
  if not ind.betaling_til then raise exception 'Betaling med rigtige penge er ikke åbnet endnu. Køb VIP for Glimt i stedet ⭐'; end if;
  if hv_er_vip(s.navn) then raise exception 'Du er allerede VIP 👑'; end if;
  ref := 'vip-' || s.id || '-' || replace(gen_random_uuid()::text, '-', '');
  insert into hv_vip_betaling (spiller_id, navn, udbyder, reference, kroner) values (s.id, s.navn, coalesce(p_udbyder, 'stripe'), ref, ind.pris_kroner);
  return json_build_object('reference', ref, 'kroner', ind.pris_kroner);
end $$;

--     Betalingsfirmaet siger "betalt". Kun serveren selv (en Supabase Edge Function med service-nøglen) må kalde denne.
create or replace function public.hv_vip_betaling_bekraeft(p_reference text, p_kroner integer)
returns json language plpgsql security definer set search_path = public as $$
declare b hv_vip_betaling; s hv_spillere;
begin
  select * into b from hv_vip_betaling where reference = p_reference for update;
  if b.id is null then raise exception 'Ukendt betaling.'; end if;
  if b.status = 'betalt' then return json_build_object('ok', true, 'allerede', true); end if;
  if p_kroner is null or p_kroner < b.kroner then raise exception 'Forkert beløb.'; end if;
  update hv_vip_betaling set status = 'betalt', betalt = now() where id = b.id;
  select * into s from hv_spillere where id = b.spiller_id;
  perform hv_vip_saet(s, 'penge', b.udbyder);
  insert into hv_vip_log (spiller_id, navn, hvad, kroner, af) values (s.id, s.navn, 'koeb_penge', b.kroner, b.udbyder);
  return json_build_object('ok', true, 'allerede', false, 'navn', s.navn);
end $$;

revoke all on function public.hv_er_vip, public.hv_vip_uge, public.hv_vip_saet, public.hv_vip_json, public.hv_vip_mig,
  public.hv_vip_koeb_glimt, public.hv_vip_ugegave, public.hv_vip_stil, public.hv_vip_alle, public.hv_vip_ejer, public.hv_vip_giv,
  public.hv_vip_betaling_start, public.hv_vip_betaling_bekraeft from public, anon, authenticated;
grant execute on function public.hv_vip_mig, public.hv_vip_koeb_glimt, public.hv_vip_ugegave, public.hv_vip_stil,
  public.hv_vip_alle, public.hv_vip_ejer, public.hv_vip_giv, public.hv_vip_betaling_start to anon, authenticated;
-- hv_vip_betaling_bekraeft får KUN service_role (Edge Function), så ingen spiller kan snyde sig til VIP.
grant execute on function public.hv_vip_betaling_bekraeft to service_role;

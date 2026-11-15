-- HELLO VERA, del 59: 🤖 Test-botter (kun for hotellets ejer)
-- - Ejeren kan lave så mange test-botter, hun vil (Ejerpanel → ⚙️ System → 🤖 Test-botter), fx til at teste spil.
-- - Botterne er rigtige figurer på hotellet: alle kan se dem gå rundt, og de kan være med i Lysreaktion og quizzen.
-- - Kun ejeren kan lave, styre og slette botter. Det tjekker serveren her, ikke kun spillet.
-- - Botter hedder Bot-1, Bot-2 … Ingen rigtig spiller kan oprette et navn, der starter med "Bot-".
-- - Botter har ALTID 0 Glimt og 0 Stella, kan ikke blive VIP, og kan ikke få gevinster eller stå på vinderlister.
-- - Botter tæller ikke med i hotellets økonomi-tal.
-- Kopiér ALT herfra → Supabase → SQL Editor → + New query → Run. Må gerne køres flere gange.
--
-- Nødbremse: vil du slette ALLE botter direkte i Supabase, kan du køre denne ene linje:
--   delete from public.hv_spillere where er_bot;

alter table public.hv_spillere add column if not exists er_bot boolean not null default false;
alter table public.hv_spillere add column if not exists bot_data jsonb not null default '{}'::jsonb;
create index if not exists hv_spillere_er_bot on public.hv_spillere (er_bot) where er_bot;

-- Er det en bot? (bruges af serveren selv)
create or replace function public.hv_er_bot(p_navn text)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from hv_spillere where navn_lille = lower(trim(coalesce(p_navn, ''))) and er_bot);
$$;
revoke all on function public.hv_er_bot(text) from public, anon, authenticated;

-- 1) Vagten på spillerne: botter har altid 0 penge, og "Bot-" er et reserveret navn
create or replace function public.hv_bot_vagt()
returns trigger language plpgsql set search_path = public as $$
begin
  if new.er_bot then
    new.glimt := 0;
    new.stella := 0;
  elsif tg_op = 'INSERT' and new.navn_lille like 'bot-%' then
    raise exception 'Navne der starter med "Bot-" er kun til hotellets test-botter. Vælg et andet navn.';
  end if;
  return new;
end $$;
drop trigger if exists hv_bot_vagt on public.hv_spillere;
create trigger hv_bot_vagt before insert or update on public.hv_spillere
  for each row execute function public.hv_bot_vagt();

-- 2) Botter kan ikke blive VIP
create or replace function public.hv_bot_ingen_vip()
returns trigger language plpgsql set search_path = public as $$
begin
  if exists (select 1 from hv_spillere where id = new.spiller_id and er_bot) then
    raise exception 'Test-botter kan ikke blive VIP.';
  end if;
  return new;
end $$;
do $$ begin
  if to_regclass('public.hv_vip') is not null then
    drop trigger if exists hv_bot_ingen_vip on public.hv_vip;
    create trigger hv_bot_ingen_vip before insert or update on public.hv_vip
      for each row execute function public.hv_bot_ingen_vip();
  end if;
end $$;

-- 3) Botter får ingen gevinster (rækken bliver bare ikke gemt – de rigtige vindere får stadig deres)
create or replace function public.hv_bot_ingen_gevinst()
returns trigger language plpgsql set search_path = public as $$
begin
  if exists (select 1 from hv_spillere where navn_lille = lower(new.navn_lille) and er_bot) then
    return null;
  end if;
  return new;
end $$;
do $$ begin
  if to_regclass('public.hv_gevinster') is not null then
    drop trigger if exists hv_bot_ingen_gevinst on public.hv_gevinster;
    create trigger hv_bot_ingen_gevinst before insert on public.hv_gevinster
      for each row execute function public.hv_bot_ingen_gevinst();
  end if;
end $$;

-- 4) Botter kommer ikke på vinderlisterne (de bliver taget ud af listen med navne)
create or replace function public.hv_bot_ikke_vinder()
returns trigger language plpgsql set search_path = public as $$
begin
  if jsonb_typeof(new.navne) = 'array' then
    new.navne := coalesce((select jsonb_agg(e) from jsonb_array_elements(new.navne) e
      where not exists (select 1 from hv_spillere b where b.er_bot and b.navn_lille = lower(e #>> '{}'))), '[]'::jsonb);
  end if;
  return new;
end $$;
do $$ begin
  if to_regclass('public.hv_vindere') is not null then
    drop trigger if exists hv_bot_ikke_vinder on public.hv_vindere;
    create trigger hv_bot_ikke_vinder before insert or update on public.hv_vindere
      for each row execute function public.hv_bot_ikke_vinder();
  end if;
end $$;

-- 5) Hotellets økonomi-tal (Penge → Vekselbørs) tæller ikke botter med
do $$ begin
  if to_regclass('public.hv_oekonomi_dag') is not null then
    execute $f$
create or replace function public.hv_oekonomi_gem_dag()
returns void language plpgsql security definer set search_path = public as $b$
begin
  insert into hv_oekonomi_dag (dato, glimt, stella, ejer_glimt, ejer_stella, spillere)
  select (now() at time zone 'Europe/Copenhagen')::date,
    coalesce(sum(glimt) filter (where not hv_er_ejer(navn)), 0), coalesce(sum(stella) filter (where not hv_er_ejer(navn)), 0),
    coalesce(sum(glimt) filter (where hv_er_ejer(navn)), 0), coalesce(sum(stella) filter (where hv_er_ejer(navn)), 0),
    count(*) filter (where not hv_er_ejer(navn))
  from hv_spillere where not er_bot
  on conflict (dato) do update set glimt = excluded.glimt, stella = excluded.stella,
    ejer_glimt = excluded.ejer_glimt, ejer_stella = excluded.ejer_stella, spillere = excluded.spillere;
end $b$;
    $f$;
    revoke all on function public.hv_oekonomi_gem_dag() from public;
  end if;
end $$;

-- 6) "Giv alle" (Penge) giver ikke til botter, og de tælles ikke med i antallet
create or replace function public.hv_penge_giv_alle(p_token uuid, p_glimt integer, p_stella integer)
returns integer language plpgsql security definer set search_path = public as $$
declare s hv_spillere; v_antal integer;
begin
  select * into s from hv_spillere where token = p_token;
  if s.id is null then raise exception 'Du er ikke logget ind.'; end if;
  if not hv_er_ejer(s.navn) then raise exception 'Kun hotellets ejer kan give penge til alle.'; end if;
  p_glimt := greatest(coalesce(p_glimt, 0), 0); p_stella := greatest(coalesce(p_stella, 0), 0);
  if p_glimt = 0 and p_stella = 0 then return 0; end if;
  if p_glimt > 1000000 or p_stella > 100000 then raise exception 'Det er vist lige i overkanten 😅'; end if;
  update hv_spillere set glimt = coalesce(glimt, 100) + p_glimt, stella = coalesce(stella, 5) + p_stella
  where not hv_er_ejer(navn) and not er_bot;
  get diagnostics v_antal = row_count;
  insert into hv_adminlog (hvem, hvad) values (s.navn, 'Gav ' || case when p_glimt > 0 then p_glimt || ' Glimt' else p_stella || ' Stella' end
    || ' til alle spillere (' || v_antal || ')');
  return v_antal;
end $$;
revoke all on function public.hv_penge_giv_alle from public;
grant execute on function public.hv_penge_giv_alle to anon, authenticated;

-- (intern) tjek at det er ejeren, og giv ejerens række tilbage
create or replace function public.hv_bot_ejer(p_token uuid)
returns hv_spillere language plpgsql security definer set search_path = public as $$
declare s hv_spillere;
begin
  select * into s from hv_spillere where token = p_token;
  if s.id is null then raise exception 'Du er ikke logget ind.'; end if;
  if s.er_bot or not hv_er_ejer(s.navn) then raise exception 'Kun hotellets ejer kan bruge test-botter.'; end if;
  return s;
end $$;
revoke all on function public.hv_bot_ejer(uuid) from public, anon, authenticated;

-- Alle botter (kun ejeren). Tokens er med, så ejerens spil kan styre botterne.
create or replace function public.hv_bot_liste(p_token uuid)
returns json language plpgsql security definer set search_path = public as $$
declare s hv_spillere;
begin
  s := hv_bot_ejer(p_token);
  return coalesce((select json_agg(json_build_object('navn', b.navn, 'token', b.token, 'rum', b.rum, 'x', b.x, 'y', b.y,
      'retning', b.retning, 'figur', b.figur, 'data', b.bot_data,
      'online', coalesce(b.sidst_set > now() - interval '20 seconds', false),
      'oprettet', (extract(epoch from b.oprettet) * 1000)::bigint)
    order by nullif(regexp_replace(b.navn_lille, '\D', '', 'g'), '')::bigint nulls last, b.id)
    from hv_spillere b where b.er_bot), '[]'::json);
end $$;

-- Lav nye botter. p_botter = [{ rum, x, y, retning, figur }, …] – én række pr. bot.
create or replace function public.hv_bot_opret(p_token uuid, p_botter jsonb)
returns integer language plpgsql security definer set search_path = public, extensions as $$
declare s hv_spillere; e jsonb; nr bigint; v_antal integer := 0;
begin
  s := hv_bot_ejer(p_token);
  if jsonb_typeof(p_botter) <> 'array' or jsonb_array_length(p_botter) = 0 then return 0; end if;
  if jsonb_array_length(p_botter) > 50 then raise exception 'Højst 50 botter ad gangen.'; end if;
  if (select count(*) from hv_spillere where er_bot) + jsonb_array_length(p_botter) > 300 then
    raise exception 'Der kan højst være 300 botter. Slet nogle først.';
  end if;
  select coalesce(max(nullif(regexp_replace(navn_lille, '\D', '', 'g'), '')::bigint), 0) into nr
    from hv_spillere where navn_lille ~ '^bot-[0-9]+$';
  for e in select * from jsonb_array_elements(p_botter) loop
    nr := nr + 1;
    insert into hv_spillere (navn, navn_lille, kode_hash, token, er_bot, bot_data, rum, x, y, retning, figur, sidst_set)
    values ('Bot-' || nr, 'bot-' || nr, crypt(gen_random_uuid()::text, gen_salt('bf', 4)), gen_random_uuid(), true,
      jsonb_build_object('vis', true, 'adfaerd', 'staa'),
      left(coalesce(e->>'rum', 'hal'), 80), coalesce((e->>'x')::real, 2), coalesce((e->>'y')::real, 2),
      left(coalesce(e->>'retning', 'ned'), 20),
      case when jsonb_typeof(e->'figur') = 'object' then e->'figur' else '{"type":"pige"}'::jsonb end, now());
    v_antal := v_antal + 1;
  end loop;
  insert into hv_adminlog (hvem, hvad) values (s.navn, 'Lavede ' || v_antal || ' test-bot' || case when v_antal = 1 then '' else 'ter' end);
  return v_antal;
end $$;

-- Botterne er her: ejerens spil sender, hvor de står (én gang for alle botter).
-- p_botter = [{ navn, rum, x, y, retning, sidder }, …]
create or replace function public.hv_bot_puls(p_token uuid, p_botter jsonb)
returns integer language plpgsql security definer set search_path = public as $$
declare s hv_spillere; e jsonb; v_antal integer := 0;
begin
  s := hv_bot_ejer(p_token);
  if jsonb_typeof(p_botter) <> 'array' then return 0; end if;
  for e in select * from jsonb_array_elements(p_botter) limit 300 loop
    update hv_spillere set sidst_set = now(), rum = left(coalesce(e->>'rum', rum), 80),
      x = coalesce((e->>'x')::real, x), y = coalesce((e->>'y')::real, y), retning = left(coalesce(e->>'retning', retning), 20),
      sidder = case when jsonb_typeof(e->'sidder') = 'object' then e->'sidder' else null end
    where er_bot and navn_lille = lower(e->>'navn') and coalesce((bot_data->>'vis')::boolean, true);
    if found then v_antal := v_antal + 1; end if;
  end loop;
  return v_antal;
end $$;

-- Ret botter: p_navne = ["Bot-1", …] eller null = alle botter.
-- p_data kan have: vis (true/false), adfaerd ('staa', 'gaa', 'lys'), figur, rum, x, y
create or replace function public.hv_bot_ret(p_token uuid, p_navne jsonb, p_data jsonb)
returns integer language plpgsql security definer set search_path = public as $$
declare s hv_spillere; v_antal integer;
begin
  s := hv_bot_ejer(p_token);
  update hv_spillere b set
    bot_data = b.bot_data
      || case when p_data ? 'vis' then jsonb_build_object('vis', (p_data->>'vis')::boolean) else '{}'::jsonb end
      || case when p_data->>'adfaerd' in ('staa', 'gaa', 'lys') then jsonb_build_object('adfaerd', p_data->>'adfaerd') else '{}'::jsonb end,
    figur = case when jsonb_typeof(p_data->'figur') = 'object' then p_data->'figur' else b.figur end,
    rum = case when p_data ? 'rum' then left(p_data->>'rum', 80) else b.rum end,
    x = coalesce((p_data->>'x')::real, b.x), y = coalesce((p_data->>'y')::real, b.y),
    -- skjult bot = går offline med det samme
    sidst_set = case when (p_data->>'vis') = 'false' then null else b.sidst_set end
  where b.er_bot and (p_navne is null or jsonb_typeof(p_navne) <> 'array'
    or lower(b.navn) in (select lower(el #>> '{}') from jsonb_array_elements(p_navne) el));
  get diagnostics v_antal = row_count;
  return v_antal;
end $$;

-- Slet én bot (p_navn = "Bot-3") eller ALLE botter (p_navn tom/null).
-- Kun rækker med er_bot slettes – en rigtig spiller kan aldrig blive slettet her.
create or replace function public.hv_bot_slet(p_token uuid, p_navn text)
returns integer language plpgsql security definer set search_path = public as $$
declare s hv_spillere; b hv_spillere; t text[]; v_antal integer := 0;
begin
  s := hv_bot_ejer(p_token);
  for b in select * from hv_spillere where er_bot
      and (coalesce(trim(p_navn), '') = '' or navn_lille = lower(trim(p_navn))) loop
    -- det, der kan høre til botten (tabeller, der ikke findes, springes over)
    foreach t slice 1 in array array[
      ['hv_venner', 'a'], ['hv_venner', 'b'], ['hv_anmodninger', 'fra'], ['hv_anmodninger', 'til'],
      ['hv_beskeder', 'fra'], ['hv_beskeder', 'til'], ['hv_mentions', 'til'], ['hv_likes', 'fra'], ['hv_likes', 'til'],
      ['hv_forhold', 'fra'], ['hv_forhold', 'til'], ['hv_ansatte', 'navn_lille'], ['hv_straffe', 'navn_lille'],
      ['hv_staff_adgang', 'navn_lille'], ['hv_gevinster', 'navn_lille']]
    loop
      if to_regclass('public.' || t[1]) is not null then
        begin
          execute format('delete from public.%I where lower(%I::text) = $1', t[1], t[2]) using b.navn_lille;
        exception when others then null;
        end;
      end if;
    end loop;
    delete from hv_spillere where id = b.id and er_bot;
    v_antal := v_antal + 1;
  end loop;
  if v_antal > 0 then
    insert into hv_adminlog (hvem, hvad) values (s.navn, case when coalesce(trim(p_navn), '') = ''
      then 'Slettede alle test-botter (' || v_antal || ')' else 'Slettede test-botten ' || trim(p_navn) end);
  end if;
  return v_antal;
end $$;

revoke all on function public.hv_bot_liste, public.hv_bot_opret, public.hv_bot_puls, public.hv_bot_ret, public.hv_bot_slet from public;
grant execute on function public.hv_bot_liste, public.hv_bot_opret, public.hv_bot_puls, public.hv_bot_ret, public.hv_bot_slet to anon, authenticated;

notify pgrst, 'reload schema';

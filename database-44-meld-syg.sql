-- HELLO VERA, del 44: 🤒 Meld dig syg i vagtskemaet
-- En ansat kan melde sig syg til en vagt. Ejeren får en besked på sin telefon 📱
-- (i Beskeder), og vagten bliver ledig igen, så en anden kan tage den.
-- Kør database-31-vagtskema.sql FØRST.
-- Kopiér ALT herfra → Supabase → SQL Editor → + New query → Run. Må gerne køres flere gange.

alter table public.hv_vagter add column if not exists syg timestamptz;
alter table public.hv_vagter add column if not exists syg_grund text;

-- Hent vagterne (nu også om man er meldt syg)
create or replace function public.hv_vagter_hent(p_token uuid, p_fra date, p_til date)
returns json language plpgsql stable security definer set search_path = public as $$
declare s hv_spillere;
begin
  select * into s from hv_spillere where token = p_token;
  if s.id is null then raise exception 'Du er ikke logget ind.'; end if;
  if not hv_er_ansat(s.navn) then raise exception 'Kun ejeren og de ansatte kan se vagtskemaet.'; end if;
  return coalesce((select json_agg(json_build_object('id', id, 'dato', dato, 'slot', slot, 'rolle', rolle, 'navn', navn, 'hvem', hvem,
      'syg', syg, 'grund', syg_grund) order by dato, slot, tid)
    from hv_vagter where dato between p_fra and least(p_til, p_fra + 62)), '[]'::json);
end $$;

-- Skriv en på en vagt. Syge tæller ikke med i de 4 pladser.
-- Skriver man sig på en vagt, man har meldt sig syg til, er man rask igen.
create or replace function public.hv_vagt_skriv(p_token uuid, p_dato date, p_slot int, p_rolle text, p_navn text)
returns bigint language plpgsql security definer set search_path = public as $$
declare s hv_spillere; n text; nl text; ejer boolean; v_skilt text; v_navn text; ny bigint;
begin
  select * into s from hv_spillere where token = p_token;
  if s.id is null then raise exception 'Du er ikke logget ind.'; end if;
  if not hv_er_ansat(s.navn) then raise exception 'Kun ejeren og de ansatte kan bruge vagtskemaet.'; end if;
  ejer := hv_er_ejer(s.navn);
  if p_slot < 0 or p_slot > 4 then raise exception 'Den vagt findes ikke.'; end if;
  n := coalesce(nullif(trim(coalesce(p_navn, '')), ''), s.navn);
  nl := lower(n);
  if nl <> s.navn_lille and not ejer then raise exception 'Kun ejeren kan skrive andre på en vagt.'; end if;
  if not ejer and p_dato < current_date then raise exception 'Du kan ikke skrive dig på en vagt, der er gået.'; end if;
  if p_dato > current_date + 90 then raise exception 'Vagtskemaet går kun 90 dage frem.'; end if;
  select a.skilt, a.navn into v_skilt, v_navn from hv_ansatte a where a.navn_lille = nl;
  if not hv_er_ejer(n) and coalesce(v_skilt, '') <> p_rolle then
    raise exception '% er ikke i kategorien %.', n, p_rolle;
  end if;
  if v_navn is null then select sp.navn into v_navn from hv_spillere sp where sp.navn_lille = nl; end if;
  n := coalesce(v_navn, n);
  if (select count(*) from hv_vagter where dato = p_dato and slot = p_slot and rolle = p_rolle and syg is null and navn_lille <> nl) >= 4 then
    raise exception 'Der er allerede 4 på den vagt.';
  end if;
  insert into hv_vagter (dato, slot, rolle, navn, navn_lille, hvem) values (p_dato, p_slot, left(p_rolle, 40), n, nl, s.navn)
  on conflict (dato, slot, rolle, navn_lille) do update set syg = null, syg_grund = null
  returning id into ny;
  if nl <> s.navn_lille then
    begin insert into hv_adminlog (hvem, hvad) values (s.navn, 'Satte ' || n || ' på vagt ' || p_dato || ' (' || p_rolle || ')'); exception when others then null; end;
  end if;
  return ny;
end $$;

-- 🤒 Meld dig syg (p_syg = true) eller rask igen (p_syg = false).
-- Ejeren (alle ejere) får en besked i telefonen.
create or replace function public.hv_vagt_syg(p_token uuid, p_id bigint, p_grund text, p_syg boolean default true)
returns void language plpgsql security definer set search_path = public as $$
declare s hv_spillere; v hv_vagter; e record; tid text; dage text[] := array['søn','man','tir','ons','tor','fre','lør'];
  mdr text[] := array['jan','feb','mar','apr','maj','jun','jul','aug','sep','okt','nov','dec'];
  tider text[] := array['06–10','10–14','14–18','18–22','22–02']; g text;
begin
  select * into s from hv_spillere where token = p_token;
  if s.id is null then raise exception 'Du er ikke logget ind.'; end if;
  select * into v from hv_vagter where id = p_id;
  if v.id is null then raise exception 'Den vagt findes ikke længere.'; end if;
  if v.navn_lille <> s.navn_lille and not hv_er_ejer(s.navn) then raise exception 'Du kan kun melde dig syg til dine egne vagter.'; end if;
  g := nullif(left(trim(coalesce(p_grund, '')), 200), '');
  if not coalesce(p_syg, true) then
    update hv_vagter set syg = null, syg_grund = null where id = p_id;
    return;
  end if;
  if v.syg is not null then return; end if;
  if v.dato < current_date - 1 then raise exception 'Den vagt er gået.'; end if;
  update hv_vagter set syg = now(), syg_grund = g where id = p_id;
  tid := dage[extract(dow from v.dato)::int + 1] || ' ' || extract(day from v.dato)::int || '. ' || mdr[extract(month from v.dato)::int] || ' kl. ' || tider[v.slot + 1];
  -- besked til ejeren på telefonen (ikke hvis ejeren selv er syg)
  for e in select x.navn from hv_ejere j join hv_spillere x on x.navn_lille = j.navn_lille where x.navn_lille <> v.navn_lille loop
    insert into hv_beskeder (fra, til, tekst)
      values (v.navn, e.navn, '🤒 ' || v.navn || ' har meldt sig syg til vagten ' || tid || ' (' || case v.rolle when 'mod' then 'MOD' when 'staff' then 'Staff' when 'eventvaert' then 'Eventvært'
          when 'eventfolk' then 'Eventfolk' when 'bygmester' then 'Bygmester' when 'support' then 'Support' when 'hjaelper' then 'Hjælper'
          when 'content-creator' then 'Content creator' else v.rolle end || ')' ||
        coalesce('. Grund: ' || g, '') || '. Vagten er ledig igen i 📅 Vagtskema.');
  end loop;
  begin insert into hv_adminlog (hvem, hvad) values (s.navn, v.navn || ' meldte sig syg til vagt ' || v.dato || ' (' || v.rolle || ')'); exception when others then null; end;
end $$;

revoke all on function public.hv_vagter_hent, public.hv_vagt_skriv, public.hv_vagt_syg from public;
grant execute on function public.hv_vagter_hent, public.hv_vagt_skriv, public.hv_vagt_syg to anon, authenticated;
notify pgrst, 'reload schema';

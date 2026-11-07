-- HELLO VERA, del 31: 📅 Vagtskema for de ansatte
-- Ejeren og alle ansatte kan se vagtskemaet i panelet. Det er delt op i kategorier
-- efter skiltet (MOD, Staff, Eventvært, Hjælper …). De ansatte skriver sig selv på
-- vagter i deres egen kategori. Ejeren kan skrive alle på og fjerne alle.
-- Kopiér ALT herfra → Supabase → SQL Editor → + New query → Run. Må gerne køres flere gange.

create table if not exists public.hv_vagter (
  id bigint generated always as identity primary key,
  dato date not null,
  slot smallint not null,                 -- 0 = 06–10, 1 = 10–14, 2 = 14–18, 3 = 18–22, 4 = 22–02
  rolle text not null,                    -- skiltet: mod, staff, hjaelper, eventvaert …
  navn text not null,
  navn_lille text not null,
  hvem text,                              -- hvem der skrev vagten ind
  tid timestamptz not null default now(),
  unique (dato, slot, rolle, navn_lille)
);
alter table public.hv_vagter enable row level security;
revoke all on public.hv_vagter from anon, authenticated;

-- Hent vagterne mellem to datoer (kun ansatte og ejeren)
create or replace function public.hv_vagter_hent(p_token uuid, p_fra date, p_til date)
returns json language plpgsql stable security definer set search_path = public as $$
declare s hv_spillere;
begin
  select * into s from hv_spillere where token = p_token;
  if s.id is null then raise exception 'Du er ikke logget ind.'; end if;
  if not hv_er_ansat(s.navn) then raise exception 'Kun ejeren og de ansatte kan se vagtskemaet.'; end if;
  return coalesce((select json_agg(json_build_object('id', id, 'dato', dato, 'slot', slot, 'rolle', rolle, 'navn', navn, 'hvem', hvem) order by dato, slot, tid)
    from hv_vagter where dato between p_fra and least(p_til, p_fra + 62)), '[]'::json);
end $$;

-- Skriv en på en vagt. p_navn = null betyder "mig selv".
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
  -- man skrives på i sin egen kategori (ejeren må være med overalt)
  select a.skilt, a.navn into v_skilt, v_navn from hv_ansatte a where a.navn_lille = nl;
  if not hv_er_ejer(n) and coalesce(v_skilt, '') <> p_rolle then
    raise exception '% er ikke i kategorien %.', n, p_rolle;
  end if;
  if v_navn is null then select sp.navn into v_navn from hv_spillere sp where sp.navn_lille = nl; end if;
  n := coalesce(v_navn, n);
  if (select count(*) from hv_vagter where dato = p_dato and slot = p_slot and rolle = p_rolle) >= 4 then
    raise exception 'Der er allerede 4 på den vagt.';
  end if;
  insert into hv_vagter (dato, slot, rolle, navn, navn_lille, hvem) values (p_dato, p_slot, left(p_rolle, 40), n, nl, s.navn)
  on conflict (dato, slot, rolle, navn_lille) do nothing returning id into ny;
  if nl <> s.navn_lille then
    begin insert into hv_adminlog (hvem, hvad) values (s.navn, 'Satte ' || n || ' på vagt ' || p_dato || ' (' || p_rolle || ')'); exception when others then null; end;
  end if;
  return ny;
end $$;

-- Fjern en vagt (sin egen, eller alle hvis man er ejeren)
create or replace function public.hv_vagt_slet(p_token uuid, p_id bigint)
returns void language plpgsql security definer set search_path = public as $$
declare s hv_spillere; v hv_vagter;
begin
  select * into s from hv_spillere where token = p_token;
  if s.id is null then raise exception 'Du er ikke logget ind.'; end if;
  select * into v from hv_vagter where id = p_id;
  if v.id is null then return; end if;
  if v.navn_lille <> s.navn_lille and not hv_er_ejer(s.navn) then raise exception 'Du kan kun fjerne dine egne vagter.'; end if;
  delete from hv_vagter where id = p_id;
  if v.navn_lille <> s.navn_lille then
    begin insert into hv_adminlog (hvem, hvad) values (s.navn, 'Fjernede ' || v.navn || ' fra vagt ' || v.dato || ' (' || v.rolle || ')'); exception when others then null; end;
  end if;
end $$;

revoke all on function public.hv_vagter_hent, public.hv_vagt_skriv, public.hv_vagt_slet from public;
grant execute on function public.hv_vagter_hent, public.hv_vagt_skriv, public.hv_vagt_slet to anon, authenticated;
notify pgrst, 'reload schema';

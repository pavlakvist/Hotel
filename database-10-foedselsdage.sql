-- HELLO VERA, del 10: fødselsdage 🎂. Spillerne kan skrive deres fødselsdag i Min profil,
-- og ejeren og Eventværter ser en fødselsdagskalender i Ejerpanel → Events og nyheder.
-- Kør database-5-mod.sql FØRST. Kopiér ALT herfra → Supabase → SQL Editor → + New query → Run.
-- Må gerne køres flere gange.
alter table public.hv_spillere add column if not exists foedselsdag text;   -- "MM-DD", fx "03-14"

-- Min egen fødselsdag
create or replace function public.hv_foedselsdag_hent(p_token uuid)
returns text language plpgsql security definer set search_path = public as $$
declare s hv_spillere;
begin
  select * into s from hv_spillere where token = p_token;
  if s.id is null then raise exception 'Du er ikke logget ind.'; end if;
  return s.foedselsdag;
end $$;

-- Sæt en fødselsdag: sin egen, eller (ejeren og Eventværter) for en anden spiller. Tom tekst sletter den.
create or replace function public.hv_foedselsdag_saet(p_token uuid, p_navn text, p_dato text)
returns void language plpgsql security definer set search_path = public as $$
declare s hv_spillere; v_navn text;
begin
  select * into s from hv_spillere where token = p_token;
  if s.id is null then raise exception 'Du er ikke logget ind.'; end if;
  v_navn := lower(trim(coalesce(nullif(p_navn, ''), s.navn)));
  if v_navn <> s.navn_lille and not hv_er_eventvaert(s.navn) then
    raise exception 'Kun ejeren og Eventværter kan skrive andres fødselsdag.';
  end if;
  if coalesce(p_dato, '') <> '' and (p_dato !~ '^(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$') then
    raise exception 'Fødselsdagen skal skrives som MM-DD.';
  end if;
  update hv_spillere set foedselsdag = nullif(p_dato, '') where navn_lille = v_navn;
  if not found then raise exception 'Der findes ingen spiller, der hedder %.', p_navn; end if;
end $$;

-- Kalenderen (kun ejeren og Eventværter)
create or replace function public.hv_foedselsdage(p_token uuid)
returns json language plpgsql security definer set search_path = public as $$
declare s hv_spillere;
begin
  select * into s from hv_spillere where token = p_token;
  if s.id is null then raise exception 'Du er ikke logget ind.'; end if;
  if not hv_er_eventvaert(s.navn) then raise exception 'Kun ejeren og Eventværter kan se fødselsdagskalenderen.'; end if;
  return coalesce((select json_agg(json_build_object('navn', navn, 'dato', foedselsdag) order by foedselsdag, navn_lille)
    from hv_spillere where foedselsdag is not null), '[]'::json);
end $$;

revoke all on function public.hv_foedselsdag_hent, public.hv_foedselsdag_saet, public.hv_foedselsdage from public;
grant execute on function public.hv_foedselsdag_hent, public.hv_foedselsdag_saet, public.hv_foedselsdage to anon, authenticated;

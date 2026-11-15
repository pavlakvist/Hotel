-- HELLO VERA, del 49: 💼 Egen løn til hver ansat
-- Kræver at database-43-loen-og-loppetider.sql er kørt først.
-- Kopiér ALT herfra → Supabase → SQL Editor → + New query → Run. Må gerne køres flere gange.
--
-- - Ejeren klikker på en ansat i Ejerpanel → Personale → 💼 Løn og giver dem sin egen løn.
--   Ansatte uden egen løn får den almindelige løn (fx 100 Glimt).
-- - Bliver en ansat fyret, slettes deres egne løn med det samme, og de får ingen løn mere.
--   Ansættes de igen senere, starter de på den almindelige løn.

create table if not exists public.hv_loen_egen (
  navn_lille text primary key,
  beloeb int not null check (beloeb between 0 and 100000),   -- 0 = ingen løn til denne person
  hvem text,
  tid timestamptz not null default now()
);
alter table public.hv_loen_egen enable row level security;
revoke all on public.hv_loen_egen from anon, authenticated;

-- Fyret (eller fået et skilt, der ikke er personale)? Så forsvinder den egne løn med det samme.
create or replace function public.hv_loen_fyret()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if tg_op = 'DELETE' then
    delete from hv_loen_egen where navn_lille = old.navn_lille;
    return old;
  end if;
  if not hv_er_ansat(new.navn) then delete from hv_loen_egen where navn_lille = new.navn_lille; end if;
  return new;
end $$;
drop trigger if exists hv_loen_fyret on public.hv_ansatte;
create trigger hv_loen_fyret after update or delete on public.hv_ansatte
  for each row execute function public.hv_loen_fyret();
-- ryd op i dem, der allerede er fyret
delete from public.hv_loen_egen e where not exists (select 1 from public.hv_ansatte a where a.navn_lille = e.navn_lille and public.hv_er_ansat(a.navn));

-- Udbetal denne uges løn (nu med egen løn pr. ansat)
create or replace function public.hv_loen_udbetal()
returns int language plpgsql security definer set search_path = public as $$
declare ind hv_loen_indstil; a record; antal int := 0; v_uge date := hv_loen_uge(); ny bigint; v_beloeb int;
begin
  select * into ind from hv_loen_indstil where id = 1;
  if ind.id is null or not ind.til then return 0; end if;
  for a in select * from hv_ansatte where hv_er_ansat(navn) and not hv_er_ejer(navn) loop
    v_beloeb := coalesce((select e.beloeb from hv_loen_egen e where e.navn_lille = a.navn_lille), ind.beloeb);
    if v_beloeb <= 0 then continue; end if;
    ny := null;
    insert into hv_loen_udbetalt (navn, navn_lille, skilt, uge, beloeb)
      values (a.navn, a.navn_lille, a.skilt, v_uge, v_beloeb)
      on conflict (navn_lille, uge) do nothing returning id into ny;
    if ny is not null then
      update hv_spillere set glimt = coalesce(glimt, 100) + v_beloeb where navn_lille = a.navn_lille;
      antal := antal + 1;
    end if;
  end loop;
  if antal > 0 then
    begin insert into hv_adminlog (hvem, hvad) values ('Hotellet', '💼 Ugens løn udbetalt til ' || antal || ' ansatte'); exception when others then null; end;
  end if;
  return antal;
end $$;

-- Ejeren: giv én ansat sin egen løn (p_beloeb = null → tilbage til den almindelige løn)
create or replace function public.hv_loen_egen_saet(p_token uuid, p_navn text, p_beloeb int)
returns void language plpgsql security definer set search_path = public as $$
declare s hv_spillere; a hv_ansatte;
begin
  select * into s from hv_spillere where token = p_token;
  if s.id is null then raise exception 'Du er ikke logget ind.'; end if;
  if not hv_er_ejer(s.navn) then raise exception 'Kun hotellets ejer kan ændre lønnen.'; end if;
  select * into a from hv_ansatte where navn_lille = lower(trim(coalesce(p_navn, '')));
  if a.navn_lille is null or not hv_er_ansat(a.navn) or hv_er_ejer(a.navn) then raise exception '% er ikke ansat.', p_navn; end if;
  if p_beloeb is null then
    delete from hv_loen_egen where navn_lille = a.navn_lille;
    begin insert into hv_adminlog (hvem, hvad) values (s.navn, '💼 ' || a.navn || ' får nu den almindelige løn'); exception when others then null; end;
  else
    if p_beloeb < 0 or p_beloeb > 100000 then raise exception 'Lønnen skal være mellem 0 og 100.000 Glimt.'; end if;
    insert into hv_loen_egen (navn_lille, beloeb, hvem) values (a.navn_lille, p_beloeb, s.navn)
      on conflict (navn_lille) do update set beloeb = excluded.beloeb, hvem = excluded.hvem, tid = now();
    begin insert into hv_adminlog (hvem, hvad) values (s.navn, '💼 Satte ' || a.navn || 's løn til ' || p_beloeb || ' Glimt om ugen'); exception when others then null; end;
  end if;
end $$;

-- Ejeren: alt om lønnen (nu med "egen" løn pr. ansat)
create or replace function public.hv_loen_hent(p_token uuid)
returns json language plpgsql security definer set search_path = public as $$
declare s hv_spillere; ind hv_loen_indstil;
begin
  select * into s from hv_spillere where token = p_token;
  if s.id is null then raise exception 'Du er ikke logget ind.'; end if;
  if not hv_er_ejer(s.navn) then raise exception 'Kun hotellets ejer kan se lønnen.'; end if;
  select * into ind from hv_loen_indstil where id = 1;
  return json_build_object(
    'til', ind.til, 'beloeb', ind.beloeb, 'uge', hv_loen_uge(),
    'ansatte', coalesce((select json_agg(json_build_object('navn', a.navn, 'skilt', a.skilt,
        'egen', (select e.beloeb from hv_loen_egen e where e.navn_lille = a.navn_lille),
        'fik', (select u.beloeb from hv_loen_udbetalt u where u.navn_lille = a.navn_lille and u.uge = hv_loen_uge()),
        'ialt', (select coalesce(sum(u.beloeb), 0) from hv_loen_udbetalt u where u.navn_lille = a.navn_lille)) order by a.navn)
      from hv_ansatte a where hv_er_ansat(a.navn) and not hv_er_ejer(a.navn)), '[]'::json),
    'seneste', coalesce((select json_agg(x) from (select u.navn, u.skilt, u.beloeb, u.uge, u.tid from hv_loen_udbetalt u order by u.tid desc limit 40) x), '[]'::json)
  );
end $$;

revoke all on function public.hv_loen_fyret, public.hv_loen_udbetal from public, anon, authenticated;
revoke all on function public.hv_loen_egen_saet, public.hv_loen_hent from public;
grant execute on function public.hv_loen_egen_saet, public.hv_loen_hent to anon, authenticated;
notify pgrst, 'reload schema';

-- HELLO VERA, del 30: Velkomstsiden efter login 🛎 (velkommen.html)
-- Profilkort, venner, nyheder og opslagstavlen ("Hvad sker der?").
-- Kopiér ALT herfra → Supabase → SQL Editor → + New query → Run. Må gerne køres flere gange.

-- Opslagstavlen: korte opslag, alle der er logget ind kan se dem
create table if not exists public.hv_opslag (
  id bigint generated always as identity primary key,
  hvem text not null,
  tekst text not null,
  tid timestamptz not null default now()
);
alter table public.hv_opslag enable row level security;   -- kun funktionerne herunder må røre den

-- Alt til velkomstsiden på én gang
create or replace function public.hv_velkomst(p_token uuid)
returns json language plpgsql security definer set search_path = public as $$
declare s hv_spillere;
begin
  select * into s from hv_spillere where token = p_token;
  if s.id is null then raise exception 'Du er ikke logget ind.'; end if;
  return json_build_object(
    'navn', s.navn,
    'motto', s.motto,
    'oprettet', s.oprettet,
    'figur', s.figur ->> 'type',
    'glimt', s.glimt,
    'stella', s.stella,
    'ejer', hv_er_ejer(s.navn),
    'mod', hv_er_mod(s.navn),
    'online', (select count(*) from hv_spillere where sidst_set > now() - interval '20 seconds'),
    'venner', coalesce((select json_agg(json_build_object('navn', o.navn, 'figur', o.figur ->> 'type',
                 'online', coalesce(o.sidst_set > now() - interval '20 seconds', false))
                 order by (o.sidst_set > now() - interval '20 seconds') desc nulls last, o.navn_lille)
               from hv_venner v join hv_spillere o on o.navn_lille = v.b where v.a = s.navn_lille), '[]'::json),
    'nyheder', coalesce((select json_agg(n) from (select id, titel, tekst, hvem,
                 (extract(epoch from tid) * 1000)::bigint as tid from hv_nyheder order by id desc limit 5) n), '[]'::json),
    'opslag', coalesce((select json_agg(x) from (select p.id, p.hvem, p.tekst, (extract(epoch from p.tid) * 1000)::bigint as tid,
                 o.figur ->> 'type' as figur
               from hv_opslag p left join hv_spillere o on o.navn_lille = lower(p.hvem)
               order by p.id desc limit 40) x), '[]'::json)
  );
end $$;

-- Skriv et opslag (højst 200 tegn, og højst ét hvert 15. sekund)
create or replace function public.hv_opslag_send(p_token uuid, p_tekst text)
returns bigint language plpgsql security definer set search_path = public as $$
declare s hv_spillere; v_id bigint; t text := trim(coalesce(p_tekst, ''));
begin
  select * into s from hv_spillere where token = p_token;
  if s.id is null then raise exception 'Du er ikke logget ind.'; end if;
  if length(t) = 0 then raise exception 'Skriv noget først.'; end if;
  if exists (select 1 from hv_opslag where hvem = s.navn and tid > now() - interval '15 seconds') then
    raise exception 'Vent lidt, før du skriver igen.';
  end if;
  insert into hv_opslag (hvem, tekst) values (s.navn, left(t, 200)) returning id into v_id;
  return v_id;
end $$;

-- Slet et opslag: dit eget, eller alle hvis du er ejer eller MOD
create or replace function public.hv_opslag_slet(p_token uuid, p_id bigint)
returns void language plpgsql security definer set search_path = public as $$
declare s hv_spillere;
begin
  select * into s from hv_spillere where token = p_token;
  if s.id is null then raise exception 'Du er ikke logget ind.'; end if;
  delete from hv_opslag where id = p_id and (hvem = s.navn or hv_er_ejer(s.navn) or hv_er_mod(s.navn));
end $$;

revoke all on function public.hv_velkomst, public.hv_opslag_send, public.hv_opslag_slet from public;
grant execute on function public.hv_velkomst, public.hv_opslag_send, public.hv_opslag_slet to anon, authenticated;

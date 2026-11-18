-- HELLO VERA, del 65: 🎨 Telefon-temaer
-- 6 temaer til Vera-telefonen (Grand Hotel, Enchanted, Y2K, Neon Night, Vintage, Ice Crystal).
-- Hvert tema koster 10 Stella og er ens eget for altid. Ejeren har alle temaer gratis.
-- Her gemmes, hvilke temaer hver spiller har købt, og hvilket tema de bruger.
-- Kør database-6-penge.sql FØRST (det har du allerede gjort).
-- Kopiér ALT herfra → Supabase → SQL Editor → + New query → Run. Må gerne køres flere gange.

-- 1) Hvilke temaer har hver spiller købt (og et log over købene)
create table if not exists public.hv_tlf_tema (
  spiller_id bigint not null,
  navn text not null,
  tema text not null,
  pris integer not null default 10,      -- Stella betalt (0 = givet af ejeren)
  noegle uuid unique,                     -- unikt nummer fra knappen, så et dobbeltklik ikke køber to gange
  koebt timestamptz not null default now(),
  primary key (spiller_id, tema)
);

-- 2) Hvilket tema bruger hver spiller lige nu ('' = Standard)
create table if not exists public.hv_tlf_tema_valgt (
  spiller_id bigint primary key,
  tema text not null default '',
  tid timestamptz not null default now()
);

alter table public.hv_tlf_tema enable row level security;
alter table public.hv_tlf_tema_valgt enable row level security;

-- 3) De temaer, der findes, og prisen
create or replace function public.hv_tema_alle()
returns text[] language sql immutable as $$
  select array['grand', 'enchanted', 'y2k', 'neon', 'vintage', 'ice'];
$$;
create or replace function public.hv_tema_pris()
returns integer language sql immutable as $$ select 10; $$;

-- 4) Mine temaer: hvad ejer jeg, og hvad bruger jeg
create or replace function public.hv_tema_mig(p_token uuid)
returns json language plpgsql security definer set search_path = public as $$
declare s hv_spillere; er boolean; ejede text[]; v text;
begin
  select * into s from hv_spillere where token = p_token;
  if s.id is null then raise exception 'Du er ikke logget ind.'; end if;
  er := hv_er_ejer(s.navn);
  if er then ejede := hv_tema_alle();
  else select coalesce(array_agg(tema order by koebt), '{}') into ejede from hv_tlf_tema where spiller_id = s.id;
  end if;
  select tema into v from hv_tlf_tema_valgt where spiller_id = s.id;
  return json_build_object('ejer', er, 'ejede', ejede, 'valgt', coalesce(v, ''), 'pris', hv_tema_pris(),
    'stella', coalesce(s.stella, 0), 'glimt', coalesce(s.glimt, 0));
end $$;

-- 5) Køb et tema for 10 Stella (ejeren betaler ikke)
create or replace function public.hv_tema_koeb(p_token uuid, p_tema text, p_noegle uuid)
returns json language plpgsql security definer set search_path = public as $$
declare s hv_spillere; er boolean; pris integer := hv_tema_pris(); ejede text[];
begin
  if p_noegle is null then raise exception 'Prøv igen (mangler nøgle).'; end if;
  if p_tema is null or not (p_tema = any (hv_tema_alle())) then raise exception 'Det tema findes ikke.'; end if;
  select * into s from hv_spillere where token = p_token for update;
  if s.id is null then raise exception 'Du er ikke logget ind.'; end if;
  er := hv_er_ejer(s.navn);
  -- samme klik to gange: giv bare svaret igen
  if exists (select 1 from hv_tlf_tema where noegle = p_noegle) or exists (select 1 from hv_tlf_tema where spiller_id = s.id and tema = p_tema) or er then
    if er then insert into hv_tlf_tema (spiller_id, navn, tema, pris, noegle) values (s.id, s.navn, p_tema, 0, p_noegle) on conflict do nothing; end if;
  else
    if coalesce(s.stella, 0) < pris then
      raise exception 'Du har ikke nok Stella. Temaet koster % Stella, og du har %.', pris, coalesce(s.stella, 0);
    end if;
    update hv_spillere set stella = stella - pris where id = s.id returning * into s;
    insert into hv_tlf_tema (spiller_id, navn, tema, pris, noegle) values (s.id, s.navn, p_tema, pris, p_noegle);
    if to_regprocedure('public.hv_oekonomi_gem_dag()') is not null then perform hv_oekonomi_gem_dag(); end if;
  end if;
  -- det købte tema bliver sat på med det samme
  insert into hv_tlf_tema_valgt (spiller_id, tema, tid) values (s.id, p_tema, now())
    on conflict (spiller_id) do update set tema = excluded.tema, tid = now();
  if er then ejede := hv_tema_alle();
  else select coalesce(array_agg(tema order by koebt), '{}') into ejede from hv_tlf_tema where spiller_id = s.id;
  end if;
  return json_build_object('ok', true, 'ejede', ejede, 'valgt', p_tema, 'glimt', coalesce(s.glimt, 0), 'stella', coalesce(s.stella, 0));
end $$;

-- 6) Brug et tema ('' = Standard). Man kan kun bruge temaer, man ejer.
create or replace function public.hv_tema_vaelg(p_token uuid, p_tema text)
returns json language plpgsql security definer set search_path = public as $$
declare s hv_spillere; t text := coalesce(p_tema, '');
begin
  select * into s from hv_spillere where token = p_token;
  if s.id is null then raise exception 'Du er ikke logget ind.'; end if;
  if t <> '' then
    if not (t = any (hv_tema_alle())) then raise exception 'Det tema findes ikke.'; end if;
    if not hv_er_ejer(s.navn) and not exists (select 1 from hv_tlf_tema where spiller_id = s.id and tema = t) then
      raise exception 'Du har ikke købt det tema endnu.';
    end if;
  end if;
  insert into hv_tlf_tema_valgt (spiller_id, tema, tid) values (s.id, t, now())
    on conflict (spiller_id) do update set tema = excluded.tema, tid = now();
  return json_build_object('ok', true, 'valgt', t);
end $$;

revoke all on function public.hv_tema_alle, public.hv_tema_pris, public.hv_tema_mig, public.hv_tema_koeb, public.hv_tema_vaelg from public, anon, authenticated;
grant execute on function public.hv_tema_mig, public.hv_tema_koeb, public.hv_tema_vaelg to anon, authenticated;

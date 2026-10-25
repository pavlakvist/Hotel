-- HELLO VERA, del 11: spillerkortet 🪪. Når man klikker på en spiller, ser man et lille kort
-- med motto og hvem der har sat ❤ hjerte og 🙂 smiley på spilleren. Man kan sætte og fjerne sine egne.
-- Kopiér ALT herfra → Supabase → SQL Editor → + New query → Run. Må gerne køres flere gange.
alter table public.hv_spillere add column if not exists motto text not null default '';

create table if not exists public.hv_forhold (
  fra text not null,          -- navn_lille på den, der sætter det
  til text not null,          -- navn_lille på den, det sættes på
  slags text not null check (slags in ('hjerte', 'smiley')),
  tid timestamptz not null default now(),
  primary key (fra, til, slags)
);
alter table public.hv_forhold enable row level security;
revoke all on public.hv_forhold from anon, authenticated;

-- Mit motto (det, der står i Min profil)
create or replace function public.hv_motto_saet(p_token uuid, p_motto text)
returns void language plpgsql security definer set search_path = public as $$
declare s hv_spillere;
begin
  select * into s from hv_spillere where token = p_token;
  if s.id is null then raise exception 'Du er ikke logget ind.'; end if;
  update hv_spillere set motto = left(trim(coalesce(p_motto, '')), 80) where id = s.id;
end $$;

-- Sæt (p_til = true) eller fjern (p_til = false) mit hjerte eller min smiley på en anden spiller
create or replace function public.hv_forhold_saet(p_token uuid, p_navn text, p_slags text, p_til boolean)
returns void language plpgsql security definer set search_path = public as $$
declare s hv_spillere; v_til text := lower(trim(p_navn));
begin
  select * into s from hv_spillere where token = p_token;
  if s.id is null then raise exception 'Du er ikke logget ind.'; end if;
  if p_slags not in ('hjerte', 'smiley') then raise exception 'Det kan man ikke sætte.'; end if;
  if v_til = s.navn_lille then raise exception 'Du kan ikke sætte det på dig selv.'; end if;
  if not exists (select 1 from hv_spillere where navn_lille = v_til) then raise exception 'Den spiller findes ikke.'; end if;
  if p_til then
    insert into hv_forhold (fra, til, slags) values (s.navn_lille, v_til, p_slags) on conflict do nothing;
  else
    delete from hv_forhold where fra = s.navn_lille and til = v_til and slags = p_slags;
  end if;
end $$;

-- Alt det, der står på en spillers kort
create or replace function public.hv_spillerkort(p_token uuid, p_navn text)
returns json language plpgsql security definer set search_path = public as $$
declare s hv_spillere; o hv_spillere;
begin
  select * into s from hv_spillere where token = p_token;
  if s.id is null then raise exception 'Du er ikke logget ind.'; end if;
  select * into o from hv_spillere where navn_lille = lower(trim(p_navn));
  if o.id is null then return null; end if;
  return json_build_object(
    'navn', o.navn,
    'motto', o.motto,
    'oprettet', o.oprettet,
    'foedselsdag', to_jsonb(o) ->> 'foedselsdag',
    'hjerte', coalesce((select json_agg(x.navn order by f.tid desc) from hv_forhold f join hv_spillere x on x.navn_lille = f.fra
                        where f.til = o.navn_lille and f.slags = 'hjerte'), '[]'::json),
    'smiley', coalesce((select json_agg(x.navn order by f.tid desc) from hv_forhold f join hv_spillere x on x.navn_lille = f.fra
                        where f.til = o.navn_lille and f.slags = 'smiley'), '[]'::json)
  );
end $$;

revoke all on function public.hv_motto_saet, public.hv_forhold_saet, public.hv_spillerkort from public;
grant execute on function public.hv_motto_saet, public.hv_forhold_saet, public.hv_spillerkort to anon, authenticated;

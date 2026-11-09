-- HELLO VERA, del 38: 🎮 Spil med venner i telefonen (Stjernestribe)
-- - Man kan invitere en ven til et spil. Begge skal have hentet spillet i App Butikken.
-- - Vennen får en invitation og trykker Bekræft. Så skiftes I til at lægge brikker.
-- - Spillet giver ingen Glimt, det er bare for sjov.
-- Kopiér ALT herfra → Supabase → SQL Editor → + New query → Run. Må gerne køres flere gange.

create table if not exists public.hv_spil_hentet (
  navn_lille text not null,
  spil text not null,
  tid timestamptz not null default now(),
  primary key (navn_lille, spil)
);
create table if not exists public.hv_spil_kampe (
  id bigint generated always as identity primary key,
  spil text not null,
  vaert text not null,                -- den der inviterede (spiller 1)
  gaest text not null,                -- vennen (spiller 2)
  status text not null default 'inviteret',   -- inviteret, igang, slut, afvist, annulleret
  braet int[] not null default array_fill(0, array[42]),
  tur int not null default 1,         -- 1 = værten, 2 = gæsten
  vinder int not null default 0,      -- 0 = ingen, 1/2 = spiller, 3 = uafgjort
  sidste int,                         -- feltet med den sidste brik
  oprettet timestamptz not null default now(),
  opdateret timestamptz not null default now()
);
create index if not exists hv_spil_kampe_vaert on public.hv_spil_kampe (lower(vaert));
create index if not exists hv_spil_kampe_gaest on public.hv_spil_kampe (lower(gaest));
alter table public.hv_spil_hentet enable row level security;
alter table public.hv_spil_kampe enable row level security;
revoke all on public.hv_spil_hentet, public.hv_spil_kampe from anon, authenticated;

-- 📲 Telefonen fortæller, hvilke spil man har hentet
create or replace function public.hv_spil_installeret(p_token uuid, p_spil text, p_har boolean)
returns void language plpgsql security definer set search_path = public as $$
declare s hv_spillere;
begin
  select * into s from hv_spillere where token = p_token;
  if s.id is null then raise exception 'Du er ikke logget ind.'; end if;
  if p_har then
    insert into hv_spil_hentet (navn_lille, spil) values (s.navn_lille, left(p_spil, 30)) on conflict do nothing;
  else
    delete from hv_spil_hentet where navn_lille = s.navn_lille and spil = p_spil;
    update hv_spil_kampe set status = 'annulleret', opdateret = now()
      where spil = p_spil and status in ('inviteret', 'igang') and (lower(vaert) = s.navn_lille or lower(gaest) = s.navn_lille);
  end if;
end $$;

-- ✉️ Invitér en ven
create or replace function public.hv_kamp_inviter(p_token uuid, p_ven text, p_spil text)
returns bigint language plpgsql security definer set search_path = public as $$
declare s hv_spillere; o hv_spillere; v_id bigint;
begin
  select * into s from hv_spillere where token = p_token;
  if s.id is null then raise exception 'Du er ikke logget ind.'; end if;
  select * into o from hv_spillere where navn_lille = lower(trim(coalesce(p_ven, '')));
  if o.id is null then raise exception 'Der findes ingen spiller, der hedder %.', p_ven; end if;
  if o.id = s.id then raise exception 'Du kan ikke spille mod dig selv.'; end if;
  if not exists (select 1 from hv_venner where a = s.navn_lille and b = o.navn_lille) then
    raise exception 'I skal være venner for at spille sammen.';
  end if;
  insert into hv_spil_hentet (navn_lille, spil) values (s.navn_lille, p_spil) on conflict do nothing;
  if not exists (select 1 from hv_spil_hentet where navn_lille = o.navn_lille and spil = p_spil) then
    raise exception '% har ikke hentet spillet endnu. Bed dem hente det i App Butikken.', o.navn;
  end if;
  select id into v_id from hv_spil_kampe
    where spil = p_spil and status in ('inviteret', 'igang')
      and ((lower(vaert) = s.navn_lille and lower(gaest) = o.navn_lille) or (lower(vaert) = o.navn_lille and lower(gaest) = s.navn_lille))
    limit 1;
  if v_id is not null then return v_id; end if;   -- I har allerede et spil i gang
  insert into hv_spil_kampe (spil, vaert, gaest) values (left(p_spil, 30), s.navn, o.navn) returning id into v_id;
  delete from hv_spil_kampe where opdateret < now() - interval '14 days';
  return v_id;
end $$;

-- ✅ Bekræft eller sig nej tak til en invitation
create or replace function public.hv_kamp_svar(p_token uuid, p_id bigint, p_ja boolean)
returns void language plpgsql security definer set search_path = public as $$
declare s hv_spillere; k hv_spil_kampe;
begin
  select * into s from hv_spillere where token = p_token;
  if s.id is null then raise exception 'Du er ikke logget ind.'; end if;
  select * into k from hv_spil_kampe where id = p_id;
  if k.id is null or k.status <> 'inviteret' then raise exception 'Invitationen findes ikke mere.'; end if;
  if lower(k.gaest) <> s.navn_lille then raise exception 'Invitationen er ikke til dig.'; end if;
  update hv_spil_kampe set status = case when p_ja then 'igang' else 'afvist' end, opdateret = now() where id = p_id;
end $$;

-- Har nogen fået fire i træk? (0 = nej, 1/2 = spiller, 3 = brættet er fyldt)
create or replace function public.hv_stribe_vinder(b int[])
returns int language plpgsql immutable as $$
declare r int; c int; v int; dr int; dc int; i int; ok boolean;
begin
  for r in 0..5 loop
    for c in 0..6 loop
      v := b[r * 7 + c + 1];
      if v = 0 then continue; end if;
      -- vandret, lodret og de to skrå
      for i in 1..4 loop
        dr := (array[0, 1, 1, 1])[i];
        dc := (array[1, 0, 1, -1])[i];
        if r + 3 * dr > 5 or c + 3 * dc > 6 or c + 3 * dc < 0 then continue; end if;
        ok := b[(r + dr) * 7 + c + dc + 1] = v and b[(r + 2 * dr) * 7 + c + 2 * dc + 1] = v and b[(r + 3 * dr) * 7 + c + 3 * dc + 1] = v;
        if ok then return v; end if;
      end loop;
    end loop;
  end loop;
  if not (0 = any(b)) then return 3; end if;
  return 0;
end $$;

-- 🔴 Læg en brik i en søjle (0–6)
create or replace function public.hv_kamp_traek(p_token uuid, p_id bigint, p_kol int)
returns void language plpgsql security definer set search_path = public as $$
declare s hv_spillere; k hv_spil_kampe; mig int; r int; felt int; b int[];
begin
  select * into s from hv_spillere where token = p_token;
  if s.id is null then raise exception 'Du er ikke logget ind.'; end if;
  select * into k from hv_spil_kampe where id = p_id for update;
  if k.id is null or k.status <> 'igang' then raise exception 'Spillet er ikke i gang.'; end if;
  mig := case when lower(k.vaert) = s.navn_lille then 1 when lower(k.gaest) = s.navn_lille then 2 else 0 end;
  if mig = 0 then raise exception 'Det er ikke dit spil.'; end if;
  if k.tur <> mig then raise exception 'Det er ikke din tur.'; end if;
  if p_kol < 0 or p_kol > 6 then raise exception 'Den søjle findes ikke.'; end if;
  b := k.braet;
  felt := null;
  for r in reverse 5..0 loop
    if b[r * 7 + p_kol + 1] = 0 then felt := r * 7 + p_kol; exit; end if;
  end loop;
  if felt is null then raise exception 'Søjlen er fuld.'; end if;
  b[felt + 1] := mig;
  update hv_spil_kampe set braet = b, sidste = felt, tur = 3 - mig, vinder = hv_stribe_vinder(b),
    status = case when hv_stribe_vinder(b) > 0 then 'slut' else 'igang' end, opdateret = now()
  where id = p_id;
end $$;

-- 🏳️ Giv op / annullér en invitation
create or replace function public.hv_kamp_opgiv(p_token uuid, p_id bigint)
returns void language plpgsql security definer set search_path = public as $$
declare s hv_spillere; k hv_spil_kampe; mig int;
begin
  select * into s from hv_spillere where token = p_token;
  if s.id is null then raise exception 'Du er ikke logget ind.'; end if;
  select * into k from hv_spil_kampe where id = p_id;
  if k.id is null then return; end if;
  mig := case when lower(k.vaert) = s.navn_lille then 1 when lower(k.gaest) = s.navn_lille then 2 else 0 end;
  if mig = 0 then raise exception 'Det er ikke dit spil.'; end if;
  if k.status = 'inviteret' then update hv_spil_kampe set status = 'annulleret', opdateret = now() where id = p_id;
  elsif k.status = 'igang' then update hv_spil_kampe set status = 'slut', vinder = 3 - mig, opdateret = now() where id = p_id;
  end if;
end $$;

-- 📋 Mine spil og invitationer + hvilke venner der har hentet spillet
create or replace function public.hv_kamp_hent(p_token uuid, p_spil text)
returns json language plpgsql stable security definer set search_path = public as $$
declare s hv_spillere;
begin
  select * into s from hv_spillere where token = p_token;
  if s.id is null then raise exception 'Du er ikke logget ind.'; end if;
  return json_build_object(
    'kampe', coalesce((select json_agg(json_build_object(
        'id', k.id, 'vaert', k.vaert, 'gaest', k.gaest, 'status', k.status, 'braet', k.braet, 'tur', k.tur,
        'vinder', k.vinder, 'sidste', k.sidste, 'opdateret', (extract(epoch from k.opdateret) * 1000)::bigint) order by k.opdateret desc)
      from hv_spil_kampe k
      where k.spil = p_spil and (lower(k.vaert) = s.navn_lille or lower(k.gaest) = s.navn_lille)
        and (k.status in ('inviteret', 'igang') or k.opdateret > now() - interval '1 day')), '[]'::json),
    'har_spillet', coalesce((select json_agg(o.navn) from hv_venner v join hv_spillere o on o.navn_lille = v.b
      join hv_spil_hentet h on h.navn_lille = v.b and h.spil = p_spil where v.a = s.navn_lille), '[]'::json)
  );
end $$;

grant execute on function public.hv_spil_installeret(uuid, text, boolean) to anon, authenticated;
grant execute on function public.hv_kamp_inviter(uuid, text, text) to anon, authenticated;
grant execute on function public.hv_kamp_svar(uuid, bigint, boolean) to anon, authenticated;
grant execute on function public.hv_kamp_traek(uuid, bigint, int) to anon, authenticated;
grant execute on function public.hv_kamp_opgiv(uuid, bigint) to anon, authenticated;
grant execute on function public.hv_kamp_hent(uuid, text) to anon, authenticated;
notify pgrst, 'reload schema';

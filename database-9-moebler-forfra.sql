-- HELLO VERA, del 9: start forfra med møblerne i de fælles rum (Velkomsthallen, event-rum, hemmelig etage).
-- Der bliver først lavet en kopi i tabellen hv_rum_moebler_backup, så de kan hentes tilbage.
-- Kør database-7-bygmester.sql FØRST. Kopiér ALT herfra → Supabase → SQL Editor → + New query → Run.
create table if not exists public.hv_rum_moebler_backup (
  rum text not null,
  moebler jsonb not null,
  hvem text,
  tid timestamptz,
  gemt timestamptz not null default now()
);
alter table public.hv_rum_moebler_backup enable row level security;
revoke all on public.hv_rum_moebler_backup from anon, authenticated;

insert into public.hv_rum_moebler_backup (rum, moebler, hvem, tid)
  select rum, moebler, hvem, tid from public.hv_rum_moebler where jsonb_array_length(moebler) > 0;

-- alle fælles rum bliver tomme
insert into public.hv_rum_moebler (rum, moebler, hvem)
  select r, '[]'::jsonb, 'nulstillet' from unnest(array['hal', 'event1', 'event2', 'event3', 'event4', 'hemmelig']) as r
on conflict (rum) do update set moebler = '[]'::jsonb, hvem = 'nulstillet', tid = now();

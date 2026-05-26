create extension if not exists btree_gist;

create table if not exists public.players (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text not null,
  email text not null,
  role text not null default 'member' check (role in ('admin', 'member')),
  created_at timestamptz not null default now()
);

alter table public.players
add column if not exists role text not null default 'member'
check (role in ('admin', 'member'));

create unique index if not exists players_email_unique_idx
on public.players (lower(email));

create table if not exists public.courts (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  status text not null default 'operativo' check (status in ('operativo', 'mantencion')),
  created_at timestamptz not null default now()
);

create table if not exists public.reservations (
  id uuid primary key default gen_random_uuid(),
  player_id uuid not null references public.players(id) on delete cascade,
  court_id uuid not null references public.courts(id) on delete restrict,
  reservation_date date not null,
  start_time time not null,
  end_time time not null,
  status text not null default 'active' check (status in ('active', 'cancelled')),
  reservation_range tsrange generated always as (
    tsrange(reservation_date + start_time, reservation_date + end_time, '[)')
  ) stored,
  created_at timestamptz not null default now(),
  constraint reservations_time_order check (end_time > start_time),
  constraint reservations_no_overlap exclude using gist (
    court_id with =,
    reservation_range with &&
  ) where (status = 'active')
);

insert into public.courts (name)
values ('Cancha 1')
on conflict (name) do nothing;

alter table public.players enable row level security;
alter table public.courts enable row level security;
alter table public.reservations enable row level security;

create or replace function public.is_registered_player()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.players
    where lower(email) = lower(auth.email())
  );
$$;

grant execute on function public.is_registered_player() to authenticated;

create or replace function public.current_player_id()
returns uuid
language sql
security definer
set search_path = public
stable
as $$
  select id
  from public.players
  where lower(email) = lower(auth.email())
  limit 1;
$$;

grant execute on function public.current_player_id() to authenticated;

create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.players
    where lower(email) = lower(auth.email())
      and role = 'admin'
  );
$$;

grant execute on function public.is_admin() to authenticated;

create or replace function public.can_create_player_access(requested_email text)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.players
    where lower(email) = lower(trim(requested_email))
  );
$$;

grant execute on function public.can_create_player_access(text) to anon, authenticated;

drop policy if exists "Authenticated users can read players" on public.players;
drop policy if exists "Authenticated users can manage players" on public.players;
drop policy if exists "Authenticated users can read courts" on public.courts;
drop policy if exists "Authenticated users can manage courts" on public.courts;
drop policy if exists "Authenticated users can read reservations" on public.reservations;
drop policy if exists "Authenticated users can manage reservations" on public.reservations;
drop policy if exists "Registered players can read players" on public.players;
drop policy if exists "Registered players can manage players" on public.players;
drop policy if exists "Admins can insert players" on public.players;
drop policy if exists "Admins can update players" on public.players;
drop policy if exists "Admins can delete players" on public.players;
drop policy if exists "Registered players can read courts" on public.courts;
drop policy if exists "Registered players can manage courts" on public.courts;
drop policy if exists "Admins can manage courts" on public.courts;
drop policy if exists "Registered players can read reservations" on public.reservations;
drop policy if exists "Registered players can manage reservations" on public.reservations;
drop policy if exists "Registered players can insert own reservations" on public.reservations;
drop policy if exists "Registered players can update own reservations" on public.reservations;
drop policy if exists "Registered players can delete own reservations" on public.reservations;

create policy "Registered players can read players"
on public.players for select
to authenticated
using (public.is_registered_player());

create policy "Admins can insert players"
on public.players for insert
to authenticated
with check (public.is_admin());

create policy "Admins can update players"
on public.players for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "Admins can delete players"
on public.players for delete
to authenticated
using (public.is_admin());

create policy "Registered players can read courts"
on public.courts for select
to authenticated
using (public.is_registered_player());

create policy "Admins can manage courts"
on public.courts for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "Registered players can read reservations"
on public.reservations for select
to authenticated
using (public.is_registered_player());

create policy "Registered players can insert own reservations"
on public.reservations for insert
to authenticated
with check (public.is_admin() or player_id = public.current_player_id());

create policy "Registered players can update own reservations"
on public.reservations for update
to authenticated
using (public.is_admin() or player_id = public.current_player_id())
with check (public.is_admin() or player_id = public.current_player_id());

create policy "Registered players can delete own reservations"
on public.reservations for delete
to authenticated
using (public.is_admin() or player_id = public.current_player_id());

-- Bootstrap opcional para el primer socio:
-- Ejecuta esto una sola vez si la tabla public.players esta vacia.
-- Cambia los datos antes de correrlo.
--
-- insert into public.players (name, phone, email, role)
-- values ('Frank Bernales', '+56 9 0000 0000', 'f_bernales@hotmail.com', 'admin')
-- on conflict do nothing;

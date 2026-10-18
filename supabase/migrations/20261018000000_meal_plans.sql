create table if not exists public.meal_plans (
  household_id uuid not null references public.households(id) on delete cascade,
  date date not null,
  slot text not null check (slot in ('lunch', 'dinner')),
  text text not null check (length(trim(text)) > 0),
  primary key (household_id, date, slot)
);

alter table public.meal_plans enable row level security;
drop policy if exists "meal household access" on public.meal_plans;
create policy "meal household access" on public.meal_plans
  for all to authenticated
  using (public.is_household_member(household_id))
  with check (public.is_household_member(household_id));

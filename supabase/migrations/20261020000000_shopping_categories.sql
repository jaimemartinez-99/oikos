-- Store only user corrections; automatic grouping needs no product backfill.
create table if not exists public.shopping_product_categories (
  household_id uuid not null references public.households(id) on delete cascade,
  product_key text not null check (length(trim(product_key)) between 1 and 1000),
  category text not null check (category in (
    'fruit', 'vegetables', 'meat', 'fish', 'dairy', 'grains', 'legumes',
    'drinks', 'household', 'hygiene', 'other', 'unknown'
  )),
  primary key (household_id, product_key)
);

alter table public.shopping_product_categories enable row level security;
grant select, insert, update, delete on public.shopping_product_categories to authenticated;
drop policy if exists "shopping category household access" on public.shopping_product_categories;
create policy "shopping category household access" on public.shopping_product_categories
  for all to authenticated
  using (public.is_household_member(household_id))
  with check (public.is_household_member(household_id));

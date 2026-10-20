-- Run after the migration with:
-- supabase db query --linked --file supabase/tests/shopping_categories.sql
-- All fixtures and changes are rolled back, including when an assertion fails.
begin;
do $$
declare
  member_user uuid;
  own_home uuid := gen_random_uuid();
  other_home uuid := gen_random_uuid();
  test_key text := 'oikos category permission test';
  row_count integer;
begin
  select user_id into member_user from public.household_members limit 1;
  if member_user is null then raise exception 'An existing household member is required'; end if;

  insert into public.households (id, name) values (own_home, 'Temporary category test'), (other_home, 'Temporary unrelated household');
  insert into public.household_members (household_id, user_id, display_name) values (own_home, member_user, 'Temporary test member');
  insert into public.shopping_product_categories (household_id, product_key, category) values (other_home, test_key, 'fruit');

  perform set_config('request.jwt.claims', json_build_object('sub', member_user::text, 'role', 'authenticated')::text, true);
  execute 'set local role authenticated';
  if current_user <> 'authenticated' then raise exception 'Test must run with authenticated permissions'; end if;

  insert into public.shopping_product_categories (household_id, product_key, category) values (own_home, test_key, 'household');
  select count(*) into row_count from public.shopping_product_categories where household_id = own_home and product_key = test_key and category = 'household';
  if row_count <> 1 then raise exception 'Member cannot read their saved category'; end if;

  insert into public.shopping_product_categories (household_id, product_key, category) values (own_home, test_key, 'hygiene')
    on conflict (household_id, product_key) do update set category = excluded.category;
  select count(*) into row_count from public.shopping_product_categories where household_id = own_home and product_key = test_key and category = 'hygiene';
  if row_count <> 1 then raise exception 'Member cannot update their category'; end if;

  select count(*) into row_count from public.shopping_product_categories where household_id = other_home;
  if row_count <> 0 then raise exception 'Other household categories are visible'; end if;
  update public.shopping_product_categories set category = 'other' where household_id = other_home;
  get diagnostics row_count = row_count;
  if row_count <> 0 then raise exception 'Other household categories can be updated'; end if;
  delete from public.shopping_product_categories where household_id = other_home;
  get diagnostics row_count = row_count;
  if row_count <> 0 then raise exception 'Other household categories can be deleted'; end if;

  begin
    insert into public.shopping_product_categories (household_id, product_key, category) values (other_home, 'unauthorised test', 'other');
    raise exception 'Cross-household insert was allowed';
  exception when insufficient_privilege then null;
  end;
  begin
    insert into public.shopping_product_categories (household_id, product_key, category) values (own_home, 'invalid test', 'invalid-category');
    raise exception 'Invalid category was accepted';
  exception when check_violation then null;
  end;

  delete from public.shopping_product_categories where household_id = own_home and product_key = test_key;
  get diagnostics row_count = row_count;
  if row_count <> 1 then raise exception 'Member cannot reset their category'; end if;
end $$;
rollback;

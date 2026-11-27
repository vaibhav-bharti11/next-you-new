-- NextYou CMS: additive schema for merchandising, inventory, customers and review operations.
alter table public.admin_users add column if not exists role text not null default 'admin';
alter table public.admin_users drop constraint if exists admin_users_role_check;
alter table public.admin_users add constraint admin_users_role_check
  check (role in ('owner','admin','catalog','marketing','fulfillment','content','support'));
update public.admin_users set role='owner' where role='admin';

alter table public.admin_invites add column if not exists role text not null default 'admin';
alter table public.admin_invites drop constraint if exists admin_invites_role_check;
alter table public.admin_invites add constraint admin_invites_role_check
  check (role in ('owner','admin','catalog','marketing','fulfillment','content','support'));
alter table public.admin_invites add constraint admin_invites_owner_invite_check check (role <> 'owner');

alter table public.products add column if not exists sku text;
alter table public.products add column if not exists category text not null default 'Sleep + Recovery';
alter table public.products add column if not exists tags text[] not null default '{}';
alter table public.products add column if not exists seo jsonb not null default '{}'::jsonb;
update public.products set sku='NY-'||upper(regexp_replace(slug,'[^a-z0-9]+','-','g')) where sku is null;
create unique index if not exists products_sku_unique on public.products(sku) where sku is not null;

create table if not exists public.product_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  description text not null default '',
  sort_order integer not null default 0,
  is_active boolean not null default true,
  seo jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
insert into public.product_categories(name,slug,description)
values ('Sleep + Recovery','sleep-recovery','Thoughtful support for an evening wellness routine.')
on conflict (slug) do nothing;

create table if not exists public.product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  sku text not null unique,
  title text not null,
  options jsonb not null default '{}'::jsonb,
  price_paise bigint not null check(price_paise >= 0),
  stock integer not null default 0 check(stock >= 0),
  image_url text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);
create index if not exists product_variants_product_idx on public.product_variants(product_id);

create table if not exists public.inventory_movements (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete restrict,
  variant_id uuid references public.product_variants(id) on delete restrict,
  delta integer not null check(delta <> 0),
  stock_after integer not null check(stock_after >= 0),
  reason text not null,
  reference text,
  actor_id uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);
create index if not exists inventory_movements_product_date_idx on public.inventory_movements(product_id,created_at desc);

create table if not exists public.order_fulfillments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  items jsonb not null check(jsonb_typeof(items)='array' and jsonb_array_length(items)>0),
  carrier text not null default '',
  tracking_number text not null default '',
  tracking_url text,
  status text not null default 'packed' check(status in ('packed','shipped','delivered','cancelled')),
  shipped_at timestamptz,
  delivered_at timestamptz,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);
create index if not exists order_fulfillments_order_idx on public.order_fulfillments(order_id,created_at desc);

create table if not exists public.customer_records (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  name text not null default '',
  phone text not null default '',
  user_id uuid references auth.users(id) on delete set null,
  order_count integer not null default 0,
  lifetime_value_paise bigint not null default 0,
  last_order_at timestamptz,
  last_shipping_address jsonb,
  notes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists customer_records_name_idx on public.customer_records using gin (to_tsvector('simple',name||' '||email));

create table if not exists public.product_reviews (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  order_id uuid references public.orders(id) on delete set null,
  customer_email text not null,
  customer_name text not null,
  rating smallint not null check(rating between 1 and 5),
  title text not null default '',
  body text not null,
  status text not null default 'pending' check(status in ('pending','published','rejected')),
  verified_purchase boolean not null default false,
  created_at timestamptz not null default now(),
  moderated_at timestamptz,
  moderated_by uuid references auth.users(id) on delete set null
);
create index if not exists product_reviews_status_date_idx on public.product_reviews(status,created_at desc);

alter table public.orders add column if not exists carrier text;
alter table public.orders add column if not exists tracking_number text;
alter table public.orders add column if not exists fulfilled_at timestamptz;
alter table public.orders add column if not exists internal_notes text not null default '';

create or replace function public.sync_customer_record_from_order()
returns trigger language plpgsql security invoker set search_path=''
as $$
declare customer_email text;
begin
  customer_email:=lower(coalesce(new.customer->>'email',''));
  if customer_email='' then return new; end if;
  insert into public.customer_records(email,name,phone,user_id,order_count,lifetime_value_paise,last_order_at,last_shipping_address)
  values(customer_email,coalesce(new.customer->>'name',''),coalesce(new.customer->>'phone',''),new.user_id,1,coalesce((new.totals->>'total_paise')::bigint,0),new.created_at,new.shipping_address)
  on conflict(email) do update set
    name=excluded.name,phone=excluded.phone,user_id=coalesce(excluded.user_id,public.customer_records.user_id),
    order_count=public.customer_records.order_count+1,
    lifetime_value_paise=public.customer_records.lifetime_value_paise+excluded.lifetime_value_paise,
    last_order_at=excluded.last_order_at,last_shipping_address=excluded.last_shipping_address,updated_at=now();
  return new;
end $$;

create or replace function public.log_order_stock_movements()
returns trigger language plpgsql security invoker set search_path=''
as $$
declare line jsonb; product_stock integer; movement_delta integer;
begin
  if tg_op='INSERT' then movement_delta:=-1;
  elsif tg_op='UPDATE' and new.status='cancelled' and old.status is distinct from 'cancelled' then movement_delta:=1;
  else return new; end if;
  for line in select * from jsonb_array_elements(new.items) loop
    select stock into product_stock from public.products where id=(line->>'product_id')::uuid;
    if product_stock is not null then
      insert into public.inventory_movements(product_id,delta,stock_after,reason,reference)
      values((line->>'product_id')::uuid,movement_delta*(line->>'quantity')::integer,product_stock,
        case when movement_delta<0 then 'Order allocation' else 'Order cancellation return' end,new.number);
    end if;
  end loop;
  return new;
end $$;
drop trigger if exists orders_sync_customer_record on public.orders;
create trigger orders_sync_customer_record after insert on public.orders
for each row execute function public.sync_customer_record_from_order();
drop trigger if exists orders_log_stock_insert on public.orders;
create trigger orders_log_stock_insert after insert on public.orders
for each row execute function public.log_order_stock_movements();
drop trigger if exists orders_log_stock_cancel on public.orders;
create trigger orders_log_stock_cancel after update of status on public.orders
for each row execute function public.log_order_stock_movements();
insert into public.customer_records(email,name,phone,user_id,order_count,lifetime_value_paise,last_order_at,last_shipping_address)
select lower(customer->>'email'),max(customer->>'name'),max(customer->>'phone'),(array_agg(user_id) filter(where user_id is not null))[1],
       count(*)::integer,coalesce(sum((totals->>'total_paise')::bigint),0),max(created_at),(array_agg(shipping_address order by created_at desc))[1]
from public.orders where coalesce(customer->>'email','')<>'' group by lower(customer->>'email')
on conflict(email) do nothing;

create or replace function public.cms_adjust_inventory(p_product_id uuid,p_delta integer,p_reason text,p_reference text default null)
returns public.inventory_movements
language plpgsql security invoker set search_path=''
as $$
declare actor_role text; next_stock integer; movement public.inventory_movements;
begin
  select role into actor_role from public.admin_users where user_id=auth.uid();
  if actor_role not in ('owner','admin','catalog','fulfillment') then raise exception 'Inventory access denied'; end if;
  if p_delta=0 or abs(p_delta)>100000 or length(trim(p_reason)) not between 1 and 120 then raise exception 'Invalid inventory adjustment'; end if;
  update public.products set stock=stock+p_delta where id=p_product_id and stock+p_delta>=0 returning stock into next_stock;
  if next_stock is null then raise exception 'Product not found or stock cannot be negative'; end if;
  insert into public.inventory_movements(product_id,delta,stock_after,reason,reference,actor_id)
  values(p_product_id,p_delta,next_stock,trim(p_reason),nullif(trim(p_reference),''),auth.uid()) returning * into movement;
  return movement;
end $$;

-- Preserve the existing invite claim flow while applying the role recorded on an invite.
create or replace function public.claim_admin_invitation()
returns trigger language plpgsql security definer set search_path=''
as $$
declare invited_role text;
begin
  if new.email_confirmed_at is null then return new; end if;
  update public.admin_invites set claimed_by=new.id,claimed_at=now()
  where email=lower(new.email) and claimed_by is null returning role into invited_role;
  if invited_role is not null then
    insert into public.admin_users(user_id,role) values(new.id,invited_role)
    on conflict(user_id) do nothing;
  end if;
  return new;
end $$;

-- Every CMS table remains behind RLS; service-role storefront endpoints bypass these policies.
alter table public.admin_users enable row level security;
alter table public.admin_invites enable row level security;
alter table public.products enable row level security;
alter table public.coupons enable row level security;
alter table public.shipping_rules enable row level security;
alter table public.store_settings enable row level security;
alter table public.store_content enable row level security;
alter table public.orders enable row level security;
alter table public.product_categories enable row level security;
alter table public.product_variants enable row level security;
alter table public.inventory_movements enable row level security;
alter table public.customer_records enable row level security;
alter table public.product_reviews enable row level security;
alter table public.order_fulfillments enable row level security;

create or replace function public.cms_has_role(allowed text[])
returns boolean language sql stable security invoker set search_path=''
as $$ select exists(select 1 from public.admin_users a where a.user_id=auth.uid() and a.role=any(allowed)) $$;
revoke all on function public.cms_has_role(text[]) from public,anon;
grant execute on function public.cms_has_role(text[]) to authenticated;
revoke all on function public.cms_adjust_inventory(uuid,integer,text,text) from public,anon;
grant execute on function public.cms_adjust_inventory(uuid,integer,text,text) to authenticated;

do $$
declare t text; p record;
begin
  for t in select unnest(array['admin_users','admin_invites','products','coupons','shipping_rules','store_settings','store_content','orders','product_categories','product_variants','inventory_movements','customer_records','product_reviews','order_fulfillments']) loop
    for p in select policyname from pg_policies where schemaname='public' and tablename=t loop
      execute format('drop policy if exists %I on public.%I',p.policyname,t);
    end loop;
  end loop;
end $$;

create policy admin_users_self_read on public.admin_users for select to authenticated using(user_id=auth.uid());
create policy products_staff_read on public.products for select to authenticated using(public.cms_has_role(array['owner','admin','catalog','marketing','fulfillment','support']));
create policy products_catalog_write on public.products for all to authenticated using(public.cms_has_role(array['owner','admin','catalog'])) with check(public.cms_has_role(array['owner','admin','catalog']));
create policy coupons_staff_read on public.coupons for select to authenticated using(public.cms_has_role(array['owner','admin','marketing']));
create policy coupons_marketing_write on public.coupons for all to authenticated using(public.cms_has_role(array['owner','admin','marketing'])) with check(public.cms_has_role(array['owner','admin','marketing']));
create policy shipping_staff_read on public.shipping_rules for select to authenticated using(public.cms_has_role(array['owner','admin','fulfillment']));
create policy shipping_fulfillment_write on public.shipping_rules for all to authenticated using(public.cms_has_role(array['owner','admin','fulfillment'])) with check(public.cms_has_role(array['owner','admin','fulfillment']));
create policy settings_owner_read on public.store_settings for select to authenticated using(public.cms_has_role(array['owner','admin']));
create policy settings_owner_write on public.store_settings for all to authenticated using(public.cms_has_role(array['owner','admin'])) with check(public.cms_has_role(array['owner','admin']));
create policy content_staff_read on public.store_content for select to authenticated using(public.cms_has_role(array['owner','admin','content','marketing']));
create policy content_editor_write on public.store_content for all to authenticated using(public.cms_has_role(array['owner','admin','content'])) with check(public.cms_has_role(array['owner','admin','content']));
create policy orders_ops_read on public.orders for select to authenticated using(public.cms_has_role(array['owner','admin','fulfillment','support']));
create policy categories_catalog_read on public.product_categories for select to authenticated using(public.cms_has_role(array['owner','admin','catalog','marketing']));
create policy categories_catalog_write on public.product_categories for all to authenticated using(public.cms_has_role(array['owner','admin','catalog'])) with check(public.cms_has_role(array['owner','admin','catalog']));
create policy variants_catalog_read on public.product_variants for select to authenticated using(public.cms_has_role(array['owner','admin','catalog','fulfillment']));
create policy variants_catalog_write on public.product_variants for all to authenticated using(public.cms_has_role(array['owner','admin','catalog'])) with check(public.cms_has_role(array['owner','admin','catalog']));
create policy inventory_ops_read on public.inventory_movements for select to authenticated using(public.cms_has_role(array['owner','admin','catalog','fulfillment']));
create policy fulfillment_ops_read on public.order_fulfillments for select to authenticated using(public.cms_has_role(array['owner','admin','fulfillment','support']));
create policy fulfillment_ops_write on public.order_fulfillments for all to authenticated using(public.cms_has_role(array['owner','admin','fulfillment'])) with check(public.cms_has_role(array['owner','admin','fulfillment']));
create policy customers_support_read on public.customer_records for select to authenticated using(public.cms_has_role(array['owner','admin','support','fulfillment']));
create policy reviews_staff_read on public.product_reviews for select to authenticated using(public.cms_has_role(array['owner','admin','content','support']));

grant select on public.admin_users to authenticated;
grant select,insert,delete on public.products to authenticated;
revoke update on public.products from authenticated;
grant update(name,slug,sku,subtitle,description,category,tags,price_paise,compare_at_paise,gst_bps,is_active,discount_bps,images,details,seo) on public.products to authenticated;
grant select,insert,update,delete on public.product_categories,public.product_variants to authenticated;
grant select,insert,update,delete on public.coupons,public.shipping_rules to authenticated;
grant select,update on public.store_settings,public.store_content to authenticated;
grant select on public.orders,public.inventory_movements to authenticated;
grant select,insert,update on public.order_fulfillments to authenticated;
grant select on public.customer_records,public.product_reviews to authenticated;

-- Existing public product-media reads remain available. Writes are limited to CMS staff.
drop policy if exists cms_product_media_upload on storage.objects;
drop policy if exists cms_product_media_update on storage.objects;
drop policy if exists cms_product_media_delete on storage.objects;
create policy cms_product_media_upload on storage.objects for insert to authenticated
  with check(bucket_id='product-media' and public.cms_has_role(array['owner','admin','catalog','content']));
create policy cms_product_media_update on storage.objects for update to authenticated
  using(bucket_id='product-media' and public.cms_has_role(array['owner','admin','catalog','content']))
  with check(bucket_id='product-media' and public.cms_has_role(array['owner','admin','catalog','content']));
create policy cms_product_media_delete on storage.objects for delete to authenticated
  using(bucket_id='product-media' and public.cms_has_role(array['owner','admin','catalog','content']));

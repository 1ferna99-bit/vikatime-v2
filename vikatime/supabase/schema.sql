-- VikaTime V2 — Schema SQL para Supabase
-- Ejecutar en el SQL Editor de Supabase

-- Extensiones
create extension if not exists "uuid-ossp";

-- ─────────────────────────────────────────
-- PLANES
-- ─────────────────────────────────────────
create table if not exists plans (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  lunches_per_week int not null check (lunches_per_week > 0),
  is_active boolean default true,
  created_at timestamptz default now()
);

-- ─────────────────────────────────────────
-- DÍAS DEL MENÚ SEMANAL
-- ─────────────────────────────────────────
create table if not exists weekly_menu_days (
  id uuid primary key default uuid_generate_v4(),
  day_key text not null unique,
  day_label text not null,
  is_active boolean default true,
  delivery_time text,
  sort_order int not null
);

-- ─────────────────────────────────────────
-- ITEMS DEL MENÚ
-- ─────────────────────────────────────────
create table if not exists menu_items (
  id uuid primary key default uuid_generate_v4(),
  day_id uuid not null references weekly_menu_days(id) on delete cascade,
  category text not null check (category in ('protein','carb','salad')),
  name text not null,
  emoji text,
  calories int,
  is_active boolean default true,
  sort_order int default 0,
  created_at timestamptz default now()
);

-- ─────────────────────────────────────────
-- PEDIDOS
-- ─────────────────────────────────────────
create table if not exists orders (
  id uuid primary key default uuid_generate_v4(),
  customer_name text not null,
  customer_phone text not null,
  customer_address text not null,
  customer_notes text,
  plan_id uuid references plans(id),
  plan_name text not null,
  status text not null default 'pendiente' check (status in ('pendiente','confirmado','preparado','entregado','cancelado')),
  whatsapp_message text,
  created_at timestamptz default now()
);

-- ─────────────────────────────────────────
-- DÍAS DEL PEDIDO
-- ─────────────────────────────────────────
create table if not exists order_days (
  id uuid primary key default uuid_generate_v4(),
  order_id uuid not null references orders(id) on delete cascade,
  day_key text not null,
  day_label text not null,
  protein_item_id uuid,
  protein_name text not null,
  carb_item_id uuid,
  carb_name text not null,
  salads text[] default '{}',
  delivery_time text
);

-- ─────────────────────────────────────────
-- POLÍTICAS RLS
-- ─────────────────────────────────────────

-- Plans: lectura pública, escritura solo admin
alter table plans enable row level security;
create policy "plans_read_all" on plans for select using (true);
create policy "plans_write_admin" on plans for all using (auth.role() = 'authenticated');

-- Weekly menu days: lectura pública
alter table weekly_menu_days enable row level security;
create policy "menu_days_read_all" on weekly_menu_days for select using (true);
create policy "menu_days_write_admin" on weekly_menu_days for all using (auth.role() = 'authenticated');

-- Menu items: lectura pública
alter table menu_items enable row level security;
create policy "menu_items_read_all" on menu_items for select using (true);
create policy "menu_items_write_admin" on menu_items for all using (auth.role() = 'authenticated');

-- Orders: inserción pública, lectura/edición solo admin
alter table orders enable row level security;
create policy "orders_insert_all" on orders for insert with check (true);
create policy "orders_read_admin" on orders for select using (auth.role() = 'authenticated');
create policy "orders_update_admin" on orders for update using (auth.role() = 'authenticated');

-- Order days: inserción pública, lectura solo admin
alter table order_days enable row level security;
create policy "order_days_insert_all" on order_days for insert with check (true);
create policy "order_days_read_admin" on order_days for select using (auth.role() = 'authenticated');

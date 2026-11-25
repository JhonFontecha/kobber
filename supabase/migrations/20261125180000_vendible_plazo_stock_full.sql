-- Tienda: un producto se puede comprar aunque stock sea 0.
-- vendible = false lo saca de la tienda (descontinuado).
-- plazo_envio, si viene, reemplaza el texto por defecto del servidor.
-- stock_full y ml_stock_movements son el inventario físico en Mercado Libre Full.
-- No tienen relación con stock (catálogo) ni con stock_ml (cantidad del Excel de ML).
-- La tienda pública no debe leer estas dos últimas.
--
-- Aplicar en el SQL editor. No editar la migración anterior: esa ya corrió.

alter table public.products
  add column if not exists vendible boolean not null default true;

alter table public.products
  add column if not exists plazo_envio text;

comment on column public.products.vendible is
  'False: la tienda no muestra el producto. No representa inventario.';
comment on column public.products.plazo_envio is
  'Texto de plazo en la tienda. Null usa el default del servidor.';

alter table public.product_variants
  add column if not exists stock_full integer not null default 0;

comment on column public.product_variants.stock_full is
  'Unidades físicas en bodegas Mercado Libre Full. Solo el panel.';

alter table public.product_variants
  drop constraint if exists product_variants_stock_full_check;

alter table public.product_variants
  add constraint product_variants_stock_full_check check (stock_full >= 0);

create table if not exists public.ml_stock_movements (
  id bigint generated always as identity primary key,
  variant_id uuid not null references public.product_variants (id) on delete cascade,
  delta integer not null,
  stock_despues integer not null,
  nota text,
  created_at timestamptz not null default now(),
  constraint ml_stock_movements_delta_check check (delta <> 0),
  constraint ml_stock_movements_stock_check check (stock_despues >= 0)
);

comment on table public.ml_stock_movements is
  'Ajustes del inventario físico en Mercado Libre Full. No se expone en la tienda.';

create index if not exists ml_stock_movements_variant_id_idx
  on public.ml_stock_movements (variant_id, created_at desc);

alter table public.ml_stock_movements enable row level security;
alter table public.ml_stock_movements force row level security;

revoke all on table public.ml_stock_movements from public, anon, authenticated;
revoke all on sequence public.ml_stock_movements_id_seq from public, anon, authenticated;

grant select, insert on table public.ml_stock_movements to service_role;
grant usage, select on sequence public.ml_stock_movements_id_seq to service_role;

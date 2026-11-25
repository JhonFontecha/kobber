-- Tienda pública: pedidos persistidos y precio anterior real para ofertas.
--
-- Aplicar a mano en el SQL editor de Supabase (o con la CLI) ANTES de usar
-- el checkout nuevo y el campo de oferta del panel. No borra datos.
-- El backend usa la service_role key y salta RLS. anon y authenticated
-- no tienen acceso: los pedidos tienen datos personales.

create table if not exists public.orders (
  id bigint generated always as identity primary key,
  numero text not null,
  created_at timestamptz not null default now(),
  estado text not null default 'recibido',
  metodo_pago text not null,
  pago_estado text not null default 'pendiente',
  pasarela text,
  pasarela_ref text,
  cliente_nombre text not null,
  cliente_email text not null,
  cliente_telefono text not null,
  envio_direccion text not null,
  envio_ciudad text not null,
  envio_departamento text not null,
  envio_cp text,
  factura_mismo_envio boolean not null default true,
  factura_razon_social text,
  factura_documento text,
  factura_direccion text,
  factura_ciudad text,
  envio_notas text,
  subtotal integer not null,
  iva_incluido integer not null,
  envio integer not null,
  total integer not null,
  moneda text not null default 'COP',
  constraint orders_numero_key unique (numero),
  constraint orders_estado_check check (estado in ('recibido', 'confirmado', 'cancelado')),
  constraint orders_pago_check check (pago_estado in ('pendiente', 'pagado', 'fallido', 'reembolsado')),
  constraint orders_metodo_len_check check (char_length(metodo_pago) between 1 and 40),
  constraint orders_montos_check check (
    subtotal >= 0
    and iva_incluido >= 0
    and envio >= 0
    and total >= 0
    and total = subtotal + envio
  )
);

comment on table public.orders is
  'Pedidos de la tienda pública. El precio lo calcula el backend. No guardar datos de tarjeta.';
comment on column public.orders.pasarela is
  'Null hasta conectar una pasarela (Wompi, Mercado Pago, etc.).';
comment on column public.orders.iva_incluido is
  'IVA ya contenido en subtotal. No se suma otra vez al total.';

create index if not exists orders_cliente_email_idx on public.orders (cliente_email);
create index if not exists orders_created_at_idx on public.orders (created_at desc);

create table if not exists public.order_items (
  id bigint generated always as identity primary key,
  order_id bigint not null references public.orders (id) on delete cascade,
  variant_id uuid,
  product_id uuid,
  clave text,
  nombre text not null,
  cantidad integer not null,
  precio_unitario integer not null,
  subtotal integer not null,
  constraint order_items_cantidad_check check (cantidad > 0 and cantidad <= 99),
  constraint order_items_precio_check check (precio_unitario >= 0 and subtotal >= 0)
);

comment on column public.order_items.variant_id is
  'Copia del id de la variante. Sin FK: el pedido se conserva si el catálogo cambia.';

create index if not exists order_items_order_id_idx on public.order_items (order_id);
create index if not exists order_items_variant_id_idx on public.order_items (variant_id);

alter table public.product_variants
  add column if not exists precio_anterior numeric(12, 2);

comment on column public.product_variants.precio_anterior is
  'Precio de venta anterior real, IVA incluido. Null si el producto no está en oferta.';

alter table public.product_variants
  drop constraint if exists product_variants_precio_anterior_check;

alter table public.product_variants
  add constraint product_variants_precio_anterior_check
  check (precio_anterior is null or precio_anterior > 0);

alter table public.orders enable row level security;
alter table public.orders force row level security;
alter table public.order_items enable row level security;
alter table public.order_items force row level security;

revoke all on table public.orders from public, anon, authenticated;
revoke all on table public.order_items from public, anon, authenticated;
revoke all on sequence public.orders_id_seq from public, anon, authenticated;
revoke all on sequence public.order_items_id_seq from public, anon, authenticated;

grant select, insert, update on table public.orders to service_role;
grant select, insert, update on table public.order_items to service_role;
grant usage, select on sequence public.orders_id_seq to service_role;
grant usage, select on sequence public.order_items_id_seq to service_role;

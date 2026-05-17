-- ALISTA AHORRO V42 - índices para búsqueda rápida de artículos y clientes
-- No borra datos. Solo mejora velocidad de búsqueda.

CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE INDEX IF NOT EXISTS idx_articulos_cod_trgm
ON public.articulos USING gin (lower(cod) gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_articulos_cod_art_trgm
ON public.articulos USING gin (lower(cod_art) gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_articulos_descripcion_trgm
ON public.articulos USING gin (lower(descripcion) gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_articulos_estado
ON public.articulos (estado);

CREATE INDEX IF NOT EXISTS idx_clientes_nombre_trgm
ON public.clientes USING gin (lower(nombre) gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_clientes_apellido_trgm
ON public.clientes USING gin (lower(apellido) gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_clientes_fantasia_trgm
ON public.clientes USING gin (lower(nombre_fantasia) gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_clientes_tel_trgm
ON public.clientes USING gin (lower(tel) gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_clientes_dir_trgm
ON public.clientes USING gin (lower(dir) gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_clientes_estado
ON public.clientes (estado);

CREATE INDEX IF NOT EXISTS idx_clientes_deuda
ON public.clientes (deuda);

CREATE INDEX IF NOT EXISTS idx_movimientos_cc_cliente_id
ON public.movimientos_cc (cliente_id);

CREATE INDEX IF NOT EXISTS idx_movimientos_cc_fecha
ON public.movimientos_cc (created_at DESC);

NOTIFY pgrst, 'reload schema';

-- V46 - Unidades vendidas + productos pesables
-- No borra datos. Agrega columna pesable a artículos e índices útiles.
ALTER TABLE public.articulos
ADD COLUMN IF NOT EXISTS pesable boolean DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_articulos_pesable
ON public.articulos (pesable);

CREATE INDEX IF NOT EXISTS idx_pedidos_estado_fecha_preparado
ON public.pedidos (estado, fecha_preparado DESC);

CREATE INDEX IF NOT EXISTS idx_pedidos_estado_fecha_entregado
ON public.pedidos (estado, fecha_entregado DESC);

NOTIFY pgrst, 'reload schema';

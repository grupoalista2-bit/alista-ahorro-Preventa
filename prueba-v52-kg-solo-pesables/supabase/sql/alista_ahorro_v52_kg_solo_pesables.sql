-- V52 - Venta por kg solo para artículos marcados como PESABLE
-- No borra datos. Asegura columna pesable y recarga schema.
ALTER TABLE IF EXISTS public.articulos
ADD COLUMN IF NOT EXISTS pesable boolean DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_articulos_pesable
ON public.articulos (pesable);

NOTIFY pgrst, 'reload schema';

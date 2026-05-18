-- V51 - Fix facturación por kg / pesables
-- No borra datos. Refuerza columna pesable en artículos y recarga PostgREST.
ALTER TABLE public.articulos
ADD COLUMN IF NOT EXISTS pesable boolean DEFAULT false;

UPDATE public.articulos
SET pesable = false
WHERE pesable IS NULL;

CREATE INDEX IF NOT EXISTS idx_articulos_pesable
ON public.articulos (pesable);

NOTIFY pgrst, 'reload schema';

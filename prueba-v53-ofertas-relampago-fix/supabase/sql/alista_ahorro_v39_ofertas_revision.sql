-- ALISTA AHORRO V39 - Estado de revisión para ofertas relámpago

ALTER TABLE public.ofertas_preventistas
ADD COLUMN IF NOT EXISTS coincidencia_dudosa boolean DEFAULT false;

ALTER TABLE public.ofertas_preventistas
ADD COLUMN IF NOT EXISTS estado_revision text DEFAULT 'ok';

ALTER TABLE public.ofertas_preventistas
ADD COLUMN IF NOT EXISTS revision_motivo text;

NOTIFY pgrst, 'reload schema';

SELECT column_name, data_type
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'ofertas_preventistas'
  AND column_name IN ('coincidencia_dudosa','estado_revision','revision_motivo')
ORDER BY column_name;

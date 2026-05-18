-- ALISTA AHORRO V40 - Campos opcionales para registrar cobros de cuenta corriente
ALTER TABLE public.movimientos_cc
ADD COLUMN IF NOT EXISTS fecha_cancelacion text;

ALTER TABLE public.movimientos_cc
ADD COLUMN IF NOT EXISTS hora_cancelacion text;

ALTER TABLE public.movimientos_cc
ADD COLUMN IF NOT EXISTS referencia text;

ALTER TABLE public.movimientos_cc
ADD COLUMN IF NOT EXISTS observaciones text;

ALTER TABLE public.movimientos_cc
ADD COLUMN IF NOT EXISTS forma_pago text;

NOTIFY pgrst, 'reload schema';

SELECT column_name, data_type
FROM information_schema.columns
WHERE table_schema='public'
  AND table_name='movimientos_cc'
ORDER BY column_name;

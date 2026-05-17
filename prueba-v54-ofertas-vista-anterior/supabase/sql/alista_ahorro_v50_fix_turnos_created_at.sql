-- V50 - Corrección jornada/caja: created_at y updated_at
-- No borra datos. Evita error 23502 cuando la app inicia jornada.

ALTER TABLE public.turnos_jornada
  ALTER COLUMN created_at SET DEFAULT now(),
  ALTER COLUMN updated_at SET DEFAULT now();

UPDATE public.turnos_jornada
SET created_at = now()
WHERE created_at IS NULL;

UPDATE public.turnos_jornada
SET updated_at = now()
WHERE updated_at IS NULL;

NOTIFY pgrst, 'reload schema';

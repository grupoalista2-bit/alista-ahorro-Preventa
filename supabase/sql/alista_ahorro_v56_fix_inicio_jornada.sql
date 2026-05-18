-- V56 - Fix inicio de jornada / caja
-- No borra datos. Asegura defaults y recarga esquema para turnos_jornada.

ALTER TABLE public.turnos_jornada
  ALTER COLUMN created_at SET DEFAULT now();

ALTER TABLE public.turnos_jornada
  ALTER COLUMN updated_at SET DEFAULT now();

UPDATE public.turnos_jornada
SET created_at = now()
WHERE created_at IS NULL;

UPDATE public.turnos_jornada
SET updated_at = now()
WHERE updated_at IS NULL;

ALTER TABLE public.pedidos
ADD COLUMN IF NOT EXISTS turno_id text;

CREATE INDEX IF NOT EXISTS idx_turnos_jornada_usuario_estado
ON public.turnos_jornada (usuario_id, estado);

CREATE INDEX IF NOT EXISTS idx_pedidos_turno_id
ON public.pedidos (turno_id);

NOTIFY pgrst, 'reload schema';

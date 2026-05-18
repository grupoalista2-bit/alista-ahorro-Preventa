-- V57 - Preventista inicia jornada / Preparador cierra caja
-- No borra datos. Agrega trazabilidad de quién cerró la jornada y permite al preparador cerrar jornadas abiertas.

ALTER TABLE public.turnos_jornada
ADD COLUMN IF NOT EXISTS cerrado_por_id text;

ALTER TABLE public.turnos_jornada
ADD COLUMN IF NOT EXISTS cerrado_por_nombre text;

ALTER TABLE public.turnos_jornada
ADD COLUMN IF NOT EXISTS cerrado_por_rol text;

CREATE INDEX IF NOT EXISTS idx_turnos_jornada_estado_fecha
ON public.turnos_jornada (estado, fecha_inicio);

CREATE INDEX IF NOT EXISTS idx_turnos_jornada_cerrado_por
ON public.turnos_jornada (cerrado_por_id);

ALTER TABLE public.turnos_jornada ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS turnos_jornada_select ON public.turnos_jornada;
DROP POLICY IF EXISTS turnos_jornada_insert ON public.turnos_jornada;
DROP POLICY IF EXISTS turnos_jornada_update ON public.turnos_jornada;

CREATE POLICY turnos_jornada_select
ON public.turnos_jornada
FOR SELECT
TO authenticated
USING (
  usuario_id IN (SELECT id FROM public.usuarios WHERE auth_user_id = auth.uid())
  OR EXISTS (
    SELECT 1 FROM public.usuarios
    WHERE auth_user_id = auth.uid()
      AND role IN ('admin','coadmin','preparador')
  )
);

CREATE POLICY turnos_jornada_insert
ON public.turnos_jornada
FOR INSERT
TO authenticated
WITH CHECK (
  usuario_id IN (SELECT id FROM public.usuarios WHERE auth_user_id = auth.uid())
  OR EXISTS (
    SELECT 1 FROM public.usuarios
    WHERE auth_user_id = auth.uid()
      AND role IN ('admin','coadmin')
  )
);

CREATE POLICY turnos_jornada_update
ON public.turnos_jornada
FOR UPDATE
TO authenticated
USING (
  usuario_id IN (SELECT id FROM public.usuarios WHERE auth_user_id = auth.uid())
  OR EXISTS (
    SELECT 1 FROM public.usuarios
    WHERE auth_user_id = auth.uid()
      AND role IN ('admin','coadmin','preparador')
  )
)
WITH CHECK (
  usuario_id IN (SELECT id FROM public.usuarios WHERE auth_user_id = auth.uid())
  OR EXISTS (
    SELECT 1 FROM public.usuarios
    WHERE auth_user_id = auth.uid()
      AND role IN ('admin','coadmin','preparador')
  )
);

NOTIFY pgrst, 'reload schema';

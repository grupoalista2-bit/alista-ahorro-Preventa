-- V58 - Fix jornada preventista en teléfono
-- No borra datos.
-- Corrige permisos RLS de turnos_jornada para que el preventista pueda iniciar jornada
-- aunque la vinculación auth_user_id / usuario interno no esté perfecta en el teléfono.

ALTER TABLE public.turnos_jornada ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS turnos_jornada_select ON public.turnos_jornada;
DROP POLICY IF EXISTS turnos_jornada_insert ON public.turnos_jornada;
DROP POLICY IF EXISTS turnos_jornada_update ON public.turnos_jornada;

-- SELECT:
-- Admin/coadmin/preparador pueden ver jornadas para control/cierre.
-- Preventista autenticado puede consultar jornadas para que la app detecte su jornada abierta.
CREATE POLICY turnos_jornada_select
ON public.turnos_jornada
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.usuarios u
    WHERE u.auth_user_id = auth.uid()
      AND u.role IN ('admin','coadmin','preparador','preventista')
  )
);

-- INSERT:
-- Permitimos que usuarios autenticados con rol preventista/admin/coadmin abran jornada.
-- Esto evita que en celular falle por diferencia entre usuario interno y sesión Auth.
CREATE POLICY turnos_jornada_insert
ON public.turnos_jornada
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.usuarios u
    WHERE u.auth_user_id = auth.uid()
      AND u.role IN ('admin','coadmin','preventista')
  )
);

-- UPDATE:
-- Preparador/admin/coadmin pueden cerrar jornadas.
-- Preventista puede actualizar su propia jornada si hiciera falta.
CREATE POLICY turnos_jornada_update
ON public.turnos_jornada
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.usuarios u
    WHERE u.auth_user_id = auth.uid()
      AND u.role IN ('admin','coadmin','preparador','preventista')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.usuarios u
    WHERE u.auth_user_id = auth.uid()
      AND u.role IN ('admin','coadmin','preparador','preventista')
  )
);

-- Asegurar defaults necesarios para que no falle desde mobile.
ALTER TABLE public.turnos_jornada
  ALTER COLUMN created_at SET DEFAULT now();

ALTER TABLE public.turnos_jornada
  ALTER COLUMN updated_at SET DEFAULT now();

ALTER TABLE public.pedidos
ADD COLUMN IF NOT EXISTS turno_id text;

CREATE INDEX IF NOT EXISTS idx_turnos_jornada_usuario_estado
ON public.turnos_jornada (usuario_id, estado);

CREATE INDEX IF NOT EXISTS idx_turnos_jornada_estado_fecha
ON public.turnos_jornada (estado, fecha_inicio);

CREATE INDEX IF NOT EXISTS idx_pedidos_turno_id
ON public.pedidos (turno_id);

NOTIFY pgrst, 'reload schema';

-- V47 - Jornada / Caja por turno
-- No borra datos. Agrega control de apertura/cierre de jornada para preventistas.

CREATE TABLE IF NOT EXISTS public.turnos_jornada (
  id text PRIMARY KEY,
  usuario_id text NOT NULL,
  usuario_nombre text,
  fecha_inicio text NOT NULL,
  fecha_cierre text,
  estado text NOT NULL DEFAULT 'abierto' CHECK (estado IN ('abierto','cerrado','anulado')),
  gps_inicio jsonb,
  gps_cierre jsonb,
  resumen jsonb NOT NULL DEFAULT '{}'::jsonb,
  observaciones text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.pedidos
ADD COLUMN IF NOT EXISTS turno_id text;

CREATE INDEX IF NOT EXISTS idx_turnos_jornada_usuario_estado
ON public.turnos_jornada (usuario_id, estado);

CREATE INDEX IF NOT EXISTS idx_turnos_jornada_fecha_inicio
ON public.turnos_jornada (fecha_inicio);

CREATE INDEX IF NOT EXISTS idx_pedidos_turno_id
ON public.pedidos (turno_id);

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
      AND role IN ('admin','coadmin')
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
      AND role IN ('admin','coadmin')
  )
)
WITH CHECK (
  usuario_id IN (SELECT id FROM public.usuarios WHERE auth_user_id = auth.uid())
  OR EXISTS (
    SELECT 1 FROM public.usuarios
    WHERE auth_user_id = auth.uid()
      AND role IN ('admin','coadmin')
  )
);

NOTIFY pgrst, 'reload schema';

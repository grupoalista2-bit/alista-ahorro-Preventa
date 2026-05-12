-- ALISTA AHORRO V35 - GPS sincronizado para control del administrador

CREATE TABLE IF NOT EXISTS public.gps_puntos (
  id text PRIMARY KEY,
  usuario_id text NOT NULL,
  usuario_nombre text,
  fecha text,
  fecha_dia date,
  lat numeric NOT NULL,
  lng numeric NOT NULL,
  ts bigint,
  activo boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.gps_puntos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS gps_puntos_select_v35 ON public.gps_puntos;
DROP POLICY IF EXISTS gps_puntos_insert_v35 ON public.gps_puntos;
DROP POLICY IF EXISTS gps_puntos_update_v35 ON public.gps_puntos;
DROP POLICY IF EXISTS gps_puntos_delete_v35 ON public.gps_puntos;

CREATE POLICY gps_puntos_select_v35
ON public.gps_puntos
FOR SELECT TO authenticated
USING (
  public.aa_is_admin_or_coadmin()
  OR usuario_id = public.aa_current_user_id()
);

CREATE POLICY gps_puntos_insert_v35
ON public.gps_puntos
FOR INSERT TO authenticated
WITH CHECK (
  public.aa_is_admin_or_coadmin()
  OR usuario_id = public.aa_current_user_id()
);

CREATE POLICY gps_puntos_update_v35
ON public.gps_puntos
FOR UPDATE TO authenticated
USING (
  public.aa_is_admin_or_coadmin()
  OR usuario_id = public.aa_current_user_id()
)
WITH CHECK (
  public.aa_is_admin_or_coadmin()
  OR usuario_id = public.aa_current_user_id()
);

CREATE POLICY gps_puntos_delete_v35
ON public.gps_puntos
FOR DELETE TO authenticated
USING (public.aa_is_admin_or_coadmin());

NOTIFY pgrst, 'reload schema';

SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename = 'gps_puntos';

-- ALISTA AHORRO V26 - Ofertas para preventistas
-- Ejecutar en Supabase SQL Editor antes de usar el módulo Ofertas.

CREATE TABLE IF NOT EXISTS public.ofertas_preventistas (
  id text PRIMARY KEY,
  articulo_id text,
  cod text,
  cod_art text,
  descripcion text NOT NULL,
  precio_regular numeric NOT NULL DEFAULT 0,
  precio_oferta numeric NOT NULL DEFAULT 0,
  costo numeric NOT NULL DEFAULT 0,
  fecha_desde date NOT NULL DEFAULT current_date,
  fecha_hasta date,
  stock_info text,
  observacion text,
  activo boolean NOT NULL DEFAULT true,
  created_by text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.ofertas_preventistas ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS ofertas_select_v26 ON public.ofertas_preventistas;
DROP POLICY IF EXISTS ofertas_insert_v26 ON public.ofertas_preventistas;
DROP POLICY IF EXISTS ofertas_update_v26 ON public.ofertas_preventistas;
DROP POLICY IF EXISTS ofertas_delete_v26 ON public.ofertas_preventistas;

-- Admin/CoAdmin ven todo. Preventistas y usuarios autenticados ven solo ofertas activas y vigentes.
CREATE POLICY ofertas_select_v26
ON public.ofertas_preventistas
FOR SELECT TO authenticated
USING (
  public.aa_is_admin_or_coadmin()
  OR (
    activo = true
    AND fecha_desde <= current_date
    AND (fecha_hasta IS NULL OR fecha_hasta >= current_date)
  )
);

CREATE POLICY ofertas_insert_v26
ON public.ofertas_preventistas
FOR INSERT TO authenticated
WITH CHECK (public.aa_is_admin_or_coadmin());

CREATE POLICY ofertas_update_v26
ON public.ofertas_preventistas
FOR UPDATE TO authenticated
USING (public.aa_is_admin_or_coadmin())
WITH CHECK (public.aa_is_admin_or_coadmin());

CREATE POLICY ofertas_delete_v26
ON public.ofertas_preventistas
FOR DELETE TO authenticated
USING (public.aa_is_admin_or_coadmin());

CREATE INDEX IF NOT EXISTS idx_ofertas_preventistas_vigencia
ON public.ofertas_preventistas (activo, fecha_desde, fecha_hasta);

CREATE INDEX IF NOT EXISTS idx_ofertas_preventistas_articulo
ON public.ofertas_preventistas (articulo_id);

SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename = 'ofertas_preventistas';

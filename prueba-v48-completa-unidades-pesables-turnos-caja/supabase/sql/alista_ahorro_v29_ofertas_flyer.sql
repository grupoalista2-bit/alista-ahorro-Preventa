-- ALISTA AHORRO V29 - Ofertas Relámpago + Flyer A4 + fotos
-- Ejecutar en Supabase SQL Editor.

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

ALTER TABLE public.ofertas_preventistas
  ADD COLUMN IF NOT EXISTS foto_url text,
  ADD COLUMN IF NOT EXISTS mostrar_flyer boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS mostrar_precio_anterior boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS mostrar_vigencia boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS orden_flyer integer NOT NULL DEFAULT 0;

ALTER TABLE public.ofertas_preventistas ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS ofertas_select_v26 ON public.ofertas_preventistas;
DROP POLICY IF EXISTS ofertas_insert_v26 ON public.ofertas_preventistas;
DROP POLICY IF EXISTS ofertas_update_v26 ON public.ofertas_preventistas;
DROP POLICY IF EXISTS ofertas_delete_v26 ON public.ofertas_preventistas;
DROP POLICY IF EXISTS ofertas_select_v29 ON public.ofertas_preventistas;
DROP POLICY IF EXISTS ofertas_insert_v29 ON public.ofertas_preventistas;
DROP POLICY IF EXISTS ofertas_update_v29 ON public.ofertas_preventistas;
DROP POLICY IF EXISTS ofertas_delete_v29 ON public.ofertas_preventistas;

-- Admin / CoAdmin ven todo. Preventista ve solo ofertas activas y vigentes.
CREATE POLICY ofertas_select_v29
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

CREATE POLICY ofertas_insert_v29
ON public.ofertas_preventistas
FOR INSERT TO authenticated
WITH CHECK (public.aa_is_admin_or_coadmin());

CREATE POLICY ofertas_update_v29
ON public.ofertas_preventistas
FOR UPDATE TO authenticated
USING (public.aa_is_admin_or_coadmin())
WITH CHECK (public.aa_is_admin_or_coadmin());

CREATE POLICY ofertas_delete_v29
ON public.ofertas_preventistas
FOR DELETE TO authenticated
USING (public.aa_is_admin_or_coadmin());

CREATE OR REPLACE FUNCTION public.aa_touch_ofertas_preventistas()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_aa_touch_ofertas_preventistas ON public.ofertas_preventistas;
CREATE TRIGGER trg_aa_touch_ofertas_preventistas
BEFORE UPDATE ON public.ofertas_preventistas
FOR EACH ROW
EXECUTE FUNCTION public.aa_touch_ofertas_preventistas();

SELECT column_name, data_type
FROM information_schema.columns
WHERE table_schema='public' AND table_name='ofertas_preventistas'
ORDER BY ordinal_position;

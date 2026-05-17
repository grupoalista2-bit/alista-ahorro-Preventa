-- ALISTA AHORRO V25 - Objetivos simples para preventistas
-- Ejecutar en Supabase → SQL Editor antes de usar el módulo Objetivos Preventistas.

CREATE TABLE IF NOT EXISTS public.objetivos_preventistas (
  id text PRIMARY KEY,
  usuario_id text NOT NULL,
  usuario_nombre text,
  fecha_desde date NOT NULL,
  fecha_hasta date NOT NULL,
  objetivo_visitas numeric NOT NULL DEFAULT 0,
  objetivo_pedidos numeric NOT NULL DEFAULT 0,
  objetivo_ventas numeric NOT NULL DEFAULT 0,
  objetivo_cobranza numeric NOT NULL DEFAULT 0,
  activo boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.objetivos_preventistas ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS objetivos_select_v25 ON public.objetivos_preventistas;
DROP POLICY IF EXISTS objetivos_insert_v25 ON public.objetivos_preventistas;
DROP POLICY IF EXISTS objetivos_update_v25 ON public.objetivos_preventistas;
DROP POLICY IF EXISTS objetivos_delete_v25 ON public.objetivos_preventistas;

-- Admin / coadmin ven todo. Preventista ve solamente sus objetivos.
CREATE POLICY objetivos_select_v25
ON public.objetivos_preventistas
FOR SELECT TO authenticated
USING (
  public.aa_is_admin_or_coadmin()
  OR usuario_id::text = public.aa_current_user_id()
);

CREATE POLICY objetivos_insert_v25
ON public.objetivos_preventistas
FOR INSERT TO authenticated
WITH CHECK (public.aa_is_admin_or_coadmin());

CREATE POLICY objetivos_update_v25
ON public.objetivos_preventistas
FOR UPDATE TO authenticated
USING (public.aa_is_admin_or_coadmin())
WITH CHECK (public.aa_is_admin_or_coadmin());

CREATE POLICY objetivos_delete_v25
ON public.objetivos_preventistas
FOR DELETE TO authenticated
USING (public.aa_is_admin_or_coadmin());

SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname='public'
  AND tablename='objetivos_preventistas';

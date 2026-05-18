-- ═════════════════════════════════════════════════════════════════════
-- ALISTA AHORRO — V21 Seguridad Supabase Auth + RLS
-- Ejecutar en Supabase → SQL Editor DESPUÉS de crear los usuarios Auth.
-- No pegues claves secret/service_role en el HTML.
-- ═════════════════════════════════════════════════════════════════════

-- 0) RESPALDO recomendado antes de ejecutar:
-- Supabase → Table Editor → exportá usuarios, pedidos, clientes y movimientos_cc.

-- 1) Preparar tabla de perfiles de la app.
ALTER TABLE IF EXISTS public.usuarios ADD COLUMN IF NOT EXISTS auth_user_id uuid;
ALTER TABLE IF EXISTS public.usuarios ADD COLUMN IF NOT EXISTS email text;

CREATE UNIQUE INDEX IF NOT EXISTS usuarios_auth_user_id_unique
ON public.usuarios(auth_user_id)
WHERE auth_user_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS usuarios_username_unique
ON public.usuarios(lower(username));

-- 2) Vincular perfiles existentes con usuarios de Supabase Auth por email.
-- Convención: username -> username@alista.internal
-- Ejemplo: carlos -> carlos@alista.internal | ADMINISTRADOR -> administrador@alista.internal
UPDATE public.usuarios u
SET auth_user_id = au.id,
    email = au.email
FROM auth.users au
WHERE lower(au.email) = lower(regexp_replace(u.username, '\s+', '', 'g') || '@alista.internal');

-- 3) Crear/asegurar perfil del administrador principal si existe en Supabase Auth.
INSERT INTO public.usuarios(id, auth_user_id, email, username, nombre, role, activo, permisos)
SELECT 'root', au.id, au.email, 'ADMINISTRADOR', 'Alejandro', 'admin', true,
       '{"max_desc":10,"desc_deshabilitado":false}'::jsonb
FROM auth.users au
WHERE lower(au.email) = 'administrador@alista.internal'
ON CONFLICT (id) DO UPDATE SET
  auth_user_id = EXCLUDED.auth_user_id,
  email = EXCLUDED.email,
  username = EXCLUDED.username,
  nombre = EXCLUDED.nombre,
  role = 'admin',
  activo = true,
  permisos = EXCLUDED.permisos;

-- 4) Eliminar contraseñas de la tabla pública.
-- Desde ahora las contraseñas las maneja Supabase Auth.
ALTER TABLE IF EXISTS public.usuarios DROP COLUMN IF EXISTS password;

-- 5) Funciones seguras para RLS.
CREATE OR REPLACE FUNCTION public.aa_current_user_id()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id::text
  FROM public.usuarios
  WHERE auth_user_id = auth.uid()
    AND activo IS TRUE
  LIMIT 1
$$;

CREATE OR REPLACE FUNCTION public.aa_current_role()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role::text
  FROM public.usuarios
  WHERE auth_user_id = auth.uid()
    AND activo IS TRUE
  LIMIT 1
$$;

CREATE OR REPLACE FUNCTION public.aa_has_role(roles text[])
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(public.aa_current_role() = ANY(roles), false)
$$;

CREATE OR REPLACE FUNCTION public.aa_is_admin_or_coadmin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.aa_has_role(ARRAY['admin','coadmin'])
$$;

CREATE OR REPLACE FUNCTION public.aa_is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(public.aa_current_role() = 'admin', false)
$$;

-- 6) Activar RLS.
ALTER TABLE IF EXISTS public.articulos ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.pedidos ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.config ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.visitas ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.movimientos_cc ENABLE ROW LEVEL SECURITY;

-- 7) Borrar políticas anteriores para evitar huecos tipo "authenticated puede todo".
DO $$
DECLARE r record;
BEGIN
  FOR r IN
    SELECT schemaname, tablename, policyname
    FROM pg_policies
    WHERE schemaname='public'
      AND tablename IN ('articulos','clientes','pedidos','usuarios','config','visitas','movimientos_cc')
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', r.policyname, r.schemaname, r.tablename);
  END LOOP;
END $$;

-- 8) Políticas por tabla y rol.

-- USUARIOS: cada uno lee su perfil; admin/coadmin leen perfiles. Solo admin/coadmin gestionan.
CREATE POLICY usuarios_select_v21 ON public.usuarios
FOR SELECT TO authenticated
USING (auth.uid() = auth_user_id OR public.aa_is_admin_or_coadmin());

CREATE POLICY usuarios_insert_v21 ON public.usuarios
FOR INSERT TO authenticated
WITH CHECK (public.aa_is_admin_or_coadmin());

CREATE POLICY usuarios_update_v21 ON public.usuarios
FOR UPDATE TO authenticated
USING (public.aa_is_admin_or_coadmin())
WITH CHECK (public.aa_is_admin_or_coadmin());

CREATE POLICY usuarios_delete_v21 ON public.usuarios
FOR DELETE TO authenticated
USING (public.aa_is_admin());

-- ARTÍCULOS: todos los usuarios autenticados leen; solo admin/coadmin importan/editan/eliminan.
CREATE POLICY articulos_select_v21 ON public.articulos
FOR SELECT TO authenticated
USING (true);

CREATE POLICY articulos_insert_v21 ON public.articulos
FOR INSERT TO authenticated
WITH CHECK (public.aa_is_admin_or_coadmin());

CREATE POLICY articulos_update_v21 ON public.articulos
FOR UPDATE TO authenticated
USING (public.aa_is_admin_or_coadmin())
WITH CHECK (public.aa_is_admin_or_coadmin());

CREATE POLICY articulos_delete_v21 ON public.articulos
FOR DELETE TO authenticated
USING (public.aa_is_admin_or_coadmin());

-- CLIENTES: admin/coadmin ven todo; roles operativos ven activos.
CREATE POLICY clientes_select_v21 ON public.clientes
FOR SELECT TO authenticated
USING (public.aa_is_admin_or_coadmin() OR estado IS NULL OR estado = 'activo');

CREATE POLICY clientes_insert_v21 ON public.clientes
FOR INSERT TO authenticated
WITH CHECK (public.aa_has_role(ARRAY['admin','coadmin','preventista']));

CREATE POLICY clientes_update_v21 ON public.clientes
FOR UPDATE TO authenticated
USING (public.aa_has_role(ARRAY['admin','coadmin','preventista']))
WITH CHECK (public.aa_has_role(ARRAY['admin','coadmin','preventista']));

CREATE POLICY clientes_delete_v21 ON public.clientes
FOR DELETE TO authenticated
USING (public.aa_is_admin_or_coadmin());

-- PEDIDOS: se permite operar según el flujo actual; borrado solo admin/coadmin.
CREATE POLICY pedidos_select_v21 ON public.pedidos
FOR SELECT TO authenticated
USING (true);

CREATE POLICY pedidos_insert_v21 ON public.pedidos
FOR INSERT TO authenticated
WITH CHECK (public.aa_has_role(ARRAY['admin','coadmin','preventista']));

CREATE POLICY pedidos_update_v21 ON public.pedidos
FOR UPDATE TO authenticated
USING (public.aa_has_role(ARRAY['admin','coadmin','preventista','preparador']))
WITH CHECK (public.aa_has_role(ARRAY['admin','coadmin','preventista','preparador']));

CREATE POLICY pedidos_delete_v21 ON public.pedidos
FOR DELETE TO authenticated
USING (public.aa_is_admin_or_coadmin());

-- CUENTAS CORRIENTES / MOVIMIENTOS: todos los roles operativos pueden registrar; edición/borrado solo admin/coadmin.
CREATE POLICY movimientos_cc_select_v21 ON public.movimientos_cc
FOR SELECT TO authenticated
USING (true);

CREATE POLICY movimientos_cc_insert_v21 ON public.movimientos_cc
FOR INSERT TO authenticated
WITH CHECK (public.aa_has_role(ARRAY['admin','coadmin','preventista','preparador']));

CREATE POLICY movimientos_cc_update_v21 ON public.movimientos_cc
FOR UPDATE TO authenticated
USING (public.aa_is_admin_or_coadmin())
WITH CHECK (public.aa_is_admin_or_coadmin());

CREATE POLICY movimientos_cc_delete_v21 ON public.movimientos_cc
FOR DELETE TO authenticated
USING (public.aa_is_admin_or_coadmin());

-- VISITAS / GPS: admin/coadmin auditan todo; preventista ve y carga su recorrido.
CREATE POLICY visitas_select_v21 ON public.visitas
FOR SELECT TO authenticated
USING (public.aa_is_admin_or_coadmin() OR usuario_id::text = public.aa_current_user_id());

CREATE POLICY visitas_insert_v21 ON public.visitas
FOR INSERT TO authenticated
WITH CHECK (public.aa_is_admin_or_coadmin() OR usuario_id::text = public.aa_current_user_id());

CREATE POLICY visitas_update_v21 ON public.visitas
FOR UPDATE TO authenticated
USING (public.aa_is_admin_or_coadmin() OR usuario_id::text = public.aa_current_user_id())
WITH CHECK (public.aa_is_admin_or_coadmin() OR usuario_id::text = public.aa_current_user_id());

CREATE POLICY visitas_delete_v21 ON public.visitas
FOR DELETE TO authenticated
USING (public.aa_is_admin_or_coadmin());

-- CONFIG: todos leen; solo admin/coadmin escriben.
CREATE POLICY config_select_v21 ON public.config
FOR SELECT TO authenticated
USING (true);

CREATE POLICY config_insert_v21 ON public.config
FOR INSERT TO authenticated
WITH CHECK (public.aa_is_admin_or_coadmin());

CREATE POLICY config_update_v21 ON public.config
FOR UPDATE TO authenticated
USING (public.aa_is_admin_or_coadmin())
WITH CHECK (public.aa_is_admin_or_coadmin());

CREATE POLICY config_delete_v21 ON public.config
FOR DELETE TO authenticated
USING (public.aa_is_admin_or_coadmin());

-- 9) Verificación rápida.
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname='public'
  AND tablename IN ('articulos','clientes','pedidos','usuarios','config','visitas','movimientos_cc')
ORDER BY tablename;

SELECT tablename, policyname, cmd, qual, with_check
FROM pg_policies
WHERE schemaname='public'
ORDER BY tablename, policyname;

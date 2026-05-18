-- ALISTA AHORRO — V21 — Vincular perfiles de la app con Supabase Auth
-- Ejecutar DESPUÉS de crear usuarios en Authentication → Users
-- y DESPUÉS de ejecutar alista_ahorro_v21_seguridad_supabase.sql

-- ADMINISTRADOR
UPDATE public.usuarios u
SET auth_user_id = au.id,
    email = au.email,
    username = 'ADMINISTRADOR',
    nombre = 'Alejandro',
    role = 'admin',
    activo = true,
    permisos = COALESCE(u.permisos, '{}'::jsonb) || '{"max_desc":10,"desc_deshabilitado":false}'::jsonb
FROM auth.users au
WHERE lower(au.email) = 'administrador@alista.internal'
  AND u.id = 'root';

INSERT INTO public.usuarios(id, auth_user_id, email, username, nombre, role, activo, permisos)
SELECT 'root', au.id, au.email, 'ADMINISTRADOR', 'Alejandro', 'admin', true,
       '{"max_desc":10,"desc_deshabilitado":false}'::jsonb
FROM auth.users au
WHERE lower(au.email) = 'administrador@alista.internal'
  AND NOT EXISTS (SELECT 1 FROM public.usuarios WHERE id = 'root');

-- COADMIN
UPDATE public.usuarios u
SET auth_user_id = au.id,
    email = au.email,
    username = 'COADMIN',
    nombre = 'Co-Administrador',
    role = 'coadmin',
    activo = true,
    permisos = COALESCE(u.permisos, '{}'::jsonb) || '{"max_desc":10,"desc_deshabilitado":false}'::jsonb
FROM auth.users au
WHERE lower(au.email) = 'coadmin@alista.internal'
  AND lower(u.username) = 'coadmin';

INSERT INTO public.usuarios(id, auth_user_id, email, username, nombre, role, activo, permisos)
SELECT 'u_coadmin', au.id, au.email, 'COADMIN', 'Co-Administrador', 'coadmin', true,
       '{"max_desc":10,"desc_deshabilitado":false}'::jsonb
FROM auth.users au
WHERE lower(au.email) = 'coadmin@alista.internal'
  AND NOT EXISTS (SELECT 1 FROM public.usuarios WHERE lower(username) = 'coadmin');

-- CARLOS
UPDATE public.usuarios u
SET auth_user_id = au.id,
    email = au.email,
    username = 'carlos',
    nombre = COALESCE(NULLIF(u.nombre,''), 'Carlos Gómez'),
    role = 'preventista',
    activo = true,
    permisos = COALESCE(u.permisos, '{}'::jsonb) || '{"max_desc":5,"desc_deshabilitado":false}'::jsonb
FROM auth.users au
WHERE lower(au.email) = 'carlos@alista.internal'
  AND lower(u.username) = 'carlos';

INSERT INTO public.usuarios(id, auth_user_id, email, username, nombre, role, activo, permisos)
SELECT 'u1', au.id, au.email, 'carlos', 'Carlos Gómez', 'preventista', true,
       '{"max_desc":5,"desc_deshabilitado":false}'::jsonb
FROM auth.users au
WHERE lower(au.email) = 'carlos@alista.internal'
  AND NOT EXISTS (SELECT 1 FROM public.usuarios WHERE lower(username) = 'carlos');

-- MARIA
UPDATE public.usuarios u
SET auth_user_id = au.id,
    email = au.email,
    username = 'maria',
    nombre = COALESCE(NULLIF(u.nombre,''), 'María López'),
    role = 'preventista',
    activo = true,
    permisos = COALESCE(u.permisos, '{}'::jsonb) || '{"max_desc":5,"desc_deshabilitado":false}'::jsonb
FROM auth.users au
WHERE lower(au.email) = 'maria@alista.internal'
  AND lower(u.username) = 'maria';

INSERT INTO public.usuarios(id, auth_user_id, email, username, nombre, role, activo, permisos)
SELECT 'u2', au.id, au.email, 'maria', 'María López', 'preventista', true,
       '{"max_desc":5,"desc_deshabilitado":false}'::jsonb
FROM auth.users au
WHERE lower(au.email) = 'maria@alista.internal'
  AND NOT EXISTS (SELECT 1 FROM public.usuarios WHERE lower(username) = 'maria');

-- ROBERTO
UPDATE public.usuarios u
SET auth_user_id = au.id,
    email = au.email,
    username = 'roberto',
    nombre = COALESCE(NULLIF(u.nombre,''), 'Roberto Díaz'),
    role = 'preparador',
    activo = true,
    permisos = COALESCE(u.permisos, '{}'::jsonb)
FROM auth.users au
WHERE lower(au.email) = 'roberto@alista.internal'
  AND lower(u.username) = 'roberto';

INSERT INTO public.usuarios(id, auth_user_id, email, username, nombre, role, activo, permisos)
SELECT 'u3', au.id, au.email, 'roberto', 'Roberto Díaz', 'preparador', true,
       '{}'::jsonb
FROM auth.users au
WHERE lower(au.email) = 'roberto@alista.internal'
  AND NOT EXISTS (SELECT 1 FROM public.usuarios WHERE lower(username) = 'roberto');

-- VERIFICACIÓN FINAL: todos deberían decir vinculado = true
SELECT username, email, role, activo, (auth_user_id IS NOT NULL) AS vinculado
FROM public.usuarios
WHERE lower(username) IN ('administrador','coadmin','carlos','maria','roberto') OR id = 'root'
ORDER BY role, username;

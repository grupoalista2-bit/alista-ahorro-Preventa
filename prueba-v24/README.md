# ALISTA AHORRO v24 — Modular + Bootstrap

Esta versión separa la app en varios archivos para dejar de trabajar con un único `index.html` gigante.

## Estructura

```text
index.html
assets/
  css/app.css
  js/config.js
  js/config.example.js
  js/vendor-check.js
  js/app.js
supabase/
  sql/
    alista_ahorro_v21_seguridad_supabase.sql
    alista_ahorro_v21_vincular_usuarios_auth.sql
    alista_ahorro_v23_fix_rls_preparador.sql
SECURITY.md
```

## Cómo subir a GitHub Pages

1. Subí todo el contenido de esta carpeta al repositorio.
2. Mantené `index.html` en la raíz.
3. Mantené las carpetas `assets/` y `supabase/`.
4. Probá la URL oficial.

## Login

El login usa Supabase Auth. No se guardan contraseñas dentro del HTML ni dentro del código de la app.

## Bootstrap

Bootstrap 5.3.8 está cargado desde CDN. El CSS propio de la app está en `assets/css/app.css` y se carga después de Bootstrap para conservar el diseño de ALISTA AHORRO.

## Comercialización

Esta versión es un paso intermedio: ya está modularizada y más ordenada, pero para venderla a varios clientes conviene hacer una versión SaaS con:

- multiempresa / multitenant;
- Supabase Edge Functions para acciones administrativas;
- Storage con políticas para fotos;
- auditoría no editable;
- dominio propio y HTTPS;
- backups automáticos;
- términos de uso y política de privacidad.

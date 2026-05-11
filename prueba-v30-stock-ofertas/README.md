# ALISTA AHORRO v28 — Modular + Bootstrap + Objetivos + Ofertas Relámpago

Esta versión separa la app en varios archivos y agrega objetivos simples y ofertas relámpago para preventistas.

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

## V25 - Objetivos simples preventistas

Se agregó el módulo **Objetivos Preventistas** para admin/coadmin.
Permite cargar objetivos simples por período:

- visitas
- pedidos
- ventas
- cobranza

El preventista ve su avance en el Dashboard.
Antes de usarlo, ejecutar en Supabase SQL Editor:

`supabase/sql/alista_ahorro_v25_objetivos_preventistas.sql`


## V28 - Ofertas Relámpago

Ejecutar en Supabase SQL Editor:

```
supabase/sql/alista_ahorro_v26_ofertas_preventistas.sql
```

Admin/CoAdmin cargan ofertas desde el módulo **Ofertas Relámpago**. Preventistas ven solo ofertas relámpago activas y vigentes.


## V30 — Resumen de unidades vendidas

En `Todos los Pedidos`, el administrador/coadministrador puede exportar un Excel de unidades vendidas por artículo para descontar stock en Zona de Precios. El reporte usa pedidos Entregados/Finalizados y descuenta devoluciones registradas.

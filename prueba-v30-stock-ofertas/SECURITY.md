# Seguridad — ALISTA AHORRO

## Reglas importantes

- No guardar contraseñas en el frontend.
- No pegar claves `service_role` en `assets/js/config.js`.
- La clave del frontend debe ser publishable/anon y debe estar protegida con RLS en Supabase.
- Mantener Row Level Security activo en tablas sensibles.
- Crear usuarios reales desde Supabase Auth o desde una Edge Function segura, nunca desde HTML con una clave secreta.
- Para comercializar: separar acciones críticas en backend/Edge Functions.

## Tablas sensibles

- usuarios
- pedidos
- clientes
- movimientos_cc
- visitas
- articulos
- config

## Pendientes recomendados antes de vender

1. Mover creación de usuarios a una Edge Function.
2. Agregar Storage privado para fotos de clientes.
3. Agregar tabla `audit_log` append-only.
4. Validar que preparador no pueda cambiar descuentos desde API.
5. Validar que preventista no pueda modificar precios desde API.
6. Agregar backups automáticos diarios.
7. Agregar monitoreo de errores.

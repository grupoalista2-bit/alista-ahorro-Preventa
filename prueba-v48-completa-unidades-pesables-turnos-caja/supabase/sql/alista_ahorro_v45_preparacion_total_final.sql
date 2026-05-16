-- V45 - Preparacion: no requiere cambios de estructura.
-- Este archivo solo recarga cache de PostgREST por seguridad.
NOTIFY pgrst, 'reload schema';

-- V44 — corrección de comisiones, estadísticas y auditoría por rango
-- No borra datos. Agrega índices para acelerar pedidos, auditoría y movimientos.

CREATE INDEX IF NOT EXISTS idx_pedidos_estado ON public.pedidos (estado);
CREATE INDEX IF NOT EXISTS idx_pedidos_fecha ON public.pedidos (fecha);
CREATE INDEX IF NOT EXISTS idx_pedidos_fecha_entregado ON public.pedidos (fecha_entregado);
CREATE INDEX IF NOT EXISTS idx_pedidos_fecha_preparado ON public.pedidos (fecha_preparado);
CREATE INDEX IF NOT EXISTS idx_pedidos_preventista ON public.pedidos (preventista_id);

CREATE INDEX IF NOT EXISTS idx_movimientos_cc_fecha ON public.movimientos_cc (fecha);
CREATE INDEX IF NOT EXISTS idx_movimientos_cc_usuario ON public.movimientos_cc (usuario_id);
CREATE INDEX IF NOT EXISTS idx_visitas_fecha ON public.visitas (fecha);
CREATE INDEX IF NOT EXISTS idx_visitas_preventista ON public.visitas (preventista_id);
CREATE INDEX IF NOT EXISTS idx_auditoria_eventos_fecha_dia ON public.auditoria_eventos (fecha_dia);
CREATE INDEX IF NOT EXISTS idx_auditoria_eventos_usuario_fecha ON public.auditoria_eventos (usuario_id, fecha_dia);
CREATE INDEX IF NOT EXISTS idx_gps_puntos_usuario_fecha_dia ON public.gps_puntos (usuario_id, fecha_dia);

NOTIFY pgrst, 'reload schema';

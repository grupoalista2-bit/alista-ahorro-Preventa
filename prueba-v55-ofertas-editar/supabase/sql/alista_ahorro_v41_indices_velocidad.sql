-- ALISTA AHORRO V41 - índices de velocidad para clientes, pedidos, movimientos y GPS

CREATE INDEX IF NOT EXISTS idx_clientes_activo ON public.clientes (activo);
CREATE INDEX IF NOT EXISTS idx_clientes_inhabilitado ON public.clientes (inhabilitado);
CREATE INDEX IF NOT EXISTS idx_clientes_estado ON public.clientes (estado);
CREATE INDEX IF NOT EXISTS idx_clientes_deuda ON public.clientes (deuda);
CREATE INDEX IF NOT EXISTS idx_clientes_nombre ON public.clientes (nombre);
CREATE INDEX IF NOT EXISTS idx_clientes_apellido ON public.clientes (apellido);
CREATE INDEX IF NOT EXISTS idx_clientes_nombre_fantasia ON public.clientes (nombre_fantasia);
CREATE INDEX IF NOT EXISTS idx_clientes_updated_at ON public.clientes (updated_at DESC);

CREATE INDEX IF NOT EXISTS idx_movimientos_cc_cliente_id ON public.movimientos_cc (cliente_id);
CREATE INDEX IF NOT EXISTS idx_movimientos_cc_created_at ON public.movimientos_cc (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_movimientos_cc_fecha ON public.movimientos_cc (fecha);

CREATE INDEX IF NOT EXISTS idx_pedidos_estado ON public.pedidos (estado);
CREATE INDEX IF NOT EXISTS idx_pedidos_created_at ON public.pedidos (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_pedidos_preventista ON public.pedidos (preventista_id);

CREATE INDEX IF NOT EXISTS idx_gps_puntos_usuario_fecha ON public.gps_puntos (usuario_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_visitas_cliente_id ON public.visitas (cliente_id);
CREATE INDEX IF NOT EXISTS idx_visitas_fecha ON public.visitas (fecha);

NOTIFY pgrst, 'reload schema';

-- ALISTA AHORRO V43
-- Balance de recorrido offline/online para preventistas.
-- No borra datos. Crea una tabla de eventos de auditoría y agrega índices.

CREATE TABLE IF NOT EXISTS public.auditoria_eventos (
  id text PRIMARY KEY,
  usuario_id text,
  usuario_nombre text,
  rol text,
  fecha text,
  fecha_dia date,
  hora text,
  ts bigint,
  tipo text,
  accion text,
  cliente_id text,
  cliente_nombre text,
  pedido_id text,
  monto numeric DEFAULT 0,
  resultado text,
  observaciones text,
  lat double precision,
  lng double precision,
  accuracy double precision,
  gps_estado text DEFAULT 'sin_gps',
  sync_estado text DEFAULT 'sincronizado',
  sync_ts timestamptz,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.auditoria_eventos ENABLE ROW LEVEL SECURITY;

-- Políticas simples y seguras para la app con Supabase Auth.
-- Si ya existen, no se duplican.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='auditoria_eventos' AND policyname='aa_auditoria_eventos_select'
  ) THEN
    CREATE POLICY aa_auditoria_eventos_select ON public.auditoria_eventos
      FOR SELECT TO authenticated
      USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='auditoria_eventos' AND policyname='aa_auditoria_eventos_insert'
  ) THEN
    CREATE POLICY aa_auditoria_eventos_insert ON public.auditoria_eventos
      FOR INSERT TO authenticated
      WITH CHECK (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='auditoria_eventos' AND policyname='aa_auditoria_eventos_update'
  ) THEN
    CREATE POLICY aa_auditoria_eventos_update ON public.auditoria_eventos
      FOR UPDATE TO authenticated
      USING (true)
      WITH CHECK (true);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_auditoria_eventos_fecha_dia
ON public.auditoria_eventos (fecha_dia DESC);

CREATE INDEX IF NOT EXISTS idx_auditoria_eventos_usuario_fecha
ON public.auditoria_eventos (usuario_id, fecha_dia DESC, ts DESC);

CREATE INDEX IF NOT EXISTS idx_auditoria_eventos_tipo
ON public.auditoria_eventos (tipo);

CREATE INDEX IF NOT EXISTS idx_auditoria_eventos_cliente
ON public.auditoria_eventos (cliente_id);

-- Reforzar velocidad de tablas usadas en balance.
CREATE INDEX IF NOT EXISTS idx_visitas_preventista_fecha
ON public.visitas (preventista_id, fecha);

CREATE INDEX IF NOT EXISTS idx_movimientos_cc_usuario_fecha
ON public.movimientos_cc (usuario_id, fecha);

CREATE INDEX IF NOT EXISTS idx_pedidos_preventista_fecha
ON public.pedidos (preventista_id, fecha);

NOTIFY pgrst, 'reload schema';

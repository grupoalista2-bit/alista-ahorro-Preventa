-- ALISTA AHORRO V53 - Ofertas Relámpago Fix
-- Seguro: no borra datos. Asegura columnas usadas por la pantalla de ofertas.
ALTER TABLE public.ofertas_preventistas
ADD COLUMN IF NOT EXISTS articulo_id text,
ADD COLUMN IF NOT EXISTS cod text,
ADD COLUMN IF NOT EXISTS cod_art text,
ADD COLUMN IF NOT EXISTS descripcion text,
ADD COLUMN IF NOT EXISTS precio_regular numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS precio_oferta numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS costo numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS fecha_desde text,
ADD COLUMN IF NOT EXISTS fecha_hasta text,
ADD COLUMN IF NOT EXISTS stock_info text,
ADD COLUMN IF NOT EXISTS observacion text,
ADD COLUMN IF NOT EXISTS foto_url text,
ADD COLUMN IF NOT EXISTS mostrar_flyer boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS mostrar_precio_anterior boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS mostrar_vigencia boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS orden_flyer integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS activo boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS created_by text,
ADD COLUMN IF NOT EXISTS coincidencia_dudosa boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS estado_revision text DEFAULT 'ok',
ADD COLUMN IF NOT EXISTS revision_motivo text;

CREATE INDEX IF NOT EXISTS idx_ofertas_preventistas_activo ON public.ofertas_preventistas (activo);
CREATE INDEX IF NOT EXISTS idx_ofertas_preventistas_cod ON public.ofertas_preventistas (cod);
CREATE INDEX IF NOT EXISTS idx_ofertas_preventistas_articulo_id ON public.ofertas_preventistas (articulo_id);
CREATE INDEX IF NOT EXISTS idx_ofertas_preventistas_fecha_desde ON public.ofertas_preventistas (fecha_desde);
CREATE INDEX IF NOT EXISTS idx_ofertas_preventistas_fecha_hasta ON public.ofertas_preventistas (fecha_hasta);

NOTIFY pgrst, 'reload schema';

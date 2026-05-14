-- V23: permitir que el preparador ACTUALICE pedidos existentes.
-- No le da permisos para borrar ni administrar descuentos desde la app.

DROP POLICY IF EXISTS pedidos_update_v21 ON public.pedidos;

CREATE POLICY pedidos_update_v21
ON public.pedidos
FOR UPDATE
TO authenticated
USING (public.aa_has_role(ARRAY['admin','coadmin','preventista','preparador']))
WITH CHECK (public.aa_has_role(ARRAY['admin','coadmin','preventista','preparador']));

SELECT tablename, policyname, cmd, qual, with_check
FROM pg_policies
WHERE schemaname='public'
  AND tablename='pedidos'
ORDER BY policyname;

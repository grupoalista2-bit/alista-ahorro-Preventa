# ALISTA AHORRO — Prueba V43 Balance offline/online

Versión de prueba para mejorar el balance diario del preventista.

## Incluye

- Eventos de trabajo offline/online.
- Sincronización automática cuando vuelve internet.
- GPS opcional: si no hay GPS, igual guarda la acción.
- Balance admin por fecha y preventista.
- Búsqueda rápida de clientes y artículos de V42.

## SQL requerido

Ejecutar en Supabase:

`supabase/sql/alista_ahorro_v43_balance_offline_online.sql`

No borra datos.


## V47
Corrección de unidades vendidas y soporte para columna PESABLE en Excel.


## V47
Agrega Jornada / Caja por turno: apertura obligatoria para preventistas, cierre con resumen de efectivo, transferencias, cuenta corriente, cobros y total del turno.


## V51
Corrección de facturación por kg: productos pesables desde Excel, decimales en pedido/preparación y exportación de unidades vendidas con tipo KG/UNIDAD.

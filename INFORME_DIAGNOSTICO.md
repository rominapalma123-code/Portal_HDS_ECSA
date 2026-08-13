# INFORME DE DIAGNÓSTICO — Fichas de Seguridad (HDS)

**Fecha:** 13 de agosto de 2026
**Carpeta analizada:** `Seguridad y Salud en el Trabajo - 5. HDS Suspel`
**Total de fichas:** 332 PDFs

---

## QUÉ SE PUEDE LEER AUTOMÁTICAMENTE

| Estado | Cantidad | Porcentaje |
|---|---|---|
| ✅ Se leen sin problema | 271 | 81,6% |
| 📷 Escaneadas (foto — no se puede leer) | 58 | 17,5% |
| ⚠️ Con problemas técnicos | 3 | 0,9% |

**Conclusión:** 4 de cada 5 fichas son procesables automáticamente. Ese es un resultado muy bueno.

---

## ESTADO DE VIGENCIA (5 años desde la fecha de revisión)

De las 332 fichas, 82 traen fecha de revisión legible. El resto usa un formato distinto donde el parser aún no detecta la fecha — eso se puede ajustar.

| Estado | Cantidad |
|---|---|
| ✅ Vigentes | 11 |
| 🟡 Por vencer (próximos 6 meses) | 13 |
| 🔴 **VENCIDAS** | **58** |
| ❓ Sin fecha detectada | ~250 |

> **Nota:** 58 fichas están confirmadamente vencidas. Las ~250 sin fecha detectada pueden incluir más vencidas — ese número se va a aclarar cuando se ajuste el parser para los formatos nuevos.

---

## QUÉ INFORMACIÓN SE OBTIENE DE CADA FICHA

De las 271 fichas con texto, esto es lo que el programa logra leer:

| Campo | Fichas donde se encontró | Porcentaje |
|---|---|---|
| Componentes (ingredientes) | 224 / 271 | 82,7% |
| Primeros auxilios | 217 / 271 | 80,1% |
| Clasificación GHS (peligros) | 215 / 271 | 79,3% |
| Rombo NFPA | 145 / 271 | 53,5% |
| Fecha de revisión | 138 / 271 | 50,9% |
| Código de producto | 129 / 271 | 47,6% |

### Ejemplo real — ficha que salió completa

**Producto:** Beverage Base (`AC/B-0063.011-P1B`)
- **Estado:** Vencida (revisada el 26-oct-2019, venció el 26-oct-2024)
- **Rombo NFPA:** Salud 2 — Inflamabilidad y Reactividad: no declaradas en la ficha
- **Peligros GHS:** Lesiones oculares graves Cat. 2 (H319) — Palabra de advertencia: "Atención"
- **Componentes:** Sorbato de potasio (CAS 24634-61-5, 90–99%)
- **Primeros auxilios:**
  - Ojos: Enjuagar con abundante agua al menos 15 minutos
  - Piel: Lavar con agua y jabón
  - Inhalación: Transportar al exterior
  - Ingestión: Limpiar la boca y beber agua abundante
- **Teléfono de emergencia:** 56-2-27771994

Los datos salen limpios y ordenados. La calidad es buena donde el formato es el esperado.

---

## POR QUÉ HAY TANTOS "PARCIALES"

Hay 271 fichas con texto, pero solo 37 salen con todos los campos. Las otras 234 tienen información pero en formatos distintos al esperado. Los grupos principales:

- Fichas con prefijo `12.AFF`: 12 fichas — formato diferente al parser actual
- Fichas `MS21xxxxx`: 8 fichas — formato estandarizado diferente
- Fichas `PAADN / PEADN / ORADN`: 17 fichas — probablemente mismo proveedor
- Fichas `71994 PIS-`: 5 fichas — formato argentino
- Fichas `GLANBIA`: 6 fichas — proveedor específico

Esto es normal. Con una o dos sesiones de ajuste al parser, la mayoría quedarían cubiertos.

---

## CONCLUSIÓN — ¿ES VIABLE EL PROYECTO?

**Sí, el proyecto es viable.**

- El 81,6% de las fichas se puede leer automáticamente (por encima del umbral de 70%).
- Los datos que salen son limpios y útiles (primeros auxilios, NFPA, componentes).
- Los 58 escaneados son el mayor desafío: hay que pedir el PDF digital al proveedor o cargarlos a mano.

**Lo que falta antes de publicar el portal:**
1. Ajustar el parser para los distintos formatos de proveedores (estimado 1–2 semanas de trabajo técnico)
2. Resolver las 58 fichas escaneadas (pedir digital al proveedor o carga manual)
3. Confirmar qué hacer con los PDFs sin fecha detectada
4. Definir las decisiones de diseño (ver sección siguiente)

---

## PREGUNTAS PARA ROMI (decisiones de prevencionista)

1. **Al escanear el QR en una emergencia, ¿qué aparece primero?** ¿El rombo NFPA? ¿Los primeros auxilios? ¿El teléfono de emergencia?

2. **¿El QR va por sustancia o por área de la planta?** El portal hoy está armado por área.

3. **Cuando la ficha no declara un valor del rombo NFPA, ¿qué se muestra?** El portal actual muestra "0" (parece "sin riesgo" cuando es "no sabemos"). ¿Lo cambiamos a "no especificado"?

4. **Las fichas vencidas, ¿se muestran con advertencia visible, o se ocultan?**

---

## NOTA FINAL

**No se modificó nada del portal durante este diagnóstico.**
El detalle ficha por ficha quedó en `diagnostico.csv` dentro de la carpeta de SharePoint.

---

## DECISIONES CONFIRMADAS POR ROMI — 13 agosto 2026

**1. QR:** El código QR simplemente abre la página del portal. No requiere lógica especial — es un link directo. Queda para cuando el portal esté publicado.

**2. QR por área o por sustancia:** El portal sigue organizado por área (tal como está hoy). El QR apunta a la página general.

**3. Rombo NFPA sin valor declarado:** Se **omite** ese valor. No se muestra "0" ni "no especificado" — simplemente no aparece si la ficha no lo declara.

**4. Fichas vencidas:** Se **muestran igual**, pero con una advertencia visible (discreta, no alarmante). No se ocultan.

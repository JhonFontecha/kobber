-- Corrección de claves confirmadas contra el PDF del catálogo Truper.
-- Generado el 2026-11-25. NO es un cambio de esquema. NO se corrió en producción.
-- Alcance: solo variantes que hoy están publicadas en la tienda.
-- Cada cambio exige el mismo código numérico, el mismo precio de distribuidor
-- y la clave leída en la página del PDF. Si la ficha publicada describe otra
-- medida o el banco no coincide con la página, la fila se deja como está.
--
-- No se toca order_items.clave: ahí quedó el texto del pedido ya hecho.
-- El update solo corre si la variante sigue con la clave vieja y ninguna
-- otra variante tiene ya la clave nueva.
--
-- Correcciones: 71 variantes.
-- Fotos a insertar: 233 URLs, en 70 variantes.
-- Productos que no tenían ninguna foto y ahora sí: 31.
-- Sin foto en el banco, se corrige solo la clave: ASP-20AS->ASP-20MS (103936).
--
-- El detalle de las 536 variantes publicadas está en
-- reports/conciliacion_pdf_catalogo.csv.
--
-- Decisiones que quedan para el dueño (la página se leyó y no alcanza para cambiar solo):
-- Aspiradoras inalámbricas para auto, 20 V | ASPI-20A -> PDF ASP-20A | 103955 | publicado $465000 | PDF $465000 | Página 26: código 103955, clave ASP-20A, precio $465,000. aspiradora inalámbrica para auto 20 V, 7.5 L; la clave impresa es ASP-20A. No se cambia: la clave destino ya la tiene otra
-- Aspiradoras plásticas | ASP-06 -> PDF FILP-ASPI-G1 | 12082 | publicado $267000 | PDF $40000 | Página 25 imprime FILP-ASPI-G1 a $40,000 y lo publicado es ASP-06 a $267,000. bolsa para polvo.
-- Báscula electrónica de pilas | BASE-3A -> PDF BASE-05B | 102316 | publicado $39000 | PDF $39000 | Página 29 imprime BASE-05B a $39,000. el PDF es la báscula de bolsillo de 500 g y la ficha publicada dice 3 kg.
-- Básculas electrónicas de alta precisión | BASE-USB -> PDF BASE-3 | 102317 | publicado $68000 | PDF $66000 | Página 29 imprime BASE-3 a $66,000 y lo publicado es BASE-USB a $68,000. báscula de precisión recargable 3 kg.
-- Básculas electrónicas grameras, 5 kg | BASE-BEC -> PDF BASE-5EC | 15160 | publicado $30500 | PDF $30500 | Página 29 imprime BASE-5EC a $30,500. el PDF marca plato de vidrio y la ficha publicada dice cuerpo de acero inoxidable.
-- Brocas escalonadas | BES-9 -> PDF BES-12 | 12125 | publicado $39000 | PDF $51000 | Página 38 imprime BES-12 a $51,000 y lo publicado es BES-9 a $39,000. broca escalonada de 12 escalones.
-- Candados de hierro con coraza | CHR-404 -> PDF CH-38 | 43315 | publicado $21000 | PDF $7600 | Página 52 imprime CH-38 a $7,600 y lo publicado es CHR-404 a $21,000. candado de hierro, gancho corto, medidas 38 mm.
-- Candados de hierro, gancho corto | CH-32 -> PDF CH-38 | 43315 | publicado $5700 | PDF $7600 | Página 52 imprime CH-38 a $7,600 y lo publicado es CH-32 a $5,700. candado de hierro, gancho corto, medidas 38 mm.
-- Candados de hierro, gancho corto | CH-38 -> PDF CH-38 | 43315 | publicado $7500 | PDF $7600 | Página 52: la clave CH-38 coincide, pero el precio impreso es $7,600 y el publicado es $7,500.
-- Candados de hierro, gancho corto | CH-50 -> PDF CA-65LQ | 43337 | publicado $12000 | PDF $40000 | Página 52 imprime CA-65LQ a $40,000 y lo publicado es CH-50 a $12,000. candado redondo 65 mm, gancho largo; 54 mm es la medida A del gancho.
-- Candados de hierro, gancho largo | CH-3XL -> PDF CH-25L | 43797 | publicado $4500 | PDF $4500 | Página 52 imprime CH-25L a $4,500. el PDF imprime CH-25L con medida A de 25 mm y la ficha publicada dice 30 mm.
-- Destornilladores punta pala, empuñadura Co | DR-3/16I6B -> PDF DR-3/16X6B | 100832 | publicado $5900 | PDF $6500 | Página 85 imprime DR-3/16X6B a $6,500 y lo publicado es DR-3/16I6B a $5,900. pala Comfort Grip 3/16 x 6"; el precio impreso no es el publicado.
-- Destornilladores punta pala, empuñadura Co | DR-1/4I4B -> PDF DR-1/4X4B | 13998 | publicado $6500 | PDF $7200 | Página 85 imprime DR-1/4X4B a $7,200 y lo publicado es DR-1/4I4B a $6,500. pala Comfort Grip 1/4 x 4"; el precio impreso no es el publicado.
-- Destornilladores punta pala, empuñadura Co | DR-1/4I6B -> PDF DR-1/4X8B | 100833 | publicado $7500 | PDF $7900 | Página 85 imprime DR-1/4X8B a $7,900 y lo publicado es DR-1/4I6B a $7,500. pala Comfort Grip 1/4 x 8".
-- Destornilladores punta phillips, empuñadur | DP-3/16I3B -> PDF DR-1/4X8B | 100833 | publicado $4500 | PDF $7900 | Página 85 imprime DR-1/4X8B a $7,900 y lo publicado es DP-3/16I3B a $4,500. pala Comfort Grip 1/4 x 8".
-- Destornilladores punta phillips, empuñadur | DP-3/16I6B -> PDF DP-3/16X6B | 14067 | publicado $6200 | PDF $6500 | Página 85 imprime DP-3/16X6B a $6,500 y lo publicado es DP-3/16I6B a $6,200. phillips Comfort Grip 3/16 x 6"; el precio impreso no es el publicado.
-- Destornilladores punta phillips, empuñadur | DP-1/4I1-I/2B -> PDF DP-1/4X1-1/2B | 14073 | publicado $7200 | PDF $5200 | Página 85 imprime DP-1/4X1-1/2B a $5,200 y lo publicado es DP-1/4I1-I/2B a $7,200. phillips Comfort Grip 1/4 x 1-1/2"; el precio impreso no es el publicado.
-- Destornilladores punta phillips, empuñadur | DP-1/4I8B -> PDF DP-1/4X8B | 14082 | publicado $9000 | PDF $7900 | Página 85 imprime DP-1/4X8B a $7,900 y lo publicado es DP-1/4I8B a $9,000. phillips Comfort Grip 1/4 x 8"; el precio impreso no es el publicado.
-- Filtros y bolsas para aspiradoras — Filtro | FILC-ASP-GI -> PDF FILC-AS-6X-G1 | 12085 | publicado $56000 | PDF $56000 | Página 25 imprime FILC-AS-6X-G1 a $56,000. el PDF imprime FILC-AS-6X-G1 y el banco dice FILC-ASPI-G1.
-- Juego de bisturís con 13 cuchillas | EXA-5P -> PDF EXA-3P | 22409 | publicado $15000 | PDF $15000 | Página 31 imprime EXA-3P a $15,000. el PDF imprime EXA-3P y el banco dice EXA-13P; el título de la página habla de 13 cuchillas.
-- Juegos de llaves bristol cortas, punta rec | ALE-10P -> PDF ALL-10P | 15539 | publicado $15000 | PDF $15000 | Página 140: código 15539, clave ALL-10P, precio $15,000. 10 llaves cortas pulgadas. No se cambia: la clave destino ya la tiene otra variante publicada.
-- Juegos de llaves bristol largas, punta de  | ALLB-10 -> PDF ALLX-10P | 13643 | publicado $24000 | PDF $24000 | Página 140 imprime ALLX-10P a $24,000. el PDF es el juego en pulgadas ALLX-10P y la ficha publicada lista medidas en milímetros.
-- Juegos de llaves bristol tipo navaja, cuer | ALL-9P -> PDF ALL-8P | 15556 | publicado $15000 | PDF $15000 | Página 140 imprime ALL-8P a $15,000. el PDF es un juego de 8 llaves (ALL-8P) y la ficha publicada dice 9.
-- Juegos de llaves bristol tipo navaja, cuer | ALL-9 -> PDF TORX-9 | 15554 | publicado $13000 | PDF $16000 | Página 141 imprime TORX-9 a $16,000 y lo publicado es ALL-9 a $13,000. 9 llaves torx cortas, no llaves hexagonales en mm.
-- Juegos de llaves bristol, organizador plás | ALL-10P -> PDF ALL-10P-P | 21854 | publicado $9000 | PDF $11000 | Página 140 imprime ALL-10P-P a $11,000 y lo publicado es ALL-10P a $9,000. 10 llaves pulgadas, organizador plástico.
--
-- Otras 27 variantes tienen el código en el PDF, pero la fila no se leyó
-- con claridad y la clave no coincide con el banco. Están en el CSV como decision_dueno.

begin;

-- 1. Claves. Primero las que liberan una clave que otra variante va a tomar.
update public.product_variants v
set clave = 'AFI-CU'
where v.id = '9a3b05a3-0fb2-4dbf-b73b-90fbddd7977e'
  and v.clave = 'AFI-CD'
  and not exists (select 1 from public.product_variants o where o.clave = 'AFI-CU' and o.id <> v.id);
update public.product_variants v
set clave = 'PCT-8K'
where v.id = '942c5840-57fe-42f2-ac68-d018f48b83f0'
  and v.clave = 'PCT-BK'
  and not exists (select 1 from public.product_variants o where o.clave = 'PCT-8K' and o.id <> v.id);
update public.product_variants v
set clave = 'ASD-180'
where v.id = 'e9022fac-eac2-4a03-a8d9-ba49009a172d'
  and v.clave = 'ASR-180'
  and not exists (select 1 from public.product_variants o where o.clave = 'ASD-180' and o.id <> v.id);
update public.product_variants v
set clave = 'ASP-20MS'
where v.id = '7ade200f-fac1-49ee-837a-2203ea1c101f'
  and v.clave = 'ASP-20AS'
  and not exists (select 1 from public.product_variants o where o.clave = 'ASP-20MS' and o.id <> v.id);
update public.product_variants v
set clave = 'BACO-120'
where v.id = '6dcf0bcb-df73-4bf2-acc3-13361baad53f'
  and v.clave = 'BACD-120'
  and not exists (select 1 from public.product_variants o where o.clave = 'BACO-120' and o.id <> v.id);
update public.product_variants v
set clave = 'BACO-130'
where v.id = 'bcb56e88-4118-4ff3-bd0a-c728f5ced16d'
  and v.clave = 'BACD-135'
  and not exists (select 1 from public.product_variants o where o.clave = 'BACO-130' and o.id <> v.id);
update public.product_variants v
set clave = 'BACO-140'
where v.id = '3f4d39c9-07c0-46ae-ab82-c226225278eb'
  and v.clave = 'BACD-140'
  and not exists (select 1 from public.product_variants o where o.clave = 'BACO-140' and o.id <> v.id);
update public.product_variants v
set clave = 'BACO-150'
where v.id = 'e0ec0821-98b0-48f2-8c9f-17aeded3a39b'
  and v.clave = 'BACD-150'
  and not exists (select 1 from public.product_variants o where o.clave = 'BACO-150' and o.id <> v.id);
update public.product_variants v
set clave = 'BAS-200PLA'
where v.id = '1b5763f4-6d3b-4fc5-b676-9c287c038651'
  and v.clave = 'BAS-500PLA'
  and not exists (select 1 from public.product_variants o where o.clave = 'BAS-200PLA' and o.id <> v.id);
update public.product_variants v
set clave = 'BASE-5EPP'
where v.id = '36d41258-7e0d-4136-bd7f-e19e3b8f5acf'
  and v.clave = 'BASE-5PP'
  and not exists (select 1 from public.product_variants o where o.clave = 'BASE-5EPP' and o.id <> v.id);
update public.product_variants v
set clave = 'BASE-5T'
where v.id = 'b2d21318-d556-4b5a-8eb9-3a119c8c4ca8'
  and v.clave = 'BASE-ST'
  and not exists (select 1 from public.product_variants o where o.clave = 'BASE-5T' and o.id <> v.id);
update public.product_variants v
set clave = 'BASE-5EP'
where v.id = 'f81d7cd6-3a14-48e8-85bb-b60767e56886'
  and v.clave = 'BASE-SEP'
  and not exists (select 1 from public.product_variants o where o.clave = 'BASE-5EP' and o.id <> v.id);
update public.product_variants v
set clave = 'BASE-40T'
where v.id = '3cb19f1b-3543-41d7-97d7-25d132ae34bd'
  and v.clave = 'BASE-401'
  and not exists (select 1 from public.product_variants o where o.clave = 'BASE-40T' and o.id <> v.id);
update public.product_variants v
set clave = 'BASE-40U'
where v.id = '55310c7c-11eb-427c-906e-ab1ad6521481'
  and v.clave = 'BASE-40I'
  and not exists (select 1 from public.product_variants o where o.clave = 'BASE-40U' and o.id <> v.id);
update public.product_variants v
set clave = 'CUT-6XX'
where v.id = 'a18bf174-77b6-4975-a658-e035876dbb54'
  and v.clave = 'CUT-6X3'
  and not exists (select 1 from public.product_variants o where o.clave = 'CUT-6XX' and o.id <> v.id);
update public.product_variants v
set clave = 'REP-CUTEX'
where v.id = '55e50a22-f4c3-4b98-8215-b50b3e1e40f4'
  and v.clave = 'REP-5013'
  and not exists (select 1 from public.product_variants o where o.clave = 'REP-CUTEX' and o.id <> v.id);
update public.product_variants v
set clave = 'BOPE-60'
where v.id = '157658a6-38f9-4dc5-b949-8a321aeb7729'
  and v.clave = 'BOM-F-60'
  and not exists (select 1 from public.product_variants o where o.clave = 'BOPE-60' and o.id <> v.id);
update public.product_variants v
set clave = 'BOMEX-28'
where v.id = '0749e8d9-3799-4d29-add1-df61378b5b18'
  and v.clave = 'BOME3-2B'
  and not exists (select 1 from public.product_variants o where o.clave = 'BOMEX-28' and o.id <> v.id);
update public.product_variants v
set clave = 'BOMEX-25'
where v.id = 'ad1fcf17-693e-463f-b843-c2e13e3a41f4'
  and v.clave = 'BOME3-3I'
  and not exists (select 1 from public.product_variants o where o.clave = 'BOMEX-25' and o.id <> v.id);
update public.product_variants v
set clave = 'BOMEX-31'
where v.id = 'd022a74c-4f07-48a3-b4b1-2bd3659097de'
  and v.clave = 'BOME3-3S'
  and not exists (select 1 from public.product_variants o where o.clave = 'BOMEX-31' and o.id <> v.id);
update public.product_variants v
set clave = 'BOMEX-35'
where v.id = 'd0f1da9b-a3c1-4d1b-aeb3-36c575a3a944'
  and v.clave = 'BOME3-3S'
  and not exists (select 1 from public.product_variants o where o.clave = 'BOMEX-35' and o.id <> v.id);
update public.product_variants v
set clave = 'CA-65Q'
where v.id = 'b3e6e3d5-814f-4706-b4e3-1a829da948f8'
  and v.clave = 'CA-650'
  and not exists (select 1 from public.product_variants o where o.clave = 'CA-65Q' and o.id <> v.id);
update public.product_variants v
set clave = 'CA-65LQ'
where v.id = '6ef459c5-1c4a-4bce-8cc0-c1c498d177c8'
  and v.clave = 'CA-65LO'
  and not exists (select 1 from public.product_variants o where o.clave = 'CA-65LQ' and o.id <> v.id);
update public.product_variants v
set clave = 'CH-20P'
where v.id = '1e22140b-5a5a-4544-8c78-bf8b40e3205e'
  and v.clave = 'CH-25P'
  and not exists (select 1 from public.product_variants o where o.clave = 'CH-20P' and o.id <> v.id);
update public.product_variants v
set clave = 'CHR-40A'
where v.id = '8c288c5c-16e9-4066-bec4-b305918239f9'
  and v.clave = 'CHR-404'
  and not exists (select 1 from public.product_variants o where o.clave = 'CHR-40A' and o.id <> v.id);
update public.product_variants v
set clave = 'CHR-50A'
where v.id = 'f320c7c0-afd6-42c6-bcbd-375694ff2d9e'
  and v.clave = 'CHR-504'
  and not exists (select 1 from public.product_variants o where o.clave = 'CHR-50A' and o.id <> v.id);
update public.product_variants v
set clave = 'REP-CUT-650'
where v.id = 'b14783ac-438b-4f61-abbc-fcfed7cdf63e'
  and v.clave = 'REP-CUT-65S'
  and not exists (select 1 from public.product_variants o where o.clave = 'REP-CUT-650' and o.id <> v.id);
update public.product_variants v
set clave = 'DG-1/8X4B'
where v.id = 'ad153d62-04a0-4d0f-bdba-5ad4d61eeb0c'
  and v.clave = 'DG-1/8I4B'
  and not exists (select 1 from public.product_variants o where o.clave = 'DG-1/8X4B' and o.id <> v.id);
update public.product_variants v
set clave = 'DR-3/16X3B'
where v.id = '7f0aee70-d037-4109-a87d-69ad0aef691d'
  and v.clave = 'DR-3/16I3B'
  and not exists (select 1 from public.product_variants o where o.clave = 'DR-3/16X3B' and o.id <> v.id);
update public.product_variants v
set clave = 'DR-3/16X4B'
where v.id = '82a94aed-1d4d-4706-a102-15b20a157835'
  and v.clave = 'DR-3/16I4B'
  and not exists (select 1 from public.product_variants o where o.clave = 'DR-3/16X4B' and o.id <> v.id);
update public.product_variants v
set clave = 'DR-1/4X1-1/2B'
where v.id = '97dd3e68-0efa-466c-a421-5e91be40dde3'
  and v.clave = 'DR-1/4I1-I/2B'
  and not exists (select 1 from public.product_variants o where o.clave = 'DR-1/4X1-1/2B' and o.id <> v.id);
update public.product_variants v
set clave = 'DR-1/4X8B'
where v.id = 'd1a44ea5-2aa9-4851-98bc-97857399dd94'
  and v.clave = 'DR-1/4I8B'
  and not exists (select 1 from public.product_variants o where o.clave = 'DR-1/4X8B' and o.id <> v.id);
update public.product_variants v
set clave = 'DP-1/8X2-1/2B'
where v.id = '8656b72f-36b6-4715-93ce-6dc4995f5507'
  and v.clave = 'DP-1X8I2-I/28'
  and not exists (select 1 from public.product_variants o where o.clave = 'DP-1/8X2-1/2B' and o.id <> v.id);
update public.product_variants v
set clave = 'DP-1/8X4B'
where v.id = 'd56ac7ed-9b78-42c3-8ffc-3bb62b846369'
  and v.clave = 'DP-1/8I4B'
  and not exists (select 1 from public.product_variants o where o.clave = 'DP-1/8X4B' and o.id <> v.id);
update public.product_variants v
set clave = 'DP-1/8X6B'
where v.id = 'b898ffe8-879f-44ac-9857-08b8a6bbd31d'
  and v.clave = 'DP-1/8I6B'
  and not exists (select 1 from public.product_variants o where o.clave = 'DP-1/8X6B' and o.id <> v.id);
update public.product_variants v
set clave = 'DP-3/16X8B'
where v.id = 'be84053e-7600-4f7d-9271-a042febcf40c'
  and v.clave = 'DP-3/16I8B'
  and not exists (select 1 from public.product_variants o where o.clave = 'DP-3/16X8B' and o.id <> v.id);
update public.product_variants v
set clave = 'DP-1/4X4B'
where v.id = '5915fb30-e682-4a86-bc23-ea42e7ec5e9e'
  and v.clave = 'DP-1/4I4B'
  and not exists (select 1 from public.product_variants o where o.clave = 'DP-1/4X4B' and o.id <> v.id);
update public.product_variants v
set clave = 'FILP-ASPI-G2'
where v.id = '77524a22-71a7-4f20-8270-c6d1cd623121'
  and v.clave = 'FILP-ASPI-62'
  and not exists (select 1 from public.product_variants o where o.clave = 'FILP-ASPI-G2' and o.id <> v.id);
update public.product_variants v
set clave = 'FILP-ASPI-G1'
where v.id = '619beadb-5bcf-46cf-8ff3-a0e16eb6fbbd'
  and v.clave = 'FILP-ASPI-GI'
  and not exists (select 1 from public.product_variants o where o.clave = 'FILP-ASPI-G1' and o.id <> v.id);
update public.product_variants v
set clave = 'FILF-ASPI-12-16'
where v.id = '420d3e02-ea47-4f7d-a74a-fc5edeaee955'
  and v.clave = 'FILP-ASP-12-16'
  and not exists (select 1 from public.product_variants o where o.clave = 'FILF-ASPI-12-16' and o.id <> v.id);
update public.product_variants v
set clave = 'FE-AS-8X-16X'
where v.id = '37c4db69-556c-4254-9707-4e4d2eadcad6'
  and v.clave = 'FEA-8X-16X'
  and not exists (select 1 from public.product_variants o where o.clave = 'FE-AS-8X-16X' and o.id <> v.id);
update public.product_variants v
set clave = 'FILE-ASPI-G2'
where v.id = '29e2bd33-5765-4e09-ac99-63c883170543'
  and v.clave = 'FILE-ASPI-62'
  and not exists (select 1 from public.product_variants o where o.clave = 'FILE-ASPI-G2' and o.id <> v.id);
update public.product_variants v
set clave = 'FILE-ASPI-G1'
where v.id = 'b291d3cf-054f-4f3e-a954-0ff45398c82e'
  and v.clave = 'FILE-ASPI-GI'
  and not exists (select 1 from public.product_variants o where o.clave = 'FILE-ASPI-G1' and o.id <> v.id);
update public.product_variants v
set clave = 'FIL-ASPI-G2'
where v.id = '865cbe5c-ea9f-46fb-88af-639edf928490'
  and v.clave = 'FIL-ASPI-62'
  and not exists (select 1 from public.product_variants o where o.clave = 'FIL-ASPI-G2' and o.id <> v.id);
update public.product_variants v
set clave = 'FIL-ASPI-G1'
where v.id = '22db4ada-727f-4125-8eb2-88adb45a3b4e'
  and v.clave = 'FIL-ASPI-GI'
  and not exists (select 1 from public.product_variants o where o.clave = 'FIL-ASPI-G1' and o.id <> v.id);
update public.product_variants v
set clave = 'ALL-25'
where v.id = '9f368b61-170b-4436-b22c-339d0d22c6db'
  and v.clave = 'ALLX-25'
  and not exists (select 1 from public.product_variants o where o.clave = 'ALL-25' and o.id <> v.id);
update public.product_variants v
set clave = 'JBAV-5R'
where v.id = '5f41b30d-6e6c-4a31-9a29-5080cdd53902'
  and v.clave = 'JBAV-5B'
  and not exists (select 1 from public.product_variants o where o.clave = 'JBAV-5R' and o.id <> v.id);
update public.product_variants v
set clave = 'TORX-8TLX'
where v.id = 'b2580de6-5393-48c0-a1c4-a8e257291aba'
  and v.clave = 'TORX-8TX'
  and not exists (select 1 from public.product_variants o where o.clave = 'TORX-8TLX' and o.id <> v.id);
update public.product_variants v
set clave = 'JBMX-9P'
where v.id = '91a6aeeb-7a95-447b-9aa7-ea2ba49283d2'
  and v.clave = 'JBMV-9P'
  and not exists (select 1 from public.product_variants o where o.clave = 'JBMX-9P' and o.id <> v.id);
update public.product_variants v
set clave = 'JBMX-9'
where v.id = '109391b8-9186-4679-86dd-9aea41173db3'
  and v.clave = 'JBMI-9'
  and not exists (select 1 from public.product_variants o where o.clave = 'JBMX-9' and o.id <> v.id);
update public.product_variants v
set clave = 'EXA-11'
where v.id = '0f2d9dd7-0d59-48fd-9be9-8f70c85e77fd'
  and v.clave = 'EXA-13'
  and not exists (select 1 from public.product_variants o where o.clave = 'EXA-11' and o.id <> v.id);
update public.product_variants v
set clave = 'JBS-5'
where v.id = '0d61e938-d014-4782-9fc0-36bc5485f0d5'
  and v.clave = 'JSDS-5'
  and not exists (select 1 from public.product_variants o where o.clave = 'JBS-5' and o.id <> v.id);
update public.product_variants v
set clave = 'ALL-10M'
where v.id = '314bc94e-1369-4294-bced-f80e9e395c56'
  and v.clave = 'ALE-10M'
  and not exists (select 1 from public.product_variants o where o.clave = 'ALL-10M' and o.id <> v.id);
update public.product_variants v
set clave = 'ALLX-7P'
where v.id = '42638085-be29-492d-ade7-13b622ae0ad5'
  and v.clave = 'ALLB-7P'
  and not exists (select 1 from public.product_variants o where o.clave = 'ALLX-7P' and o.id <> v.id);
update public.product_variants v
set clave = 'ALLX-7M'
where v.id = '0d42e7b5-b316-4c1f-87e8-57ab8271d6be'
  and v.clave = 'ALLB-7M'
  and not exists (select 1 from public.product_variants o where o.clave = 'ALLX-7M' and o.id <> v.id);
update public.product_variants v
set clave = 'ALLX-10M'
where v.id = 'edc467eb-62c4-4dfd-98b4-0be0e632d32b'
  and v.clave = 'ALLB-10M'
  and not exists (select 1 from public.product_variants o where o.clave = 'ALLX-10M' and o.id <> v.id);
update public.product_variants v
set clave = 'ALLX-13P'
where v.id = 'bd616b95-1d2d-4f02-9436-cfbfdb21557b'
  and v.clave = 'ALLB-13P'
  and not exists (select 1 from public.product_variants o where o.clave = 'ALLX-13P' and o.id <> v.id);
update public.product_variants v
set clave = 'ALLX-13M'
where v.id = 'c7da0c48-296d-4d5d-bdf5-4a612f16e749'
  and v.clave = 'ALLB-13M'
  and not exists (select 1 from public.product_variants o where o.clave = 'ALLX-13M' and o.id <> v.id);
update public.product_variants v
set clave = 'ALL-9M'
where v.id = '2bf92244-c4b1-45fd-b149-9ecc1b410a26'
  and v.clave = 'ALL-9N'
  and not exists (select 1 from public.product_variants o where o.clave = 'ALL-9M' and o.id <> v.id);
update public.product_variants v
set clave = 'ALL-13P-P'
where v.id = 'd2f8b519-3adb-4e90-9496-bd9fbac84380'
  and v.clave = 'ALL-13P'
  and not exists (select 1 from public.product_variants o where o.clave = 'ALL-13P-P' and o.id <> v.id);
update public.product_variants v
set clave = 'ALL-13M-P'
where v.id = '68568f47-7f73-495a-ba21-a3fcd6bc87f8'
  and v.clave = 'ALL-13M'
  and not exists (select 1 from public.product_variants o where o.clave = 'ALL-13M-P' and o.id <> v.id);
update public.product_variants v
set clave = 'ALL-P8P'
where v.id = '35c2393d-395b-46ad-b668-2fa07c472344'
  and v.clave = 'ALL-PBP'
  and not exists (select 1 from public.product_variants o where o.clave = 'ALL-P8P' and o.id <> v.id);
update public.product_variants v
set clave = 'ALL-P8M'
where v.id = '166f7de7-4d94-46a1-b0b4-5f3a2fbf953b'
  and v.clave = 'ALL-PBM'
  and not exists (select 1 from public.product_variants o where o.clave = 'ALL-P8M' and o.id <> v.id);
update public.product_variants v
set clave = 'MOTB-2'
where v.id = '9056c2f3-e2aa-4a52-acd9-b8f024f73633'
  and v.clave = 'MOTT-2'
  and not exists (select 1 from public.product_variants o where o.clave = 'MOTB-2' and o.id <> v.id);
update public.product_variants v
set clave = 'SICI-7-1/4P'
where v.id = 'a7b9edc0-5901-45d4-86f3-d14d9663d2c1'
  and v.clave = 'SICI-7-I/4P'
  and not exists (select 1 from public.product_variants o where o.clave = 'SICI-7-1/4P' and o.id <> v.id);
update public.product_variants v
set clave = 'SICI-7-1/4A3'
where v.id = '71ff7362-6d8c-4272-84d6-d4d29cd9ff44'
  and v.clave = 'SICI-7-I/4A3'
  and not exists (select 1 from public.product_variants o where o.clave = 'SICI-7-1/4A3' and o.id <> v.id);
update public.product_variants v
set clave = 'SICI-7-1/4N4'
where v.id = '41f7a853-9275-445a-a125-b4772d4624e4'
  and v.clave = 'SICI-7-I/4N4'
  and not exists (select 1 from public.product_variants o where o.clave = 'SICI-7-1/4N4' and o.id <> v.id);
update public.product_variants v
set clave = 'SICI-7-1/4N5'
where v.id = '41ce2a48-e317-41eb-8796-90fa75902e6f'
  and v.clave = 'SICI-7-I/4N5'
  and not exists (select 1 from public.product_variants o where o.clave = 'SICI-7-1/4N5' and o.id <> v.id);
update public.product_variants v
set clave = 'VAL-BA-5'
where v.id = '59bdcf3f-cc0c-43c4-ab78-e1466c7e5f15'
  and v.clave = 'YK-BA-5'
  and not exists (select 1 from public.product_variants o where o.clave = 'VAL-BA-5' and o.id <> v.id);
update public.product_variants v
set clave = 'ALL-13P'
where v.id = '034386a1-5e43-4a49-bf1c-d67b2dd0e262'
  and v.clave = 'ALE-13P'
  and not exists (select 1 from public.product_variants o where o.clave = 'ALL-13P' and o.id <> v.id);
update public.product_variants v
set clave = 'ALL-13M'
where v.id = 'eb4dd115-994a-48cd-a116-80a23cb36d33'
  and v.clave = 'ALE-13M'
  and not exists (select 1 from public.product_variants o where o.clave = 'ALL-13M' and o.id <> v.id);

-- 2. Fotos del banco para las claves ya corregidas.
--    No pisa una URL que el producto ya tenga.
insert into public.product_images (product_id, variant_id, url, orden, fuente)
select v.product_id, v.variant_id, v.url, v.orden, 'banco-truper'
from (values
  ('76ff157e-2b49-4de3-a380-38d6e2b923e7'::uuid, '9a3b05a3-0fb2-4dbf-b73b-90fbddd7977e'::uuid, 'https://www.truper.com/media/import/imagenes/AFI-CU.jpg', 0),
  ('76ff157e-2b49-4de3-a380-38d6e2b923e7'::uuid, '9a3b05a3-0fb2-4dbf-b73b-90fbddd7977e'::uuid, 'https://www.truper.com/media/import/imagenes/AFI-CU+FC1.jpg', 1),
  ('76ff157e-2b49-4de3-a380-38d6e2b923e7'::uuid, '9a3b05a3-0fb2-4dbf-b73b-90fbddd7977e'::uuid, 'https://www.truper.com/media/import/imagenes/AFI-CU+FC2.jpg', 2),
  ('b4e26104-1a7a-4add-b4df-89f702a5b18e'::uuid, '942c5840-57fe-42f2-ac68-d018f48b83f0'::uuid, 'https://www.truper.com/media/import/imagenes/PCT-8K.jpg', 0),
  ('b4e26104-1a7a-4add-b4df-89f702a5b18e'::uuid, '942c5840-57fe-42f2-ac68-d018f48b83f0'::uuid, 'https://www.truper.com/media/import/imagenes/PCT-8K+D1.jpg', 1),
  ('b4e26104-1a7a-4add-b4df-89f702a5b18e'::uuid, '942c5840-57fe-42f2-ac68-d018f48b83f0'::uuid, 'https://www.truper.com/media/import/imagenes/PCT-8K+BIZQ1.jpg', 2),
  ('87022dad-604d-4af3-b0c2-d5d1e11e73d8'::uuid, 'e9022fac-eac2-4a03-a8d9-ba49009a172d'::uuid, 'https://www.truper.com/media/import/imagenes/ASD-180.jpg', 0),
  ('87022dad-604d-4af3-b0c2-d5d1e11e73d8'::uuid, 'e9022fac-eac2-4a03-a8d9-ba49009a172d'::uuid, 'https://www.truper.com/media/import/imagenes/ASD-180+BIZQ1.jpg', 1),
  ('87022dad-604d-4af3-b0c2-d5d1e11e73d8'::uuid, 'e9022fac-eac2-4a03-a8d9-ba49009a172d'::uuid, 'https://www.truper.com/media/import/imagenes/ASD-180+FC3.jpg', 2),
  ('87022dad-604d-4af3-b0c2-d5d1e11e73d8'::uuid, 'e9022fac-eac2-4a03-a8d9-ba49009a172d'::uuid, 'https://www.truper.com/media/import/imagenes/ASD-180+D1.jpg', 3),
  ('a3db794b-e105-43e4-b389-6d0a330b50b0'::uuid, '6dcf0bcb-df73-4bf2-acc3-13361baad53f'::uuid, 'https://www.truper.com/media/import/imagenes/BACO-120.jpg', 0),
  ('a3db794b-e105-43e4-b389-6d0a330b50b0'::uuid, '6dcf0bcb-df73-4bf2-acc3-13361baad53f'::uuid, 'https://www.truper.com/media/import/imagenes/BACO-120+FC1.jpg', 1),
  ('a3db794b-e105-43e4-b389-6d0a330b50b0'::uuid, '6dcf0bcb-df73-4bf2-acc3-13361baad53f'::uuid, 'https://www.truper.com/media/import/imagenes/BACO-120+FC2.jpg', 2),
  ('a3db794b-e105-43e4-b389-6d0a330b50b0'::uuid, 'bcb56e88-4118-4ff3-bd0a-c728f5ced16d'::uuid, 'https://www.truper.com/media/import/imagenes/BACO-130.jpg', 0),
  ('a3db794b-e105-43e4-b389-6d0a330b50b0'::uuid, 'bcb56e88-4118-4ff3-bd0a-c728f5ced16d'::uuid, 'https://www.truper.com/media/import/imagenes/BACO-130+FC1.jpg', 1),
  ('a3db794b-e105-43e4-b389-6d0a330b50b0'::uuid, 'bcb56e88-4118-4ff3-bd0a-c728f5ced16d'::uuid, 'https://www.truper.com/media/import/imagenes/BACO-130+FC2.jpg', 2),
  ('a3db794b-e105-43e4-b389-6d0a330b50b0'::uuid, '3f4d39c9-07c0-46ae-ab82-c226225278eb'::uuid, 'https://www.truper.com/media/import/imagenes/BACO-140.jpg', 0),
  ('a3db794b-e105-43e4-b389-6d0a330b50b0'::uuid, '3f4d39c9-07c0-46ae-ab82-c226225278eb'::uuid, 'https://www.truper.com/media/import/imagenes/BACO-140+FC1.jpg', 1),
  ('a3db794b-e105-43e4-b389-6d0a330b50b0'::uuid, '3f4d39c9-07c0-46ae-ab82-c226225278eb'::uuid, 'https://www.truper.com/media/import/imagenes/BACO-140+FC2.jpg', 2),
  ('a3db794b-e105-43e4-b389-6d0a330b50b0'::uuid, 'e0ec0821-98b0-48f2-8c9f-17aeded3a39b'::uuid, 'https://www.truper.com/media/import/imagenes/BACO-150.jpg', 0),
  ('a3db794b-e105-43e4-b389-6d0a330b50b0'::uuid, 'e0ec0821-98b0-48f2-8c9f-17aeded3a39b'::uuid, 'https://www.truper.com/media/import/imagenes/BACO-150+FC1.jpg', 1),
  ('a3db794b-e105-43e4-b389-6d0a330b50b0'::uuid, 'e0ec0821-98b0-48f2-8c9f-17aeded3a39b'::uuid, 'https://www.truper.com/media/import/imagenes/BACO-150+FC2.jpg', 2),
  ('ac5fe225-60dc-4fa1-8a4e-4f1c8c2bd13f'::uuid, '1b5763f4-6d3b-4fc5-b676-9c287c038651'::uuid, 'https://www.truper.com/media/import/imagenes/BAS-200PLA.jpg', 0),
  ('ac5fe225-60dc-4fa1-8a4e-4f1c8c2bd13f'::uuid, '1b5763f4-6d3b-4fc5-b676-9c287c038651'::uuid, 'https://www.truper.com/media/import/imagenes/BAS-200PLA+A3.jpg', 1),
  ('ac5fe225-60dc-4fa1-8a4e-4f1c8c2bd13f'::uuid, '1b5763f4-6d3b-4fc5-b676-9c287c038651'::uuid, 'https://www.truper.com/media/import/imagenes/BAS-200PLA+FC1.jpg', 2),
  ('ac5fe225-60dc-4fa1-8a4e-4f1c8c2bd13f'::uuid, '1b5763f4-6d3b-4fc5-b676-9c287c038651'::uuid, 'https://www.truper.com/media/import/imagenes/BAS-200PLA+FC2.jpg', 3),
  ('81bb3376-4b0f-4899-bd95-ea95bba57409'::uuid, '36d41258-7e0d-4136-bd7f-e19e3b8f5acf'::uuid, 'https://www.truper.com/media/import/imagenes/BASE-5EPP.jpg', 0),
  ('81bb3376-4b0f-4899-bd95-ea95bba57409'::uuid, '36d41258-7e0d-4136-bd7f-e19e3b8f5acf'::uuid, 'https://www.truper.com/media/import/imagenes/BASE-5EPP+FC1.jpg', 1),
  ('81bb3376-4b0f-4899-bd95-ea95bba57409'::uuid, '36d41258-7e0d-4136-bd7f-e19e3b8f5acf'::uuid, 'https://www.truper.com/media/import/imagenes/BASE-5EPP+FC2.jpg', 2),
  ('3b11666d-ca9c-4b3e-89ee-e59ef3a47159'::uuid, 'b2d21318-d556-4b5a-8eb9-3a119c8c4ca8'::uuid, 'https://www.truper.com/media/import/imagenes/BASE-5T.jpg', 0),
  ('3b11666d-ca9c-4b3e-89ee-e59ef3a47159'::uuid, 'b2d21318-d556-4b5a-8eb9-3a119c8c4ca8'::uuid, 'https://www.truper.com/media/import/imagenes/BASE-5T+FC1.jpg', 1),
  ('3b11666d-ca9c-4b3e-89ee-e59ef3a47159'::uuid, 'b2d21318-d556-4b5a-8eb9-3a119c8c4ca8'::uuid, 'https://www.truper.com/media/import/imagenes/BASE-5T+FC2.jpg', 2),
  ('3b11666d-ca9c-4b3e-89ee-e59ef3a47159'::uuid, 'f81d7cd6-3a14-48e8-85bb-b60767e56886'::uuid, 'https://www.truper.com/media/import/imagenes/BASE-5EP.jpg', 0),
  ('3b11666d-ca9c-4b3e-89ee-e59ef3a47159'::uuid, 'f81d7cd6-3a14-48e8-85bb-b60767e56886'::uuid, 'https://www.truper.com/media/import/imagenes/BASE-5EP+FC1.jpg', 1),
  ('3b11666d-ca9c-4b3e-89ee-e59ef3a47159'::uuid, 'f81d7cd6-3a14-48e8-85bb-b60767e56886'::uuid, 'https://www.truper.com/media/import/imagenes/BASE-5EP+FC2.jpg', 2),
  ('ab0c95b0-22ff-4059-a64d-cee57de7a515'::uuid, '3cb19f1b-3543-41d7-97d7-25d132ae34bd'::uuid, 'https://www.truper.com/media/import/imagenes/BASE-40T.jpg', 0),
  ('ab0c95b0-22ff-4059-a64d-cee57de7a515'::uuid, '3cb19f1b-3543-41d7-97d7-25d132ae34bd'::uuid, 'https://www.truper.com/media/import/imagenes/BASE-40T+D1.jpg', 1),
  ('ab0c95b0-22ff-4059-a64d-cee57de7a515'::uuid, '3cb19f1b-3543-41d7-97d7-25d132ae34bd'::uuid, 'https://www.truper.com/media/import/imagenes/BASE-40T+FC1.jpg', 2),
  ('ab0c95b0-22ff-4059-a64d-cee57de7a515'::uuid, '3cb19f1b-3543-41d7-97d7-25d132ae34bd'::uuid, 'https://www.truper.com/media/import/imagenes/BASE-40T+FC2.jpg', 3),
  ('ab0c95b0-22ff-4059-a64d-cee57de7a515'::uuid, '3cb19f1b-3543-41d7-97d7-25d132ae34bd'::uuid, 'https://www.truper.com/media/import/imagenes/BASE-40T+FC3.jpg', 4),
  ('ab0c95b0-22ff-4059-a64d-cee57de7a515'::uuid, '55310c7c-11eb-427c-906e-ab1ad6521481'::uuid, 'https://www.truper.com/media/import/imagenes/BASE-40U.jpg', 0),
  ('ab0c95b0-22ff-4059-a64d-cee57de7a515'::uuid, '55310c7c-11eb-427c-906e-ab1ad6521481'::uuid, 'https://www.truper.com/media/import/imagenes/BASE-40U+FC1.jpg', 1),
  ('ab0c95b0-22ff-4059-a64d-cee57de7a515'::uuid, '55310c7c-11eb-427c-906e-ab1ad6521481'::uuid, 'https://www.truper.com/media/import/imagenes/BASE-40U+FC2.jpg', 2),
  ('41070018-0224-45dd-ae3f-57c28ff4e2c9'::uuid, 'a18bf174-77b6-4975-a658-e035876dbb54'::uuid, 'https://www.truper.com/media/import/imagenes/CUT-6XX.jpg', 0),
  ('41070018-0224-45dd-ae3f-57c28ff4e2c9'::uuid, 'a18bf174-77b6-4975-a658-e035876dbb54'::uuid, 'https://www.truper.com/media/import/imagenes/CUT-6XX+BIZQ1.jpg', 1),
  ('41070018-0224-45dd-ae3f-57c28ff4e2c9'::uuid, 'a18bf174-77b6-4975-a658-e035876dbb54'::uuid, 'https://www.truper.com/media/import/imagenes/CUT-6XX+FC2.jpg', 2),
  ('bec1fbfb-e9ab-4494-9ab8-62a7160e426f'::uuid, '55e50a22-f4c3-4b98-8215-b50b3e1e40f4'::uuid, 'https://www.truper.com/media/import/imagenes/REP-CUTEX.jpg', 0),
  ('bec1fbfb-e9ab-4494-9ab8-62a7160e426f'::uuid, '55e50a22-f4c3-4b98-8215-b50b3e1e40f4'::uuid, 'https://www.truper.com/media/import/imagenes/REP-CUTEX+BIZQ1.jpg', 1),
  ('ecd569c3-73cb-44b9-94ed-7d31ae60e1d1'::uuid, '157658a6-38f9-4dc5-b949-8a321aeb7729'::uuid, 'https://www.truper.com/media/import/imagenes/BOPE-60.jpg', 0),
  ('ecd569c3-73cb-44b9-94ed-7d31ae60e1d1'::uuid, '157658a6-38f9-4dc5-b949-8a321aeb7729'::uuid, 'https://www.truper.com/media/import/imagenes/BOPE-60+FC1.jpg', 1),
  ('ecd569c3-73cb-44b9-94ed-7d31ae60e1d1'::uuid, '157658a6-38f9-4dc5-b949-8a321aeb7729'::uuid, 'https://www.truper.com/media/import/imagenes/BOPE-60+FC2.jpg', 2),
  ('ecd569c3-73cb-44b9-94ed-7d31ae60e1d1'::uuid, '157658a6-38f9-4dc5-b949-8a321aeb7729'::uuid, 'https://www.truper.com/media/import/imagenes/BOPE-60+FC3.jpg', 3),
  ('dc864a73-4c43-4650-977c-5cfc2e337498'::uuid, '0749e8d9-3799-4d29-add1-df61378b5b18'::uuid, 'https://www.truper.com/media/import/imagenes/BOMEX-28.jpg', 0),
  ('dc864a73-4c43-4650-977c-5cfc2e337498'::uuid, '0749e8d9-3799-4d29-add1-df61378b5b18'::uuid, 'https://www.truper.com/media/import/imagenes/BOMEX-28+FC1.jpg', 1),
  ('dc864a73-4c43-4650-977c-5cfc2e337498'::uuid, '0749e8d9-3799-4d29-add1-df61378b5b18'::uuid, 'https://www.truper.com/media/import/imagenes/BOMEX-28+BIZQ1.jpg', 2),
  ('dc864a73-4c43-4650-977c-5cfc2e337498'::uuid, 'ad1fcf17-693e-463f-b843-c2e13e3a41f4'::uuid, 'https://www.truper.com/media/import/imagenes/BOMEX-25.jpg', 0),
  ('dc864a73-4c43-4650-977c-5cfc2e337498'::uuid, 'ad1fcf17-693e-463f-b843-c2e13e3a41f4'::uuid, 'https://www.truper.com/media/import/imagenes/BOMEX-25+FC1.jpg', 1),
  ('dc864a73-4c43-4650-977c-5cfc2e337498'::uuid, 'ad1fcf17-693e-463f-b843-c2e13e3a41f4'::uuid, 'https://www.truper.com/media/import/imagenes/BOMEX-25+BIZQ1.jpg', 2),
  ('dc864a73-4c43-4650-977c-5cfc2e337498'::uuid, 'd022a74c-4f07-48a3-b4b1-2bd3659097de'::uuid, 'https://www.truper.com/media/import/imagenes/BOMEX-31.jpg', 0),
  ('dc864a73-4c43-4650-977c-5cfc2e337498'::uuid, 'd022a74c-4f07-48a3-b4b1-2bd3659097de'::uuid, 'https://www.truper.com/media/import/imagenes/BOMEX-31+BIZQ1.jpg', 1),
  ('dc864a73-4c43-4650-977c-5cfc2e337498'::uuid, 'd0f1da9b-a3c1-4d1b-aeb3-36c575a3a944'::uuid, 'https://www.truper.com/media/import/imagenes/BOMEX-35.jpg', 0),
  ('dc864a73-4c43-4650-977c-5cfc2e337498'::uuid, 'd0f1da9b-a3c1-4d1b-aeb3-36c575a3a944'::uuid, 'https://www.truper.com/media/import/imagenes/BOMEX-35+BIZQ1.jpg', 1),
  ('0505ad95-b3c9-42d8-8977-ec6ded77c019'::uuid, 'b3e6e3d5-814f-4706-b4e3-1a829da948f8'::uuid, 'https://www.truper.com/media/import/imagenes/CA-65Q.jpg', 0),
  ('0505ad95-b3c9-42d8-8977-ec6ded77c019'::uuid, 'b3e6e3d5-814f-4706-b4e3-1a829da948f8'::uuid, 'https://www.truper.com/media/import/imagenes/CA-65Q+D1.jpg', 1),
  ('0505ad95-b3c9-42d8-8977-ec6ded77c019'::uuid, 'b3e6e3d5-814f-4706-b4e3-1a829da948f8'::uuid, 'https://www.truper.com/media/import/imagenes/CA-65Q+BIZQ1.jpg', 2),
  ('0505ad95-b3c9-42d8-8977-ec6ded77c019'::uuid, 'b3e6e3d5-814f-4706-b4e3-1a829da948f8'::uuid, 'https://www.truper.com/media/import/imagenes/CA-65Q+D2.jpg', 3),
  ('397e9d55-7012-4ead-acea-216f430c2e5b'::uuid, '6ef459c5-1c4a-4bce-8cc0-c1c498d177c8'::uuid, 'https://www.truper.com/media/import/imagenes/CA-65LQ.jpg', 0),
  ('397e9d55-7012-4ead-acea-216f430c2e5b'::uuid, '6ef459c5-1c4a-4bce-8cc0-c1c498d177c8'::uuid, 'https://www.truper.com/media/import/imagenes/CA-65LQ+D1.jpg', 1),
  ('397e9d55-7012-4ead-acea-216f430c2e5b'::uuid, '6ef459c5-1c4a-4bce-8cc0-c1c498d177c8'::uuid, 'https://www.truper.com/media/import/imagenes/CA-65LQ+BIZQ1.jpg', 2),
  ('397e9d55-7012-4ead-acea-216f430c2e5b'::uuid, '6ef459c5-1c4a-4bce-8cc0-c1c498d177c8'::uuid, 'https://www.truper.com/media/import/imagenes/CA-65LQ+D2.jpg', 3),
  ('0fbf9fac-8f34-44d4-af9c-f3d43402a805'::uuid, '1e22140b-5a5a-4544-8c78-bf8b40e3205e'::uuid, 'https://www.truper.com/media/import/imagenes/CH-20P.jpg', 0),
  ('0fbf9fac-8f34-44d4-af9c-f3d43402a805'::uuid, '1e22140b-5a5a-4544-8c78-bf8b40e3205e'::uuid, 'https://www.truper.com/media/import/imagenes/CH-20P+D1.jpg', 1),
  ('0fbf9fac-8f34-44d4-af9c-f3d43402a805'::uuid, '1e22140b-5a5a-4544-8c78-bf8b40e3205e'::uuid, 'https://www.truper.com/media/import/imagenes/CH-20P+BIZQ1.jpg', 2),
  ('0fbf9fac-8f34-44d4-af9c-f3d43402a805'::uuid, '1e22140b-5a5a-4544-8c78-bf8b40e3205e'::uuid, 'https://www.truper.com/media/import/imagenes/CH-20P+D2.jpg', 3),
  ('3b27332b-a1bb-45ad-a396-3b0fd91c6fbf'::uuid, '8c288c5c-16e9-4066-bec4-b305918239f9'::uuid, 'https://www.truper.com/media/import/imagenes/CHR-40A.jpg', 0),
  ('3b27332b-a1bb-45ad-a396-3b0fd91c6fbf'::uuid, '8c288c5c-16e9-4066-bec4-b305918239f9'::uuid, 'https://www.truper.com/media/import/imagenes/CHR-40A+D2.jpg', 1),
  ('3b27332b-a1bb-45ad-a396-3b0fd91c6fbf'::uuid, '8c288c5c-16e9-4066-bec4-b305918239f9'::uuid, 'https://www.truper.com/media/import/imagenes/CHR-40A+BIZQ1.jpg', 2),
  ('3b27332b-a1bb-45ad-a396-3b0fd91c6fbf'::uuid, '8c288c5c-16e9-4066-bec4-b305918239f9'::uuid, 'https://www.truper.com/media/import/imagenes/CHR-40A+D1.jpg', 3),
  ('3b27332b-a1bb-45ad-a396-3b0fd91c6fbf'::uuid, 'f320c7c0-afd6-42c6-bcbd-375694ff2d9e'::uuid, 'https://www.truper.com/media/import/imagenes/CHR-50A.jpg', 0),
  ('3b27332b-a1bb-45ad-a396-3b0fd91c6fbf'::uuid, 'f320c7c0-afd6-42c6-bcbd-375694ff2d9e'::uuid, 'https://www.truper.com/media/import/imagenes/CHR-50A+BIZQ1.jpg', 1),
  ('3b27332b-a1bb-45ad-a396-3b0fd91c6fbf'::uuid, 'f320c7c0-afd6-42c6-bcbd-375694ff2d9e'::uuid, 'https://www.truper.com/media/import/imagenes/CHR-50A+D1.jpg', 2),
  ('3b27332b-a1bb-45ad-a396-3b0fd91c6fbf'::uuid, 'f320c7c0-afd6-42c6-bcbd-375694ff2d9e'::uuid, 'https://www.truper.com/media/import/imagenes/CHR-50A+D2.jpg', 3),
  ('255b61eb-53c3-46c0-a87a-636c66d3b259'::uuid, 'b14783ac-438b-4f61-abbc-fcfed7cdf63e'::uuid, 'https://www.truper.com/media/import/imagenes/REP-CUT-650.jpg', 0),
  ('255b61eb-53c3-46c0-a87a-636c66d3b259'::uuid, 'b14783ac-438b-4f61-abbc-fcfed7cdf63e'::uuid, 'https://www.truper.com/media/import/imagenes/REP-CUT-650+BIZQ1.jpg', 1),
  ('0b8b961d-26ef-4882-b46a-702efe97c0c0'::uuid, 'ad153d62-04a0-4d0f-bdba-5ad4d61eeb0c'::uuid, 'https://www.truper.com/media/import/imagenes/DG-1-8X4B.jpg', 0),
  ('0b8b961d-26ef-4882-b46a-702efe97c0c0'::uuid, 'ad153d62-04a0-4d0f-bdba-5ad4d61eeb0c'::uuid, 'https://www.truper.com/media/import/imagenes/DG-1-8X4B+FC2.jpg', 1),
  ('0b8b961d-26ef-4882-b46a-702efe97c0c0'::uuid, 'ad153d62-04a0-4d0f-bdba-5ad4d61eeb0c'::uuid, 'https://www.truper.com/media/import/imagenes/DG-1-8X4B+BIZQ1.jpg', 2),
  ('9182d687-f65a-4595-a8d4-e3d8dd80ee17'::uuid, '7f0aee70-d037-4109-a87d-69ad0aef691d'::uuid, 'https://www.truper.com/media/import/imagenes/DR-3-16X3B.jpg', 0),
  ('9182d687-f65a-4595-a8d4-e3d8dd80ee17'::uuid, '7f0aee70-d037-4109-a87d-69ad0aef691d'::uuid, 'https://www.truper.com/media/import/imagenes/DR-3-16X3B+FC2.jpg', 1),
  ('9182d687-f65a-4595-a8d4-e3d8dd80ee17'::uuid, '7f0aee70-d037-4109-a87d-69ad0aef691d'::uuid, 'https://www.truper.com/media/import/imagenes/DR-3-16X3B+BIZQ1.jpg', 2),
  ('9182d687-f65a-4595-a8d4-e3d8dd80ee17'::uuid, '82a94aed-1d4d-4706-a102-15b20a157835'::uuid, 'https://www.truper.com/media/import/imagenes/DR-3-16X4B.jpg', 0),
  ('9182d687-f65a-4595-a8d4-e3d8dd80ee17'::uuid, '82a94aed-1d4d-4706-a102-15b20a157835'::uuid, 'https://www.truper.com/media/import/imagenes/DR-3-16X4B+FC2.jpg', 1),
  ('9182d687-f65a-4595-a8d4-e3d8dd80ee17'::uuid, '82a94aed-1d4d-4706-a102-15b20a157835'::uuid, 'https://www.truper.com/media/import/imagenes/DR-3-16X4B+BIZQ1.jpg', 2),
  ('9182d687-f65a-4595-a8d4-e3d8dd80ee17'::uuid, '97dd3e68-0efa-466c-a421-5e91be40dde3'::uuid, 'https://www.truper.com/media/import/imagenes/DR-1-4X1-1-2B.jpg', 0),
  ('9182d687-f65a-4595-a8d4-e3d8dd80ee17'::uuid, '97dd3e68-0efa-466c-a421-5e91be40dde3'::uuid, 'https://www.truper.com/media/import/imagenes/DR-1-4X1-1-2B+FC2.jpg', 1),
  ('9182d687-f65a-4595-a8d4-e3d8dd80ee17'::uuid, '97dd3e68-0efa-466c-a421-5e91be40dde3'::uuid, 'https://www.truper.com/media/import/imagenes/DR-1-4X1-1-2B+BIZQ1.jpg', 2),
  ('9182d687-f65a-4595-a8d4-e3d8dd80ee17'::uuid, 'd1a44ea5-2aa9-4851-98bc-97857399dd94'::uuid, 'https://www.truper.com/media/import/imagenes/DR-1-4X8B.jpg', 0),
  ('9182d687-f65a-4595-a8d4-e3d8dd80ee17'::uuid, 'd1a44ea5-2aa9-4851-98bc-97857399dd94'::uuid, 'https://www.truper.com/media/import/imagenes/DR-1-4X8B+FC2.jpg', 1),
  ('9182d687-f65a-4595-a8d4-e3d8dd80ee17'::uuid, 'd1a44ea5-2aa9-4851-98bc-97857399dd94'::uuid, 'https://www.truper.com/media/import/imagenes/DR-1-4X8B+BIZQ1.jpg', 2),
  ('d74df9e7-4238-4299-85bb-6b4c25c126e1'::uuid, '8656b72f-36b6-4715-93ce-6dc4995f5507'::uuid, 'https://www.truper.com/media/import/imagenes/DP-1-8X2-1-2B.jpg', 0),
  ('d74df9e7-4238-4299-85bb-6b4c25c126e1'::uuid, '8656b72f-36b6-4715-93ce-6dc4995f5507'::uuid, 'https://www.truper.com/media/import/imagenes/DP-1-8X2-1-2B+FC2.jpg', 1),
  ('d74df9e7-4238-4299-85bb-6b4c25c126e1'::uuid, '8656b72f-36b6-4715-93ce-6dc4995f5507'::uuid, 'https://www.truper.com/media/import/imagenes/DP-1-8X2-1-2B+BIZQ1.jpg', 2),
  ('d74df9e7-4238-4299-85bb-6b4c25c126e1'::uuid, 'd56ac7ed-9b78-42c3-8ffc-3bb62b846369'::uuid, 'https://www.truper.com/media/import/imagenes/DP-1-8X4B.jpg', 0),
  ('d74df9e7-4238-4299-85bb-6b4c25c126e1'::uuid, 'd56ac7ed-9b78-42c3-8ffc-3bb62b846369'::uuid, 'https://www.truper.com/media/import/imagenes/DP-1-8X4B+FC2.jpg', 1),
  ('d74df9e7-4238-4299-85bb-6b4c25c126e1'::uuid, 'd56ac7ed-9b78-42c3-8ffc-3bb62b846369'::uuid, 'https://www.truper.com/media/import/imagenes/DP-1-8X4B+BIZQ1.jpg', 2),
  ('d74df9e7-4238-4299-85bb-6b4c25c126e1'::uuid, 'b898ffe8-879f-44ac-9857-08b8a6bbd31d'::uuid, 'https://www.truper.com/media/import/imagenes/DP-1-8X6B.jpg', 0),
  ('d74df9e7-4238-4299-85bb-6b4c25c126e1'::uuid, 'b898ffe8-879f-44ac-9857-08b8a6bbd31d'::uuid, 'https://www.truper.com/media/import/imagenes/DP-1-8X6B+FC2.jpg', 1),
  ('d74df9e7-4238-4299-85bb-6b4c25c126e1'::uuid, 'b898ffe8-879f-44ac-9857-08b8a6bbd31d'::uuid, 'https://www.truper.com/media/import/imagenes/DP-1-8X6B+BIZQ1.jpg', 2),
  ('d74df9e7-4238-4299-85bb-6b4c25c126e1'::uuid, 'be84053e-7600-4f7d-9271-a042febcf40c'::uuid, 'https://www.truper.com/media/import/imagenes/DP-3-16X8B.jpg', 0),
  ('d74df9e7-4238-4299-85bb-6b4c25c126e1'::uuid, 'be84053e-7600-4f7d-9271-a042febcf40c'::uuid, 'https://www.truper.com/media/import/imagenes/DP-3-16X8B+FC2.jpg', 1),
  ('d74df9e7-4238-4299-85bb-6b4c25c126e1'::uuid, 'be84053e-7600-4f7d-9271-a042febcf40c'::uuid, 'https://www.truper.com/media/import/imagenes/DP-3-16X8B+BIZQ1.jpg', 2),
  ('d74df9e7-4238-4299-85bb-6b4c25c126e1'::uuid, '5915fb30-e682-4a86-bc23-ea42e7ec5e9e'::uuid, 'https://www.truper.com/media/import/imagenes/DP-1-4X4B.jpg', 0),
  ('d74df9e7-4238-4299-85bb-6b4c25c126e1'::uuid, '5915fb30-e682-4a86-bc23-ea42e7ec5e9e'::uuid, 'https://www.truper.com/media/import/imagenes/DP-1-4X4B+FC2.jpg', 1),
  ('d74df9e7-4238-4299-85bb-6b4c25c126e1'::uuid, '5915fb30-e682-4a86-bc23-ea42e7ec5e9e'::uuid, 'https://www.truper.com/media/import/imagenes/DP-1-4X4B+BIZQ1.jpg', 2),
  ('b3871233-0b3a-45f8-8124-4ae0760aea12'::uuid, '77524a22-71a7-4f20-8270-c6d1cd623121'::uuid, 'https://www.truper.com/media/import/imagenes/FILP-ASPI-G2.jpg', 0),
  ('b3871233-0b3a-45f8-8124-4ae0760aea12'::uuid, '77524a22-71a7-4f20-8270-c6d1cd623121'::uuid, 'https://www.truper.com/media/import/imagenes/FILP-ASPI-G2+D1.jpg', 1),
  ('b3871233-0b3a-45f8-8124-4ae0760aea12'::uuid, '619beadb-5bcf-46cf-8ff3-a0e16eb6fbbd'::uuid, 'https://www.truper.com/media/import/imagenes/FILP-ASPI-G1.jpg', 0),
  ('b3871233-0b3a-45f8-8124-4ae0760aea12'::uuid, '619beadb-5bcf-46cf-8ff3-a0e16eb6fbbd'::uuid, 'https://www.truper.com/media/import/imagenes/FILP-ASPI-G1+D1.jpg', 1),
  ('70e841f3-c1b7-4523-9190-0117744b4ca4'::uuid, '420d3e02-ea47-4f7d-a74a-fc5edeaee955'::uuid, 'https://www.truper.com/media/import/imagenes/FILF-ASPI-12-16.jpg', 0),
  ('70e841f3-c1b7-4523-9190-0117744b4ca4'::uuid, '420d3e02-ea47-4f7d-a74a-fc5edeaee955'::uuid, 'https://www.truper.com/media/import/imagenes/FILF-ASPI-12-16+D1.jpg', 1),
  ('b502bff6-992b-41e1-8376-9006f431164f'::uuid, '37c4db69-556c-4254-9707-4e4d2eadcad6'::uuid, 'https://www.truper.com/media/import/imagenes/FE-AS-8X-16X.jpg', 0),
  ('b502bff6-992b-41e1-8376-9006f431164f'::uuid, '37c4db69-556c-4254-9707-4e4d2eadcad6'::uuid, 'https://www.truper.com/media/import/imagenes/FE-AS-8X-16X+D1.jpg', 1),
  ('b502bff6-992b-41e1-8376-9006f431164f'::uuid, '29e2bd33-5765-4e09-ac99-63c883170543'::uuid, 'https://www.truper.com/media/import/imagenes/FILE-ASPI-G2+D1.jpg', 0),
  ('b502bff6-992b-41e1-8376-9006f431164f'::uuid, 'b291d3cf-054f-4f3e-a954-0ff45398c82e'::uuid, 'https://www.truper.com/media/import/imagenes/FILE-ASPI-G1.jpg', 0),
  ('b502bff6-992b-41e1-8376-9006f431164f'::uuid, 'b291d3cf-054f-4f3e-a954-0ff45398c82e'::uuid, 'https://www.truper.com/media/import/imagenes/FILE-ASPI-G1+D1.jpg', 1),
  ('56980a77-7251-422c-809b-27a03ca4ff30'::uuid, '865cbe5c-ea9f-46fb-88af-639edf928490'::uuid, 'https://www.truper.com/media/import/imagenes/FIL-ASPI-G2.jpg', 0),
  ('56980a77-7251-422c-809b-27a03ca4ff30'::uuid, '865cbe5c-ea9f-46fb-88af-639edf928490'::uuid, 'https://www.truper.com/media/import/imagenes/FIL-ASPI-G2+D1.jpg', 1),
  ('56980a77-7251-422c-809b-27a03ca4ff30'::uuid, '22db4ada-727f-4125-8eb2-88adb45a3b4e'::uuid, 'https://www.truper.com/media/import/imagenes/FIL-ASPI-G1.jpg', 0),
  ('56980a77-7251-422c-809b-27a03ca4ff30'::uuid, '22db4ada-727f-4125-8eb2-88adb45a3b4e'::uuid, 'https://www.truper.com/media/import/imagenes/FIL-ASPI-G1+D1.jpg', 1),
  ('f4a9769e-2e5b-45a7-8980-5e6565b6f89f'::uuid, '9f368b61-170b-4436-b22c-339d0d22c6db'::uuid, 'https://www.truper.com/media/import/imagenes/ALL-25.jpg', 0),
  ('f4a9769e-2e5b-45a7-8980-5e6565b6f89f'::uuid, '9f368b61-170b-4436-b22c-339d0d22c6db'::uuid, 'https://www.truper.com/media/import/imagenes/ALL-25+FC1.jpg', 1),
  ('f4a9769e-2e5b-45a7-8980-5e6565b6f89f'::uuid, '9f368b61-170b-4436-b22c-339d0d22c6db'::uuid, 'https://www.truper.com/media/import/imagenes/ALL-25+FC2.jpg', 2),
  ('f4a9769e-2e5b-45a7-8980-5e6565b6f89f'::uuid, '9f368b61-170b-4436-b22c-339d0d22c6db'::uuid, 'https://www.truper.com/media/import/imagenes/ALL-25+FC3.jpg', 3),
  ('24d66180-853d-4d3f-81fe-8e109156dcce'::uuid, '5f41b30d-6e6c-4a31-9a29-5080cdd53902'::uuid, 'https://www.truper.com/media/import/imagenes/JBAV-5R.jpg', 0),
  ('24d66180-853d-4d3f-81fe-8e109156dcce'::uuid, '5f41b30d-6e6c-4a31-9a29-5080cdd53902'::uuid, 'https://www.truper.com/media/import/imagenes/JBAV-5R+D1.jpg', 1),
  ('24d66180-853d-4d3f-81fe-8e109156dcce'::uuid, '5f41b30d-6e6c-4a31-9a29-5080cdd53902'::uuid, 'https://www.truper.com/media/import/imagenes/JBAV-5R+FC1.jpg', 2),
  ('012d7ff1-8f02-4a91-8871-2b47ea2eb1c2'::uuid, 'b2580de6-5393-48c0-a1c4-a8e257291aba'::uuid, 'https://www.truper.com/media/import/imagenes/TORX-8TLX.jpg', 0),
  ('012d7ff1-8f02-4a91-8871-2b47ea2eb1c2'::uuid, 'b2580de6-5393-48c0-a1c4-a8e257291aba'::uuid, 'https://www.truper.com/media/import/imagenes/TORX-8TLX+FC1.jpg', 1),
  ('012d7ff1-8f02-4a91-8871-2b47ea2eb1c2'::uuid, 'b2580de6-5393-48c0-a1c4-a8e257291aba'::uuid, 'https://www.truper.com/media/import/imagenes/TORX-8TLX+FC2.jpg', 2),
  ('012d7ff1-8f02-4a91-8871-2b47ea2eb1c2'::uuid, 'b2580de6-5393-48c0-a1c4-a8e257291aba'::uuid, 'https://www.truper.com/media/import/imagenes/TORX-8TLX+FC3.jpg', 3),
  ('65a811ac-4485-4f91-b20f-d0faa714fab3'::uuid, '91a6aeeb-7a95-447b-9aa7-ea2ba49283d2'::uuid, 'https://www.truper.com/media/import/imagenes/JBMX-9P.jpg', 0),
  ('9577b0d5-42f2-4594-8fa2-6b5244dac103'::uuid, '109391b8-9186-4679-86dd-9aea41173db3'::uuid, 'https://www.truper.com/media/import/imagenes/JBMX-9.jpg', 0),
  ('9577b0d5-42f2-4594-8fa2-6b5244dac103'::uuid, '109391b8-9186-4679-86dd-9aea41173db3'::uuid, 'https://www.truper.com/media/import/imagenes/JBMX-9+A1.jpg', 1),
  ('9577b0d5-42f2-4594-8fa2-6b5244dac103'::uuid, '109391b8-9186-4679-86dd-9aea41173db3'::uuid, 'https://www.truper.com/media/import/imagenes/JBMX-9+A2.jpg', 2),
  ('8bfa5b36-873d-4a29-a07a-44d38efa41bd'::uuid, '0f2d9dd7-0d59-48fd-9be9-8f70c85e77fd'::uuid, 'https://www.truper.com/media/import/imagenes/EXA-11.jpg', 0),
  ('8bfa5b36-873d-4a29-a07a-44d38efa41bd'::uuid, '0f2d9dd7-0d59-48fd-9be9-8f70c85e77fd'::uuid, 'https://www.truper.com/media/import/imagenes/EXA-11+BIZQ1.jpg', 1),
  ('8bfa5b36-873d-4a29-a07a-44d38efa41bd'::uuid, '0f2d9dd7-0d59-48fd-9be9-8f70c85e77fd'::uuid, 'https://www.truper.com/media/import/imagenes/EXA-11+D1.jpg', 2),
  ('6554d9bd-98ea-4bff-80f8-02c96f2420dc'::uuid, '0d61e938-d014-4782-9fc0-36bc5485f0d5'::uuid, 'https://www.truper.com/media/import/imagenes/JBS-5.jpg', 0),
  ('6554d9bd-98ea-4bff-80f8-02c96f2420dc'::uuid, '0d61e938-d014-4782-9fc0-36bc5485f0d5'::uuid, 'https://www.truper.com/media/import/imagenes/JBS-5+BIZQ1.jpg', 1),
  ('70d55294-7d58-4124-bbc3-42724e1d3fec'::uuid, '314bc94e-1369-4294-bced-f80e9e395c56'::uuid, 'https://www.truper.com/media/import/imagenes/ALL-10M.jpg', 0),
  ('70d55294-7d58-4124-bbc3-42724e1d3fec'::uuid, '314bc94e-1369-4294-bced-f80e9e395c56'::uuid, 'https://www.truper.com/media/import/imagenes/ALL-10M+FC1.jpg', 1),
  ('70d55294-7d58-4124-bbc3-42724e1d3fec'::uuid, '314bc94e-1369-4294-bced-f80e9e395c56'::uuid, 'https://www.truper.com/media/import/imagenes/ALL-10M+FC2.jpg', 2),
  ('546ee899-4ea6-4802-b90a-e909903b6c33'::uuid, '42638085-be29-492d-ade7-13b622ae0ad5'::uuid, 'https://www.truper.com/media/import/imagenes/ALLX-7P.jpg', 0),
  ('546ee899-4ea6-4802-b90a-e909903b6c33'::uuid, '42638085-be29-492d-ade7-13b622ae0ad5'::uuid, 'https://www.truper.com/media/import/imagenes/ALLX-7P+FC1.jpg', 1),
  ('546ee899-4ea6-4802-b90a-e909903b6c33'::uuid, '42638085-be29-492d-ade7-13b622ae0ad5'::uuid, 'https://www.truper.com/media/import/imagenes/ALLX-7P+FC2.jpg', 2),
  ('546ee899-4ea6-4802-b90a-e909903b6c33'::uuid, '42638085-be29-492d-ade7-13b622ae0ad5'::uuid, 'https://www.truper.com/media/import/imagenes/ALLX-7P+FC3.jpg', 3),
  ('546ee899-4ea6-4802-b90a-e909903b6c33'::uuid, '0d42e7b5-b316-4c1f-87e8-57ab8271d6be'::uuid, 'https://www.truper.com/media/import/imagenes/ALLX-7M.jpg', 0),
  ('546ee899-4ea6-4802-b90a-e909903b6c33'::uuid, '0d42e7b5-b316-4c1f-87e8-57ab8271d6be'::uuid, 'https://www.truper.com/media/import/imagenes/ALLX-7M+FC1.jpg', 1),
  ('546ee899-4ea6-4802-b90a-e909903b6c33'::uuid, '0d42e7b5-b316-4c1f-87e8-57ab8271d6be'::uuid, 'https://www.truper.com/media/import/imagenes/ALLX-7M+FC2.jpg', 2),
  ('546ee899-4ea6-4802-b90a-e909903b6c33'::uuid, '0d42e7b5-b316-4c1f-87e8-57ab8271d6be'::uuid, 'https://www.truper.com/media/import/imagenes/ALLX-7M+FC3.jpg', 3),
  ('546ee899-4ea6-4802-b90a-e909903b6c33'::uuid, 'edc467eb-62c4-4dfd-98b4-0be0e632d32b'::uuid, 'https://www.truper.com/media/import/imagenes/ALLX-10M.jpg', 0),
  ('546ee899-4ea6-4802-b90a-e909903b6c33'::uuid, 'edc467eb-62c4-4dfd-98b4-0be0e632d32b'::uuid, 'https://www.truper.com/media/import/imagenes/ALLX-10M+FC1.jpg', 1),
  ('546ee899-4ea6-4802-b90a-e909903b6c33'::uuid, 'edc467eb-62c4-4dfd-98b4-0be0e632d32b'::uuid, 'https://www.truper.com/media/import/imagenes/ALLX-10M+FC2.jpg', 2),
  ('546ee899-4ea6-4802-b90a-e909903b6c33'::uuid, 'edc467eb-62c4-4dfd-98b4-0be0e632d32b'::uuid, 'https://www.truper.com/media/import/imagenes/ALLX-10M+FC3.jpg', 3),
  ('546ee899-4ea6-4802-b90a-e909903b6c33'::uuid, 'bd616b95-1d2d-4f02-9436-cfbfdb21557b'::uuid, 'https://www.truper.com/media/import/imagenes/ALLX-13P.jpg', 0),
  ('546ee899-4ea6-4802-b90a-e909903b6c33'::uuid, 'bd616b95-1d2d-4f02-9436-cfbfdb21557b'::uuid, 'https://www.truper.com/media/import/imagenes/ALLX-13P+FC1.jpg', 1),
  ('546ee899-4ea6-4802-b90a-e909903b6c33'::uuid, 'bd616b95-1d2d-4f02-9436-cfbfdb21557b'::uuid, 'https://www.truper.com/media/import/imagenes/ALLX-13P+FC2.jpg', 2),
  ('546ee899-4ea6-4802-b90a-e909903b6c33'::uuid, 'bd616b95-1d2d-4f02-9436-cfbfdb21557b'::uuid, 'https://www.truper.com/media/import/imagenes/ALLX-13P+FC3.jpg', 3),
  ('546ee899-4ea6-4802-b90a-e909903b6c33'::uuid, 'c7da0c48-296d-4d5d-bdf5-4a612f16e749'::uuid, 'https://www.truper.com/media/import/imagenes/ALLX-13M.jpg', 0),
  ('546ee899-4ea6-4802-b90a-e909903b6c33'::uuid, 'c7da0c48-296d-4d5d-bdf5-4a612f16e749'::uuid, 'https://www.truper.com/media/import/imagenes/ALLX-13M+FC1.jpg', 1),
  ('546ee899-4ea6-4802-b90a-e909903b6c33'::uuid, 'c7da0c48-296d-4d5d-bdf5-4a612f16e749'::uuid, 'https://www.truper.com/media/import/imagenes/ALLX-13M+FC2.jpg', 2),
  ('546ee899-4ea6-4802-b90a-e909903b6c33'::uuid, 'c7da0c48-296d-4d5d-bdf5-4a612f16e749'::uuid, 'https://www.truper.com/media/import/imagenes/ALLX-13M+FC3.jpg', 3),
  ('eb3ee5bc-06c4-460a-a6af-aab50e46b1a2'::uuid, '2bf92244-c4b1-45fd-b149-9ecc1b410a26'::uuid, 'https://www.truper.com/media/import/imagenes/ALL-9M.jpg', 0),
  ('eb3ee5bc-06c4-460a-a6af-aab50e46b1a2'::uuid, '2bf92244-c4b1-45fd-b149-9ecc1b410a26'::uuid, 'https://www.truper.com/media/import/imagenes/ALL-9M+FC1.jpg', 1),
  ('eb3ee5bc-06c4-460a-a6af-aab50e46b1a2'::uuid, '2bf92244-c4b1-45fd-b149-9ecc1b410a26'::uuid, 'https://www.truper.com/media/import/imagenes/ALL-9M+FC2.jpg', 2),
  ('8244498a-2996-40c5-9074-fb154d7b8516'::uuid, 'd2f8b519-3adb-4e90-9496-bd9fbac84380'::uuid, 'https://www.truper.com/media/import/imagenes/ALL-13P-P.jpg', 0),
  ('8244498a-2996-40c5-9074-fb154d7b8516'::uuid, 'd2f8b519-3adb-4e90-9496-bd9fbac84380'::uuid, 'https://www.truper.com/media/import/imagenes/ALL-13P-P+FC1.jpg', 1),
  ('8244498a-2996-40c5-9074-fb154d7b8516'::uuid, 'd2f8b519-3adb-4e90-9496-bd9fbac84380'::uuid, 'https://www.truper.com/media/import/imagenes/ALL-13P-P+FC2.jpg', 2),
  ('8244498a-2996-40c5-9074-fb154d7b8516'::uuid, '68568f47-7f73-495a-ba21-a3fcd6bc87f8'::uuid, 'https://www.truper.com/media/import/imagenes/ALL-13M-P.jpg', 0),
  ('8244498a-2996-40c5-9074-fb154d7b8516'::uuid, '68568f47-7f73-495a-ba21-a3fcd6bc87f8'::uuid, 'https://www.truper.com/media/import/imagenes/ALL-13M-P+FC1.jpg', 1),
  ('8244498a-2996-40c5-9074-fb154d7b8516'::uuid, '68568f47-7f73-495a-ba21-a3fcd6bc87f8'::uuid, 'https://www.truper.com/media/import/imagenes/ALL-13M-P+FC2.jpg', 2),
  ('8244498a-2996-40c5-9074-fb154d7b8516'::uuid, '35c2393d-395b-46ad-b668-2fa07c472344'::uuid, 'https://www.truper.com/media/import/imagenes/ALL-P8P.jpg', 0),
  ('8244498a-2996-40c5-9074-fb154d7b8516'::uuid, '35c2393d-395b-46ad-b668-2fa07c472344'::uuid, 'https://www.truper.com/media/import/imagenes/ALL-P8P+FC1.jpg', 1),
  ('8244498a-2996-40c5-9074-fb154d7b8516'::uuid, '35c2393d-395b-46ad-b668-2fa07c472344'::uuid, 'https://www.truper.com/media/import/imagenes/ALL-P8P+FC2.jpg', 2),
  ('8244498a-2996-40c5-9074-fb154d7b8516'::uuid, '166f7de7-4d94-46a1-b0b4-5f3a2fbf953b'::uuid, 'https://www.truper.com/media/import/imagenes/ALL-P8M.jpg', 0),
  ('8244498a-2996-40c5-9074-fb154d7b8516'::uuid, '166f7de7-4d94-46a1-b0b4-5f3a2fbf953b'::uuid, 'https://www.truper.com/media/import/imagenes/ALL-P8M+FC1.jpg', 1),
  ('8244498a-2996-40c5-9074-fb154d7b8516'::uuid, '166f7de7-4d94-46a1-b0b4-5f3a2fbf953b'::uuid, 'https://www.truper.com/media/import/imagenes/ALL-P8M+FC2.jpg', 2),
  ('9bf78424-4586-40c9-951b-fe3a8262b0f9'::uuid, '9056c2f3-e2aa-4a52-acd9-b8f024f73633'::uuid, 'https://www.truper.com/media/import/imagenes/MOTB-2.jpg', 0),
  ('9bf78424-4586-40c9-951b-fe3a8262b0f9'::uuid, '9056c2f3-e2aa-4a52-acd9-b8f024f73633'::uuid, 'https://www.truper.com/media/import/imagenes/MOTB-2+FC2.jpg', 1),
  ('9bf78424-4586-40c9-951b-fe3a8262b0f9'::uuid, '9056c2f3-e2aa-4a52-acd9-b8f024f73633'::uuid, 'https://www.truper.com/media/import/imagenes/MOTB-2+FC1.jpg', 2),
  ('9bf78424-4586-40c9-951b-fe3a8262b0f9'::uuid, '9056c2f3-e2aa-4a52-acd9-b8f024f73633'::uuid, 'https://www.truper.com/media/import/imagenes/MOTB-2+FC3.jpg', 3),
  ('27c31818-b0cc-40ec-8353-ab9edb265e28'::uuid, 'a7b9edc0-5901-45d4-86f3-d14d9663d2c1'::uuid, 'https://www.truper.com/media/import/imagenes/SICI-7-1-4P.jpg', 0),
  ('27c31818-b0cc-40ec-8353-ab9edb265e28'::uuid, 'a7b9edc0-5901-45d4-86f3-d14d9663d2c1'::uuid, 'https://www.truper.com/media/import/imagenes/SICI-7-1-4P+FC2.jpg', 1),
  ('27c31818-b0cc-40ec-8353-ab9edb265e28'::uuid, 'a7b9edc0-5901-45d4-86f3-d14d9663d2c1'::uuid, 'https://www.truper.com/media/import/imagenes/SICI-7-1-4P+BIZQ1.jpg', 2),
  ('c6973449-b870-4ae9-bf9c-8a86fdb986ab'::uuid, '71ff7362-6d8c-4272-84d6-d4d29cd9ff44'::uuid, 'https://www.truper.com/media/import/imagenes/SICI-7-1-4A3.jpg', 0),
  ('c6973449-b870-4ae9-bf9c-8a86fdb986ab'::uuid, '71ff7362-6d8c-4272-84d6-d4d29cd9ff44'::uuid, 'https://www.truper.com/media/import/imagenes/SICI-7-1-4A3+FC2.jpg', 1),
  ('c6973449-b870-4ae9-bf9c-8a86fdb986ab'::uuid, '71ff7362-6d8c-4272-84d6-d4d29cd9ff44'::uuid, 'https://www.truper.com/media/import/imagenes/SICI-7-1-4A3+BIZQ1.jpg', 2),
  ('c6973449-b870-4ae9-bf9c-8a86fdb986ab'::uuid, '71ff7362-6d8c-4272-84d6-d4d29cd9ff44'::uuid, 'https://www.truper.com/media/import/imagenes/SICI-7-1-4A3+MP1.jpg', 3),
  ('c6973449-b870-4ae9-bf9c-8a86fdb986ab'::uuid, '71ff7362-6d8c-4272-84d6-d4d29cd9ff44'::uuid, 'https://www.truper.com/media/import/imagenes/SICI-7-1-4A3+MP2.jpg', 4),
  ('c6973449-b870-4ae9-bf9c-8a86fdb986ab'::uuid, '71ff7362-6d8c-4272-84d6-d4d29cd9ff44'::uuid, 'https://www.truper.com/media/import/imagenes/SICI-7-1-4A3+MP3.jpg', 5),
  ('c6973449-b870-4ae9-bf9c-8a86fdb986ab'::uuid, '71ff7362-6d8c-4272-84d6-d4d29cd9ff44'::uuid, 'https://www.truper.com/media/import/imagenes/SICI-7-1-4A3+MP4.jpg', 6),
  ('c6973449-b870-4ae9-bf9c-8a86fdb986ab'::uuid, '71ff7362-6d8c-4272-84d6-d4d29cd9ff44'::uuid, 'https://www.truper.com/media/import/imagenes/SICI-7-1-4A3+MP5.jpg', 7),
  ('c6973449-b870-4ae9-bf9c-8a86fdb986ab'::uuid, '71ff7362-6d8c-4272-84d6-d4d29cd9ff44'::uuid, 'https://www.truper.com/media/import/imagenes/SICI-7-1-4A3+MP6.jpg', 8),
  ('c6973449-b870-4ae9-bf9c-8a86fdb986ab'::uuid, '71ff7362-6d8c-4272-84d6-d4d29cd9ff44'::uuid, 'https://www.truper.com/media/import/imagenes/SICI-7-1-4A3+MP7.jpg', 9),
  ('112713f2-d243-4d03-8185-1e3579e17a33'::uuid, '41f7a853-9275-445a-a125-b4772d4624e4'::uuid, 'https://www.truper.com/media/import/imagenes/SICI-7-1-4N4.jpg', 0),
  ('112713f2-d243-4d03-8185-1e3579e17a33'::uuid, '41f7a853-9275-445a-a125-b4772d4624e4'::uuid, 'https://www.truper.com/media/import/imagenes/SICI-7-1-4N4+FC2.jpg', 1),
  ('112713f2-d243-4d03-8185-1e3579e17a33'::uuid, '41f7a853-9275-445a-a125-b4772d4624e4'::uuid, 'https://www.truper.com/media/import/imagenes/SICI-7-1-4N4+BIZQ1.jpg', 2),
  ('112713f2-d243-4d03-8185-1e3579e17a33'::uuid, '41f7a853-9275-445a-a125-b4772d4624e4'::uuid, 'https://www.truper.com/media/import/imagenes/SICI-7-1-4N4+MP1.jpg', 3),
  ('112713f2-d243-4d03-8185-1e3579e17a33'::uuid, '41f7a853-9275-445a-a125-b4772d4624e4'::uuid, 'https://www.truper.com/media/import/imagenes/SICI-7-1-4N4+MP2.jpg', 4),
  ('112713f2-d243-4d03-8185-1e3579e17a33'::uuid, '41f7a853-9275-445a-a125-b4772d4624e4'::uuid, 'https://www.truper.com/media/import/imagenes/SICI-7-1-4N4+MP3.jpg', 5),
  ('112713f2-d243-4d03-8185-1e3579e17a33'::uuid, '41f7a853-9275-445a-a125-b4772d4624e4'::uuid, 'https://www.truper.com/media/import/imagenes/SICI-7-1-4N4+MP4.jpg', 6),
  ('112713f2-d243-4d03-8185-1e3579e17a33'::uuid, '41f7a853-9275-445a-a125-b4772d4624e4'::uuid, 'https://www.truper.com/media/import/imagenes/SICI-7-1-4N4+MP5.jpg', 7),
  ('112713f2-d243-4d03-8185-1e3579e17a33'::uuid, '41f7a853-9275-445a-a125-b4772d4624e4'::uuid, 'https://www.truper.com/media/import/imagenes/SICI-7-1-4N4+MP6.jpg', 8),
  ('112713f2-d243-4d03-8185-1e3579e17a33'::uuid, '41f7a853-9275-445a-a125-b4772d4624e4'::uuid, 'https://www.truper.com/media/import/imagenes/SICI-7-1-4N4+MP7.jpg', 9),
  ('bfbe60ff-dfea-408b-8857-301abde1d7ec'::uuid, '41ce2a48-e317-41eb-8796-90fa75902e6f'::uuid, 'https://www.truper.com/media/import/imagenes/SICI-7-1-4N5+FC2.jpg', 0),
  ('bfbe60ff-dfea-408b-8857-301abde1d7ec'::uuid, '41ce2a48-e317-41eb-8796-90fa75902e6f'::uuid, 'https://www.truper.com/media/import/imagenes/SICI-7-1-4N5+BIZQ1.jpg', 1),
  ('bfbe60ff-dfea-408b-8857-301abde1d7ec'::uuid, '41ce2a48-e317-41eb-8796-90fa75902e6f'::uuid, 'https://www.truper.com/media/import/imagenes/SICI-7-1-4N5.jpg', 2),
  ('bfbe60ff-dfea-408b-8857-301abde1d7ec'::uuid, '41ce2a48-e317-41eb-8796-90fa75902e6f'::uuid, 'https://www.truper.com/media/import/imagenes/SICI-7-1-4N5+MP1.jpg', 3),
  ('bfbe60ff-dfea-408b-8857-301abde1d7ec'::uuid, '41ce2a48-e317-41eb-8796-90fa75902e6f'::uuid, 'https://www.truper.com/media/import/imagenes/SICI-7-1-4N5+MP2.jpg', 4),
  ('bfbe60ff-dfea-408b-8857-301abde1d7ec'::uuid, '41ce2a48-e317-41eb-8796-90fa75902e6f'::uuid, 'https://www.truper.com/media/import/imagenes/SICI-7-1-4N5+MP3.jpg', 5),
  ('bfbe60ff-dfea-408b-8857-301abde1d7ec'::uuid, '41ce2a48-e317-41eb-8796-90fa75902e6f'::uuid, 'https://www.truper.com/media/import/imagenes/SICI-7-1-4N5+MP4.jpg', 6),
  ('bfbe60ff-dfea-408b-8857-301abde1d7ec'::uuid, '41ce2a48-e317-41eb-8796-90fa75902e6f'::uuid, 'https://www.truper.com/media/import/imagenes/SICI-7-1-4N5+MP5.jpg', 7),
  ('bfbe60ff-dfea-408b-8857-301abde1d7ec'::uuid, '41ce2a48-e317-41eb-8796-90fa75902e6f'::uuid, 'https://www.truper.com/media/import/imagenes/SICI-7-1-4N5+MP6.jpg', 8),
  ('bfbe60ff-dfea-408b-8857-301abde1d7ec'::uuid, '41ce2a48-e317-41eb-8796-90fa75902e6f'::uuid, 'https://www.truper.com/media/import/imagenes/SICI-7-1-4N5+MP7.jpg', 9),
  ('e12fd740-df31-409c-b1d2-002a6901c793'::uuid, '59bdcf3f-cc0c-43c4-ab78-e1466c7e5f15'::uuid, 'https://www.truper.com/media/import/imagenes/VAL-BA-5.jpg', 0),
  ('e12fd740-df31-409c-b1d2-002a6901c793'::uuid, '59bdcf3f-cc0c-43c4-ab78-e1466c7e5f15'::uuid, 'https://www.truper.com/media/import/imagenes/VAL-BA-5+FC1.jpg', 1),
  ('e12fd740-df31-409c-b1d2-002a6901c793'::uuid, '59bdcf3f-cc0c-43c4-ab78-e1466c7e5f15'::uuid, 'https://www.truper.com/media/import/imagenes/VAL-BA-5+FC2.jpg', 2),
  ('70d55294-7d58-4124-bbc3-42724e1d3fec'::uuid, '034386a1-5e43-4a49-bf1c-d67b2dd0e262'::uuid, 'https://www.truper.com/media/import/imagenes/ALL-13P.jpg', 0),
  ('70d55294-7d58-4124-bbc3-42724e1d3fec'::uuid, '034386a1-5e43-4a49-bf1c-d67b2dd0e262'::uuid, 'https://www.truper.com/media/import/imagenes/ALL-13P+FC1.jpg', 1),
  ('70d55294-7d58-4124-bbc3-42724e1d3fec'::uuid, '034386a1-5e43-4a49-bf1c-d67b2dd0e262'::uuid, 'https://www.truper.com/media/import/imagenes/ALL-13P+FC2.jpg', 2),
  ('70d55294-7d58-4124-bbc3-42724e1d3fec'::uuid, 'eb4dd115-994a-48cd-a116-80a23cb36d33'::uuid, 'https://www.truper.com/media/import/imagenes/ALL-13M.jpg', 0),
  ('70d55294-7d58-4124-bbc3-42724e1d3fec'::uuid, 'eb4dd115-994a-48cd-a116-80a23cb36d33'::uuid, 'https://www.truper.com/media/import/imagenes/ALL-13M+FC1.jpg', 1),
  ('70d55294-7d58-4124-bbc3-42724e1d3fec'::uuid, 'eb4dd115-994a-48cd-a116-80a23cb36d33'::uuid, 'https://www.truper.com/media/import/imagenes/ALL-13M+FC2.jpg', 2)
) as v(product_id, variant_id, url, orden)
where not exists (
  select 1 from public.product_images i
  where i.product_id = v.product_id and i.url = v.url
);

commit;


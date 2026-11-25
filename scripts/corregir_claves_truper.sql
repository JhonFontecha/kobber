-- Corrección de claves mal leídas del PDF y fotos confirmadas en el banco Truper.
-- Generado el 2026-11-25. NO es un cambio de esquema. NO se corrió en producción.
-- Buscador: https://www.truper.com/banco-contenido-digital/searching/searchByWord
-- con el código numérico y la cookie reg=mx.
--
-- Se actualiza product_variants.clave solo en la fila indicada, y solo si esa
-- clave nueva no la tiene ya otra variante. No se toca order_items.clave:
-- ahí quedó el texto del pedido ya hecho. El Excel de ML y la tienda leen
-- la clave vigente al exportar o al mostrar, así que el próximo archivo sale
-- con la clave corregida. Las fotos se cuelgan por variant_id, no por el texto.
--
-- Correcciones incluidas: 69 variantes en 39 productos.
-- Fotos a insertar: 234 URLs. Productos que no tenían ninguna foto y ahora sí: 31.
-- Cada update y cada foto exigió que el nombre del banco coincidiera con la
-- ficha (medida, cantidad o tipo). Si solo coincidía el código, no se cambió.
--
-- Dudosas, sin tocar (53 variantes, 28 productos).
-- columnas: producto | clave actual | clave del banco | código | ficha || nombre en el banco
-- Afilador de cuchillos, base con ventosa    | AFI-CD             | AFI-CU             | 24140   | Afilador de cuchillos base c || Afilador de cuchillos, cuerpo de ABS, PRETUL
-- Aspiradoras inalámbricas para auto, 20 V - | ASP-20A            | ASPI-20A           | 103955  | 7.5 L (2 gal) - Con aspirado || Aspiradora, 20V, 1 batería 2Ah, TRUPER PRO
-- Aspiradoras plásticas                      | ASP-06             | FILP-ASPI-G1       | 12082   | 23 L (6 gal) — POTENCIA MÁXI || Bolsa para polvo para aspiradoras 5 y 6 gal, TRU
-- Barras cavadoras                           | BACD-135           | BACO-130           | 19986   | 6 kg (14 lb), Largo 135 cm ( || Barra cavadora 1" x 130 cm, escoplo 102 mm, TRUP
-- Bisturí 6" profesional tipo lápiz con 5 cu | REP-5013           | REP-CUTEX          | 16979   | Cuchillas de repuesto, 5 pie || Repuesto para EXA-6 , blíster con 5 pzas, TRUPER
-- Brocas escalonadas                         | BES-9              | BES-12             | 12125   | 9 Escalones, 1/2" rango 1/4" || Broca escalonada óxido negro 12escalones 3/16" a
-- Báscula electrónica de pilas               | BASE-3A            | BASE-05B           | 102316  | 3 kg, Acero inoxidable, Medi || Báscula electrónica de precisión, de bolsillo, 5
-- Básculas electrónicas de alta precisión    | BASE-USB           | BASE-3             | 102317  | 500 g, g/az/dwt/ct/ozt/tl, C || Báscula electrónica de precisión, recargable, 3 
-- Básculas electrónicas grameras, 5 kg       | BASE-SEC           | AL-2S              | 103106  | 5 kg, g/oz, Cuerpo ABS, Medi || Azadón Lane No. 2 de 2.0 lb, mango de acero 54",
-- Básculas electrónicas grameras, 5 kg       | BASE-BEC           | BASE-5EC           | 15160   | 5 kg, g/oz, Cuerpo Acero ino || Báscula digital para cocina, plato de vidrio, 5 
-- Básculas electrónicas grameras, 5 kg       | BASE-SEP           | BASE-5EP           | 15161   | 5 kg, g/oz, Cuerpo ABS, Plat || Báscula digital para cocina, plato de ABS, 5 kg,
-- Candados de acero, gancho corto, máxima se | CA-650             | CA-65Q             | 43336   | 29mm || Candado redondo de acero 65mm, gancho corto, lla
-- Candados de acero, gancho largo, máxima se | CA-65LO            | CA-65LQ            | 43337   | 54mm || Candado redondo de acero 65mm, gancho largo, lla
-- Candados de hierro color latón, gancho cor | CH-25P             | CH-20P             | 22526   | 25mm || Candado de hierro 20 mm, color latón, corto, caj
-- Candados de hierro con coraza              | CHR-404            | CH-38              | 43315   | Llave antigua / Caja con 1 p || Candado de hierro 38 mm, gancho corto en caja, H
-- Candados de hierro, gancho corto           | CH-25              | CUT-DUP-310-V      | 43789   | 25mm || Disco cortador para DUP-310, V, HERMEX
-- Candados de hierro, gancho corto           | CH-32              | CH-38              | 43315   | 32mm || Candado de hierro 38 mm, gancho corto en caja, H
-- Candados de hierro, gancho corto           | CH-50              | CA-65LQ            | 43337   | 50mm || Candado redondo de acero 65mm, gancho largo, lla
-- Candados de hierro, gancho largo           | CH-3XL             | CH-25L             | 43797   | 30mm || Candado de hierro 25 mm, gancho largo en caja, H
-- Candados de hierro, gancho largo           | CH-3XL             | CH-38L             | 43323   | 38mm || Candado de hierro 38 mm, gancho largo en caja, H
-- Candados de hierro, gancho largo           | CH-4XL             | CH-45L             | 43324   | 40mm || Candado de hierro 45 mm, gancho largo en caja, H
-- Candados de hierro, gancho largo           | CH-4XL             | CH-50L             | 43325   | 45mm || Candado de hierro 50 mm, gancho largo en caja, H
-- Cerrojos llave-llave, llave tradicional    | CERO-42P           | CERO-12P           | 23610   | Latón brillante / Acero || Cerrojo llave-llave, latón brillante,llave tradi
-- Cerrojos llave-llave, llave tradicional    | CERO-02P           | CERO-32P           | 23611   | Negro mate / Acero || Cerrojo llave-llave, cromo mate, llave tradicion
-- Cerrojos llave-mariposa, llave tradicional | CERO-21P           | CERO-22P           | 23612   | Latón antiguo / Acero || Cerrojo llave-llave, latón antiguo, llave tradic
-- Cerrojos llave-mariposa, llave tradicional | CERO-6P            | CERO-61P           | 26067   | Negro mate / Acero || Cerrojo llave-mariposa, negro mate, llave tradic
-- Destornilladores punta gabinete, empuñadur | DG-1/8I7B          | DG-1/8X4-1/2B      | 18549   | 1/8" 7 3/4" x 5" || Desarmador cabinet 1/8 x 4-1/2" mango Comfort Gr
-- Destornilladores punta gabinete, empuñadur | DG-3/16I8B         | DG-1/8X6B          | 14025   | 3/16" 8 3/4" x 6" || Desarmador cabinet 1/8 x 6" mango Comfort Grip, 
-- Destornilladores punta gabinete, empuñadur | DG-1/4I8B          | DG-1/8X8B          | 14027   | 1/4" 10 3/4" x 8" || Desarmador cabinet 1/8 x 8" mango Comfort Grip, 
-- Destornilladores punta gabinete, empuñadur | DG-3/16I33B        | DP-3/16X4B         | 100836  | 3/16" 9 3/4" x 6" || Desarmador de cruz 3/16 x 4" mango Comfort Grip,
-- Destornilladores punta gabinete, empuñadur | DG-3/16I36B        | DG-3/16X6B         | 14040   | 3/16" 9 1/2" x 6" || Desarmador cabinet 3/16 x 6" mango Comfort Grip,
-- Destornilladores punta gabinete, empuñadur | DG-3/16I38B        | DG-3/16X8B         | 14043   | 3/16" 3 1/16" x 8" || Desarmador cabinet 3/16 x 8" mango Comfort Grip,
-- Destornilladores punta pala, empuñadura Co | DR-1/4I6B          | DR-1/4X8B          | 100833  | 1/4" 10" x 6" || Desarmador plano 1/4 x 8" mango Comfort Grip, TR
-- Destornilladores punta pala, empuñadura Co | DR-1/4I10B         | DR-5/16X6B         | 14006   | 1/4" 10 3/4" x 10" || Desarmador plano 5/16 x 6" mango Comfort Grip, T
-- Destornilladores punta pala, empuñadura Co | DR-5/16I0B         | DR-5/16X10B        | 18546   | 5/16" 14 3/4" x 10" || Desarmador plano 5/16 x 10" mango Comfort Grip, 
-- Destornilladores punta pala, empuñadura Co | DR-3/8I3B          | DR-3/8X8B          | 100834  | 3/8" 12 1/4" x 8" || Desarmador plano 3/8 x 8" mango Comfort Grip, TR
-- Destornilladores punta phillips, empuñadur | DP-3/16I3B         | DR-1/4X8B          | 100833  | 1/8" 8 3/4" x 3" || Desarmador plano 1/4 x 8" mango Comfort Grip, TR
-- Destornilladores punta phillips, empuñadur | DP-1/4I8B          | DP-3/16X10B        | 100837  | 3/16" 13 5/8" x 10" || Desarmador de cruz 3/16 x 10" mango Comfort Grip
-- Destornilladores punta phillips, empuñadur | DP-1/4I6B          | DP-3/16X8          | 14068   | 1/4" 10" x 6" || Desarmador de cruz 3/16" x 8" mango de acetato, 
-- Destornilladores punta phillips, empuñadur | DP-I/4I02B         | DP-1/4X12B         | 100838  | 1/4" 16" x 12" || Desarmador de cruz 1/4 x 12" mango Comfort Grip,
-- Destornilladores punta phillips, empuñadur | DP-5/16I3B         | DP-5/16X6B         | 18548   | 5/16" 10 3/4" x 6" || Desarmador de cruz 5/16 x 6" mango Comfort Grip,
-- Destornilladores punta phillips, empuñadur | DP-3/8I4B          | DR-3/8X8B          | 100834  | 3/8" 11 3/4" x 8" || Desarmador plano 3/8 x 8" mango Comfort Grip, TR
-- Filtros y bolsas para aspiradoras — Bolsas | FILP-ASPI-62       | FILP-ASPI-G2       | 11101   | Bolsa para polvo || Bolsa para polvo para aspiradoras 12 y 16 gal, T
-- Filtros y bolsas para aspiradoras — Filtro | FILE-ASPI-62       | FILE-ASPI-G2       | 12081   | Filtro de espuma para líquid || Filtro de espuma para líquidos, aspiradoras 6, 1
-- Filtros y bolsas para aspiradoras — Filtro | FIL-ASPI-62        | FIL-ASPI-G2        | 12080   | Filtro de tela para sólidos  || Bolsa con 3 filtros de tela, aspiradoras 5-16 ga
-- Juego de bisturís profesionales tipo lápiz | EXA-13             | EXA-11             | 17512   | Juego de bisturís tipo lápiz || Juego de exactos profesional con 13 cuchillas,es
-- Juegos de llaves bristol largas, punta de  | ALLB-10            | ALLX-10P           | 13643   | 10 llaves, medidas: 1.5 mm,  || Juego de 10 llaves hexagonales std largas, punta
-- Juegos de llaves bristol tipo navaja, cuer | ALL-9P             | ALL-8P             | 15556   | 9 llaves pulgadas: 1/16", 5/ || Juego de 8 llaves hexagonales std, tipo navaja, 
-- Juegos de llaves bristol tipo navaja, cuer | ALL-9              | TORX-9             | 15554   | 9 llaves: 1.5 mm, 2 mm, 2.5  || Juego de 9 llaves torx con organizador abatible,
-- Juegos de llaves bristol tipo navaja, cuer | ALL-9N             | ALL-9M             | 15563   | 9 llaves: 1.5 mm, 2 mm, 2.5  || Juego de 9 llaves hexagonales mm, tipo navaja, T
-- Juegos de llaves bristol, organizador plás | ALL-PBP            | ALL-P8P            | 21850   | 8 llaves pulgadas: 1/16", 5/ || Juego de 8 llaves hexagonales std, tipo llavero,
-- Juegos de llaves bristol, organizador plás | ALL-PBM            | ALL-P8M            | 21851   | 8 llaves métricas: 1.5 mm, 2 || Juego de 8 llaves hexagonales mm, tipo llavero, 
-- Motobombas de combustión de 2 tiempos      | MOT-12             | GU-445             | 103925  | Ø Entrada/Salida 1" (25 mm), || Guantes de algodón con puntos de PVC en palma y 

begin;

-- 1. Claves
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
set clave = 'BACO-120'
where v.id = '6dcf0bcb-df73-4bf2-acc3-13361baad53f'
  and v.clave = 'BACD-120'
  and not exists (select 1 from public.product_variants o where o.clave = 'BACO-120' and o.id <> v.id);
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
set clave = 'CUT-6XX'
where v.id = 'a18bf174-77b6-4975-a658-e035876dbb54'
  and v.clave = 'CUT-6X3'
  and not exists (select 1 from public.product_variants o where o.clave = 'CUT-6XX' and o.id <> v.id);
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
set clave = 'DR-1/4X1-1/2B'
where v.id = '97dd3e68-0efa-466c-a421-5e91be40dde3'
  and v.clave = 'DR-1/4I1-I/2B'
  and not exists (select 1 from public.product_variants o where o.clave = 'DR-1/4X1-1/2B' and o.id <> v.id);
update public.product_variants v
set clave = 'DR-1/4X4B'
where v.id = '97eca79b-62d4-4027-85d3-0c272d991121'
  and v.clave = 'DR-1/4I4B'
  and not exists (select 1 from public.product_variants o where o.clave = 'DR-1/4X4B' and o.id <> v.id);
update public.product_variants v
set clave = 'DR-1/4X8B'
where v.id = 'd1a44ea5-2aa9-4851-98bc-97857399dd94'
  and v.clave = 'DR-1/4I8B'
  and not exists (select 1 from public.product_variants o where o.clave = 'DR-1/4X8B' and o.id <> v.id);
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
set clave = 'DR-3/16X6B'
where v.id = '00566cef-82cc-4263-82d7-4168b04a4426'
  and v.clave = 'DR-3/16I6B'
  and not exists (select 1 from public.product_variants o where o.clave = 'DR-3/16X6B' and o.id <> v.id);
update public.product_variants v
set clave = 'DP-1/4X1-1/2B'
where v.id = 'adff7ad2-3ada-4f41-89dc-74e9a8c9824a'
  and v.clave = 'DP-1/4I1-I/2B'
  and not exists (select 1 from public.product_variants o where o.clave = 'DP-1/4X1-1/2B' and o.id <> v.id);
update public.product_variants v
set clave = 'DP-1/4X4B'
where v.id = '5915fb30-e682-4a86-bc23-ea42e7ec5e9e'
  and v.clave = 'DP-1/4I4B'
  and not exists (select 1 from public.product_variants o where o.clave = 'DP-1/4X4B' and o.id <> v.id);
update public.product_variants v
set clave = 'DP-1/4X8B'
where v.id = '19c5772f-4e86-4813-a948-77e5f2f6389a'
  and v.clave = 'DP-1/4I8B'
  and not exists (select 1 from public.product_variants o where o.clave = 'DP-1/4X8B' and o.id <> v.id);
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
set clave = 'DP-1/8X2-1/2B'
where v.id = '8656b72f-36b6-4715-93ce-6dc4995f5507'
  and v.clave = 'DP-1X8I2-I/28'
  and not exists (select 1 from public.product_variants o where o.clave = 'DP-1/8X2-1/2B' and o.id <> v.id);
update public.product_variants v
set clave = 'DP-3/16X4B'
where v.id = '09cfe848-e36c-45e4-9957-e08099141323'
  and v.clave = 'DP-3/16I4B'
  and not exists (select 1 from public.product_variants o where o.clave = 'DP-3/16X4B' and o.id <> v.id);
update public.product_variants v
set clave = 'DP-3/16X6B'
where v.id = 'dc1412fb-ac32-4a1c-b86c-d998d38cd29a'
  and v.clave = 'DP-3/16I6B'
  and not exists (select 1 from public.product_variants o where o.clave = 'DP-3/16X6B' and o.id <> v.id);
update public.product_variants v
set clave = 'DP-3/16X8B'
where v.id = 'be84053e-7600-4f7d-9271-a042febcf40c'
  and v.clave = 'DP-3/16I8B'
  and not exists (select 1 from public.product_variants o where o.clave = 'DP-3/16X8B' and o.id <> v.id);
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
set clave = 'FILC-ASPI-G1'
where v.id = '60c6d902-22c1-4ac3-ad6c-f3c30d93c332'
  and v.clave = 'FILC-ASP-GI'
  and not exists (select 1 from public.product_variants o where o.clave = 'FILC-ASPI-G1' and o.id <> v.id);
update public.product_variants v
set clave = 'FE-AS-8X-16X'
where v.id = '37c4db69-556c-4254-9707-4e4d2eadcad6'
  and v.clave = 'FEA-8X-16X'
  and not exists (select 1 from public.product_variants o where o.clave = 'FE-AS-8X-16X' and o.id <> v.id);
update public.product_variants v
set clave = 'FILE-ASPI-G1'
where v.id = 'b291d3cf-054f-4f3e-a954-0ff45398c82e'
  and v.clave = 'FILE-ASPI-GI'
  and not exists (select 1 from public.product_variants o where o.clave = 'FILE-ASPI-G1' and o.id <> v.id);
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
set clave = 'DTJ-5B'
where v.id = 'f2d02742-57bf-4acd-938e-611050fb9051'
  and v.clave = 'DU-58'
  and not exists (select 1 from public.product_variants o where o.clave = 'DTJ-5B' and o.id <> v.id);
update public.product_variants v
set clave = 'DTJ-6B'
where v.id = 'a0a6c948-e007-4c8d-b3ba-f8771a0bf26a'
  and v.clave = 'BJU-68'
  and not exists (select 1 from public.product_variants o where o.clave = 'DTJ-6B' and o.id <> v.id);
update public.product_variants v
set clave = 'J-DIMP-7'
where v.id = 'a9d6732f-d8f2-4772-b979-2a59ae39fd81'
  and v.clave = 'J-BIMP-7'
  and not exists (select 1 from public.product_variants o where o.clave = 'J-DIMP-7' and o.id <> v.id);
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
set clave = 'EXA-13P'
where v.id = 'bb1cd7a2-55a8-4b2f-b372-55ca7ac312a6'
  and v.clave = 'EXA-5P'
  and not exists (select 1 from public.product_variants o where o.clave = 'EXA-13P' and o.id <> v.id);
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
set clave = 'ALL-10P'
where v.id = 'a9f2478c-779f-4f5c-bd5c-26f77ef2cd14'
  and v.clave = 'ALE-10P'
  and not exists (select 1 from public.product_variants o where o.clave = 'ALL-10P' and o.id <> v.id);
update public.product_variants v
set clave = 'ALL-13M'
where v.id = 'eb4dd115-994a-48cd-a116-80a23cb36d33'
  and v.clave = 'ALE-13M'
  and not exists (select 1 from public.product_variants o where o.clave = 'ALL-13M' and o.id <> v.id);
update public.product_variants v
set clave = 'ALL-13P'
where v.id = '034386a1-5e43-4a49-bf1c-d67b2dd0e262'
  and v.clave = 'ALE-13P'
  and not exists (select 1 from public.product_variants o where o.clave = 'ALL-13P' and o.id <> v.id);
update public.product_variants v
set clave = 'ALLX-10M'
where v.id = 'edc467eb-62c4-4dfd-98b4-0be0e632d32b'
  and v.clave = 'ALLB-10M'
  and not exists (select 1 from public.product_variants o where o.clave = 'ALLX-10M' and o.id <> v.id);
update public.product_variants v
set clave = 'ALLX-13M'
where v.id = 'c7da0c48-296d-4d5d-bdf5-4a612f16e749'
  and v.clave = 'ALLB-13M'
  and not exists (select 1 from public.product_variants o where o.clave = 'ALLX-13M' and o.id <> v.id);
update public.product_variants v
set clave = 'ALLX-13P'
where v.id = 'bd616b95-1d2d-4f02-9436-cfbfdb21557b'
  and v.clave = 'ALLB-13P'
  and not exists (select 1 from public.product_variants o where o.clave = 'ALLX-13P' and o.id <> v.id);
update public.product_variants v
set clave = 'ALLX-7M'
where v.id = '0d42e7b5-b316-4c1f-87e8-57ab8271d6be'
  and v.clave = 'ALLB-7M'
  and not exists (select 1 from public.product_variants o where o.clave = 'ALLX-7M' and o.id <> v.id);
update public.product_variants v
set clave = 'ALLX-7P'
where v.id = '42638085-be29-492d-ade7-13b622ae0ad5'
  and v.clave = 'ALLB-7P'
  and not exists (select 1 from public.product_variants o where o.clave = 'ALLX-7P' and o.id <> v.id);
update public.product_variants v
set clave = 'ALL-10P-P'
where v.id = '536e1d9f-e74d-461e-9b87-7d94031e4dbc'
  and v.clave = 'ALL-10P'
  and not exists (select 1 from public.product_variants o where o.clave = 'ALL-10P-P' and o.id <> v.id);
update public.product_variants v
set clave = 'ALL-13M-P'
where v.id = '68568f47-7f73-495a-ba21-a3fcd6bc87f8'
  and v.clave = 'ALL-13M'
  and not exists (select 1 from public.product_variants o where o.clave = 'ALL-13M-P' and o.id <> v.id);
update public.product_variants v
set clave = 'ALL-13P-P'
where v.id = 'd2f8b519-3adb-4e90-9496-bd9fbac84380'
  and v.clave = 'ALL-13P'
  and not exists (select 1 from public.product_variants o where o.clave = 'ALL-13P-P' and o.id <> v.id);
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

-- 2. Fotos que el banco publica para esas claves ya corregidas.
--    No pisa una URL que el producto ya tenga.
insert into public.product_images (product_id, variant_id, url, orden, fuente)
select v.product_id, v.variant_id, v.url, v.orden, 'banco-truper'
from (values
  ('87022dad-604d-4af3-b0c2-d5d1e11e73d8'::uuid, 'e9022fac-eac2-4a03-a8d9-ba49009a172d'::uuid, 'https://www.truper.com/media/import/imagenes/ASD-180.jpg', 0),
  ('87022dad-604d-4af3-b0c2-d5d1e11e73d8'::uuid, 'e9022fac-eac2-4a03-a8d9-ba49009a172d'::uuid, 'https://www.truper.com/media/import/imagenes/ASD-180+BIZQ1.jpg', 1),
  ('87022dad-604d-4af3-b0c2-d5d1e11e73d8'::uuid, 'e9022fac-eac2-4a03-a8d9-ba49009a172d'::uuid, 'https://www.truper.com/media/import/imagenes/ASD-180+FC3.jpg', 2),
  ('87022dad-604d-4af3-b0c2-d5d1e11e73d8'::uuid, 'e9022fac-eac2-4a03-a8d9-ba49009a172d'::uuid, 'https://www.truper.com/media/import/imagenes/ASD-180+D1.jpg', 3),
  ('a3db794b-e105-43e4-b389-6d0a330b50b0'::uuid, '6dcf0bcb-df73-4bf2-acc3-13361baad53f'::uuid, 'https://www.truper.com/media/import/imagenes/BACO-120.jpg', 0),
  ('a3db794b-e105-43e4-b389-6d0a330b50b0'::uuid, '6dcf0bcb-df73-4bf2-acc3-13361baad53f'::uuid, 'https://www.truper.com/media/import/imagenes/BACO-120+FC1.jpg', 1),
  ('a3db794b-e105-43e4-b389-6d0a330b50b0'::uuid, '6dcf0bcb-df73-4bf2-acc3-13361baad53f'::uuid, 'https://www.truper.com/media/import/imagenes/BACO-120+FC2.jpg', 2),
  ('a3db794b-e105-43e4-b389-6d0a330b50b0'::uuid, '3f4d39c9-07c0-46ae-ab82-c226225278eb'::uuid, 'https://www.truper.com/media/import/imagenes/BACO-140.jpg', 3),
  ('a3db794b-e105-43e4-b389-6d0a330b50b0'::uuid, '3f4d39c9-07c0-46ae-ab82-c226225278eb'::uuid, 'https://www.truper.com/media/import/imagenes/BACO-140+FC1.jpg', 4),
  ('a3db794b-e105-43e4-b389-6d0a330b50b0'::uuid, '3f4d39c9-07c0-46ae-ab82-c226225278eb'::uuid, 'https://www.truper.com/media/import/imagenes/BACO-140+FC2.jpg', 5),
  ('a3db794b-e105-43e4-b389-6d0a330b50b0'::uuid, 'e0ec0821-98b0-48f2-8c9f-17aeded3a39b'::uuid, 'https://www.truper.com/media/import/imagenes/BACO-150.jpg', 6),
  ('a3db794b-e105-43e4-b389-6d0a330b50b0'::uuid, 'e0ec0821-98b0-48f2-8c9f-17aeded3a39b'::uuid, 'https://www.truper.com/media/import/imagenes/BACO-150+FC1.jpg', 7),
  ('a3db794b-e105-43e4-b389-6d0a330b50b0'::uuid, 'e0ec0821-98b0-48f2-8c9f-17aeded3a39b'::uuid, 'https://www.truper.com/media/import/imagenes/BACO-150+FC2.jpg', 8),
  ('81bb3376-4b0f-4899-bd95-ea95bba57409'::uuid, '36d41258-7e0d-4136-bd7f-e19e3b8f5acf'::uuid, 'https://www.truper.com/media/import/imagenes/BASE-5EPP.jpg', 0),
  ('81bb3376-4b0f-4899-bd95-ea95bba57409'::uuid, '36d41258-7e0d-4136-bd7f-e19e3b8f5acf'::uuid, 'https://www.truper.com/media/import/imagenes/BASE-5EPP+FC1.jpg', 1),
  ('81bb3376-4b0f-4899-bd95-ea95bba57409'::uuid, '36d41258-7e0d-4136-bd7f-e19e3b8f5acf'::uuid, 'https://www.truper.com/media/import/imagenes/BASE-5EPP+FC2.jpg', 2),
  ('0b8b961d-26ef-4882-b46a-702efe97c0c0'::uuid, 'ad153d62-04a0-4d0f-bdba-5ad4d61eeb0c'::uuid, 'https://www.truper.com/media/import/imagenes/DG-1-8X4B.jpg', 0),
  ('0b8b961d-26ef-4882-b46a-702efe97c0c0'::uuid, 'ad153d62-04a0-4d0f-bdba-5ad4d61eeb0c'::uuid, 'https://www.truper.com/media/import/imagenes/DG-1-8X4B+FC2.jpg', 1),
  ('0b8b961d-26ef-4882-b46a-702efe97c0c0'::uuid, 'ad153d62-04a0-4d0f-bdba-5ad4d61eeb0c'::uuid, 'https://www.truper.com/media/import/imagenes/DG-1-8X4B+BIZQ1.jpg', 2),
  ('9182d687-f65a-4595-a8d4-e3d8dd80ee17'::uuid, '7f0aee70-d037-4109-a87d-69ad0aef691d'::uuid, 'https://www.truper.com/media/import/imagenes/DR-3-16X3B.jpg', 0),
  ('9182d687-f65a-4595-a8d4-e3d8dd80ee17'::uuid, '7f0aee70-d037-4109-a87d-69ad0aef691d'::uuid, 'https://www.truper.com/media/import/imagenes/DR-3-16X3B+FC2.jpg', 1),
  ('9182d687-f65a-4595-a8d4-e3d8dd80ee17'::uuid, '7f0aee70-d037-4109-a87d-69ad0aef691d'::uuid, 'https://www.truper.com/media/import/imagenes/DR-3-16X3B+BIZQ1.jpg', 2),
  ('9182d687-f65a-4595-a8d4-e3d8dd80ee17'::uuid, '82a94aed-1d4d-4706-a102-15b20a157835'::uuid, 'https://www.truper.com/media/import/imagenes/DR-3-16X4B.jpg', 3),
  ('9182d687-f65a-4595-a8d4-e3d8dd80ee17'::uuid, '82a94aed-1d4d-4706-a102-15b20a157835'::uuid, 'https://www.truper.com/media/import/imagenes/DR-3-16X4B+FC2.jpg', 4),
  ('9182d687-f65a-4595-a8d4-e3d8dd80ee17'::uuid, '82a94aed-1d4d-4706-a102-15b20a157835'::uuid, 'https://www.truper.com/media/import/imagenes/DR-3-16X4B+BIZQ1.jpg', 5),
  ('9182d687-f65a-4595-a8d4-e3d8dd80ee17'::uuid, '00566cef-82cc-4263-82d7-4168b04a4426'::uuid, 'https://www.truper.com/media/import/imagenes/DR-3-16X6B.jpg', 6),
  ('9182d687-f65a-4595-a8d4-e3d8dd80ee17'::uuid, '00566cef-82cc-4263-82d7-4168b04a4426'::uuid, 'https://www.truper.com/media/import/imagenes/DR-3-16X6B+D1.jpg', 7),
  ('9182d687-f65a-4595-a8d4-e3d8dd80ee17'::uuid, '00566cef-82cc-4263-82d7-4168b04a4426'::uuid, 'https://www.truper.com/media/import/imagenes/DR-3-16X6B+FC2.jpg', 8),
  ('9182d687-f65a-4595-a8d4-e3d8dd80ee17'::uuid, '00566cef-82cc-4263-82d7-4168b04a4426'::uuid, 'https://www.truper.com/media/import/imagenes/DR-3-16X6B+BIZQ1.jpg', 9),
  ('9182d687-f65a-4595-a8d4-e3d8dd80ee17'::uuid, '97dd3e68-0efa-466c-a421-5e91be40dde3'::uuid, 'https://www.truper.com/media/import/imagenes/DR-1-4X1-1-2B.jpg', 10),
  ('9182d687-f65a-4595-a8d4-e3d8dd80ee17'::uuid, '97dd3e68-0efa-466c-a421-5e91be40dde3'::uuid, 'https://www.truper.com/media/import/imagenes/DR-1-4X1-1-2B+FC2.jpg', 11),
  ('9182d687-f65a-4595-a8d4-e3d8dd80ee17'::uuid, '97dd3e68-0efa-466c-a421-5e91be40dde3'::uuid, 'https://www.truper.com/media/import/imagenes/DR-1-4X1-1-2B+BIZQ1.jpg', 12),
  ('9182d687-f65a-4595-a8d4-e3d8dd80ee17'::uuid, '97eca79b-62d4-4027-85d3-0c272d991121'::uuid, 'https://www.truper.com/media/import/imagenes/DR-1-4X4B.jpg', 13),
  ('9182d687-f65a-4595-a8d4-e3d8dd80ee17'::uuid, '97eca79b-62d4-4027-85d3-0c272d991121'::uuid, 'https://www.truper.com/media/import/imagenes/DR-1-4X4B+FC2.jpg', 14),
  ('9182d687-f65a-4595-a8d4-e3d8dd80ee17'::uuid, '97eca79b-62d4-4027-85d3-0c272d991121'::uuid, 'https://www.truper.com/media/import/imagenes/DR-1-4X4B+BIZQ1.jpg', 15),
  ('9182d687-f65a-4595-a8d4-e3d8dd80ee17'::uuid, 'd1a44ea5-2aa9-4851-98bc-97857399dd94'::uuid, 'https://www.truper.com/media/import/imagenes/DR-1-4X8B.jpg', 16),
  ('9182d687-f65a-4595-a8d4-e3d8dd80ee17'::uuid, 'd1a44ea5-2aa9-4851-98bc-97857399dd94'::uuid, 'https://www.truper.com/media/import/imagenes/DR-1-4X8B+FC2.jpg', 17),
  ('9182d687-f65a-4595-a8d4-e3d8dd80ee17'::uuid, 'd1a44ea5-2aa9-4851-98bc-97857399dd94'::uuid, 'https://www.truper.com/media/import/imagenes/DR-1-4X8B+BIZQ1.jpg', 18),
  ('d74df9e7-4238-4299-85bb-6b4c25c126e1'::uuid, 'd56ac7ed-9b78-42c3-8ffc-3bb62b846369'::uuid, 'https://www.truper.com/media/import/imagenes/DP-1-8X4B.jpg', 0),
  ('d74df9e7-4238-4299-85bb-6b4c25c126e1'::uuid, 'd56ac7ed-9b78-42c3-8ffc-3bb62b846369'::uuid, 'https://www.truper.com/media/import/imagenes/DP-1-8X4B+FC2.jpg', 1),
  ('d74df9e7-4238-4299-85bb-6b4c25c126e1'::uuid, 'd56ac7ed-9b78-42c3-8ffc-3bb62b846369'::uuid, 'https://www.truper.com/media/import/imagenes/DP-1-8X4B+BIZQ1.jpg', 2),
  ('d74df9e7-4238-4299-85bb-6b4c25c126e1'::uuid, 'b898ffe8-879f-44ac-9857-08b8a6bbd31d'::uuid, 'https://www.truper.com/media/import/imagenes/DP-1-8X6B.jpg', 3),
  ('d74df9e7-4238-4299-85bb-6b4c25c126e1'::uuid, 'b898ffe8-879f-44ac-9857-08b8a6bbd31d'::uuid, 'https://www.truper.com/media/import/imagenes/DP-1-8X6B+FC2.jpg', 4),
  ('d74df9e7-4238-4299-85bb-6b4c25c126e1'::uuid, 'b898ffe8-879f-44ac-9857-08b8a6bbd31d'::uuid, 'https://www.truper.com/media/import/imagenes/DP-1-8X6B+BIZQ1.jpg', 5),
  ('d74df9e7-4238-4299-85bb-6b4c25c126e1'::uuid, '09cfe848-e36c-45e4-9957-e08099141323'::uuid, 'https://www.truper.com/media/import/imagenes/DP-3-16X4B.jpg', 6),
  ('d74df9e7-4238-4299-85bb-6b4c25c126e1'::uuid, '09cfe848-e36c-45e4-9957-e08099141323'::uuid, 'https://www.truper.com/media/import/imagenes/DP-3-16X4B+FC1.jpg', 7),
  ('d74df9e7-4238-4299-85bb-6b4c25c126e1'::uuid, '09cfe848-e36c-45e4-9957-e08099141323'::uuid, 'https://www.truper.com/media/import/imagenes/DP-3-16X4B+FC2.jpg', 8),
  ('d74df9e7-4238-4299-85bb-6b4c25c126e1'::uuid, 'dc1412fb-ac32-4a1c-b86c-d998d38cd29a'::uuid, 'https://www.truper.com/media/import/imagenes/DP-3-16X6B.jpg', 9),
  ('d74df9e7-4238-4299-85bb-6b4c25c126e1'::uuid, 'dc1412fb-ac32-4a1c-b86c-d998d38cd29a'::uuid, 'https://www.truper.com/media/import/imagenes/DP-3-16X6B+FC2.jpg', 10),
  ('d74df9e7-4238-4299-85bb-6b4c25c126e1'::uuid, 'dc1412fb-ac32-4a1c-b86c-d998d38cd29a'::uuid, 'https://www.truper.com/media/import/imagenes/DP-3-16X6B+BIZQ1.jpg', 11),
  ('d74df9e7-4238-4299-85bb-6b4c25c126e1'::uuid, 'be84053e-7600-4f7d-9271-a042febcf40c'::uuid, 'https://www.truper.com/media/import/imagenes/DP-3-16X8B.jpg', 12),
  ('d74df9e7-4238-4299-85bb-6b4c25c126e1'::uuid, 'be84053e-7600-4f7d-9271-a042febcf40c'::uuid, 'https://www.truper.com/media/import/imagenes/DP-3-16X8B+FC2.jpg', 13),
  ('d74df9e7-4238-4299-85bb-6b4c25c126e1'::uuid, 'be84053e-7600-4f7d-9271-a042febcf40c'::uuid, 'https://www.truper.com/media/import/imagenes/DP-3-16X8B+BIZQ1.jpg', 14),
  ('d74df9e7-4238-4299-85bb-6b4c25c126e1'::uuid, 'adff7ad2-3ada-4f41-89dc-74e9a8c9824a'::uuid, 'https://www.truper.com/media/import/imagenes/DP-1-4X1-1-2B.jpg', 15),
  ('d74df9e7-4238-4299-85bb-6b4c25c126e1'::uuid, 'adff7ad2-3ada-4f41-89dc-74e9a8c9824a'::uuid, 'https://www.truper.com/media/import/imagenes/DP-1-4X1-1-2B+FC2.jpg', 16),
  ('d74df9e7-4238-4299-85bb-6b4c25c126e1'::uuid, 'adff7ad2-3ada-4f41-89dc-74e9a8c9824a'::uuid, 'https://www.truper.com/media/import/imagenes/DP-1-4X1-1-2B+BIZQ1.jpg', 17),
  ('d74df9e7-4238-4299-85bb-6b4c25c126e1'::uuid, '5915fb30-e682-4a86-bc23-ea42e7ec5e9e'::uuid, 'https://www.truper.com/media/import/imagenes/DP-1-4X4B.jpg', 18),
  ('d74df9e7-4238-4299-85bb-6b4c25c126e1'::uuid, '5915fb30-e682-4a86-bc23-ea42e7ec5e9e'::uuid, 'https://www.truper.com/media/import/imagenes/DP-1-4X4B+FC2.jpg', 19),
  ('d74df9e7-4238-4299-85bb-6b4c25c126e1'::uuid, '5915fb30-e682-4a86-bc23-ea42e7ec5e9e'::uuid, 'https://www.truper.com/media/import/imagenes/DP-1-4X4B+BIZQ1.jpg', 20),
  ('d74df9e7-4238-4299-85bb-6b4c25c126e1'::uuid, '19c5772f-4e86-4813-a948-77e5f2f6389a'::uuid, 'https://www.truper.com/media/import/imagenes/DP-1-4X8B.jpg', 21),
  ('d74df9e7-4238-4299-85bb-6b4c25c126e1'::uuid, '19c5772f-4e86-4813-a948-77e5f2f6389a'::uuid, 'https://www.truper.com/media/import/imagenes/DP-1-4X8B+FC2.jpg', 22),
  ('d74df9e7-4238-4299-85bb-6b4c25c126e1'::uuid, '19c5772f-4e86-4813-a948-77e5f2f6389a'::uuid, 'https://www.truper.com/media/import/imagenes/DP-1-4X8B+BIZQ1.jpg', 23),
  ('b3871233-0b3a-45f8-8124-4ae0760aea12'::uuid, '619beadb-5bcf-46cf-8ff3-a0e16eb6fbbd'::uuid, 'https://www.truper.com/media/import/imagenes/FILP-ASPI-G1.jpg', 0),
  ('b3871233-0b3a-45f8-8124-4ae0760aea12'::uuid, '619beadb-5bcf-46cf-8ff3-a0e16eb6fbbd'::uuid, 'https://www.truper.com/media/import/imagenes/FILP-ASPI-G1+D1.jpg', 1),
  ('3af2cc03-dee4-4cfd-9db1-87188aa47466'::uuid, '60c6d902-22c1-4ac3-ad6c-f3c30d93c332'::uuid, 'https://www.truper.com/media/import/imagenes/FILC-ASPI-G1.jpg', 0),
  ('3af2cc03-dee4-4cfd-9db1-87188aa47466'::uuid, '60c6d902-22c1-4ac3-ad6c-f3c30d93c332'::uuid, 'https://www.truper.com/media/import/imagenes/FILC-ASPI-G1+D1.jpg', 1),
  ('b502bff6-992b-41e1-8376-9006f431164f'::uuid, 'b291d3cf-054f-4f3e-a954-0ff45398c82e'::uuid, 'https://www.truper.com/media/import/imagenes/FILE-ASPI-G1.jpg', 0),
  ('b502bff6-992b-41e1-8376-9006f431164f'::uuid, 'b291d3cf-054f-4f3e-a954-0ff45398c82e'::uuid, 'https://www.truper.com/media/import/imagenes/FILE-ASPI-G1+D1.jpg', 1),
  ('56980a77-7251-422c-809b-27a03ca4ff30'::uuid, '22db4ada-727f-4125-8eb2-88adb45a3b4e'::uuid, 'https://www.truper.com/media/import/imagenes/FIL-ASPI-G1.jpg', 0),
  ('56980a77-7251-422c-809b-27a03ca4ff30'::uuid, '22db4ada-727f-4125-8eb2-88adb45a3b4e'::uuid, 'https://www.truper.com/media/import/imagenes/FIL-ASPI-G1+D1.jpg', 1),
  ('f4a9769e-2e5b-45a7-8980-5e6565b6f89f'::uuid, '9f368b61-170b-4436-b22c-339d0d22c6db'::uuid, 'https://www.truper.com/media/import/imagenes/ALL-25.jpg', 0),
  ('f4a9769e-2e5b-45a7-8980-5e6565b6f89f'::uuid, '9f368b61-170b-4436-b22c-339d0d22c6db'::uuid, 'https://www.truper.com/media/import/imagenes/ALL-25+FC1.jpg', 1),
  ('f4a9769e-2e5b-45a7-8980-5e6565b6f89f'::uuid, '9f368b61-170b-4436-b22c-339d0d22c6db'::uuid, 'https://www.truper.com/media/import/imagenes/ALL-25+FC2.jpg', 2),
  ('f4a9769e-2e5b-45a7-8980-5e6565b6f89f'::uuid, '9f368b61-170b-4436-b22c-339d0d22c6db'::uuid, 'https://www.truper.com/media/import/imagenes/ALL-25+FC3.jpg', 3),
  ('7510a73c-7293-4c74-8400-133eb8433598'::uuid, 'a9d6732f-d8f2-4772-b979-2a59ae39fd81'::uuid, 'https://www.truper.com/media/import/imagenes/J-DIMP-7.jpg', 0),
  ('7510a73c-7293-4c74-8400-133eb8433598'::uuid, 'a9d6732f-d8f2-4772-b979-2a59ae39fd81'::uuid, 'https://www.truper.com/media/import/imagenes/J-DIMP-7+FC1.jpg', 1),
  ('7510a73c-7293-4c74-8400-133eb8433598'::uuid, 'a9d6732f-d8f2-4772-b979-2a59ae39fd81'::uuid, 'https://www.truper.com/media/import/imagenes/J-DIMP-7+FC2.jpg', 2),
  ('7510a73c-7293-4c74-8400-133eb8433598'::uuid, 'a9d6732f-d8f2-4772-b979-2a59ae39fd81'::uuid, 'https://www.truper.com/media/import/imagenes/J-DIMP-7+BIZQ1.jpg', 3),
  ('012d7ff1-8f02-4a91-8871-2b47ea2eb1c2'::uuid, 'b2580de6-5393-48c0-a1c4-a8e257291aba'::uuid, 'https://www.truper.com/media/import/imagenes/TORX-8TLX.jpg', 0),
  ('012d7ff1-8f02-4a91-8871-2b47ea2eb1c2'::uuid, 'b2580de6-5393-48c0-a1c4-a8e257291aba'::uuid, 'https://www.truper.com/media/import/imagenes/TORX-8TLX+FC1.jpg', 1),
  ('012d7ff1-8f02-4a91-8871-2b47ea2eb1c2'::uuid, 'b2580de6-5393-48c0-a1c4-a8e257291aba'::uuid, 'https://www.truper.com/media/import/imagenes/TORX-8TLX+FC2.jpg', 2),
  ('012d7ff1-8f02-4a91-8871-2b47ea2eb1c2'::uuid, 'b2580de6-5393-48c0-a1c4-a8e257291aba'::uuid, 'https://www.truper.com/media/import/imagenes/TORX-8TLX+FC3.jpg', 3),
  ('65a811ac-4485-4f91-b20f-d0faa714fab3'::uuid, '91a6aeeb-7a95-447b-9aa7-ea2ba49283d2'::uuid, 'https://www.truper.com/media/import/imagenes/JBMX-9P.jpg', 0),
  ('9577b0d5-42f2-4594-8fa2-6b5244dac103'::uuid, '109391b8-9186-4679-86dd-9aea41173db3'::uuid, 'https://www.truper.com/media/import/imagenes/JBMX-9.jpg', 0),
  ('9577b0d5-42f2-4594-8fa2-6b5244dac103'::uuid, '109391b8-9186-4679-86dd-9aea41173db3'::uuid, 'https://www.truper.com/media/import/imagenes/JBMX-9+A1.jpg', 1),
  ('9577b0d5-42f2-4594-8fa2-6b5244dac103'::uuid, '109391b8-9186-4679-86dd-9aea41173db3'::uuid, 'https://www.truper.com/media/import/imagenes/JBMX-9+A2.jpg', 2),
  ('70d55294-7d58-4124-bbc3-42724e1d3fec'::uuid, '314bc94e-1369-4294-bced-f80e9e395c56'::uuid, 'https://www.truper.com/media/import/imagenes/ALL-10M.jpg', 0),
  ('70d55294-7d58-4124-bbc3-42724e1d3fec'::uuid, '314bc94e-1369-4294-bced-f80e9e395c56'::uuid, 'https://www.truper.com/media/import/imagenes/ALL-10M+FC1.jpg', 1),
  ('70d55294-7d58-4124-bbc3-42724e1d3fec'::uuid, '314bc94e-1369-4294-bced-f80e9e395c56'::uuid, 'https://www.truper.com/media/import/imagenes/ALL-10M+FC2.jpg', 2),
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
  ('bfbe60ff-dfea-408b-8857-301abde1d7ec'::uuid, '41ce2a48-e317-41eb-8796-90fa75902e6f'::uuid, 'https://www.truper.com/media/import/imagenes/SICI-7-1-4X.jpg', 0),
  ('bfbe60ff-dfea-408b-8857-301abde1d7ec'::uuid, '41ce2a48-e317-41eb-8796-90fa75902e6f'::uuid, 'https://www.truper.com/media/import/imagenes/SICI-7-1-4N5+FC2.jpg', 1),
  ('bfbe60ff-dfea-408b-8857-301abde1d7ec'::uuid, '41ce2a48-e317-41eb-8796-90fa75902e6f'::uuid, 'https://www.truper.com/media/import/imagenes/SICI-7-1-4N5+BIZQ1.jpg', 2),
  ('bfbe60ff-dfea-408b-8857-301abde1d7ec'::uuid, '41ce2a48-e317-41eb-8796-90fa75902e6f'::uuid, 'https://www.truper.com/media/import/imagenes/SICI-7-1-4N5.jpg', 3),
  ('bfbe60ff-dfea-408b-8857-301abde1d7ec'::uuid, '41ce2a48-e317-41eb-8796-90fa75902e6f'::uuid, 'https://www.truper.com/media/import/imagenes/SICI-7-1-4N5+MP1.jpg', 4),
  ('bfbe60ff-dfea-408b-8857-301abde1d7ec'::uuid, '41ce2a48-e317-41eb-8796-90fa75902e6f'::uuid, 'https://www.truper.com/media/import/imagenes/SICI-7-1-4N5+MP2.jpg', 5),
  ('bfbe60ff-dfea-408b-8857-301abde1d7ec'::uuid, '41ce2a48-e317-41eb-8796-90fa75902e6f'::uuid, 'https://www.truper.com/media/import/imagenes/SICI-7-1-4N5+MP3.jpg', 6),
  ('bfbe60ff-dfea-408b-8857-301abde1d7ec'::uuid, '41ce2a48-e317-41eb-8796-90fa75902e6f'::uuid, 'https://www.truper.com/media/import/imagenes/SICI-7-1-4N5+MP4.jpg', 7),
  ('bfbe60ff-dfea-408b-8857-301abde1d7ec'::uuid, '41ce2a48-e317-41eb-8796-90fa75902e6f'::uuid, 'https://www.truper.com/media/import/imagenes/SICI-7-1-4N5+MP5.jpg', 8),
  ('bfbe60ff-dfea-408b-8857-301abde1d7ec'::uuid, '41ce2a48-e317-41eb-8796-90fa75902e6f'::uuid, 'https://www.truper.com/media/import/imagenes/SICI-7-1-4N5+MP6.jpg', 9),
  ('bfbe60ff-dfea-408b-8857-301abde1d7ec'::uuid, '41ce2a48-e317-41eb-8796-90fa75902e6f'::uuid, 'https://www.truper.com/media/import/imagenes/SICI-7-1-4N5+MP7.jpg', 10),
  ('b4e26104-1a7a-4add-b4df-89f702a5b18e'::uuid, '942c5840-57fe-42f2-ac68-d018f48b83f0'::uuid, 'https://www.truper.com/media/import/imagenes/PCT-8K.jpg', 0),
  ('b4e26104-1a7a-4add-b4df-89f702a5b18e'::uuid, '942c5840-57fe-42f2-ac68-d018f48b83f0'::uuid, 'https://www.truper.com/media/import/imagenes/PCT-8K+D1.jpg', 1),
  ('b4e26104-1a7a-4add-b4df-89f702a5b18e'::uuid, '942c5840-57fe-42f2-ac68-d018f48b83f0'::uuid, 'https://www.truper.com/media/import/imagenes/PCT-8K+BIZQ1.jpg', 2),
  ('ac5fe225-60dc-4fa1-8a4e-4f1c8c2bd13f'::uuid, '1b5763f4-6d3b-4fc5-b676-9c287c038651'::uuid, 'https://www.truper.com/media/import/imagenes/BAS-200PLA.jpg', 0),
  ('ac5fe225-60dc-4fa1-8a4e-4f1c8c2bd13f'::uuid, '1b5763f4-6d3b-4fc5-b676-9c287c038651'::uuid, 'https://www.truper.com/media/import/imagenes/BAS-200PLA+A3.jpg', 1),
  ('ac5fe225-60dc-4fa1-8a4e-4f1c8c2bd13f'::uuid, '1b5763f4-6d3b-4fc5-b676-9c287c038651'::uuid, 'https://www.truper.com/media/import/imagenes/BAS-200PLA+FC1.jpg', 2),
  ('ac5fe225-60dc-4fa1-8a4e-4f1c8c2bd13f'::uuid, '1b5763f4-6d3b-4fc5-b676-9c287c038651'::uuid, 'https://www.truper.com/media/import/imagenes/BAS-200PLA+FC2.jpg', 3),
  ('3b11666d-ca9c-4b3e-89ee-e59ef3a47159'::uuid, 'b2d21318-d556-4b5a-8eb9-3a119c8c4ca8'::uuid, 'https://www.truper.com/media/import/imagenes/BASE-5T.jpg', 0),
  ('3b11666d-ca9c-4b3e-89ee-e59ef3a47159'::uuid, 'b2d21318-d556-4b5a-8eb9-3a119c8c4ca8'::uuid, 'https://www.truper.com/media/import/imagenes/BASE-5T+FC1.jpg', 1),
  ('3b11666d-ca9c-4b3e-89ee-e59ef3a47159'::uuid, 'b2d21318-d556-4b5a-8eb9-3a119c8c4ca8'::uuid, 'https://www.truper.com/media/import/imagenes/BASE-5T+FC2.jpg', 2),
  ('ab0c95b0-22ff-4059-a64d-cee57de7a515'::uuid, '3cb19f1b-3543-41d7-97d7-25d132ae34bd'::uuid, 'https://www.truper.com/media/import/imagenes/BASE-40T.jpg', 0),
  ('ab0c95b0-22ff-4059-a64d-cee57de7a515'::uuid, '3cb19f1b-3543-41d7-97d7-25d132ae34bd'::uuid, 'https://www.truper.com/media/import/imagenes/BASE-40T+D1.jpg', 1),
  ('ab0c95b0-22ff-4059-a64d-cee57de7a515'::uuid, '3cb19f1b-3543-41d7-97d7-25d132ae34bd'::uuid, 'https://www.truper.com/media/import/imagenes/BASE-40T+FC1.jpg', 2),
  ('ab0c95b0-22ff-4059-a64d-cee57de7a515'::uuid, '3cb19f1b-3543-41d7-97d7-25d132ae34bd'::uuid, 'https://www.truper.com/media/import/imagenes/BASE-40T+FC2.jpg', 3),
  ('ab0c95b0-22ff-4059-a64d-cee57de7a515'::uuid, '3cb19f1b-3543-41d7-97d7-25d132ae34bd'::uuid, 'https://www.truper.com/media/import/imagenes/BASE-40T+FC3.jpg', 4),
  ('ab0c95b0-22ff-4059-a64d-cee57de7a515'::uuid, '55310c7c-11eb-427c-906e-ab1ad6521481'::uuid, 'https://www.truper.com/media/import/imagenes/BASE-40U.jpg', 5),
  ('ab0c95b0-22ff-4059-a64d-cee57de7a515'::uuid, '55310c7c-11eb-427c-906e-ab1ad6521481'::uuid, 'https://www.truper.com/media/import/imagenes/BASE-40U+FC1.jpg', 6),
  ('ab0c95b0-22ff-4059-a64d-cee57de7a515'::uuid, '55310c7c-11eb-427c-906e-ab1ad6521481'::uuid, 'https://www.truper.com/media/import/imagenes/BASE-40U+FC2.jpg', 7),
  ('41070018-0224-45dd-ae3f-57c28ff4e2c9'::uuid, 'a18bf174-77b6-4975-a658-e035876dbb54'::uuid, 'https://www.truper.com/media/import/imagenes/CUT-6XX.jpg', 0),
  ('41070018-0224-45dd-ae3f-57c28ff4e2c9'::uuid, 'a18bf174-77b6-4975-a658-e035876dbb54'::uuid, 'https://www.truper.com/media/import/imagenes/CUT-6XX+BIZQ1.jpg', 1),
  ('41070018-0224-45dd-ae3f-57c28ff4e2c9'::uuid, 'a18bf174-77b6-4975-a658-e035876dbb54'::uuid, 'https://www.truper.com/media/import/imagenes/CUT-6XX+FC2.jpg', 2),
  ('ecd569c3-73cb-44b9-94ed-7d31ae60e1d1'::uuid, '157658a6-38f9-4dc5-b949-8a321aeb7729'::uuid, 'https://www.truper.com/media/import/imagenes/BOPE-60.jpg', 0),
  ('ecd569c3-73cb-44b9-94ed-7d31ae60e1d1'::uuid, '157658a6-38f9-4dc5-b949-8a321aeb7729'::uuid, 'https://www.truper.com/media/import/imagenes/BOPE-60+FC1.jpg', 1),
  ('ecd569c3-73cb-44b9-94ed-7d31ae60e1d1'::uuid, '157658a6-38f9-4dc5-b949-8a321aeb7729'::uuid, 'https://www.truper.com/media/import/imagenes/BOPE-60+FC2.jpg', 2),
  ('ecd569c3-73cb-44b9-94ed-7d31ae60e1d1'::uuid, '157658a6-38f9-4dc5-b949-8a321aeb7729'::uuid, 'https://www.truper.com/media/import/imagenes/BOPE-60+FC3.jpg', 3),
  ('255b61eb-53c3-46c0-a87a-636c66d3b259'::uuid, 'b14783ac-438b-4f61-abbc-fcfed7cdf63e'::uuid, 'https://www.truper.com/media/import/imagenes/REP-CUT-650.jpg', 0),
  ('255b61eb-53c3-46c0-a87a-636c66d3b259'::uuid, 'b14783ac-438b-4f61-abbc-fcfed7cdf63e'::uuid, 'https://www.truper.com/media/import/imagenes/REP-CUT-650+BIZQ1.jpg', 1),
  ('d74df9e7-4238-4299-85bb-6b4c25c126e1'::uuid, '8656b72f-36b6-4715-93ce-6dc4995f5507'::uuid, 'https://www.truper.com/media/import/imagenes/DP-1-8X2-1-2B.jpg', 24),
  ('d74df9e7-4238-4299-85bb-6b4c25c126e1'::uuid, '8656b72f-36b6-4715-93ce-6dc4995f5507'::uuid, 'https://www.truper.com/media/import/imagenes/DP-1-8X2-1-2B+FC2.jpg', 25),
  ('d74df9e7-4238-4299-85bb-6b4c25c126e1'::uuid, '8656b72f-36b6-4715-93ce-6dc4995f5507'::uuid, 'https://www.truper.com/media/import/imagenes/DP-1-8X2-1-2B+BIZQ1.jpg', 26),
  ('70e841f3-c1b7-4523-9190-0117744b4ca4'::uuid, '420d3e02-ea47-4f7d-a74a-fc5edeaee955'::uuid, 'https://www.truper.com/media/import/imagenes/FILF-ASPI-12-16.jpg', 0),
  ('70e841f3-c1b7-4523-9190-0117744b4ca4'::uuid, '420d3e02-ea47-4f7d-a74a-fc5edeaee955'::uuid, 'https://www.truper.com/media/import/imagenes/FILF-ASPI-12-16+D1.jpg', 1),
  ('b502bff6-992b-41e1-8376-9006f431164f'::uuid, '37c4db69-556c-4254-9707-4e4d2eadcad6'::uuid, 'https://www.truper.com/media/import/imagenes/FE-AS-8X-16X.jpg', 2),
  ('b502bff6-992b-41e1-8376-9006f431164f'::uuid, '37c4db69-556c-4254-9707-4e4d2eadcad6'::uuid, 'https://www.truper.com/media/import/imagenes/FE-AS-8X-16X+D1.jpg', 3),
  ('24d66180-853d-4d3f-81fe-8e109156dcce'::uuid, '5f41b30d-6e6c-4a31-9a29-5080cdd53902'::uuid, 'https://www.truper.com/media/import/imagenes/JBAV-5R.jpg', 0),
  ('24d66180-853d-4d3f-81fe-8e109156dcce'::uuid, '5f41b30d-6e6c-4a31-9a29-5080cdd53902'::uuid, 'https://www.truper.com/media/import/imagenes/JBAV-5R+D1.jpg', 1),
  ('24d66180-853d-4d3f-81fe-8e109156dcce'::uuid, '5f41b30d-6e6c-4a31-9a29-5080cdd53902'::uuid, 'https://www.truper.com/media/import/imagenes/JBAV-5R+FC1.jpg', 2),
  ('c4561ac3-55ba-4a9a-a99d-fd898c92b8c5'::uuid, 'f2d02742-57bf-4acd-938e-611050fb9051'::uuid, 'https://www.truper.com/media/import/imagenes/DTJ-5B.jpg', 0),
  ('c4561ac3-55ba-4a9a-a99d-fd898c92b8c5'::uuid, 'f2d02742-57bf-4acd-938e-611050fb9051'::uuid, 'https://www.truper.com/media/import/imagenes/DTJ-5B+FC2.jpg', 1),
  ('c4561ac3-55ba-4a9a-a99d-fd898c92b8c5'::uuid, 'f2d02742-57bf-4acd-938e-611050fb9051'::uuid, 'https://www.truper.com/media/import/imagenes/DTJ-5B+BIZQ1.jpg', 2),
  ('dddcec6b-60ee-44b7-b989-f76bca1a1025'::uuid, 'a0a6c948-e007-4c8d-b3ba-f8771a0bf26a'::uuid, 'https://www.truper.com/media/import/imagenes/DTJ-6B.jpg', 0),
  ('dddcec6b-60ee-44b7-b989-f76bca1a1025'::uuid, 'a0a6c948-e007-4c8d-b3ba-f8771a0bf26a'::uuid, 'https://www.truper.com/media/import/imagenes/DTJ-6B+FC2.jpg', 1),
  ('dddcec6b-60ee-44b7-b989-f76bca1a1025'::uuid, 'a0a6c948-e007-4c8d-b3ba-f8771a0bf26a'::uuid, 'https://www.truper.com/media/import/imagenes/DTJ-6B+BIZQ1.jpg', 2),
  ('310f93fb-43f5-49ad-b3d1-5238190f5414'::uuid, 'bb1cd7a2-55a8-4b2f-b372-55ca7ac312a6'::uuid, 'https://www.truper.com/media/import/imagenes/EXA-13P.jpg', 0),
  ('310f93fb-43f5-49ad-b3d1-5238190f5414'::uuid, 'bb1cd7a2-55a8-4b2f-b372-55ca7ac312a6'::uuid, 'https://www.truper.com/media/import/imagenes/EXA-13P+BIZQ1.jpg', 1),
  ('310f93fb-43f5-49ad-b3d1-5238190f5414'::uuid, 'bb1cd7a2-55a8-4b2f-b372-55ca7ac312a6'::uuid, 'https://www.truper.com/media/import/imagenes/EXA-13P+D1.jpg', 2),
  ('6554d9bd-98ea-4bff-80f8-02c96f2420dc'::uuid, '0d61e938-d014-4782-9fc0-36bc5485f0d5'::uuid, 'https://www.truper.com/media/import/imagenes/JBS-5.jpg', 0),
  ('6554d9bd-98ea-4bff-80f8-02c96f2420dc'::uuid, '0d61e938-d014-4782-9fc0-36bc5485f0d5'::uuid, 'https://www.truper.com/media/import/imagenes/JBS-5+BIZQ1.jpg', 1),
  ('9bf78424-4586-40c9-951b-fe3a8262b0f9'::uuid, '9056c2f3-e2aa-4a52-acd9-b8f024f73633'::uuid, 'https://www.truper.com/media/import/imagenes/MOTB-2.jpg', 0),
  ('9bf78424-4586-40c9-951b-fe3a8262b0f9'::uuid, '9056c2f3-e2aa-4a52-acd9-b8f024f73633'::uuid, 'https://www.truper.com/media/import/imagenes/MOTB-2+FC2.jpg', 1),
  ('9bf78424-4586-40c9-951b-fe3a8262b0f9'::uuid, '9056c2f3-e2aa-4a52-acd9-b8f024f73633'::uuid, 'https://www.truper.com/media/import/imagenes/MOTB-2+FC1.jpg', 2),
  ('9bf78424-4586-40c9-951b-fe3a8262b0f9'::uuid, '9056c2f3-e2aa-4a52-acd9-b8f024f73633'::uuid, 'https://www.truper.com/media/import/imagenes/MOTB-2+FC3.jpg', 3),
  ('e12fd740-df31-409c-b1d2-002a6901c793'::uuid, '59bdcf3f-cc0c-43c4-ab78-e1466c7e5f15'::uuid, 'https://www.truper.com/media/import/imagenes/VAL-BA-5.jpg', 0),
  ('e12fd740-df31-409c-b1d2-002a6901c793'::uuid, '59bdcf3f-cc0c-43c4-ab78-e1466c7e5f15'::uuid, 'https://www.truper.com/media/import/imagenes/VAL-BA-5+FC1.jpg', 1),
  ('e12fd740-df31-409c-b1d2-002a6901c793'::uuid, '59bdcf3f-cc0c-43c4-ab78-e1466c7e5f15'::uuid, 'https://www.truper.com/media/import/imagenes/VAL-BA-5+FC2.jpg', 2),
  ('dc864a73-4c43-4650-977c-5cfc2e337498'::uuid, '0749e8d9-3799-4d29-add1-df61378b5b18'::uuid, 'https://www.truper.com/media/import/imagenes/BOMEX-28.jpg', 0),
  ('dc864a73-4c43-4650-977c-5cfc2e337498'::uuid, '0749e8d9-3799-4d29-add1-df61378b5b18'::uuid, 'https://www.truper.com/media/import/imagenes/BOMEX-28+FC1.jpg', 1),
  ('dc864a73-4c43-4650-977c-5cfc2e337498'::uuid, '0749e8d9-3799-4d29-add1-df61378b5b18'::uuid, 'https://www.truper.com/media/import/imagenes/BOMEX-28+BIZQ1.jpg', 2),
  ('dc864a73-4c43-4650-977c-5cfc2e337498'::uuid, 'ad1fcf17-693e-463f-b843-c2e13e3a41f4'::uuid, 'https://www.truper.com/media/import/imagenes/BOMEX-25.jpg', 3),
  ('dc864a73-4c43-4650-977c-5cfc2e337498'::uuid, 'ad1fcf17-693e-463f-b843-c2e13e3a41f4'::uuid, 'https://www.truper.com/media/import/imagenes/BOMEX-25+FC1.jpg', 4),
  ('dc864a73-4c43-4650-977c-5cfc2e337498'::uuid, 'ad1fcf17-693e-463f-b843-c2e13e3a41f4'::uuid, 'https://www.truper.com/media/import/imagenes/BOMEX-25+BIZQ1.jpg', 5),
  ('dc864a73-4c43-4650-977c-5cfc2e337498'::uuid, 'd022a74c-4f07-48a3-b4b1-2bd3659097de'::uuid, 'https://www.truper.com/media/import/imagenes/BOMEX-31.jpg', 6),
  ('dc864a73-4c43-4650-977c-5cfc2e337498'::uuid, 'd022a74c-4f07-48a3-b4b1-2bd3659097de'::uuid, 'https://www.truper.com/media/import/imagenes/BOMEX-31+BIZQ1.jpg', 7),
  ('dc864a73-4c43-4650-977c-5cfc2e337498'::uuid, 'd0f1da9b-a3c1-4d1b-aeb3-36c575a3a944'::uuid, 'https://www.truper.com/media/import/imagenes/BOMEX-35.jpg', 8),
  ('dc864a73-4c43-4650-977c-5cfc2e337498'::uuid, 'd0f1da9b-a3c1-4d1b-aeb3-36c575a3a944'::uuid, 'https://www.truper.com/media/import/imagenes/BOMEX-35+BIZQ1.jpg', 9),
  ('3b27332b-a1bb-45ad-a396-3b0fd91c6fbf'::uuid, '8c288c5c-16e9-4066-bec4-b305918239f9'::uuid, 'https://www.truper.com/media/import/imagenes/CHR-40A.jpg', 0),
  ('3b27332b-a1bb-45ad-a396-3b0fd91c6fbf'::uuid, '8c288c5c-16e9-4066-bec4-b305918239f9'::uuid, 'https://www.truper.com/media/import/imagenes/CHR-40A+D2.jpg', 1),
  ('3b27332b-a1bb-45ad-a396-3b0fd91c6fbf'::uuid, '8c288c5c-16e9-4066-bec4-b305918239f9'::uuid, 'https://www.truper.com/media/import/imagenes/CHR-40A+BIZQ1.jpg', 2),
  ('3b27332b-a1bb-45ad-a396-3b0fd91c6fbf'::uuid, '8c288c5c-16e9-4066-bec4-b305918239f9'::uuid, 'https://www.truper.com/media/import/imagenes/CHR-40A+D1.jpg', 3),
  ('3b27332b-a1bb-45ad-a396-3b0fd91c6fbf'::uuid, 'f320c7c0-afd6-42c6-bcbd-375694ff2d9e'::uuid, 'https://www.truper.com/media/import/imagenes/CHR-50A.jpg', 4),
  ('3b27332b-a1bb-45ad-a396-3b0fd91c6fbf'::uuid, 'f320c7c0-afd6-42c6-bcbd-375694ff2d9e'::uuid, 'https://www.truper.com/media/import/imagenes/CHR-50A+BIZQ1.jpg', 5),
  ('3b27332b-a1bb-45ad-a396-3b0fd91c6fbf'::uuid, 'f320c7c0-afd6-42c6-bcbd-375694ff2d9e'::uuid, 'https://www.truper.com/media/import/imagenes/CHR-50A+D1.jpg', 6),
  ('3b27332b-a1bb-45ad-a396-3b0fd91c6fbf'::uuid, 'f320c7c0-afd6-42c6-bcbd-375694ff2d9e'::uuid, 'https://www.truper.com/media/import/imagenes/CHR-50A+D2.jpg', 7),
  ('546ee899-4ea6-4802-b90a-e909903b6c33'::uuid, '42638085-be29-492d-ade7-13b622ae0ad5'::uuid, 'https://www.truper.com/media/import/imagenes/ALLX-7P.jpg', 0),
  ('546ee899-4ea6-4802-b90a-e909903b6c33'::uuid, '42638085-be29-492d-ade7-13b622ae0ad5'::uuid, 'https://www.truper.com/media/import/imagenes/ALLX-7P+FC1.jpg', 1),
  ('546ee899-4ea6-4802-b90a-e909903b6c33'::uuid, '42638085-be29-492d-ade7-13b622ae0ad5'::uuid, 'https://www.truper.com/media/import/imagenes/ALLX-7P+FC2.jpg', 2),
  ('546ee899-4ea6-4802-b90a-e909903b6c33'::uuid, '42638085-be29-492d-ade7-13b622ae0ad5'::uuid, 'https://www.truper.com/media/import/imagenes/ALLX-7P+FC3.jpg', 3),
  ('546ee899-4ea6-4802-b90a-e909903b6c33'::uuid, '0d42e7b5-b316-4c1f-87e8-57ab8271d6be'::uuid, 'https://www.truper.com/media/import/imagenes/ALLX-7M.jpg', 4),
  ('546ee899-4ea6-4802-b90a-e909903b6c33'::uuid, '0d42e7b5-b316-4c1f-87e8-57ab8271d6be'::uuid, 'https://www.truper.com/media/import/imagenes/ALLX-7M+FC1.jpg', 5),
  ('546ee899-4ea6-4802-b90a-e909903b6c33'::uuid, '0d42e7b5-b316-4c1f-87e8-57ab8271d6be'::uuid, 'https://www.truper.com/media/import/imagenes/ALLX-7M+FC2.jpg', 6),
  ('546ee899-4ea6-4802-b90a-e909903b6c33'::uuid, '0d42e7b5-b316-4c1f-87e8-57ab8271d6be'::uuid, 'https://www.truper.com/media/import/imagenes/ALLX-7M+FC3.jpg', 7),
  ('546ee899-4ea6-4802-b90a-e909903b6c33'::uuid, 'edc467eb-62c4-4dfd-98b4-0be0e632d32b'::uuid, 'https://www.truper.com/media/import/imagenes/ALLX-10M.jpg', 8),
  ('546ee899-4ea6-4802-b90a-e909903b6c33'::uuid, 'edc467eb-62c4-4dfd-98b4-0be0e632d32b'::uuid, 'https://www.truper.com/media/import/imagenes/ALLX-10M+FC1.jpg', 9),
  ('546ee899-4ea6-4802-b90a-e909903b6c33'::uuid, 'edc467eb-62c4-4dfd-98b4-0be0e632d32b'::uuid, 'https://www.truper.com/media/import/imagenes/ALLX-10M+FC2.jpg', 10),
  ('546ee899-4ea6-4802-b90a-e909903b6c33'::uuid, 'edc467eb-62c4-4dfd-98b4-0be0e632d32b'::uuid, 'https://www.truper.com/media/import/imagenes/ALLX-10M+FC3.jpg', 11),
  ('546ee899-4ea6-4802-b90a-e909903b6c33'::uuid, 'bd616b95-1d2d-4f02-9436-cfbfdb21557b'::uuid, 'https://www.truper.com/media/import/imagenes/ALLX-13P.jpg', 12),
  ('546ee899-4ea6-4802-b90a-e909903b6c33'::uuid, 'bd616b95-1d2d-4f02-9436-cfbfdb21557b'::uuid, 'https://www.truper.com/media/import/imagenes/ALLX-13P+FC1.jpg', 13),
  ('546ee899-4ea6-4802-b90a-e909903b6c33'::uuid, 'bd616b95-1d2d-4f02-9436-cfbfdb21557b'::uuid, 'https://www.truper.com/media/import/imagenes/ALLX-13P+FC2.jpg', 14),
  ('546ee899-4ea6-4802-b90a-e909903b6c33'::uuid, 'bd616b95-1d2d-4f02-9436-cfbfdb21557b'::uuid, 'https://www.truper.com/media/import/imagenes/ALLX-13P+FC3.jpg', 15),
  ('546ee899-4ea6-4802-b90a-e909903b6c33'::uuid, 'c7da0c48-296d-4d5d-bdf5-4a612f16e749'::uuid, 'https://www.truper.com/media/import/imagenes/ALLX-13M.jpg', 16),
  ('546ee899-4ea6-4802-b90a-e909903b6c33'::uuid, 'c7da0c48-296d-4d5d-bdf5-4a612f16e749'::uuid, 'https://www.truper.com/media/import/imagenes/ALLX-13M+FC1.jpg', 17),
  ('546ee899-4ea6-4802-b90a-e909903b6c33'::uuid, 'c7da0c48-296d-4d5d-bdf5-4a612f16e749'::uuid, 'https://www.truper.com/media/import/imagenes/ALLX-13M+FC2.jpg', 18),
  ('546ee899-4ea6-4802-b90a-e909903b6c33'::uuid, 'c7da0c48-296d-4d5d-bdf5-4a612f16e749'::uuid, 'https://www.truper.com/media/import/imagenes/ALLX-13M+FC3.jpg', 19),
  ('70d55294-7d58-4124-bbc3-42724e1d3fec'::uuid, 'a9f2478c-779f-4f5c-bd5c-26f77ef2cd14'::uuid, 'https://www.truper.com/media/import/imagenes/ALL-10P.jpg', 3),
  ('70d55294-7d58-4124-bbc3-42724e1d3fec'::uuid, 'a9f2478c-779f-4f5c-bd5c-26f77ef2cd14'::uuid, 'https://www.truper.com/media/import/imagenes/ALL-10P+FC1.jpg', 4),
  ('70d55294-7d58-4124-bbc3-42724e1d3fec'::uuid, 'a9f2478c-779f-4f5c-bd5c-26f77ef2cd14'::uuid, 'https://www.truper.com/media/import/imagenes/ALL-10P+FC2.jpg', 5),
  ('70d55294-7d58-4124-bbc3-42724e1d3fec'::uuid, '034386a1-5e43-4a49-bf1c-d67b2dd0e262'::uuid, 'https://www.truper.com/media/import/imagenes/ALL-13P.jpg', 6),
  ('70d55294-7d58-4124-bbc3-42724e1d3fec'::uuid, '034386a1-5e43-4a49-bf1c-d67b2dd0e262'::uuid, 'https://www.truper.com/media/import/imagenes/ALL-13P+FC1.jpg', 7),
  ('70d55294-7d58-4124-bbc3-42724e1d3fec'::uuid, '034386a1-5e43-4a49-bf1c-d67b2dd0e262'::uuid, 'https://www.truper.com/media/import/imagenes/ALL-13P+FC2.jpg', 8),
  ('70d55294-7d58-4124-bbc3-42724e1d3fec'::uuid, 'eb4dd115-994a-48cd-a116-80a23cb36d33'::uuid, 'https://www.truper.com/media/import/imagenes/ALL-13M.jpg', 9),
  ('70d55294-7d58-4124-bbc3-42724e1d3fec'::uuid, 'eb4dd115-994a-48cd-a116-80a23cb36d33'::uuid, 'https://www.truper.com/media/import/imagenes/ALL-13M+FC1.jpg', 10),
  ('70d55294-7d58-4124-bbc3-42724e1d3fec'::uuid, 'eb4dd115-994a-48cd-a116-80a23cb36d33'::uuid, 'https://www.truper.com/media/import/imagenes/ALL-13M+FC2.jpg', 11),
  ('8244498a-2996-40c5-9074-fb154d7b8516'::uuid, '536e1d9f-e74d-461e-9b87-7d94031e4dbc'::uuid, 'https://www.truper.com/media/import/imagenes/ALL-10P-P.jpg', 0),
  ('8244498a-2996-40c5-9074-fb154d7b8516'::uuid, '536e1d9f-e74d-461e-9b87-7d94031e4dbc'::uuid, 'https://www.truper.com/media/import/imagenes/ALL-10P-P+FC1.jpg', 1),
  ('8244498a-2996-40c5-9074-fb154d7b8516'::uuid, '536e1d9f-e74d-461e-9b87-7d94031e4dbc'::uuid, 'https://www.truper.com/media/import/imagenes/ALL-10P-P+FC2.jpg', 2),
  ('8244498a-2996-40c5-9074-fb154d7b8516'::uuid, 'd2f8b519-3adb-4e90-9496-bd9fbac84380'::uuid, 'https://www.truper.com/media/import/imagenes/ALL-13P-P.jpg', 3),
  ('8244498a-2996-40c5-9074-fb154d7b8516'::uuid, 'd2f8b519-3adb-4e90-9496-bd9fbac84380'::uuid, 'https://www.truper.com/media/import/imagenes/ALL-13P-P+FC1.jpg', 4),
  ('8244498a-2996-40c5-9074-fb154d7b8516'::uuid, 'd2f8b519-3adb-4e90-9496-bd9fbac84380'::uuid, 'https://www.truper.com/media/import/imagenes/ALL-13P-P+FC2.jpg', 5),
  ('8244498a-2996-40c5-9074-fb154d7b8516'::uuid, '68568f47-7f73-495a-ba21-a3fcd6bc87f8'::uuid, 'https://www.truper.com/media/import/imagenes/ALL-13M-P.jpg', 6),
  ('8244498a-2996-40c5-9074-fb154d7b8516'::uuid, '68568f47-7f73-495a-ba21-a3fcd6bc87f8'::uuid, 'https://www.truper.com/media/import/imagenes/ALL-13M-P+FC1.jpg', 7),
  ('8244498a-2996-40c5-9074-fb154d7b8516'::uuid, '68568f47-7f73-495a-ba21-a3fcd6bc87f8'::uuid, 'https://www.truper.com/media/import/imagenes/ALL-13M-P+FC2.jpg', 8)
) as v(product_id, variant_id, url, orden)
where not exists (
  select 1 from public.product_images i
  where i.product_id = v.product_id and i.url = v.url
);

commit;

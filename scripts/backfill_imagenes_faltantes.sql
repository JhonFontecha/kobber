-- Las claves que este archivo no corrige están en scripts/corregir_claves_truper.sql,
-- que también inserta sus fotos. Correr los dos es seguro: ninguno pisa una URL existente.
--
-- Fotos para productos que la tienda pública tenía sin ninguna imagen.
-- Generado el 2026-11-25 contra https://www.truper.com/banco-contenido-digital/mx
-- NO es un cambio de esquema. Correr a mano en el SQL editor cuando quieras cargar las fotos.
-- No pisa una URL que el producto ya tenga.
--
-- Regla: se aceptó la foto solo si el código numérico de la variante existe en el banco
-- y la clave del banco coincide con la nuestra después de corregir dos lecturas típicas
-- del PDF (la letra I antes de / es el dígito 1; la I entre medidas es la x de pulgadas).
-- Si el código apuntaba a otra clave, no se cargó nada: mejor sin foto que la foto de otro producto.
--
-- Quedan con al menos una foto (8):
-- - Báscula mecánica gramera, 5 kg
-- - Destornilladores punta gabinete, empuñadura Comfort Grip
-- - Destornilladores punta pala, empuñadura Comfort Grip
-- - Destornilladores punta phillips, empuñadura Comfort Grip
-- - Sierra circular 1,200 W PRETUL
-- - Sierra circular 1,750 W TRUPER PRO
-- - Sierra circular 1,800 W TRUPER INDUSTRIAL
-- - Sierra circular 1,900 W TRUPER INDUSTRIAL
--
-- Siguen sin foto (33), porque la clave no está en el banco
-- o el código numérico corresponde a otro producto:
-- - Afilador de cuchillos, base con ventosa
-- - Aspiradora eléctrica canister
-- - Aspiradoras inalámbricas para auto, 20 V - TRUPER PRO
-- - Barras cavadoras
-- - Báscula electrónica de pilas
-- - Básculas electrónicas de alta precisión
-- - Básculas electrónicas grameras, 5 kg
-- - Bisturí 18 mm - profesional con alma y cuerpo metálicos y grip, trabajo pesado
-- - Bomba de pedal
-- - Bombas extractoras de líquidos
-- - Candados de acero, gancho corto, máxima seguridad
-- - Candados de acero, gancho largo, máxima seguridad
-- - Candados de hierro con coraza
-- - Candados de hierro, gancho largo
-- - Filtros y bolsas para aspiradoras — Bolsas para polvo
-- - Filtros y bolsas para aspiradoras — Filtro de cartucho polvo fino
-- - Filtros y bolsas para aspiradoras — Filtros de espuma para líquidos
-- - Filtros y bolsas para aspiradoras — Filtros de tela para sólidos (3 piezas)
-- - Juego de 25 llaves bristol largas mixtas, punta de bola, organizador plástico abatible
-- - Juego de 5 brocas de acero rápido (HSS), zanco de cambio rápido, TRUGOLD, 135°
-- - Juego de 5 destornilladores, empuñadura Comfort Grip
-- - Juego de 6 destornilladores, empuñadura Comfort Grip
-- - Juego de 7 destornilladores de golpe, empuñadura ámbar de PVC
-- - Juego de 8 llaves torx extralargas, empuñadura "T"
-- - Juego de 9 brocas de acero rápido, concreto y madera PRETUL
-- - Juego de 9 brocas de acero rápido, concreto y madera TRUPER
-- - Juego de bisturís con 13 cuchillas
-- - Juego de bisturís profesionales tipo lápiz con 13 cuchillas
-- - Juego de brocas SDS Plus, 5 piezas - Sistema directo de inserción SDS PLUS
-- - Juegos de llaves bristol largas, punta de bola, organizador plástico abatible
-- - Motobomba de combustión de 4 tiempos, Ø 1"
-- - Motobombas de combustión de 2 tiempos
-- - Válvulas para inflar balones

insert into public.product_images (product_id, variant_id, url, orden, fuente)
select v.product_id, v.variant_id, v.url, v.orden, 'banco-truper'
from (values
  ('c88d0238-5dfd-4912-81e0-e97d29a6316f'::uuid, '23b20a7e-322c-4cac-a6d0-7349c49a1479'::uuid, 'https://www.truper.com/media/import/imagenes/BAS-5CP.jpg', 0),
  ('c88d0238-5dfd-4912-81e0-e97d29a6316f'::uuid, '23b20a7e-322c-4cac-a6d0-7349c49a1479'::uuid, 'https://www.truper.com/media/import/imagenes/BAS-5CP+FC1.jpg', 1),
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
  ('bfbe60ff-dfea-408b-8857-301abde1d7ec'::uuid, '41ce2a48-e317-41eb-8796-90fa75902e6f'::uuid, 'https://www.truper.com/media/import/imagenes/SICI-7-1-4N5+MP7.jpg', 10)
) as v(product_id, variant_id, url, orden)
where not exists (
  select 1 from public.product_images i
  where i.product_id = v.product_id and i.url = v.url
);

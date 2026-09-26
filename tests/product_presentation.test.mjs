import test from 'node:test'
import assert from 'node:assert/strict'
import {productTitle, productMatches, matchingVariant, productSummary} from '../src/tienda/utils/productPresentation.mjs'
const product = {nombre:'Aceiteras TRUPER', marca:'TRUPER', variantes:[
  {id:'180',clave:'ACEF-180',codigo:'14870',descripcion:'180 ml (6 oz)'},
  {id:'300',clave:'ACEF-300',codigo:'14872',descripcion:'300 ml (10 oz)'}]}
test('title follows selected variant and avoids repeated details', () => {
 assert.equal(productTitle(product,product.variantes[0]),'Aceiteras TRUPER de 180 ml (6 oz)')
 assert.equal(productTitle(product,product.variantes[1]),'Aceiteras TRUPER de 300 ml (10 oz)')
 assert.equal(productTitle({nombre:'Alicate 10 pulgadas'},{descripcion:'10 pulgadas'}),'Alicate 10 pulgadas')
 assert.equal(productTitle(product,{}),'Aceiteras TRUPER')
})
test('search name, reference, code, units, accents and combined terms', () => {
 for (const query of ['aceiteras','ACEF-300','14872','300ml','TRUPER 300 ml','aceiteras 14872','']) assert.ok(productMatches(product,query),query)
 assert.ok(productMatches({nombre:'Alicate de precisión'},'precision'))
 assert.equal(productMatches(product,'taladro'),false)
 assert.equal(matchingVariant(product,'300ml'),1)
 assert.equal(matchingVariant(product,'14872'),1)
})
test('single variants expose real reference and characteristics', () => {
 assert.equal(productSummary({caracteristicas:['Cuerpo de acero']},product.variantes[0]),'Ref. ACEF-180 · Código 14870 · Cuerpo de acero')
})

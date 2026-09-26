import sys
import unittest
import asyncio
from types import SimpleNamespace
from unittest.mock import MagicMock, patch, AsyncMock
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / 'backend'))
from variant_images import galleries, image_variant_id
from routes.store import _serialize


class VariantImageTests(unittest.TestCase):
    def setUp(self):
        self.variants = [dict(id=str(n), clave=f'ACEF-{n}', precio_distribuidor=100)
                         for n in (180, 300, 500)]
        self.images = [dict(url=f'https://example.com/ACEF-{n}{suffix}.jpg',
                            orden=i, variant_id=None)
                       for n in (180, 300, 500)
                       for i, suffix in enumerate(('', '+FC1', '+FC2'))]

    def test_existing_nine_images_are_three_per_variant(self):
        result = galleries(self.images, self.variants)
        for n in (180, 300, 500):
            self.assertEqual(len(result[str(n)]), 3)
            self.assertTrue(all(f'ACEF-{n}' in url for url in result[str(n)]))

    def test_explicit_relation_overrides_filename(self):
        image = dict(self.images[0], variant_id='300')
        result = galleries([image], self.variants)
        self.assertEqual(result['300'], [image['url']])
        self.assertEqual(result['180'], [])

    def test_general_fallback_does_not_show_another_variant(self):
        general = dict(url='https://example.com/general.jpg', orden=9)
        result = galleries([self.images[0], general], self.variants)
        self.assertEqual(result['180'], [self.images[0]['url']])
        self.assertEqual(result['300'], [general['url']])

    def test_exact_match_encoded_suffix_and_ambiguity(self):
        self.assertEqual(image_variant_id('https://example.com/acef-300%2BFC1.JPG?q=1', self.variants), '300')
        self.assertIsNone(image_variant_id('https://example.com/ACEF-3000.jpg', self.variants))
        self.assertIsNone(image_variant_id('https://example.com/ACEF-300.jpg',
                          self.variants + [dict(id='other', clave='ACEF-300')]))

    def test_existing_response_and_prices_remain_compatible(self):
        product = dict(id='p', nombre='Aceiteras', product_variants=self.variants,
                       product_images=self.images)
        result = _serialize(product, 30)
        self.assertEqual(len(result['imagenes']), 9)
        self.assertEqual(result['precio'], 130)
        self.assertEqual(len(result['imagenes_por_variante']['300']), 3)
        self.assertTrue(all(i['variant_id'] is None for i in self.images))

    def test_no_images_and_generic_products(self):
        self.assertEqual(galleries([], self.variants)['300'], [])
        self.assertEqual(galleries([dict(url='generic.jpg')], self.variants)['300'], ['generic.jpg'])

    def test_upload_saves_selected_images_after_variant_ids_exist(self):
        from routes.catalog import _save_to_supabase
        db = MagicMock()
        products = db.table.return_value
        products.select.return_value.eq.return_value.eq.return_value.limit.return_value.execute.return_value.data = []
        products.insert.return_value.execute.side_effect = [
            SimpleNamespace(data=[{'id': 'p'}]),
            SimpleNamespace(data=[{'id': '180'}]),
            SimpleNamespace(data=[{'id': '300'}]),
            SimpleNamespace(data=[{'id': '500'}]),
        ]
        with patch('routes.catalog.get_client', return_value=db), patch('routes.images._save_images') as save:
            result = _save_to_supabase([dict(nombre='Aceiteras', variantes=self.variants,
                imagenes_seleccionadas=[i['url'] for i in self.images])])
        self.assertEqual(result['product_ids_sin_seleccion'], [])
        self.assertEqual(save.call_count, 3)
        for call in save.call_args_list:
            self.assertEqual(len(call.args[1]), 3)
            self.assertTrue(all('ACEF-' + call.kwargs['variant_id'] in url for url in call.args[1]))

    def test_background_fetch_keeps_variant_associations(self):
        from routes.catalog import _fetch_and_save_images_bulk
        db = MagicMock()
        db.table.return_value.select.return_value.in_.return_value.execute.return_value.data = [
            dict(v, product_id='p') for v in self.variants]
        async def fetch(clave):
            return [f'https://example.com/{clave}.jpg']
        with patch('routes.catalog.get_client', return_value=db), \
             patch('routes.images._fetch_for_clave', new=AsyncMock(side_effect=fetch)), \
             patch('routes.images._save_images') as save:
            asyncio.run(_fetch_and_save_images_bulk(['p']))
        self.assertEqual({c.kwargs['variant_id'] for c in save.call_args_list}, {'180', '300', '500'})


if __name__ == '__main__':
    unittest.main()

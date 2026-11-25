import unittest

from clave_ocr import normalizar_clave


class ClaveOcrTests(unittest.TestCase):
    def test_fraccion_y_por(self):
        self.assertEqual(normalizar_clave("SICI-7-I/4P"), "SICI-7-1/4P")
        self.assertEqual(normalizar_clave("DG-1/8I4B"), "DG-1/8X4B")
        self.assertEqual(normalizar_clave("DR-1/4I1-I/2B"), "DR-1/4X1-1/2B")

    def test_no_reescribe_otras_letras(self):
        self.assertEqual(normalizar_clave("AFI-CD"), "AFI-CD")
        self.assertEqual(normalizar_clave("BACD-150"), "BACD-150")
        self.assertEqual(normalizar_clave("FILE-ASPI-GI"), "FILE-ASPI-GI")
        self.assertIsNone(normalizar_clave(None))
        self.assertEqual(normalizar_clave(""), "")


if __name__ == "__main__":
    unittest.main()

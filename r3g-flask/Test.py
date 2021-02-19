"""Fichier permettant de faire des tests unitaires"""

import unittest
from server import APP


class Test(unittest.TestCase):
    """Classe de test"""

    def test_get_models(self):
        """get_models renvoie 200"""
        tester = APP.test_client(self)
        response = tester.get('/models/getModelsNames')
        self.assertEqual(response.status_code, 200)

if __name__ == "__main__":
    unittest.main()

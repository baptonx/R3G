import unittest
from Server import app


class Test(unittest.TestCase):
    def test_getModels(self):
        tester = app.test_client(self)
        response = tester.get('/models/getModelsNames')
        self.assertEqual(response.status_code, 200)

if __name__ == "__main__":
    unittest.main()
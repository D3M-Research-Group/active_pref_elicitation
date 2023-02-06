from django.test import TestCase
from rest_framework import status
from rest_framework.test import APITestCase, APIClient

# Create your tests here.


class RecPolicyTestCase(TestCase):
    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        cls.client = APIClient()
    def test_rec_policy_random(self):
        rec_policy_random = {
            "policiesShown": [
                [2,5],
                [12,14],
                [9,17],
                [7, 21],
                [6, 13],
                [12, 13],
                [7, 18],
                [3, 12],
                [9, 24],
                [0, 5]

            ],
            "userChoices": ["1", "1", "-1", "-1", "1", "-1", "1", "-1", "1", "1"],
            "prevStages": [
                "random",
                "random",
                "random",
                "random",
                "random",
                "random",
                "random",
                "random",
                "random",
                "random"
            ],
            "datasetName": "UK_6781beds-25policies",
            "nextStage": "adaptive",
            "recommended_item": { "adaptive": None, "random": None },
            "numFirstStage": 10
        }
        response = self.client.post("/rec_policy/", rec_policy_random, "application/json")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual({
                            "recommended_item": 12,
                            "current_stage": "random"
                            },
                            response.data)
    def test_rec_policy_adaptive(self):
        rec_policy_adaptive = {
            "policiesShown": [
            [2,8],
            [5,13],
            [4,22],
            [1,5],
            [1,18],
            [5,8],
            [18,20],
            [8,22],
            [2,3],
            [0,5]
        
            ],
            "userChoices": [1,-1,-1,-1,1,-1,1,-1,-1,1],
            "prevStages": [
            "adaptive",
            "adaptive",
            "adaptive",
            "adaptive",
            "adaptive",
            "adaptive",
            "adaptive",
            "adaptive",
            "adaptive",
            "adaptive"
            ],
            "datasetName": "UK_6781beds-25policies",
            "nextStage": "adaptive",
            "recommended_item": { "adaptive": None, "random": None },
            "numFirstStage": 10
        }
        response = self.client.post("/rec_policy/", rec_policy_adaptive, "application/json")
        self.assertEqual({
                            "recommended_item": 8,
                            "current_stage": "adaptive"
                            },
                            response.data)
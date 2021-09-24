from locust import HttpUser, between, task
import json

class WebsiteUser(HttpUser):
    wait_time = between(5, 15)
    
    # def on_start(self):
    #     self.client.get("/")
    
    @task
    def adaptive(self):
        payload = {
            "policiesShown": [[1,2], [3,4], [5,6]],
            "userChoices": [1,-1,0],
            "prevStages": ["adaptive", "adaptive", "adaptive"]
        }
        headers = {'content-type': 'application/json'}
        self.client.post("/next_query/", data=json.dumps(payload),
         headers=headers, catch_response=False)

    @task
    def random(self):
        payload = {
            "policiesShown": [[1,2], [3,4], [5,6]],
            "userChoices": [1,-1,0],
            "prevStages": ["random", "random", "random"]
        }
        headers = {'content-type': 'application/json'}
        self.client.post("/next_query/", data=json.dumps(payload),
         headers=headers, catch_response=False)    
        
    @task
    def data(self):
        self.client.get("/dataset/?dataset=COVID")
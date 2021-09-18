import json

covid_filename = "data/COVID/UK_1360beds-25policies.json"

with open(covid_filename) as fp:
    covid_data = json.load(fp)
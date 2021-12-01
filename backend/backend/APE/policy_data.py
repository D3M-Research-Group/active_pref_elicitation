import json
from elicitation_for_website.preference_classes import Item

covid_data_folder = "data/COVID"
covid_filenames = ["UK_1360beds-25policies.json", "UK_500beds-25policies.json", "UK_6781beds-25policies.json"]

covid_data_dict = {}
all_policies_dict = {}

for covid_filename in covid_filenames:
    with open(f"{covid_data_folder}/{covid_filename}") as fp:
        json_data = json.load(fp)
        covid_data_dict[covid_filename[:-5]] = json_data

        all_policies = []
        for i in range(len(json_data)):
            all_policies.append(Item(json_data[i]['values'], i, json_data[i]['labels']))
        all_policies_dict[covid_filename[:-5]] = all_policies
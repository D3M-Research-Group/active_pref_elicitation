import json
from elicitation_for_website.preference_classes import Item

# covid_data_folder = "data/COVID"
# covid_filenames = ["UK_1360beds-25policies.json", "UK_500beds-25policies.json", "UK_6781beds-25policies.json"]
# covid_normalized_filenames = ["UK_1360beds-25policies_rescaled01.json", "UK_500beds-25policies_rescaled01.json", "UK_6781beds-25policies_rescaled01.json"]


covid_data_folder = "data/LAHSA"
covid_filenames = ["AdultHMIS_20210922_preprocessed_final_Robust_edit.json"]
covid_normalized_filenames = ["AdultHMIS_20210922_preprocessed_final_Robust_edit_rescaled01.json"]


covid_data_dict = {}

covid_data_normalized_dict = {}
all_policies_dict = {}

# load the data that will be displayed on the front end
for covid_filename in covid_filenames:
    with open(f"{covid_data_folder}/{covid_filename}") as fp:
        json_data = json.load(fp)
        covid_data_dict[covid_filename[:-5]] = json_data

# load the backend normalized data
for covid_normalized_filename in covid_normalized_filenames:
    with open(f"{covid_data_folder}/{covid_normalized_filename}") as fp:
        json_data = json.load(fp)
        covid_data_normalized_dict[covid_normalized_filename[:-16]] = json_data
        all_policies = []
        # for i in range(len(json_data)):
        for i in json_data.keys():
            all_policies.append(Item(json_data[str(i)]['values'], int(i), json_data[str(i)]['labels']))
        all_policies_dict[covid_normalized_filename[:-16]] = all_policies
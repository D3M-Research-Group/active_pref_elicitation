import pickle

covid_pickle_file = "data/LAHSA/AdultHMIS_20210922_prep_K10_s0.05_mmr.p"

with open(covid_pickle_file, "rb") as fp:
    choices_data = pickle.load(fp)

# choices_data is a dictionary where the keys are tuples of tuples where each inner tuple is of the form (choice_A, choice_B, user_selection)
# the corresponding value is a tuple with the next choices to show a user
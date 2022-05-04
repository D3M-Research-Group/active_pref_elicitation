from elicitation_for_website.preference_classes import Item, Query, robust_utility
from elicitation_for_website.utils import get_gamma
import numpy as np


def get_last_stage(algo_stage_list):
    return algo_stage_list[-1]


def get_first_stage(algo_stage_list):
    return algo_stage_list[0]


def create_all_policies_list(json_data):
    all_policies = []
    for i in range(len(json_data)):
        all_policies.append(Item(json_data[i]["values"], i, json_data[i]["labels"]))
    return all_policies


def make_item(json_data, policy_id):
    """generate an Item class object using the policy data set and a given policy id
    json_data: the policy data set dict
    policy_id: an integer id
    """
    return Item(
        json_data[str(policy_id)]["values"],
        policy_id,
        json_data[str(policy_id)]["labels"],
    )


def rec_policy_data_prep(json_data, response_data, last_N=10):
    """transform the response data and json data to return a list of Query objects for the rec policy endpoint
    Args:
        json_data: the policy data set
        response_data: a dictionary with policiesShown as list of list of policies
        and userChoices as as list of the choices of the user
    """
    # get the last-N stages to use for getting the recommended policy
    answered_queries = []
    user_choices = [int(val) for val in response_data.get("userChoices")]
    policies_shown = response_data.get("policiesShown")
    num_policies_shown = len(policies_shown)
    policy_range = range(num_policies_shown - int(last_N), num_policies_shown)
    print(policy_range)
    for i in policy_range:
        # generate the items for each policy
        current_policy = policies_shown[i]
        current_choice = user_choices[i]
        policy_A = current_policy[0]
        policy_B = current_policy[1]
        item_A = Item(
            json_data[str(policy_A)]["values"],
            policy_A,
            json_data[str(policy_A)]["labels"],
        )
        item_B = Item(
            json_data[str(policy_B)]["values"],
            policy_B,
            json_data[str(policy_B)]["labels"],
        )
        answered_queries.append(Query(item_A, item_B, current_choice))

    current_gamma = get_gamma(
        len(answered_queries) + 1, sigma=0.1, confidence_level=0.9
    )

    return answered_queries, current_gamma


def elicitation_data_prep(json_data, response_data):
    """transform the response data and json data to return a list of Query objects
    Args:
        json_data: the policy data set
        response_data: a dictionary with policiesShown as list of list of policies
        and userChoices as as list of the choices of the user
    """
    # need to handle the case where we transition from random -> adaptive
    # since we will have existing user_choices
    num_first_stage = response_data.get("numFirstStage")

    answered_queries = []
    answered_queries_adaptive = []
    user_choices = [int(val) for val in response_data.get("userChoices")]
    policies_shown = response_data.get("policiesShown")
    
    if len(policies_shown) > num_first_stage:
        # then we are in the second stage and we need to limit the range of
        # policies shown that we loop over
        policy_range = range(num_first_stage, len(policies_shown))
    elif len(policies_shown) == num_first_stage:
        policy_range = []
    else:
        policy_range = range(len(policies_shown))

    for i in policy_range:
        # generate the items for each policy
        current_policy = policies_shown[i]
        current_choice = user_choices[i]
        policy_A = current_policy[0]
        policy_B = current_policy[1]
        
        # Item(features, id, feature_names)
        item_A = Item(
            json_data[str(policy_A)]["values"],
            policy_A,
            json_data[str(policy_A)]["labels"],
        )
        item_B = Item(
            json_data[str(policy_B)]["values"],
            policy_B,
            json_data[str(policy_B)]["labels"],
        )
        answered_queries_adaptive.append((policy_A, policy_B, current_choice))
        answered_queries.append(Query(item_A, item_B, current_choice))

    current_gamma = get_gamma(
        len(answered_queries) + 1, sigma=0.1, confidence_level=0.9
    )
    return answered_queries, tuple(answered_queries_adaptive), current_gamma


def choice_path_data_prep(response_data):
    """
    DEPRECIATED: use elicitation_data_prep
    transform the response data and json data to return a tuple of tuples to use as a look up key in the choices path dictionary
    Args:
        json_data: the policy data set
        response_data: a dictionary with policiesShown as list of list of policies
        and userChoices as as list of the choices of the user
    """
    # need to handle the case where we transition from random -> adaptive
    # since we will have existing user_choices
    prev_stages = response_data.get("prevStages")
    num_first_stage = response_data.get("numFirstStage")

    answered_queries = []
    user_choices = [int(val) for val in response_data.get("userChoices")]
    policies_shown = response_data.get("policiesShown")

    if (len(prev_stages) >= num_first_stage) and (prev_stages[0] == "random"):
        # then the first stage was random, we need to limit the range of
        # policies shown that we loop over
        policy_range = range(num_first_stage, len(policies_shown))

    else:
        policy_range = range(len(policies_shown))
    # TO-DO: safer way to loop through or maybe assert equal length of the lists
    for i in policy_range:
        # generate the items for each policy
        current_policy = policies_shown[i]
        current_choice = user_choices[i]
        policy_A = current_policy[0]
        policy_B = current_policy[1]
        answered_queries.append((policy_A, policy_B, current_choice))
    return tuple(answered_queries)


def get_predicted_response(item_a_opt, item_b_opt, answered_queries, gamma=0.0):
    """this function is just the last part of `get_next_query` where we calculate the robust utility for the two suggested options
    Args:
        item_a_opt: Item class object to show the user next as option A
        item_b_opt: Item class object to show the user next as option A
        answered_queries: list of Query class objects
        gamma: gamma value, default is 0.0
    """
    robust_utility_a, _ = robust_utility(
        item_a_opt, answered_queries=answered_queries, gamma_inconsistencies=gamma
    )
    robust_utility_b, _ = robust_utility(
        item_b_opt, answered_queries=answered_queries, gamma_inconsistencies=gamma
    )

    # predict the agent's response
    if robust_utility_a > robust_utility_b:
        predicted_response = 1
    elif robust_utility_a < robust_utility_b:
        predicted_response = -1
    else:
        predicted_response = 0
    return predicted_response


def look_up_choice(
    answered_queries, answered_queries_tuple, choices_data, covid_data, gamma
):
    print(f"answered_queries: {answered_queries_tuple}")
    print(f"next_query_tuple: {choices_data.get(answered_queries_tuple, None)}")
    next_query_tuple = choices_data.get(answered_queries_tuple, None)
    item_A_id, item_B_id = next_query_tuple
    item_A = make_item(covid_data, item_A_id)
    item_B = make_item(covid_data, item_B_id)
    predicted_response = get_predicted_response(
        item_A, item_B, answered_queries, gamma=gamma
    )
    recommended_item = None
    return item_A_id, item_B_id, predicted_response, recommended_item


def choose_random_comparison_policy(items, fixed_policy_id, answers=set()):
    done = True
    while done:
        item_b = np.random.choice(items, 1, replace=False)
        item_b_id = item_b[0].id
        if fixed_policy_id != item_b_id:
            if (fixed_policy_id, item_b_id) not in answers:
                done = False
    return item_b[0]


def get_shown_validation_policies(request_data):
    stage_list = request_data.data["prevStages"]
    policies_shown = request_data.data["policiesShown"]
    validation_start = np.where(np.array(stage_list) == "validation")[0]
    print(f"len(validation_start): {len(validation_start)}")
    print(f"validation_start: {validation_start}")
    if len(validation_start) > 0:
        validation_start_idx = np.min(validation_start)
        validation_shown = policies_shown[validation_start_idx:]
    else:
        validation_shown = []
    return tuple(tuple(sub) for sub in validation_shown)

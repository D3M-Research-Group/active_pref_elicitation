from elicitation_for_website.get_next_query import (
    get_next_query,
    robust_recommend_subproblem,
)
from elicitation_for_website.preference_classes import robust_utility
from django.shortcuts import render
from rest_framework import viewsets, mixins, status
from rest_framework.generics import GenericAPIView, CreateAPIView
from rest_framework.views import APIView
from rest_framework.response import Response
from .serializers import (
    MemoryWipeInfoSerializer,
    SessionInfoSerializer,
    ChoicesSerializer,
    FormInfoSerializer,
)
from .models import SessionInfo, Choices, FormInfo, MemoryWipeInfo
from .policy_data import covid_data_dict, all_policies_dict, covid_data_normalized_dict
from .choice_paths import choices_data
from elicitation_for_website.preference_classes import Item, Query
from elicitation_for_website.utils import get_gamma
import random
import numpy as np

ALGO_STAGE_MAP = {"adaptive": 0, "random": 1, "validation": 2}


def get_last_stage(algo_stage_list):
    return algo_stage_list[-1]


def get_first_stage(algo_stage_list):
    return algo_stage_list[0]


# TO-DO: perhaps move this function to a util file?


def create_all_policies_list(json_data):
    all_policies_dict = {}
    all_policies = []
    for i in range(len(json_data)):
        all_policies.append(Item(json_data[i]["values"], i, json_data[i]["labels"]))
    return all_policies


# all_policies = create_all_policies_list(covid_data)

# The viewsets base class provides an implementation of CRUD operations by default
# But we only want to create new data, not anything else
# class SessionInfoView(viewsets.ModelViewSet):
#     serializer_class = SessionInfoSerializer
#     queryset = SessionInfo.objects.all()


class SessionInfoView(mixins.CreateModelMixin, GenericAPIView):
    queryset = SessionInfo.objects.all()
    serializer_class = SessionInfoSerializer

    def post(self, request, *args, **kwargs):
        return self.create(request, *args, **kwargs)


# Mixin that allows to create multiple objects from lists.
class CreateListModelMixin(object):
    def get_serializer(self, *args, **kwargs):
        """if an array is passed, set serializer to many"""
        if isinstance(kwargs.get("data", {}), list):
            kwargs["many"] = True
        return super(CreateListModelMixin, self).get_serializer(*args, **kwargs)


class ChoicesView(CreateListModelMixin, CreateAPIView):
    # Here we are expecting to get a JSON object with the session id,
    # an array of user choices
    # and an array of arrays of policies shown
    # queryset = Choices.objects.all()
    serializer_class = ChoicesSerializer


class FormInfoView(mixins.CreateModelMixin, GenericAPIView):
    queryset = FormInfo.objects.all()
    serializer_class = FormInfoSerializer

    def post(self, request, *args, **kwargs):
        return self.create(request, *args, **kwargs)


class MemoryWipeView(mixins.CreateModelMixin, GenericAPIView):
    queryset = MemoryWipeInfo.objects.all()
    serializer_class = MemoryWipeInfoSerializer

    def post(self, request, *args, **kwargs):
        return self.create(request, *args, **kwargs)


def get_smallest_gamma_stub():
    print("[WARN]: Using get_smallest_gamma_stub() function")
    return random.randint(1, 100) / 100.0


def make_item(json_data, policy_id):
    """generate an Item class object using the policy data set and a given policy id
    json_data: the policy data set dict
    policy_id: an integer id
    """
    return Item(
        json_data[policy_id]["values"], policy_id, json_data[policy_id]["labels"]
    )

def rec_policy_data_prep(json_data, response_data, last_N=10):
    """transform the response data and json data to return a list of Query objects for the rec policy endpoint
    Args:
        json_data: the policy data set
        response_data: a dictionary with policiesShown as list of list of policies
        and userChoices as as list of the choices of the user
    """
    # get the last-N stages to use for getting the recommended policy
    print("DOING REC POLICY VIEW DATA PREP")
    answered_queries = []
    user_choices = [int(val) for val in response_data.get("userChoices")]
    policies_shown = response_data.get("policiesShown")
    num_policies_shown = len(policies_shown)
    policy_range = range(num_policies_shown - last_N, num_policies_shown)
    print(f"policy_range: {list(policy_range)}")
    # TO-DO: safer way to loop through or maybe assert equal length of the lists
    for i in policy_range:
        print(f"i: {i}")
        # generate the items for each policy
        current_policy = policies_shown[i]
        current_choice = user_choices[i]
        policy_A = current_policy[0]
        policy_B = current_policy[1]
        print(f"current_policy: {current_policy}")
        print(f"current_choice: {current_choice}")
        # print(f'item_A: {json_data[policy_A]["values"], policy_A, json_data[policy_A]["labels"]}')
        # print(f'item_B: {json_data[policy_B]["values"], policy_B, json_data[policy_B]["labels"]}')
        # Item(features, id, feature_names)
        item_A = Item(
            json_data[policy_A]["values"], policy_A, json_data[policy_A]["labels"]
        )
        item_B = Item(
            json_data[policy_B]["values"], policy_B, json_data[policy_B]["labels"]
        )
        print(Query(item_A, item_B, current_choice))
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
    print("DOING ELICITATION DATA PREP")
    prev_stages = response_data.get("prevStages")
    num_first_stage = response_data.get("numFirstStage")
    answered_queries = []
    user_choices = [int(val) for val in response_data.get("userChoices")]
    policies_shown = response_data.get("policiesShown")
    print(f"len(prev_stages): {len(prev_stages)}")
    print(f"len(policies_shown): {len(policies_shown)}")
    if (len(policies_shown) > num_first_stage):
        # then we are in the second stage and we need to limit the range of
        # policies shown that we loop over
        policy_range = range(num_first_stage, len(policies_shown))
    elif (len(policies_shown) == num_first_stage):
        policy_range = []
    else:
        policy_range = range(len(policies_shown))
    print(f"policy_range: {list(policy_range)}")
    # TO-DO: safer way to loop through or maybe assert equal length of the lists
    for i in policy_range:
        print(f"i: {i}")
        # generate the items for each policy
        current_policy = policies_shown[i]
        current_choice = user_choices[i]
        policy_A = current_policy[0]
        policy_B = current_policy[1]
        print(f"current_policy: {current_policy}")
        print(f"current_choice: {current_choice}")
        # print(f'item_A: {json_data[policy_A]["values"], policy_A, json_data[policy_A]["labels"]}')
        # print(f'item_B: {json_data[policy_B]["values"], policy_B, json_data[policy_B]["labels"]}')
        # Item(features, id, feature_names)
        item_A = Item(
            json_data[policy_A]["values"], policy_A, json_data[policy_A]["labels"]
        )
        item_B = Item(
            json_data[policy_B]["values"], policy_B, json_data[policy_B]["labels"]
        )
        print(Query(item_A, item_B, current_choice))
        answered_queries.append(Query(item_A, item_B, current_choice))

    current_gamma = get_gamma(
        len(answered_queries) + 1, sigma=0.1, confidence_level=0.9
    )

    return answered_queries, current_gamma


def choice_path_data_prep(response_data):
    """transform the response data and json data to return a tuple of tuples to use as a look up key in the choices path dictionary
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
    print(len(policies_shown))
    print(list(policy_range))
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


class RecommendPolicyView(APIView):
    def post(self, request, format=None):
        recommended_item = None
        current_stage = get_last_stage(request.data["prevStages"])
        print(f"current stage: {current_stage}")
        covid_data = covid_data_normalized_dict.get(request.data["datasetName"], None)
        all_policies = all_policies_dict.get(request.data["datasetName"], None)
        if covid_data is None or all_policies is None:
            print(f"got {request.data['datasetName']} as the datasetName")
        num_first_stage = request.data.get("numFirstStage")
        answered_queries, current_gamma = rec_policy_data_prep(
            covid_data, request.data, num_first_stage
        )
        print(f"current_gamma: {current_gamma}")
        problem_type = "maximin"
        recommended_item, _, _ = robust_recommend_subproblem(
            answered_queries,
            all_policies,
            problem_type=problem_type,
            verbose=False,
            gamma=current_gamma,
        )
        print(f"recommended_item: {recommended_item.id}")
        recommended_item = recommended_item.id
        response_dict = {
            "recommended_item": recommended_item,
            "current_stage": current_stage,
        }
        return Response(response_dict)


# NextChoice is a generic view
class NextChoiceView(APIView):
    # TO-DO: do checks on request data
    # dynamic way to choose which data set?
    # maybe add dataset name to request?
    # TO-DO: add logic for once we are in the validation stage
    def post(self, request, format=None):
        print(request.data)
        next_stage = request.data["nextStage"]
        f_random = ALGO_STAGE_MAP[next_stage]
        recommended_item = None
        covid_data = covid_data_normalized_dict.get(request.data["datasetName"], None)
        all_policies = all_policies_dict.get(request.data["datasetName"], None)
        if covid_data is None or all_policies is None:
            print(f"got {request.data['datasetName']} as the datasetName")
        answered_queries, current_gamma = elicitation_data_prep(
            covid_data, request.data
        )
        # need to handle different logic for if random or adaptive here. usually this is done in get next_query
        # TODO: first query shown depends on which stream assigned to, remove first step if else
        # Specify default problem type and u0 type here and allow the variable to be changed depending upon
        # get_next_query result
        problem_type = "maximin"
        u0_type = "positive_normed"
        if f_random == 1:
            # we are in the random stream
            (
                item_A,
                item_B,
                predicted_response,
                objval,
                problem_type,
                u0_type,
            ) = get_next_query(
                all_policies,
                answered_queries,
                gamma=current_gamma,
                f_random=f_random,
                verbose=True,
            )
        elif f_random == 2:
            # we are in the validation stage so we just return the two recommended policies as the validation items
            # what was the first stage and what is the most recent stage?
            recommended_policy_dict = request.data["recommended_item"]
            item_A = recommended_policy_dict["adaptive"]
            item_B = recommended_policy_dict["random"]
            # setting as item_A since we are in validation and comparing our recommended item to a randomly chosen policy
            predicted_response = 1
        else:
            # else we are in the adaptive stream
            # TODO: how to handle case where the user makes a clearly bad choice? Especially in the first round of adaptive?
            # need to handle the case where we are going from random -> adaptive
            answered_queries_tuple = choice_path_data_prep(request.data)
            item_A, item_B, predicted_response, recommended_item = look_up_choice(
                answered_queries,
                answered_queries_tuple,
                choices_data,
                covid_data,
                gamma=current_gamma,
            )
        print(
            f"item A: {item_A}, item B: {item_B}, prediction: {predicted_response}, recommended_item: {recommended_item}, f_random: {f_random}, problem_type: {problem_type}, u0_type : {u0_type}, gamma: {current_gamma} "
        )
        # we need to store the recommended item information on the front end
        response_dict = {
            "policy_ids": [item_A, item_B],
            "prediction": predicted_response,
            "recommended_item": recommended_item,
            "problem_type": problem_type,
            "u0_type": u0_type,
            "gamma": current_gamma,
        }
        return Response(response_dict)


class PolicyDataView(APIView):
    def get(self, request, format=None):
        dataset_name = request.GET.get("dataset", None)
        print(dataset_name)
        if dataset_name is not None:
            covid_data = covid_data_dict.get(dataset_name, None)
            if covid_data is not None:
                return Response({"data": covid_data})
            else:
                return Response(None)
        else:
            return Response(None)

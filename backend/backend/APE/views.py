from elicitation_for_website.get_next_query import get_next_query, robust_recommend_subproblem
from elicitation_for_website.preference_classes import robust_utility
from django.shortcuts import render
from rest_framework import viewsets, mixins, status
from rest_framework.generics import GenericAPIView, CreateAPIView
from rest_framework.views import APIView
from rest_framework.response import Response
from .serializers import SessionInfoSerializer, ChoicesSerializer, FormInfoSerializer
from .models import SessionInfo, Choices, FormInfo
from .policy_data import covid_data_dict, all_policies_dict
from .choice_paths import choices_data
from elicitation_for_website.preference_classes import Item, Query
import random
import numpy as np

ALGO_STAGE_MAP = {
    "adaptive": 0,
    "random": 1,
    "validation": 2
}

def get_last_stage(algo_stage_list):
    return algo_stage_list[-1]

# TO-DO: perhaps move this function to a util file?
def create_all_policies_list(json_data):
    all_policies_dict = {}
    all_policies = []
    for i in range(len(json_data)):
        all_policies.append(Item(json_data[i]['values'], i, json_data[i]['labels']))
    return all_policies

# all_policies = create_all_policies_list(covid_data)

# The viewsets base class provides an implementation of CRUD operations by default
# But we only want to create new data, not anything else
# class SessionInfoView(viewsets.ModelViewSet):
#     serializer_class = SessionInfoSerializer
#     queryset = SessionInfo.objects.all()
class SessionInfoView(mixins.CreateModelMixin,
                  GenericAPIView):
    queryset = SessionInfo.objects.all()
    serializer_class = SessionInfoSerializer
    
    def post(self, request, *args, **kwargs):
        return self.create(request, *args, **kwargs)


# Mixin that allows to create multiple objects from lists.
class CreateListModelMixin(object):
    def get_serializer(self, *args, **kwargs):
        """ if an array is passed, set serializer to many """
        if isinstance(kwargs.get('data', {}), list):
            kwargs['many'] = True
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

def get_smallest_gamma_stub():
    print("[WARN]: Using get_smallest_gamma_stub() function")
    return random.randint(1, 100) / 100.0

def make_item(json_data, policy_id):
    """ generate an Item class object using the policy data set and a given policy id
        json_data: the policy data set dict
        policy_id: an integer id
    """
    return Item(json_data[policy_id]['values'], policy_id,
         json_data[policy_id]['labels'])

def elicitation_data_prep(json_data, response_data):
    """ transform the response data and json data to return a list of Query objects
    Args:
        json_data: the policy data set
        response_data: a dictionary with policiesShown as list of list of policies
        and userChoices as as list of the choices of the user
    """
    answered_queries = []
    user_choices = [int(val) for val in response_data.get('userChoices')]
    policies_shown = response_data.get('policiesShown')
    # TO-DO: safer way to loop through or maybe assert equal length of the lists
    for i in range(len(policies_shown)):
        # generate the items for each policy
        current_policy = policies_shown[i]
        current_choice = user_choices[i]
        policy_A = current_policy[0]
        policy_B = current_policy[1]
        # Item(features, id, feature_names)
        item_A = Item(json_data[policy_A]['values'], policy_A,
         json_data[policy_A]['labels'])
        item_B = Item(json_data[policy_B]['values'], policy_B,
         json_data[policy_B]['labels'])
        answered_queries.append(Query(item_A, item_B, current_choice))
    
    # looks like the current gamma just chooses a random integer?
    current_gamma = get_smallest_gamma_stub()
    return answered_queries, current_gamma


def choice_path_data_prep(response_data):
    """ transform the response data and json data to return a tuple of tuples to use as a look up key in the choices path dictionary
    Args:
        json_data: the policy data set
        response_data: a dictionary with policiesShown as list of list of policies
        and userChoices as as list of the choices of the user
    """
    answered_queries = []
    user_choices = [int(val) for val in response_data.get('userChoices')]
    policies_shown = response_data.get('policiesShown')
    # TO-DO: safer way to loop through or maybe assert equal length of the lists
    for i in range(len(policies_shown)):
        # generate the items for each policy
        current_policy = policies_shown[i]
        current_choice = user_choices[i]
        policy_A = current_policy[0]
        policy_B = current_policy[1]
        answered_queries.append((policy_A, policy_B, current_choice))
    return tuple(answered_queries)

def get_predicted_response(item_a_opt, item_b_opt, answered_queries, gamma=0.0):
    """ this function is just the last part of `get_next_query` where we calculate the robust utility for the two suggested options
    Args:
        item_a_opt: Item class object to show the user next as option A
        item_b_opt: Item class object to show the user next as option A
        answered_queries: list of Query class objects
        gamma: gamma value, default is 0.0
    """
    robust_utility_a, _ = robust_utility(item_a_opt, answered_queries=answered_queries, gamma_inconsistencies=gamma)
    robust_utility_b, _ = robust_utility(item_b_opt, answered_queries=answered_queries, gamma_inconsistencies=gamma)

    # predict the agent's response
    if robust_utility_a > robust_utility_b:
        predicted_response = 1
    elif robust_utility_a < robust_utility_b:
        predicted_response = -1
    else:
        predicted_response = 0
    return predicted_response

def look_up_choice(answered_queries, answered_queries_tuple, choices_data, covid_data):
    print(f"answered_queries: {answered_queries_tuple}")
    print(f"next_query_tuple: {choices_data.get(answered_queries_tuple, None)}")
    next_query_tuple = choices_data.get(answered_queries_tuple, None)
    item_A_id, item_B_id = next_query_tuple
    item_A = make_item(covid_data, item_A_id)
    item_B = make_item(covid_data, item_B_id)
    predicted_response = get_predicted_response(item_A, item_B, answered_queries, gamma=0.0)
    recommended_item = None
    return item_A_id, item_B_id, predicted_response, recommended_item

def choose_random_comparison_policy(items, fixed_policy_id, answers=set()):
    done = True
    while done:
        item_b = np.random.choice(items, 1, replace=False)
        item_b_id = item_b[0].id
        if fixed_policy_id != item_b_id:
            if (fixed_policy_id,item_b_id) not in answers:
                done = False
    return item_b[0]

def get_shown_validation_policies(request_data):
    stage_list = request_data.data['prevStages']
    policies_shown = request_data.data['policiesShown']
    validation_start = np.where(np.array(stage_list) == "validation")[0]
    print(f"len(validation_start): {len(validation_start)}")
    print(f"validation_start: {validation_start}")
    if len(validation_start) > 0:
        validation_start_idx = np.min(validation_start)
        validation_shown = policies_shown[validation_start_idx:]
    else:
        validation_shown = []
    return tuple(tuple(sub) for sub in validation_shown)

# NextChoice is a generic view
class NextChoiceView(APIView):
    # TO-DO: do checks on request data 
    # dynamic way to choose which data set?
    # maybe add dataset name to request?
    # TO-DO: Do we need to track gamma?
    # TO-DO: add logic for once we are in the validation stage
    def post(self, request, format=None):
        print(request.data)
        # current_stage = get_last_stage(request.data['prevStages'])
        # f_random = ALGO_STAGE_MAP[current_stage]
        next_stage = request.data['nextStage']
        f_random = ALGO_STAGE_MAP[next_stage]
        recommended_item = None
        covid_data = covid_data_dict.get(request.data['datasetName'], None)
        all_policies = all_policies_dict.get(request.data['datasetName'], None)
        if covid_data is None or all_policies is None:
            print(f"got {request.data['datasetName']} as the datasetName")
        answered_queries, current_gamma = elicitation_data_prep(covid_data, request.data)
        # need to handle different logic for if random or adaptive here. usually this is done in get next_query
        answered_queries_tuple = choice_path_data_prep(request.data)
        if len(answered_queries_tuple) == 0:
            # we haven't answered any queries yet, give the same query to both streams
            item_A, item_B, predicted_response, recommended_item = look_up_choice(answered_queries, answered_queries_tuple, choices_data, covid_data)
        else:
            # we have answered at least one query, now we tailor queries based on the group the user was assigned to
            if f_random == 1:
                # we are in the random stream
                item_A, item_B, predicted_response, objval = get_next_query(all_policies, answered_queries,f_random=f_random, verbose=True)
            elif f_random == 2:
                # now we need to choose a random policy to compare to:
                previous_validation_shown = get_shown_validation_policies(request)
                print(f"previous_validation_shown: {previous_validation_shown}")
                if len(previous_validation_shown) == 0:
                    # we are in the validation phase and we want to call the robust_recommend_subproblem function
                    recommended_item, _ , _ = robust_recommend_subproblem(answered_queries, all_policies, problem_type="maximin",
                                        verbose=False,
                                        gamma=0.0)
                    print(f"recommended_item: {recommended_item.id}")
                    rand_policy = choose_random_comparison_policy(all_policies, recommended_item.id,set(previous_validation_shown))
                    item_A = recommended_item.id
                    item_B = rand_policy.id
                    recommended_item = recommended_item.id
                else:
                    # get recommended item id from response data 
                    recommended_item = request.data['recommended_item']
                    rand_policy = choose_random_comparison_policy(all_policies, recommended_item,set(previous_validation_shown))
                    item_A = recommended_item
                    item_B = rand_policy.id
                predicted_response = 1 # setting as item_A since we are in validation and comparing our recommended item to a randomly chosen policy
            else:
                # else we are in the adaptive stream
                answered_queries_tuple = choice_path_data_prep(request.data)
                item_A, item_B, predicted_response, recommended_item = look_up_choice(answered_queries, answered_queries_tuple, choices_data, covid_data)
        print(f"item A: {item_A}, item B: {item_B}, prediction: {predicted_response}, recommended_item: {recommended_item}")
        # we need to store the recommended item information on the front end
        response_dict = {"policy_ids": [item_A, item_B], "prediction" : predicted_response, "recommended_item": recommended_item}
        return Response(response_dict)

class PolicyDataView(APIView):
    def get(self, request, format=None):
        dataset_name = request.GET.get('dataset',None)
        print(dataset_name)
        if dataset_name is not None:
            covid_data = covid_data_dict.get(dataset_name, None)
            if covid_data is not None:
                return Response({'data': covid_data})
            else:
                return Response(None)
        else:
            return Response(None)

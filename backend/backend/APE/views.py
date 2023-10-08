from elicitation_for_website.get_next_query import (
    get_next_query,
    robust_recommend_subproblem,
)
from rest_framework import mixins
from rest_framework.generics import CreateAPIView, GenericAPIView
from rest_framework.response import Response
from rest_framework.views import APIView

from .choice_paths import choices_data
from .models import Choices, FormInfo, MemoryWipeInfo, SessionInfo
from .policy_data import all_policies_dict, covid_data_dict, covid_data_normalized_dict
from .policy_helpers import (
    elicitation_data_prep,
    get_last_stage,
    look_up_choice,
    rec_policy_data_prep,
)
from .serializers import (
    ChoicesSerializer,
    FormInfoSerializer,
    MemoryWipeInfoSerializer,
    SessionInfoSerializer,
)

ALGO_STAGE_MAP = {"adaptive": 0, "random": 1, "validation": 2}


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

        problem_type = "mmr"
        u0_type = "positive_box"
        recommended_item, _, _ = robust_recommend_subproblem(
            answered_queries,
            all_policies,
            problem_type=problem_type,
            verbose=False,
            gamma=current_gamma,
            u0_type=u0_type
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
    def post(self, request):
        next_stage = request.data["nextStage"]
        f_random = ALGO_STAGE_MAP[next_stage]
        recommended_item = None

        covid_data = covid_data_normalized_dict.get(request.data["datasetName"], None)
        all_policies = all_policies_dict.get(request.data["datasetName"], None)
        if covid_data is None or all_policies is None:
            print(f"got {request.data['datasetName']} as the datasetName")

        answered_queries, answered_queries_tuple, current_gamma = elicitation_data_prep(
            covid_data, request.data
        )

        problem_type = "mmr"
        u0_type = "positive_box"
        if f_random == 1:
            # we are in the random stream
            (
                item_A,
                item_B,
                predicted_response,
                _,
                problem_type,
                u0_type,
            ) = get_next_query(
                all_policies,
                answered_queries,
                gamma=current_gamma,
                f_random=f_random,
                verbose=True,
                u0_type=u0_type,
                problem_type=problem_type
            )
        elif f_random == 2:
            # we are in the validation stage so we just return the two recommended policies as the validation items
            recommended_policy_dict = request.data["recommended_item"]
            item_A = recommended_policy_dict["adaptive"]
            item_B = recommended_policy_dict["random"]
            # setting as item_A since we are in validation and comparing our recommended item to a randomly chosen policy
            predicted_response = 1
        else:
            # else we are in the adaptive stream
            # TODO: how to handle case where the user makes a clearly bad choice? Especially in the first round of adaptive?
            # need to handle the case where we are going from random -> adaptive
            item_A, item_B, predicted_response, recommended_item = look_up_choice(
                answered_queries,
                answered_queries_tuple,
                choices_data,
                covid_data,
                gamma=current_gamma,
                u0_type=u0_type
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
    def get(self, request):
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

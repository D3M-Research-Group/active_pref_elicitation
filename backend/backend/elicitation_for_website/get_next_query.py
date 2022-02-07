# function to get the next pairwise comparison, drawn from a set of items
import numpy as np
from gurobipy import *

from .gurobi_functions import create_mip_model, optimize
from .preference_classes import robust_utility, Query, is_feasible, Item, User
from .static_elicitation import static_mip_optimal
from .utils import U0_positive_normed
from random import randint, uniform
from time import sleep


def get_next_query(items, answered_queries, gamma=0.0, problem_type="maximin",
                   eps=0.0,
                   verbose=False, f_random=0, answers=set()):
    """
    return the next query (policy_A and policy_B) to ask a user, given their username. use optimal robust elicitation

    Args:
        user: (User object). a User object
        items: (list(Item)). a list of preference_classes.Item objects
        eps: (optional). assumed indifference threshold of the agent.
        answers: set of tuple pairs ((item_a.id, item_b.id))

    Outputs:
        policy_A: (int). the item ID of policy A for the next query
        policy_B: (int). the item ID of policy B for the next query
        preferred_policy: (int). the item ID that we predict the user prefers.
    """

    assert isinstance(items, list)
    for item in items:
        assert isinstance(item, Item)

    for query in answered_queries:
        assert isinstance(query, Query)

    # if the user does not have any answered queries, return a random query:
    # if len(answered_queries) == 0 or f_random == 1 or len(answered_queries ) > 10:
    # TO-DO: remove extra condition
    if f_random == 1 or len(answered_queries) > 10:
        done = True
        while done:
            item_b, item_a = np.random.choice(items, 2, replace=False)
            if item_a.id < item_b.id:
                if (item_a.id, item_b.id) not in answers:
                    done = False

        # in validation we do not care about the prediction (it should always be fixed policy)
        if len(answered_queries) > 10:
            predicted_response = 'garbage_validation'

        else:  # must be random exploration stage, so find the predicted choice
            _, _, predicted_response = find_random_query_prediction(answered_queries, items, item_a, item_b, gamma=gamma,
                                                                    problem_type=problem_type, eps=0.0)
        objval = None

    else:
        item_a, item_b, predicted_response, objval = find_optimal_query_mip(answered_queries, items, gamma=gamma,
                                                                            problem_type=problem_type, eps=eps)

    if verbose:
        print(f"next query: item_A={item_a.id}, item_B={item_b.id}")
        print("predicted is", predicted_response)
    return item_a.id, item_b.id, predicted_response, objval


def find_optimal_query_mip(answered_queries, items, gamma=0.0, problem_type="maximin", eps=0.0):
    """
        use the static elicitation MIP to find the next optimal query to ask. the next query can be constructed using any
        of the items.
        """

    valid_responses = [-1, 0, 1]

    # for q in answered_queries:
    #     assert q.item_A.id < q.item_B.id

    response_list = [q.response for q in answered_queries]
    # response_list = answered_queries
    # print(str(response_list[0]))

    assert set(response_list).issubset(set(valid_responses))

    scenario_list = [tuple(response_list + [r]) for r in valid_responses]

    K = len(answered_queries) + 1

    queries, objval, _, _ = static_mip_optimal(
        items,
        K,
        valid_responses,
        cut_1=True,
        cut_2=False,
        fixed_queries=answered_queries,
        subproblem_list=scenario_list,
        gamma_inconsistencies=gamma,
        problem_type=problem_type
    )

    item_a_opt = queries[-1].item_A
    item_b_opt = queries[-1].item_B

    robust_utility_a, _ = robust_utility(
        item_a_opt, answered_queries=answered_queries, gamma_inconsistencies=gamma)
    robust_utility_b, _ = robust_utility(
        item_b_opt, answered_queries=answered_queries, gamma_inconsistencies=gamma)

    # predict the agent's response
    if robust_utility_a > robust_utility_b:
        predicted_response = 1
    elif robust_utility_a < robust_utility_b:
        predicted_response = -1
    else:
        predicted_response = 0

    return item_a_opt, item_b_opt, predicted_response, objval


def find_random_query_prediction(answered_queries, items, item_a, item_b, gamma=0.0, problem_type="maximin", eps=0.0):
    """
        use the static elicitation MIP to find the next optimal query to ask. the next query can be constructed using any
        of the items.
        """

    valid_responses = [-1, 0, 1]

    # for q in answered_queries:
    #     assert q.item_A.id < q.item_B.id

    response_list = [q.response for q in answered_queries]

    assert set(response_list).issubset(set(valid_responses))

    scenario_list = [tuple(response_list + [r]) for r in valid_responses]

    K = len(answered_queries) + 1

    item_a_opt = items[item_a.id]
    item_b_opt = items[item_b.id]

    robust_utility_a, _ = robust_utility(
        item_a_opt, answered_queries=answered_queries, gamma_inconsistencies=gamma)
    robust_utility_b, _ = robust_utility(
        item_b_opt, answered_queries=answered_queries, gamma_inconsistencies=gamma)
    # sleep(randint(2, 5)) # this is a long time to sleep...
    sleep(round(uniform(0.5, 1), 2))
    if robust_utility_a is None or robust_utility_b is None:
        return item_a_opt.id, item_b_opt.id, "infeasible"
    # predict the agent's response
    if robust_utility_a > robust_utility_b:
        predicted_response = 1
    elif robust_utility_a < robust_utility_b:
        predicted_response = -1
    else:
        predicted_response = 0

    return item_a_opt.id, item_b_opt.id, predicted_response


def find_optimal_query(answered_queries, items,
                       verbose=False,
                       eps=0.0):
    """
    exhaustively search all queries for the next one that maximizes the robust rec. utility.

    inputs:
    - answered_queries: list(Query). answered query objects. each Query should have a defined response
    - items: list(Item). list of item objects.
    - verbose: (bool). set to True to print output.
    - eps: (float). decision margin for agents

    outputs:
    - item_A: (item). first item in the query
    - item_B: (item). second item in the query
    - predicted_response (int). this is the predicted response to the query (item_A, item_B), according to the robust
        utility equal to 1 if item_A has higher robust utility, -1 if item_B does, and 0 if they are equal
    """

    rs = np.random.RandomState(0)

    # keep track of the objective values and recommended items for each
    response_obj_values = [None] * len(Query.valid_responses)

    # get all item pairs
    query_list = [Query(item_A, item_B)
                  for item_A, item_B in itertools.combinations(items, 2)]

    # make sure that not all queries have been answered
    assert len(answered_queries) < len(query_list)

    # remove all answered queries
    for q in answered_queries:
        if q in query_list:
            query_list.remove(q)

    # this is the number of possible queries
    num_queries = len(query_list)

    # keep track of the objective values for each query - the *minimum* objective values for each response
    # we will return the *maximum* of these
    query_objective_values = np.zeros(num_queries)

    # iterate through each possible query
    for i, q in enumerate(query_list):

        for j, r in enumerate(Query.valid_responses):
            # find the worst-case recommendation utility for each response
            q.response = r
            queries = answered_queries + [q]
            response_obj_values[j], _, _ = robust_recommend_subproblem(
                queries, items, verbose=verbose, eps=eps)

        # if all responses are infeasible, raise an Exception
        if all(v is None for v in response_obj_values):
            raise Exception("all responses are infeasible")

        # take the minimum objective value that is not None
        query_objective_values[i] = min(
            [v for v in response_obj_values if v is not None])

    # if there are >1 optimal queries, select one at random
    max_obj = max(query_objective_values)
    optimal_query_indices = np.argwhere(
        query_objective_values == max_obj).flatten()
    optimal_ind = rs.choice(optimal_query_indices, 1)[0]

    # get the items from the optimal pair
    q_opt = query_list[optimal_ind]
    item_a_opt = q.item_A
    item_b_opt = q.item_B

    # calculate the robust utilities for each item
    robust_utility_a, _ = robust_utility(
        item_a_opt, answered_queries=answered_queries)
    robust_utility_b, _ = robust_utility(
        item_b_opt, answered_queries=answered_queries)

    # predict the agent's response
    if robust_utility_a > robust_utility_b:
        predicted_response = 1
    elif robust_utility_a < robust_utility_b:
        predicted_response = -1
    else:
        predicted_response = 0

    # the next query should not be already answered
    if q_opt in answered_queries:
        raise Exception("the optimal query has already been asked")

    return item_a_opt, item_b_opt, predicted_response, max_obj


def robust_recommend_subproblem(answered_queries, items, problem_type="maximin",
                                verbose=False,
                                gamma=0.0):
    """
    solve the robust-recommendation subproblem: for a fixed set of queries and responses, contained in answered_queries
    this is the worst-case recommendation utility, given that an agent has supplied answered_queries

    return:
    - optimal objective of the subproblem
    - robust-recommended item
    - optimal utility vector (that minimizes u^T x)
    """

    # if the agent's uncertainty set is empty, the recommendation subproblem is infeasible, return None
    if not is_feasible(answered_queries, gamma_inconsistencies=gamma):
        return None, None, None

    assert problem_type in ["maximin", "mmr"]
    assert gamma >= 0

    # some constants
    K = len(answered_queries)
    num_features = len(items[0].features)
    z_vectors = [q.z for q in answered_queries]
    responses = [q.response for q in answered_queries]

    # make sure that each answer is valid
    for query in answered_queries:
        assert query.response in Query.valid_responses

    # positive normed definition for U^0, b_mat and b_vec
    b_mat, b_vec = U0_positive_normed(num_features)

    # define beta vars (more dual variables)
    m_const = len(b_vec)

    # set up the Gurobi model
    m = create_mip_model(verbose=verbose)

    # y vars : to select x^r, the recommended item in scenario r
    y_vars = m.addVars(len(items), vtype=GRB.BINARY, name="y")
    m.addSOS(GRB.SOS_TYPE1, [y_vars[i] for i in range(len(items))])
    m.addConstr(
        quicksum(y_vars[i] for i in range(len(items))) == 1, name="y_constr"
    )

    # add dual variables
    if problem_type == "maximin":
        mu_var, alpha_vars, beta_vars = add_rec_dual_variables(
            m,
            K,
            gamma,
            problem_type,
            m_const,
            y_vars,
            num_features,
            items,
            b_mat,
            responses,
            z_vectors,
        )
    if problem_type == "mmr":
        theta_var = m.addVar(
            vtype=GRB.CONTINUOUS, lb=-GRB.INFINITY, ub=GRB.INFINITY, name="theta"
        )
        beta_vars = {}
        alpha_vars = {}
        mu_vars = {}
        for item in items:
            (
                mu_vars[item.id],
                alpha_vars[item.id],
                beta_vars[item.id],
            ) = add_rec_dual_variables(
                m,
                K,
                gamma,
                problem_type,
                m_const,
                y_vars,
                num_features,
                items,
                b_mat,
                responses,
                z_vectors,
                mmr_item=item,
            )
            m.addConstr(
                theta_var
                >= quicksum([b_vec[j] * beta_vars[item.id][j] for j in range(m_const)])
                + gamma * mu_vars[item.id]
            )

    if problem_type == "maximin":
        obj = (
            quicksum([b_vec[j] * beta_vars[j]
                     for j in range(m_const)]) + gamma * mu_var
        )
        m.setObjective(obj, sense=GRB.MAXIMIZE)
    elif problem_type == "mmr":
        m.setObjective(theta_var, sense=GRB.MINIMIZE)

    m.Params.DualReductions = 0
    # m.write("recommendation.lp")
    optimize(m)

    # --- gather results ---

    # if the model is unbounded (uncertainty set it empty), return None
    if m.status in [GRB.INF_OR_UNBD, GRB.UNBOUNDED]:
        print("STATUS BELOW _____")
        print(m.status)
        return None, None, None

    elif m.status == GRB.SUBOPTIMAL:
        # try re-solving
        optimize(m)
        # if this doesn't work, we have a problem
        assert m.status == GRB.OPTIMAL

    elif m.status != GRB.OPTIMAL:
        raise Exception("gurobi model is not optimal")

    # find the recommended item
    y_vals = np.array([var.x for var in y_vars.values()])
    selected_items = np.argwhere(y_vals > 0.5)

    # there can only be one recommended item
    assert len(selected_items) == 1
    recommended_item = items[selected_items[0][0]]

    # finally, find the minimum u-vector
    min_u_objval, u_vector = robust_utility(
        recommended_item, answered_queries=answered_queries, gamma_inconsistencies=gamma)

    return recommended_item, m.objVal, u_vector


def add_rec_dual_variables(
    m,
    K,
    gamma,
    problem_type,
    m_const,
    y_vars,
    num_features,
    items,
    b_mat,
    responses,
    z_vectors,
    mmr_item=None
):

    if gamma > 0:
        # dual variable for inconsistencies constraint
        if problem_type == "maximin":
            mu_var = m.addVar(vtype=GRB.CONTINUOUS, lb=-
                              GRB.INFINITY, ub=0.0, name="mu")
        if problem_type == "mmr":
            mu_var = m.addVar(
                vtype=GRB.CONTINUOUS, lb=0.0, ub=GRB.INFINITY, name=f"mu_{mmr_item.id}"
            )
    else:
        mu_var = 0

    # the dual variables have a different sign for mmr and maximin
    if problem_type == "maximin":
        dual_lb = 0.0
        dual_ub = GRB.INFINITY
        beta_name = "beta"
        alpha_name = "alpha"
    if problem_type == "mmr":
        dual_lb = -GRB.INFINITY
        dual_ub = 0.0
        beta_name = f"beta_{mmr_item.id}"
        alpha_name = f"alpha_{mmr_item.id}"

    beta_vars = m.addVars(
        m_const, vtype=GRB.CONTINUOUS, lb=dual_lb, ub=dual_ub, name=beta_name
    )
    alpha_vars = m.addVars(
        K, vtype=GRB.CONTINUOUS, lb=dual_lb, ub=dual_ub, name=alpha_name
    )

    if gamma > 0:
        if problem_type == "maximin":
            for k in range(K):
                m.addConstr(alpha_vars[k] + mu_var <= 0,
                            name=f"alpha_constr_k{k}")
        if problem_type == "mmr":
            for k in range(K):
                m.addConstr(
                    alpha_vars[k] + mu_var >= 0, name=f"alpha_{mmr_item.id}_constr_k{k}"
                )

    # define an expression for each feature of x
    x_features = [
        quicksum([y_vars[i] * items[i].features[j] for i in range(len(items))])
        for j in range(num_features)
    ]

    # the big constraint ...
    for f in range(num_features):
        lhs_1 = quicksum(
            [responses[k] * z_vectors[k][f] * alpha_vars[k] for k in range(K)]
        )
        lhs_2 = quicksum([b_mat[j, f] * beta_vars[j] for j in range(m_const)])

        if problem_type == "maximin":
            rhs = x_features[f]
            feature_name = f"feature_{f}"
        if problem_type == "mmr":
            assert isinstance(mmr_item, Item)
            rhs = mmr_item.features[f] - x_features[f]
            feature_name = f"feature_{mmr_item.id}_{f}"

        m.addConstr(lhs_1 + lhs_2 == rhs, name=feature_name)

    return mu_var, alpha_vars, beta_vars

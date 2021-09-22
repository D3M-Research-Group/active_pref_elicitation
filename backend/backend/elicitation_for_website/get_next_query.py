# function to get the next pairwise comparison, drawn from a set of items
import numpy as np
from gurobipy import *

from .gurobi_functions import create_mip_model, optimize
from .preference_classes import robust_utility, Query, is_feasible, Item, User


def get_next_query(user, items,
                   eps=0.0,
                   verbose=False):
    """
    return the next query (policy_A and policy_B) to ask a user, given their username. use optimal robust elicitation

    Args:
        user: (User object). a User object
        items: (list(Item)). a list of preference_classes.Item objects
        eps: (optional). assumed indifference threshold of the agent.

    Outputs:
        policy_A: (int). the item ID of policy A for the next query
        policy_B: (int). the item ID of policy B for the next query
        preferred_policy: (int). the item ID that we predict the user prefers.
    """

    assert isinstance(items, list)
    for item in items:
        assert isinstance(item, Item)

    assert isinstance(user, User)

    assert isinstance(user.answered_queries, list)
    answered_queries = user.answered_queries
    for query in answered_queries:
        assert isinstance(query, Query)

    # if the user does not have any answered queries, return a random query:
    if len(answered_queries) == 0:
        item_b, item_a = np.random.choice(items, 2, replace=False)
        predicted_response = 1
        objval = None
    else:
        item_a, item_b, predicted_response, objval = find_optimal_query(answered_queries, items, eps=eps)

    if verbose:
        print("next query for user %s: item_A=%d, item_B=%d" % (user.username, item_a.id, item_b.id))

    return item_a.id, item_b.id, predicted_response, objval


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
    query_list = [Query(item_A, item_B) for item_A, item_B in itertools.combinations(items, 2)]

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
            response_obj_values[j], _, _ = robust_recommend_subproblem(queries, items, verbose=verbose, eps=eps)

        # if all responses are infeasible, raise an Exception
        if all(v is None for v in response_obj_values):
            raise Exception("all responses are infeasible")

        # take the minimum objective value that is not None
        query_objective_values[i] = min([v for v in response_obj_values if v is not None])

    # if there are >1 optimal queries, select one at random
    max_obj = max(query_objective_values)
    optimal_query_indices = np.argwhere(query_objective_values == max_obj).flatten()
    optimal_ind = rs.choice(optimal_query_indices, 1)[0]

    # get the items from the optimal pair
    q_opt = query_list[optimal_ind]
    item_a_opt = q.item_A
    item_b_opt = q.item_B

    # calculate the robust utilities for each item
    robust_utility_a, _ = robust_utility(item_a_opt, answered_queries=answered_queries)
    robust_utility_b, _ = robust_utility(item_b_opt, answered_queries=answered_queries)

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


def robust_recommend_subproblem(answered_queries, items,
                                verbose=False,
                                eps=0):
    """
    solve the robust-recommendation subproblem: for a fixed set of queries and responses, contained in answered_queries
    this is the worst-case recommendation utility, given that an agent has supplied answered_queries

    return:
    - optimal objective of the subproblem
    - robust-recommended item
    - optimal utility vector (that minimizes u^T x)
    """

    # if the agent's uncertainty set is empty, the recommendation subproblem is infeasible, return None
    if not is_feasible(answered_queries):
        return None, None, None

    # some constants
    K = len(answered_queries)
    num_features = len(items[0].features)
    z_vectors = [q.z for q in answered_queries]

    # make sure that each answer is valid
    for query in answered_queries:
        assert query.response in Query.valid_responses

    # set up the Gurobi model
    m = create_mip_model(verbose=verbose)

    # define alpha vars (dual variables of the epigraph constraints)
    alpha_vars = m.addVars(K, vtype=GRB.CONTINUOUS, lb=-GRB.INFINITY, ub=GRB.INFINITY, name="alpha")

    # bound alpha according to r:
    for k in range(K):
        if answered_queries[k].response != 0:
            m.addConstr(answered_queries[k].response * alpha_vars[k] >= 0, name=('alpha_constr_k%d' % k))

    # define y variables -- used to select the recommended item x
    y_vars = m.addVars(len(items), vtype=GRB.BINARY)

    # only one item can be recommended
    m.addConstr(quicksum(y_vars) == 1, name="y_constr")

    # define an expression for each feature of x
    x_features = [quicksum([y_vars[i] * items[i].features[j] for i in range(len(items))]) for j in range(num_features)]

    # create the B matrix (this is for the initial set U^0 = [-1,1]^n
    b_mat = np.concatenate((np.eye(num_features), -np.eye(num_features)))
    b_vec = -np.ones(2 * num_features)

    # define beta vars (more dual variables)
    m_const = len(b_vec)
    beta_vars = m.addVars(m_const, vtype=GRB.CONTINUOUS, lb=0, ub=GRB.INFINITY, name="beta")

    # the big constraint ...
    for f in range(num_features):
        lhs_1 = quicksum([z_vectors[k][f] * alpha_vars[k] for k in range(K)])
        lhs_2 = quicksum([b_mat[j, f] * beta_vars[j] for j in range(m_const)])
        m.addConstr(lhs_1 + lhs_2 == x_features[f], name=('feature_%d' % f))

    # -- add the objective --
    if eps == 0:
        obj = quicksum([b_vec[j] * beta_vars[j] for j in range(m_const)])
    else:
        obj = eps * quicksum([answered_queries[k].response * alpha_vars[k] for k in range(K)]) \
              + quicksum([b_vec[j] * beta_vars[j] for j in range(m_const)])

    m.setObjective(obj, sense=GRB.MAXIMIZE)

    optimize(m, raise_warnings=False)

    # --- gather results ---

    # if the model is unbounded (uncertainty set it empty), return None
    if m.status in [GRB.INF_OR_UNBD, GRB.UNBOUNDED]:
        return None, None, None

    elif m.status == GRB.SUBOPTIMAL:
        # try re-solving
        optimize(m)
        # if this doesn't work, we have a problem
        assert m.status == GRB.OPTIMAL

    elif m.status != GRB.OPTIMAL:
        raise Exception("gurobi model is not optimal")

    # 1) find the recommended item
    y_vals = np.array([var.x for var in y_vars.values()])
    selected_items = np.argwhere(y_vals > 0.5)

    # there can only be one recommended item
    assert len(selected_items) == 1

    recommended_item_index = selected_items[0][0]
    recommended_item = items[recommended_item_index]

    # finally, find the minimum u-vector
    min_u_objval, u_vector = robust_utility(recommended_item, answered_queries=answered_queries)

    return m.objVal, recommended_item, u_vector

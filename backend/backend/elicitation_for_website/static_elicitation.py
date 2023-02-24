import itertools
import time

import numpy as np
from gurobipy import *
from scipy.special import comb

from .gurobi_functions import TIME_LIM, M, create_mip_model, optimize
from .preference_classes import Item, Query
from .utils import U0_polyhedron, get_u0


class StaticMIPFailed(Exception):
    pass


class FeasibilitySubproblemFailed(Exception):
    pass


class WarmDecompHeuristicFailed(Exception):
    pass


# primary function to build questionnaire
def build_questionnaire(items, K, time_lim):
    """

    args:
    - items:   (list(Item)). list of preference_classes.Item objects for building queries
    - K: (int). number of queries to find.
    - time_lim: (float). amount of time in seconds for time allowed for **each k = 1, ..., K**. this can fail if time_lim
        is too short.

    output:
    - queries

    """

    eps = 0.0
    valid_responses = [1, 0, -1]

    if K >= comb(len(items), 2):
        raise Exception("K must be smaller than the number of possible queries")

    queries, objval, _ = solve_warm_start_decomp_heuristic(
        items,
        K,
        eps,
        valid_responses,
        time_lim=time_lim,
        verbose=False,
        time_lim_overall=False,
        logfile=None,
        displayinterval=None,
    )

    # make sure that no queries have identical items
    for i, q in enumerate(queries):
        if q.item_A.id == q.item_B.id:
            raise Exception(
                "query {} returned by the heuristic uses only item {}".format(i + 1, q)
            )

    # if there are repeated queries, replace the repeated queries with other random queries
    if len(queries) > len(set(queries)):
        print(
            "the heuristic returned {} repeated queries. replacing these with new random queries.".format(
                len(queries) - len(set(queries))
            )
        )
        print("the queries returned by the heuristic are:")
        for q in queries:
            print(q)
        queries_unique = list(set(queries))

        # add new random queries to the list, which are not already there.
        new_queries = new_random_queries(items, K - len(queries_unique), queries_unique)

        queries_unique.extend(new_queries)
        assert len(queries_unique) == len(set(queries_unique))
        queries = queries_unique

    return queries, objval


# additional functions


def new_random_queries(items, num_new_queries, old_queries):
    """find new random queries to add to the list, which are not in old_queries"""

    query_list = [Query(a, b) for a, b in itertools.combinations(items, 2)]

    for q in old_queries:
        if q in query_list:
            query_list.remove(q)

    # get new random queries
    new_queries = np.random.choice(query_list, num_new_queries, replace=False)

    return new_queries


def static_mip_optimal(
    items,
    K,
    valid_responses,
    time_lim=TIME_LIM,
    cut_1=True,
    cut_2=True,
    start_queries=None,
    fixed_queries=None,
    fixed_responses=None,
    start_rec=None,
    subproblem_list=None,
    displayinterval=None,
    gamma_inconsistencies=0.0,
    problem_type="maximin",
    raise_gurobi_time_limit=True,
    log_problem_size=False,
    logger=None,
    u0_type="positive_normed",
    artificial_bounds=False,
):
    """
    finds the robust-optimal query set, given a set of items.

    input:
    - items : a list of Item objects
    - K : the number of queries to be selected
    - start_queries : list of K queries to use as a warm start. do not need to be sorted.
    - fixed_queries : list of queries to FIX. length of this list must be <=K. these are fixed as the FIRST queries (order is arbitrary anyhow)
    - fixed_responses : list of responses for FIX, for the first n <= K queries. (alternative to using arg response_subset)
    - cut_1 : (bool) use cut restricting values of p and q (p < q)
    - cut_2 : (bool) use cut restricting order of queries (lexicographical order of (p,q) pairs)
    - valid_responses : list of ints, either [1, -1, 0] (indifference) or [1, -1] (no indifference)
    - response_subset : subset of scenarios S, where S[i] is a list of ints {-1, 0, 1}, of len K
    - logfile: if specified, write a gurobi logfile at this path
    - gamma_inconsistencies: (float). assumed upper bound of agent inconsistencies. increasing gamma increases the
        size of the uncertainty set
    - problem_type : (str). either 'maximin' or 'mmr'. if maximin, solve the maximin robust recommendation
        problem. if mmr, solve the minimax regret problem.

    output:
    - query_list : a list of Query objects
    - start_rec : dict where keys are response scenarios, values are indices of recommended item
    """

    if fixed_queries is None:
        fixed_queries = []

    for query in fixed_queries:
        it_a = query.item_A
        it_b = query.item_B
        res = query.response
        if it_a.id > it_b.id:
            if res == 1:
                temp = it_a
                query.item_A = it_b
                query.item_B = temp
                query.response = -1
            elif res == -1:
                temp = it_a
                query.item_A = it_b
                query.item_B = temp
                query.response = 1
            else:
                temp = it_a
                query.item_A = it_b
                query.item_B = temp

    assert problem_type in ["maximin", "mmr"]

    # indifference responses not supported
    assert set(valid_responses) == {-1, 0, 1}

    # number of features for each item
    num_features = len(items[0].features)

    # polyhedral definition for U^0, B_mat and b_vec
    B_mat, b_vec = get_u0(u0_type, num_features)

    # number of items
    num_items = len(items)

    # lambda variables (dual variables for the initial uncertainty set):
    # lam_vars[r,i] is the i^th dual variable (for i = 1,...,m_const) for the r^th response scenario
    # recall: B_mat (m_const x n), and b_vec (m_const x 1)
    m_const = len(b_vec)
    assert B_mat.shape == (m_const, num_features)

    # get the logfile from the logger, if there is one
    if logger is not None:
        log_file = logger.handlers[0].baseFilename
    else:
        log_file = None

    # define the mip model
    m = create_mip_model(
        time_lim=time_lim,
    )

    # the objective
    tau = m.addVar(vtype=GRB.CONTINUOUS, lb=-GRB.INFINITY, ub=GRB.INFINITY, name="tau")

    if problem_type == "maximin":
        m.setObjective(tau, sense=GRB.MAXIMIZE)
        if artificial_bounds:
            # artificial objective bound
            obj_bound = 1000
            m.addConstr(tau <= obj_bound, name="artificial_obj_bound")
    if problem_type == "mmr":
        m.setObjective(tau, sense=GRB.MINIMIZE)
        # artificial objective bound
        obj_bound = -1000
        m.addConstr(tau >= obj_bound, name="artificial_obj_bound")

    # all possible agent response scenarios
    if subproblem_list is None:
        # each subproblem is a single response scenario
        scenario_list = list(itertools.product(valid_responses, repeat=K))
        num_scenarios = int(np.power(len(valid_responses), K))
        assert num_scenarios == len(scenario_list)
    else:
        # each subproblem should be a single response scenario
        # assert that every response in the subset is a valid response
        for r in subproblem_list:
            assert set(r).difference(set(valid_responses)) == set([])
        scenario_list = subproblem_list

    if fixed_responses is not None:
        # assert subproblem_list is None
        # f = len(fixed_responses)
        # t = tuple(fixed_responses)
        # assert f <= K
        # r_list = list(r for r in itertools.product(valid_responses, repeat=K) if r[:f] == t)
        raise NotImplemented("not implemented")

    # define integer variables - this is the same for both MMR and maximin problem types
    p_vars, q_vars, w_vars = add_integer_variables(
        m,
        num_items,
        K,
        start_queries=start_queries,
        cut_1=cut_1,
        cut_2=cut_2,
        fixed_queries=fixed_queries,
    )

    # now add continuous variables for each response scenario
    if problem_type == "maximin":
        y_vars = {}
        alpha_vars = {}
        rho_vars = {}
        nu_vars = {}
        beta_vars = {}
        v_bar_vars = {}
        w_bar_vars = {}
        v_bar_prime_vars = {}
        w_bar_prime_vars = {}
        v_bar_prime_prime_vars = {}
        w_bar_prime_prime_vars = {}
        for i, r in enumerate(scenario_list):
            (
                alpha_vars[r],
                rho_vars[r],
                nu_vars[r],
                beta_vars[r],
                v_bar_vars[r],
                w_bar_vars[r],
                v_bar_prime_vars[r],
                w_bar_prime_vars[r],
                v_bar_prime_prime_vars[r],
                w_bar_prime_prime_vars[r],
            ) = add_r_constraints(
                m,
                tau,
                p_vars,
                q_vars,
                K,
                r,
                i,
                m_const,
                items,
                num_items,
                num_features,
                B_mat,
                b_vec,
                y_vars=y_vars,
                problem_type=problem_type,
                fixed_queries=fixed_queries,
                gamma_inconsistencies=gamma_inconsistencies,
            )

    if problem_type == "mmr":
        # store y_vars for each scenario
        y_vars = {}
        alpha_vars = {}
        beta_vars = {}
        v_bar_vars = {}
        w_bar_vars = {}
        for i, r in enumerate(scenario_list):
            for item in items:
                (
                    alpha_vars[r, item.id],
                    beta_vars[r, item.id],
                    v_bar_vars[r, item.id],
                    w_bar_vars[r, item.id],
                ) = add_r_constraints(
                    m,
                    tau,
                    p_vars,
                    q_vars,
                    K,
                    r,
                    i,
                    m_const,
                    items,
                    num_items,
                    num_features,
                    B_mat,
                    b_vec,
                    y_vars=y_vars,
                    problem_type=problem_type,
                    mmr_item=item,
                    fixed_queries=fixed_queries,
                    gamma_inconsistencies=gamma_inconsistencies,
                )

    m.update()
    # m.write("static_elicitation_single_agent.lp")

    if log_problem_size and logger is not None:
        logger.info(f"total variables: {m.numvars}")
        logger.info(f"total constraints: {m.numconstrs}")

    # m.params.DualReductions = 0
    # try: #TODO: undo
    optimize(m, raise_warnings=False)

    # except GurobiTimeLimit:
    #     if raise_gurobi_time_limit:
    #         raise GurobiTimeLimit

    # for i in m.getVars():
    #     print(i,i.x)

    if m.status == GRB.TIME_LIMIT:
        time_limit_reached = True
    else:
        time_limit_reached = False

    if artificial_bounds and logger is not None:
        if abs(tau.x - obj_bound) <= 1e-3:
            logger.info(f"problem is likely unbounded: tau = obj_bound = {obj_bound}")
    try:
        # get the indices of the optimal queries
        p_inds = [-1 for _ in range(K)]
        q_inds = [-1 for _ in range(K)]

        # m.computeIIS()
        # m.write("model.ilp")

        for k in range(K):
            p_list = [np.round(p_vars[i, k].x) for i in range(num_items)]
            p_inds[k] = int(np.argwhere(p_list))
            # print(p_list[k])
            q_list = [np.round(q_vars[i, k].x) for i in range(num_items)]
            q_inds[k] = int(np.argwhere(q_list))
            # print(q_list[k])
        # print(p_list)
        # print(q_list)
    except:
        # if failed for some reason...

        # lp_file = generate_filepath(os.getenv("HOME"), "static_milp_problem", "lp")
        # m.write(lp_file)
        # if logger is not None:
        #     logger.info(
        #         f"static MIP failed, model status = {m.status}, writing LP file to {lp_file}"
        #     )
        raise StaticMIPFailed

    # get indices of recommended items
    rec_inds = {}
    # for i_r, r in enumerate(r_list):
    #     y_list = [np.round(y_vars[i_r][i].x) for i in range(num_items)]
    #     rec_inds[r] = int(np.argwhere(y_list))

    return (
        [Query(items[p_inds[k]], items[q_inds[k]]) for k in range(K)],
        m.objVal,
        time_limit_reached,
        rec_inds,
    )


def add_integer_variables(
    model,
    num_items,
    K,
    start_queries=None,
    cut_1=True,
    cut_2=True,
    fixed_queries=[],
):
    """
    :param model:
    :param num_items:
    :param K:
    :param r_list:
    :param start_queries: list of K queries to use as a warm start. do not need to be sorted.
    :param cut_1:
    :param cut_2:
    :param fixed_queries : list of queries to FIX. length of this list must be <=K. these are fixed as the FIRST queries (order is arbitrary anyhow)
    :param start_rec: a dict with keys corresponding to response scenarios, and values corresponding to the
            index of recommended item : { r : ind, r : ind , ...}, to be used for warm starts. the response scenarios
            here correspond to the start_queries -- i.e., if start_rec is used, then start_queries *must*
            be used as well
    """
    # p and q vars : to select the k^th comparison
    # z^k = \sum_i (p^k_i - q^k_i) x^i
    # p_vars[i,k] = p^k_i
    # q_vars[i,k] = q^k_i
    # get the indices of non-fixed variables

    p_vars = model.addVars(num_items, K, vtype=GRB.BINARY, name="v")
    q_vars = model.addVars(num_items, K, vtype=GRB.BINARY, name="w")

    # # auxiliary variable
    # new_start_rec = None

    model.update()
    for _, var in p_vars.items():
        var.BranchPriority = 1

    for _, var in q_vars.items():
        var.BranchPriority = 2

    # exactly one item can be selected in p^k and q^k

    # fix queries if fixed_queries is specified
    if len(fixed_queries) > 0:
        if len(fixed_queries) > K:
            raise Exception("number of fixed queries must be <= K")

        if cut_2:
            raise Exception("cut_2 must be off in order to use fixed queries")

        # item_A.id is the index of p, and item_B.id is the index of q
        # print("fixed, query",fixed_queries)
        for i_q, q in enumerate(fixed_queries):
            # print("i_q,q",i_q,q)
            model.addConstr(p_vars[q.item_A.id, i_q] == 1)
            model.addConstr(q_vars[q.item_B.id, i_q] == 1)

            # make sure this query isn't repeated later. ("cut off" this query, making it infeasible)
            for i_q_free in range(len(fixed_queries), K):
                model.addConstr(
                    p_vars[q.item_A.id, i_q_free] + q_vars[q.item_B.id, i_q_free] <= 1
                )

    for k in range(K):
        model.addSOS(GRB.SOS_TYPE1, [p_vars[i, k] for i in range(num_items)])
        model.addSOS(GRB.SOS_TYPE1, [q_vars[i, k] for i in range(num_items)])

        model.addConstr(
            quicksum(p_vars[i, k] for i in range(num_items)) == 1,
            # name=("p_constr_k%d" % k),
        )
        model.addConstr(
            quicksum(q_vars[i, k] for i in range(num_items)) == 1,
            # name=("q_constr_k%d" % k),
        )

    # add warm start queries if they're provided
    if start_queries is not None:
        if len(start_queries) != K:
            raise Exception("must provide exactly K start queries")

        # build (p,q) list, and sort s.t. p<q for each
        pq_list = [
            (min([q.item_A.id, q.item_B.id]), max([q.item_A.id, q.item_B.id]))
            for q in start_queries
        ]

        # order the queries (w is an auxiliary base-10 number indicating the order of queries)
        w_list = [(num_items + 1) * a + b for a, b in pq_list]

        # this is the correct order of comparisons... :  reversed(np.array(w_list).argsort())
        k_order = list(reversed(np.array(w_list).argsort()))
        pq_list_sorted = [pq_list[i] for i in k_order]

        # # if the start responses were added, re-order the keys (we assume they correspond to the new comparison
        # if start_rec is not None:
        #     new_start_rec = {}
        #     for key, val in start_rec.items():
        #         new_key = tuple([key[i] for i in k_order])
        #         new_start_rec[new_key] = val

        for k in range(K):
            for i in range(num_items):
                q_vars[i, k].start = 0
                p_vars[i, k].start = 0

        model.update()

        # now set the q and p values...
        for k in range(K):
            p_vars[pq_list_sorted[k][0], k].start = 1
            q_vars[pq_list_sorted[k][1], k].start = 1

        model.update()

    if cut_1:
        # cut 1: redundant comparison sequences
        for k in range(K):
            for i in range(num_items):
                model.addConstr(
                    1 - q_vars[i, k]
                    >= quicksum([p_vars[j, k] for j in range(num_items) if j >= i]),
                    name=("q_cut_k%d_i%d" % (k, i)),
                )

    # w vars : w^k represents k^th comparison
    # note: these are "y" in the paper
    # w^k = p^k + q^k
    # w_vars = model.addVars(num_items, K, vtype=GRB.CONTINUOUS, lb=-GRB.INFINITY, ub=GRB.INFINITY, name='w')
    w_vars = model.addVars(num_items, K, vtype=GRB.BINARY, name="t")
    for i in range(num_items):
        for k in range(K):
            model.addConstr(
                w_vars[i, k] == p_vars[i, k] + q_vars[i, k],
                name=("t_constr_i%d_k%d" % (i, k)),
            )
            # add warm start values for w, if provided
            if start_queries is not None:
                w_vars[i, k].start = p_vars[i, k].start + q_vars[i, k].start

    if cut_2:

        # only need to define these for k<k'
        z_vars = {}
        for k_prime in range(K):
            for k in range(K):
                if k < k_prime:
                    z_vars[k, k_prime] = model.addVars(
                        num_items, vtype=GRB.BINARY, name=("z_k%d_kp%d" % (k, k_prime))
                    )
                    for i in range(num_items):
                        # constraints to define v_vars
                        model.addConstr(
                            z_vars[k, k_prime][i] <= w_vars[i, k] + w_vars[i, k_prime],
                            name=("z_constrA_k%d_kp%d_i%d" % (k, k_prime, i)),
                        )
                        model.addConstr(
                            z_vars[k, k_prime][i]
                            <= 2 - w_vars[i, k] - w_vars[i, k_prime],
                            name=("z_constrB_k%d_kp%d_i%d" % (k, k_prime, i)),
                        )
                        model.addConstr(
                            z_vars[k, k_prime][i] >= w_vars[i, k] - w_vars[i, k_prime],
                            name=("z_constrC_k%d_kp%d_i%d" % (k, k_prime, i)),
                        )
                        model.addConstr(
                            z_vars[k, k_prime][i] >= -w_vars[i, k] + w_vars[i, k_prime],
                            name=("z_constrD_k%d_kp%d_i%d" % (k, k_prime, i)),
                        )

                        # cut 2: now enforce lex. ordering of w vectors
                        model.addConstr(
                            w_vars[i, k_prime]
                            >= w_vars[i, k]
                            - quicksum(
                                z_vars[k, k_prime][i_prime]
                                for i_prime in range(num_items)
                                if i_prime < i
                            ),
                            name=("lex_cut_k%d_kp%d_i%d" % (k, k_prime, i)),
                        )

                    # finally, ban identical queries (using the z_vars..)
                    model.addConstr(quicksum(z_vars[k, k_prime]) >= 1)

    # else:
    #     w_vars = []
    #
    # # loop over all response scenarios...
    # y_vars_list = []
    # for i_r, r in enumerate(r_list):
    #     # Note: all variables defined here are only for the current response scenario r
    #
    #     # y vars : to select x^r, the recommended item in scenario r
    #     y_vars = model.addVars(num_items, vtype=GRB.BINARY, name="y_r" + str(i_r))
    #
    #     if new_start_rec is None:
    #         new_start_rec = start_rec
    #
    #     # if start y_vars are provided
    #     if start_rec is not None:
    #         for i_n in range(num_items):
    #             y_vars[i_n].start = 0
    #         model.update()
    #         y_vars[new_start_rec[r]].start = 1
    #         model.update()
    #
    #     y_vars_list.append(y_vars)
    #     # exactly one item must be selected
    #     if use_sos:
    #         model.addSOS(GRB.SOS_TYPE1, [y_vars[i] for i in range(num_items)])
    #
    #     model.addConstr(quicksum(y_vars[i] for i in range(num_items)) == 1, name=('y_constr_r%d' % i_r))

    return p_vars, q_vars, w_vars


def add_r_constraints(
    m,
    tau,
    p_vars,
    q_vars,
    K,
    response_scenario,
    i_r,
    m_const,
    items,
    num_items,
    num_features,
    B_mat,
    b_vec,
    y_vars,
    problem_type="maximin",
    mmr_item=None,
    fixed_queries=[],
    gamma_inconsistencies=0.0,
):
    """
    add constraints for a single response scenario

    input vars:
    - m : gurobi model
    - tau : gurobi variable tau from the model
    - r : response scenario (K-length vector)
    - i_r : index of r (only used for printing and naming variables / constraints)
    - problem_type : (str). either 'maximin' or 'mmr'. if maximin, add constraints for the maximin robust recommendation
        problem. if mmr, add constraints for the minimax regret problem.
    - mmr_item: if problem_type is mmr, then create constraints where x' on the RHS of the equality constraint is mmr_item
    - y_vars: (dict) keys are response scenarios, values are arrays of binary y-variables. if y_vars[r] is not defined,
        add this to the dict
    """

    assert problem_type in ["mmr", "maximin"]

    for ri in response_scenario:
        assert ri in [-1, 0, 1]

    if problem_type == "mmr":
        assert isinstance(mmr_item, Item)

    if problem_type == "mmr":
        id_str = f"r{i_r}_i{mmr_item.id}"
    if problem_type == "maximin":
        id_str = f"r{i_r}"

    if y_vars.get(response_scenario) is None:
        # y vars : to select x^r, the recommended item in scenario r
        y_vars[response_scenario] = m.addVars(
            num_items, vtype=GRB.BINARY, name=(f"y_{id_str}")
        )

        m.addSOS(
            GRB.SOS_TYPE1, [y_vars[response_scenario][i] for i in range(num_items)]
        )

        m.addConstr(
            quicksum(y_vars[response_scenario][i] for i in range(num_items)) == 1,
            name=f"y_constr_{id_str}",
        )

    if gamma_inconsistencies > 0:
        # dual variable for inconsistencies constraint
        if problem_type == "maximin":
            mu_var = m.addVar(
                vtype=GRB.CONTINUOUS, lb=-GRB.INFINITY, ub=0.0, name=f"mu_{id_str}"
            )
        if problem_type == "mmr":
            mu_var = m.addVar(
                vtype=GRB.CONTINUOUS, lb=0.0, ub=GRB.INFINITY, name=f"mu_{id_str}"
            )
    else:
        mu_var = 0

    # the dual variables have a different sign for mmr and maximin
    if problem_type == "maximin":
        dual_lb = 0.0
        dual_ub = GRB.INFINITY
    if problem_type == "mmr":
        dual_lb = -GRB.INFINITY
        dual_ub = 0.0

    beta_vars = m.addVars(
        m_const, vtype=GRB.CONTINUOUS, lb=dual_lb, ub=dual_ub, name=f"beta_r_{id_str}"
    )
    alpha_vars = m.addVars(
        K, vtype=GRB.CONTINUOUS, lb=dual_lb, ub=dual_ub, name=f"zeta_{id_str}"
    )

    if 0 in response_scenario:
        # print("0 in", response_scenario)
        indiff_lb = -GRB.INFINITY
    else:
        indiff_lb = 0

    rho_vars = m.addVars(
        K, vtype=GRB.CONTINUOUS, lb=indiff_lb, ub=0, name=f"rho_{id_str}"
    )

    nu_vars = m.addVars(
        K, vtype=GRB.CONTINUOUS, lb=indiff_lb, ub=0, name=f"nu_{id_str}"
    )

    # only define these variables for queries which are not fixed
    # define v_bar, w_bar vars (dual variables of the epigraph constraints, for linearization)
    # get the indices of non-fixed variables
    K_free = [k for k in range(K) if k >= len(fixed_queries)]
    K_fixed = [k for k in range(K) if k < len(fixed_queries)]

    v_bar_vars = m.addVars(
        num_items,
        K_free,
        vtype=GRB.CONTINUOUS,
        lb=dual_lb,
        ub=dual_ub,
        name=f"vbar_{id_str}",
    )
    w_bar_vars = m.addVars(
        num_items,
        K_free,
        vtype=GRB.CONTINUOUS,
        lb=dual_lb,
        ub=dual_ub,
        name=f"wbar_{id_str}",
    )

    v_bar_prime_vars = m.addVars(
        num_items,
        K_free,
        vtype=GRB.CONTINUOUS,
        lb=indiff_lb,
        ub=0,
        name=f"vbar'_{id_str}",
    )
    w_bar_prime_vars = m.addVars(
        num_items,
        K_free,
        vtype=GRB.CONTINUOUS,
        lb=indiff_lb,
        ub=0,
        name=f"wbar'_{id_str}",
    )

    v_bar_prime_prime_vars = m.addVars(
        num_items,
        K_free,
        vtype=GRB.CONTINUOUS,
        lb=indiff_lb,
        ub=0,
        name=f"vbar''_{id_str}",
    )
    w_bar_prime_prime_vars = m.addVars(
        num_items,
        K_free,
        vtype=GRB.CONTINUOUS,
        lb=indiff_lb,
        ub=0,
        name=f"wbar''_{id_str}",
    )
    # print("vbar",v_bar_vars)
    if gamma_inconsistencies > 0:
        if problem_type == "maximin":
            for k in range(K):
                # for resp in response_scenario:
                #     print("resp scenario is", response_scenario)
                if response_scenario[k] == -1 or response_scenario[k] == 1:
                    m.addConstr(
                        alpha_vars[k] + mu_var <= 0,
                        name=f"alpha_constr_k{k}_{id_str}",
                    )
                elif response_scenario[k] == 0:  # indifferent
                    m.addConstr(
                        -rho_vars[k] - nu_vars[k] + mu_var <= 0,
                        name=f"rho_nu_constr_k{k}_{id_str}",
                    )

                else:
                    raise Exception(
                        "response scenario value unexpected:", response_scenario[k]
                    )
        if problem_type == "mmr":
            for k in range(K):
                m.addConstr(
                    alpha_vars[k] + mu_var >= 0,
                    name=f"alpha_constr_k{k}_{id_str}",
                )

    # constraints defining gamma and lambda - identical for mmr and maximin
    if problem_type == "maximin":
        for k in K_free:
            for i in range(num_items):
                m.addGenConstrIndicator(
                    p_vars[i, k],
                    False,
                    v_bar_vars[i, k] == 0.0,
                    name=f"v_constrA_k{k}_i{i}_{id_str}",
                )

                m.addGenConstrIndicator(
                    p_vars[i, k],
                    True,
                    v_bar_vars[i, k] == alpha_vars[k],
                    name=f"v_constrB_k{k}_i{i}_{id_str}",
                )

                m.addGenConstrIndicator(
                    q_vars[i, k],
                    False,
                    w_bar_vars[i, k] == 0.0,
                    name=f"v_constrA_k{k}_i{i}_{id_str}",
                )

                m.addGenConstrIndicator(
                    q_vars[i, k],
                    True,
                    w_bar_vars[i, k] == alpha_vars[k],
                    name=f"v_constrB_k{k}_i{i}_{id_str}",
                )

                # ----------------------------------------------------------------------------------
                m.addGenConstrIndicator(
                    p_vars[i, k],
                    False,
                    v_bar_prime_vars[i, k] == 0.0,
                    name=f"v_constrA_k{k}_i{i}_{id_str}",
                )

                m.addGenConstrIndicator(
                    p_vars[i, k],
                    True,
                    v_bar_prime_vars[i, k] == rho_vars[k],
                    name=f"v_constrB_k{k}_i{i}_{id_str}",
                )

                m.addGenConstrIndicator(
                    q_vars[i, k],
                    False,
                    w_bar_prime_vars[i, k] == 0.0,
                    name=f"v_constrA_k{k}_i{i}_{id_str}",
                )

                m.addGenConstrIndicator(
                    q_vars[i, k],
                    True,
                    w_bar_prime_vars[i, k] == rho_vars[k],
                    name=f"v_constrB_k{k}_i{i}_{id_str}",
                )
                # ----------------------------------------------------------------------------------
                m.addGenConstrIndicator(
                    p_vars[i, k],
                    False,
                    v_bar_prime_prime_vars[i, k] == 0.0,
                    name=f"v_constrA_k{k}_i{i}_{id_str}",
                )

                m.addGenConstrIndicator(
                    p_vars[i, k],
                    True,
                    v_bar_prime_prime_vars[i, k] == nu_vars[k],
                    name=f"v_constrB_k{k}_i{i}_{id_str}",
                )

                m.addGenConstrIndicator(
                    q_vars[i, k],
                    False,
                    w_bar_prime_prime_vars[i, k] == 0.0,
                    name=f"v_constrA_k{k}_i{i}_{id_str}",
                )

                m.addGenConstrIndicator(
                    q_vars[i, k],
                    True,
                    w_bar_prime_prime_vars[i, k] == nu_vars[k],
                    name=f"v_constrB_k{k}_i{i}_{id_str}",
                )

                # m.addConstr(
                #     v_bar_vars[i, k] <= M * p_vars[i, k],
                #     name=f"p_constrA_k{k}_i{i}_{id_str}",
                # )
                # m.addConstr(
                #     v_bar_vars[i, k] <= alpha_vars[k],
                #     name=f"p_constrB_k{k}_i{i}_{id_str}",
                # )
                # m.addConstr(
                #     v_bar_vars[i, k] >= alpha_vars[k] - M * (1 - p_vars[i, k]),
                #     name=f"p_constrC_k{k}_i{i}_{id_str}",
                # )
                #
                # m.addConstr(
                #     w_bar_vars[i, k] <= M * q_vars[i, k],
                #     name=f"q_constrA_k{k}_i{i}_{id_str}",
                # )
                # m.addConstr(
                #     w_bar_vars[i, k] <= alpha_vars[k],
                #     name=f"q_constrB_k{k}_i{i}_{id_str}",
                # )
                # m.addConstr(
                #     w_bar_vars[i, k] >= alpha_vars[k] - M * (1 - q_vars[i, k]),
                #     name=f"q_constrC_k{k}_i{i}_{id_str}",
                # )
                # #   -----------------------------------------------------------------
                # m.addConstr(
                #     v_bar_prime_vars[i, k] >= - M * p_vars[i, k],
                #     name=f"p'_constrA_k{k}_i{i}_{id_str}",
                # )
                # m.addConstr(
                #     v_bar_prime_vars[i, k] >= rho_vars[k],
                #     name=f"p'_constrB_k{k}_i{i}_{id_str}",
                # )
                # m.addConstr(
                #     v_bar_prime_vars[i, k] <= rho_vars[k] + M * (1 - p_vars[i, k]),
                #     name=f"p'_constrC_k{k}_i{i}_{id_str}",
                # )
                #
                # m.addConstr(
                #     w_bar_prime_vars[i, k] >= -M * q_vars[i, k],
                #     name=f"q'_constrA_k{k}_i{i}_{id_str}",
                # )
                # m.addConstr(
                #     w_bar_prime_vars[i, k] >= rho_vars[k],
                #     name=f"q'_constrB_k{k}_i{i}_{id_str}",
                # )
                # m.addConstr(
                #     w_bar_prime_vars[i, k] <= rho_vars[k] + M * (1 - q_vars[i, k]),
                #     name=f"q'_constrC_k{k}_i{i}_{id_str}",
                # )
                # #   -----------------------------------------------------------------
                # m.addConstr(
                #     v_bar_prime_prime_vars[i, k] >= -M * p_vars[i, k],
                #     name=f"p''_constrA_k{k}_i{i}_{id_str}",
                # )
                # m.addConstr(
                #     v_bar_prime_prime_vars[i, k] >= nu_vars[k],
                #     name=f"p''_constrB_k{k}_i{i}_{id_str}",
                # )
                # m.addConstr(
                #     v_bar_prime_prime_vars[i, k] <= nu_vars[k] + M * (1 - p_vars[i, k]),
                #     name=f"p''_constrC_k{k}_i{i}_{id_str}",
                # )
                #
                # m.addConstr(
                #     w_bar_prime_prime_vars[i, k] >= -M * q_vars[i, k],
                #     name=f"q''_constrA_k{k}_i{i}_{id_str}",
                # )
                # m.addConstr(
                #     w_bar_prime_prime_vars[i, k] >= nu_vars[k],
                #     name=f"q''_constrB_k{k}_i{i}_{id_str}",
                # )
                # m.addConstr(
                #     w_bar_prime_prime_vars[i, k] <= nu_vars[k] + M * (1 - q_vars[i, k]),
                #     name=f"q''_constrC_k{k}_i{i}_{id_str}",
                # )
    if problem_type == "mmr":
        for k in K_free:
            for i in range(num_items):
                m.addConstr(
                    v_bar_vars[i, k] >= -M * p_vars[i, k],
                    name=f"p_constrA_k{k}_i{i}_{id_str}",
                )
                m.addConstr(
                    v_bar_vars[i, k] >= alpha_vars[k],
                    name=f"p_constrB_k{k}_i{i}_{id_str}",
                )
                m.addConstr(
                    v_bar_vars[i, k] <= alpha_vars[k] + M * (1 - p_vars[i, k]),
                    name=f"p_constrC_k{k}_i{i}_{id_str}",
                )

                m.addConstr(
                    w_bar_vars[i, k] >= -M * q_vars[i, k],
                    name=f"q_constrA_k{k}_i{i}_{id_str}",
                )
                m.addConstr(
                    w_bar_vars[i, k] >= alpha_vars[k],
                    name=f"q_constrB_k{k}_i{i}_{id_str}",
                )
                m.addConstr(
                    w_bar_vars[i, k] <= alpha_vars[k] + M * (1 - q_vars[i, k]),
                    name=f"q_constrC_k{k}_i{i}_{id_str}",
                )

    # the big equality constraint
    for f in range(num_features):
        lhs_1_fixed = 0
        if len(fixed_queries) > 0:
            lhs_1_fixed = quicksum(
                response_scenario[k]
                * alpha_vars[k]
                * (
                    fixed_queries[i_q].item_A.features[f]
                    - fixed_queries[i_q].item_B.features[f]
                )
                for i_q, k in enumerate(K_fixed)
                if (response_scenario[k] == 1 or response_scenario[k] == -1)
            ) + quicksum(
                (rho_vars[k] - nu_vars[k])
                * (
                    fixed_queries[i_q].item_A.features[f]
                    - fixed_queries[i_q].item_B.features[f]
                )
                for i_q, k in enumerate(K_fixed)
                if (response_scenario[k] == 0)
            )

        lhs_1_free = (
            quicksum(
                items[i].features[f]
                * quicksum(
                    response_scenario[k] * (v_bar_vars[i, k] - w_bar_vars[i, k])
                    for k in K_free
                    if (response_scenario[k] == 1 or response_scenario[k] == -1)
                )
                for i in range(num_items)
            )
            + quicksum(
                items[i].features[f]
                * quicksum(
                    (v_bar_prime_vars[i, k] - w_bar_prime_vars[i, k])
                    for k in K_free
                    if (response_scenario[k] == 0)
                )
                for i in range(num_items)
            )
            - quicksum(
                items[i].features[f]
                * quicksum(
                    (v_bar_prime_prime_vars[i, k] - w_bar_prime_prime_vars[i, k])
                    for k in K_free
                    if (response_scenario[k] == 0)
                )
                for i in range(num_items)
            )
        )
        lhs_2 = quicksum(B_mat[j, f] * beta_vars[j] for j in range(m_const))

        if problem_type == "maximin":
            rhs = quicksum(
                y_vars[response_scenario][i] * items[i].features[f]
                for i in range(num_items)
            )

        if problem_type == "mmr":
            rhs = mmr_item.features[f] - quicksum(
                y_vars[response_scenario][i] * items[i].features[f]
                for i in range(num_items)
            )

        m.addConstr(lhs_1_fixed + lhs_1_free + lhs_2 == rhs, name=f"big_f{f}_{id_str}")

    # bound tau
    if problem_type == "maximin":
        m.addConstr(
            tau
            <= quicksum(b_vec[j] * beta_vars[j] for j in range(m_const))
            + gamma_inconsistencies * mu_var,
            name=f"tau_{id_str}",
        )
    if problem_type == "mmr":
        m.addConstr(
            tau
            >= quicksum(b_vec[j] * beta_vars[j] for j in range(m_const))
            + gamma_inconsistencies * mu_var,
            name=f"tau_{id_str}",
        )

    return (
        alpha_vars,
        rho_vars,
        nu_vars,
        beta_vars,
        v_bar_vars,
        w_bar_vars,
        v_bar_prime_vars,
        w_bar_prime_vars,
        v_bar_prime_prime_vars,
        w_bar_prime_prime_vars,
    )


# def find_cluster_queries(queries, k):
#     # queries based on cluster centers of z vectors (assume k clusters)
#     queries_cluster = []
#     # cluster z vectors
#     Z = [np.array(q.z) for q in queries]
#     kmeans = sklearn.cluster.KMeans(n_clusters=k, random_state=0).fit(Z)
#
#     # find the query with
#     for center in kmeans.cluster_centers_:
#         q_ind_min = np.argmin([np.linalg.norm(z_vec - center) for z_vec in Z])
#         queries_cluster.append(queries[q_ind_min])
#
#     return queries_cluster
#
#
# def greedy_CSS_queries(queries, k):
#     # find k queries that are nearly orthogonal
#     # algorithm 1 from : Greedy Column Subset Selection: New Bounds and Distributed Algorithms
#     # goal: select columns of A matrix (each column is one Z vector
#     Z = [np.array(q.z) for q in queries]
#
#     A = np.matrix(Z).T
#
#     queries_css = []
#     for i in range(k):
#         # find column that maximizes Frobenius norm of Proj(V)*A
#         norms = np.zeros(len(queries))
#         for i_q,q in enumerate(queries):
#             if q not in queries_css:
#                 q_aug = copy.copy(queries_css)
#                 q_aug.append(q)
#                 V = np.matrix([qq.z for qq in q_aug]).T
#                 norms[i_q] = np.power(np.linalg.norm(np.matmul(proj_mat(V),A)),2)
#
#         # set the i^th query as that which maximizes the Frobenius norm ^2
#         queries_css.append(queries[np.argmax(norms)])
#
#     return queries_css
#
# def proj_mat(A):
#     # return the projection operator (onto the columns of A)
#     # USE THE PSEUDOINVERSE, TO DEAL WITH SINGULAR MATRICES
#     return np.matmul(np.matmul(A, np.linalg.pinv(np.matmul(A.T,A))),A.T)


def solve_warm_start(
    items,
    K,
    eps,
    valid_responses,
    cut_1=True,
    time_lim=TIME_LIM,
    time_lim_overall=True,
    verbose=False,
    logfile=None,
    displayinterval=None,
):
    """
    incrementally build a solution using small K, up to the desired K
    smaller-K solutions are used as warm starts for larger-K solutions

    items: (list(Item)).
    K: (int)
    eps: (float).
    valid_responses: (list(tuple)).
    cut_1: (bool).
    time_lim: (float)
    time_lim_overall: (bool). if true, time limit applies to overall runtime. if false, time limit is applied to each
        iteration (each K) independently.
    verbose: (bool)
    logfile: (str).
    displayinterval: (float)
    """

    assert isinstance(time_lim, int) or isinstance(time_lim, float)

    start_time = time.time()

    solve_opt = lambda k, queries_apx, time_lim, start_rec: static_mip_optimal(
        items,
        k,
        eps,
        valid_responses,
        cut_1=cut_1,
        cut_2=True,
        start_queries=queries_apx,
        time_lim=time_lim,
        start_rec=start_rec,
        verbose=verbose,
        logfile=logfile,
        displayinterval=displayinterval,
    )

    # this is the time budget; subtract from it each time we run anything...
    t_remaining = time_lim

    t0 = time.time()
    k = 1

    if logfile is not None:
        with open(logfile, "a") as f:
            f.write("WARM START: k=%d; time=%f\n" % (k, (time.time() - start_time)))

    queries_opt, objval, time_lim_reached, rec_inds = static_mip_optimal(
        items,
        k,
        eps,
        valid_responses,
        cut_1=cut_1,
        cut_2=False,
        time_lim=time_lim,
        verbose=verbose,
        logfile=logfile,
        displayinterval=displayinterval,
    )

    # if we apply the time limit to the overall run, then subtract after each iteration. otherwise, never subtract.
    if time_lim_overall:
        t_remaining -= time.time() - t0

    for k in range(2, K + 1):

        # complete the approximate solution by adding a random query to the end
        done = False
        while not done:
            item_pair = np.random.choice(len(items), 2, replace=False)
            done = True
            for q in queries_opt:
                if (item_pair[0] == q.item_A.id) and (item_pair[1] == q.item_B.id):
                    done = False

        q_next = Query(items[min(item_pair)], items[max(item_pair)])

        queries_apx = queries_opt + [q_next]

        # also set up the y vars (recommended items for each response scenario)
        # add a new response to each response scenario in rec_inds with the *same* recommendation...
        start_rec_list = {}
        for key, val in rec_inds.iteritems():
            for response in valid_responses:
                # add one entry for each new response
                # keep the same index for the recommendation
                new_key = key + tuple([response])
                start_rec_list[new_key] = val

        # use approx. queries as a warm start for the OPTIMAL run

        if logfile is not None:
            with open(logfile, "a") as f:
                f.write("WARM START: k=%d; time=%f\n" % (k, (time.time() - start_time)))

        t0 = time.time()
        queries_opt, objval, time_lim_reached, rec_inds = solve_opt(
            k, queries_apx, t_remaining, start_rec_list
        )

        if time_lim_overall:
            t_remaining -= time.time() - t0

        if t_remaining <= 0:
            # if fewer than K queries were found return only the queries already identified (possisbly fewer than K)
            return queries_opt, objval, True

    return queries_opt, objval, time_lim_reached


# heuristics for solving the static questionnaire problem


def solve_warm_start_decomp_heuristic(
    items,
    K,
    eps,
    valid_responses,
    time_lim=TIME_LIM,
    verbose=False,
    time_lim_overall=True,
    logfile=None,
    displayinterval=None,
):
    """
    incrementally build a solution - solving first the K=1 problem to opimality, then incrementally adding more queries
    by solving the K=1 problem (using the scenario decomp.)
    """

    rs = np.random.RandomState()

    # note: cut_2 must be false because fixed_queries are used
    solve_opt = lambda k, fixed_queries, time_lim: solve_scenario_decomposition(
        items,
        k,
        rs,
        eps,
        valid_responses,
        max_iter=10000,
        cut_2=False,
        verbose=verbose,
        time_limit=time_lim,
        fixed_queries=fixed_queries,
    )

    # this is the time budget; subtract from it each time we run anything...
    t_remaining = time_lim
    t0 = time.time()

    k = 1
    if verbose:
        print("WARM+DECOMP HEURISTIC: solving K=1 problem")
    try:
        queries_opt, objval, time_time_lim_reached, rec_inds = static_mip_optimal(
            items,
            k,
            eps,
            valid_responses,
            cut_2=False,
            verbose=verbose,
            time_lim=time_lim,
        )
    except StaticMIPFailed:
        raise WarmDecompHeuristicFailed(
            "static MIP failed. time limit probably needs to be increased."
        )

    if time_lim_overall:
        t_remaining -= time.time() - t0

    if verbose:
        print("WARM+DECOMP HEURISTIC: identified optimal query:")
        print(str(queries_opt[0]))

    for k in range(2, K + 1):

        queries_fixed = queries_opt

        if verbose:
            print("WARM+DECOMP HEURISTIC: solving K=%d problem" % k)

        t0 = time.time()
        queries_opt, objval, time_lim_reached, rec_inds = solve_opt(
            k, queries_fixed, t_remaining
        )

        if time_lim_overall:
            t_remaining -= time.time() - t0

        if verbose:
            print("WARM+DECOMP HEURISTIC: identified optimal queries:")
            for q in queries_opt:
                print(str(q))

        if t_remaining <= 0:
            # if time limit reached, return all of the queries found, and the current objval
            time_limit_reached = True
            return queries_opt, objval, time_limit_reached

    return queries_opt, objval, time_lim_reached


def solve_scenario_decomposition(
    items,
    K,
    rs,
    eps,
    valid_responses,
    max_iter=10000,
    cut_2=True,
    verbose=False,
    verbose_gurobi=False,
    start_queries=None,
    fixed_queries=None,
    eps_optimal=1e-4,
    time_limit=1e10,
    logfile=None,
    displayinterval=None,
):
    assert sorted(valid_responses) == [-1, 0, 1] or sorted(valid_responses) == [-1, 1]

    start_time = time.time()

    if logfile is not None:
        with open(logfile, "a") as f:
            f.write("SCENARIO DECOMP: start_time=%f\n" % start_time)

    # initialize with a single random response scenario
    s_init = rs.choice(valid_responses, K, replace=True)

    num_features = len(items[0].features)

    # generate B and b, such that U^0 = {u | B * u >= b}
    B_mat, b_vec = U0_polyhedron(num_features)

    S = [list(s_init)]

    if verbose:
        print("S0 = %s" % str(S[0]))

    # keep track of time. only penalize time for solving the RMP
    time_remaining = time_limit

    # add scenarios incrementally
    rmp_queries = None
    UB = 9999
    LB = -9999
    for i in range(max_iter):

        if abs(UB - LB) <= eps_optimal:
            break

        if verbose:
            print("iter %d:" % i)
            print("solving RMP with S:")
            print(str(S))

        t0 = time.time()

        # solve reduced problem with scenarios S

        if fixed_queries is not None:
            start_queries = None

        if (start_queries is None) and (fixed_queries is None):
            start_queries = rmp_queries

        if logfile is not None:
            with open(logfile, "a") as f:
                f.write(
                    "SCENARIO DECOMP: begin iter=%d; time=%f\n"
                    % (i, (time.time() - start_time))
                )

        rmp_queries_new, RMP_objval, time_lim_reached, rec_inds = static_mip_optimal(
            items,
            K,
            eps,
            valid_responses,
            time_lim=time_remaining,
            cut_1=True,
            cut_2=cut_2,
            start_queries=start_queries,
            fixed_queries=fixed_queries,
            response_subset=S,
            verbose=verbose_gurobi,
        )

        time_remaining -= time.time() - t0

        if (time_remaining <= 0) or time_lim_reached:
            # return the rmp_queries_new
            try:
                if all([isinstance(q, Query) for q in rmp_queries_new]):
                    return rmp_queries_new, RMP_objval, True, rec_inds
            except:
                return rmp_queries, UB, True, rec_inds

        UB = RMP_objval

        if logfile is not None:
            with open(logfile, "a") as f:
                f.write(
                    "SCENARIO DECOMP: end iter %d; new UB=%f; time=%f\n"
                    % (i, UB, (start_time - time.time()))
                )

        rmp_queries = rmp_queries_new
        if verbose:
            print("RMP objval = %e" % RMP_objval)
            print(
                "RMP queries: %s"
                % str([(q.item_A.id, q.item_B.id) for q in rmp_queries])
            )

        s_opt, SP_objval = feasibility_subproblem(
            [q.z for q in rmp_queries],
            valid_responses,
            K,
            items,
            eps,
            B_mat,
            b_vec,
            time_lim=TIME_LIM,
            verbose=verbose_gurobi,
        )

        LB = SP_objval

        if logfile is not None:
            with open(logfile, "a") as f:
                f.write(
                    "SCENARIO DECOMP: end iter %d; new LB=%f; time=%f\n"
                    % (i, LB, (start_time - time.time()))
                )

        if verbose:
            print("SP objval = %e" % SP_objval)
            print("new scenario: %s" % str(s_opt))

        if s_opt in S:
            if verbose:
                print("warning: SP identified a scenario that is already in S")

        S.append(s_opt)

    return rmp_queries, RMP_objval, False, rec_inds


def feasibility_subproblem(
    z_vec_list,
    valid_responses,
    K,
    items,
    eps,
    B_mat,
    b_vec,
    gamma_inconsistencies,
    time_lim=TIME_LIM,
    fixed_responses=None,
    verbose=False,
):
    # solve the scenario decomposition subproblem.

    if set(valid_responses) == set([-1, 1]):
        use_indifference = False
    elif set(valid_responses) == set([-1, 1, 0]):
        use_indifference = True
        # print("indiff")
    else:
        raise Exception("valid_responses is not valid")

    num_items = len(items)
    num_features = len(items[0].features)

    # recall: B_mat (m_const x n), and b_vec (m_const x 1)
    m_const = len(b_vec)
    assert B_mat.shape == (m_const, num_features)

    m = create_mip_model(time_lim=time_lim, verbose=verbose)
    m.params.OptimalityTol = 1e-8

    # objective value
    theta_var = m.addVar(
        vtype=GRB.CONTINUOUS, lb=-GRB.INFINITY, ub=GRB.INFINITY, name="theta"
    )

    # decision variables for response scenario
    s_plus_vars = m.addVars(K, vtype=GRB.BINARY, name="s_plus")
    s_minus_vars = m.addVars(K, vtype=GRB.BINARY, name="s_minus")

    if use_indifference:
        s_0_vars = m.addVars(K, vtype=GRB.BINARY, name="s_0")

    # only one response is possible
    for k in range(K):
        if use_indifference:
            m.addConstr(
                s_plus_vars[k] + s_minus_vars[k] + s_0_vars[k] == 1, name="s_const"
            )
            m.addSOS(GRB.SOS_TYPE1, [s_plus_vars[k], s_minus_vars[k], s_0_vars[k]])
        else:
            m.addConstr(s_plus_vars[k] + s_minus_vars[k] == 1, name="s_const")
            m.addSOS(GRB.SOS_TYPE1, [s_plus_vars[k], s_minus_vars[k]])

    if fixed_responses is not None:
        for ix, resp in enumerate(fixed_responses):
            if resp == 1:
                s_plus_vars[ix].setAttr("lb", 1.0)
                s_plus_vars[ix].setAttr("ub", 1.0)
            elif resp == -1:
                s_minus_vars[ix].setAttr("lb", 1.0)
                s_minus_vars[ix].setAttr("ub", 1.0)
            else:  # resp == 0
                s_0_vars[ix].setAttr("lb", 1.0)
                s_0_vars[ix].setAttr("ub", 1.0)

    if gamma_inconsistencies > 0:
        # print("xi")
        xi_vars = m.addVars(num_items, K, lb=0.0, ub=GRB.INFINITY, name="xi")

        for i in range(num_items):
            m.addConstr(
                quicksum(xi_vars[i, k] for k in range(K)) <= gamma_inconsistencies,
                name="gamma_sum",
            )

    else:
        xi_vars = np.zeros((num_items, K))

    # add constraints for the utility of each item x
    # u_vars for each item
    u_vars = m.addVars(
        num_items,
        num_features,
        vtype=GRB.CONTINUOUS,
        lb=-GRB.INFINITY,
        ub=GRB.INFINITY,
        name="u",
    )
    for i_item, item in enumerate(items):

        # U^0 constraints
        for i_row in range(m_const):
            m.addConstr(
                quicksum(
                    B_mat[i_row, i_feat] * u_vars[i_item, i_feat]
                    for i_feat in range(num_features)
                )
                >= b_vec[i_row],
                name=("U0_const_row_%d" % i_row),
            )

        # partworth
        m.addConstr(
            quicksum(u_vars[i_item, i_feat] for i_feat in range(num_features)) == 1,
            name="sum_1",
        )
        for i_feat in range(num_features):
            m.addConstr(u_vars[i_item, i_feat] >= 0, name="pos_1")

        # m.addConstr(theta_var >= item_util[i_item], name=('theta_constr_%d' % i_item))
        m.addConstr(
            theta_var
            >= quicksum(
                [
                    u_vars[i_item, i_feat] * item.features[i_feat]
                    for i_feat in range(num_features)
                ]
            ),
            name=("theta_constr_%d" % i_item),
        )

        # add constraints on U(z, s)
        for i_k, z_vec in enumerate(z_vec_list):
            m.addConstr(
                quicksum(
                    [
                        u_vars[i_item, i_feat] * z_vec[i_feat]
                        for i_feat in range(num_features)
                    ]
                )
                >= -xi_vars[i_item, i_k] + eps - M * (1 - s_plus_vars[i_k]),
                name=("U_s_plus_k%d" % i_k),
            )
            m.addConstr(
                quicksum(
                    [
                        u_vars[i_item, i_feat] * z_vec[i_feat]
                        for i_feat in range(num_features)
                    ]
                )
                <= xi_vars[i_item, i_k] - eps + M * (1 - s_minus_vars[i_k]),
                name=("U_s_minus_k%d" % i_k),
            )

            if use_indifference:
                m.addConstr(
                    quicksum(
                        [
                            u_vars[i_item, i_feat] * z_vec[i_feat]
                            for i_feat in range(num_features)
                        ]
                    )
                    <= xi_vars[i_item, i_k] + M * (1 - s_0_vars[i_k]),
                    name=("U_s_0+_k%d" % i_k),
                )
                m.addConstr(
                    quicksum(
                        [
                            u_vars[i_item, i_feat] * z_vec[i_feat]
                            for i_feat in range(num_features)
                        ]
                    )
                    >= -xi_vars[i_item, i_k] - M * (1 - s_0_vars[i_k]),
                    name=("U_s_0-_k%d" % i_k),
                )

    m.setObjective(theta_var, sense=GRB.MINIMIZE)

    m.update()

    # set dualreductions = 0 to distinguish betwetween infeasible/unbounded
    # m.params.DualReductions = 0
    optimize(m, raise_warnings=True)

    try:
        # get the optimal response scenario
        # s_opt = [- s_plus_vars[k].x + s_minus_vars[k].x for k in range(K)]
        s_opt = [
            int(round(s_plus_vars[i_k].x - s_minus_vars[i_k].x)) for i_k in range(K)
        ]
        objval = m.objval
    except:
        # if failed for some reason...
        raise FeasibilitySubproblemFailed
        s_opt = None
        objval = 999

    return s_opt, objval

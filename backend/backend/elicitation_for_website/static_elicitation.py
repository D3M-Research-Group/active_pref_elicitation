from gurobipy import *
import numpy as np
import time
from scipy.special import comb

import itertools

from .gurobi_functions import create_mip_model, optimize, M, TIME_LIM
from .preference_classes import Query
from .utils import U0_polyhedron

class StaticOptimalMIPFailed(Exception):
    pass

class FeasibilitySubproblemFailed(Exception):
    pass

class WarmDecompHeuristicFailed(Exception):
    pass


# primary function to build questionnaire
def build_questionnaire(items, K, time_lim):
    '''

    args:
    - items:   (list(Item)). list of preference_classes.Item objects for building queries
    - K: (int). number of queries to find.
    - time_lim: (float). amount of time in seconds for time allowed for **each k = 1, ..., K**. this can fail if time_lim
        is too short.

    output:
    - queries

    '''

    eps = 0.0
    valid_responses = [1, -1]

    if K >= comb(len(items), 2):
        raise Exception("K must be smaller than the number of possible queries")

    queries, objval, _ = solve_warm_start_decomp_heuristic(items, K, eps, valid_responses,
                                                           time_lim=time_lim,
                                                           verbose=False,
                                                           time_lim_overall=False,
                                                           logfile=None,
                                                           displayinterval=None)

    # make sure that no queries have identical items
    for i, q in enumerate(queries):
        if q.item_A.id == q.item_B.id:
            raise Exception("query {} returned by the heuristic uses only item {}".format(i + 1, q))

    # if there are repeated queries, replace the repeated queries with other random queries
    if len(queries) > len(set(queries)):
        print("the heuristic returned {} repeated queries. replacing these with new random queries.".format(len(queries) - len(set(queries))))
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
    '''find new random queries to add to the list, which are not in old_queries'''

    query_list = [Query(a, b) for a, b in itertools.combinations(items, 2)]

    for q in old_queries:
        if q in query_list:
            query_list.remove(q)

    # get new random queries
    new_queries = np.random.choice(query_list, num_new_queries, replace=False)

    return new_queries

def static_mip_optimal(items, K, eps, valid_responses,
                       time_lim=TIME_LIM,
                       cut_1=True,
                       cut_2=True,
                       start_queries=None,
                       fixed_queries=None,
                       start_rec=None,
                       response_subset=None,
                       verbose=False):
    '''
    finds the robust-optimal query set, given a set of items.

    input:
    - items : a list of Item objects
    - K : the number of queries to be selected
    - start_queries : list of K queries to use as a warm start. do not need to be sorted.
    - fixed_queries : list of queries to FIX. length of this list must be <K. these are fixed as the FIRST queries (order is arbitrary anyhow)
    - cut_1 : (bool) use cut restricting values of p and q (p < q)
    - cut_2 : (bool) use cut restricting order of queries (lexicographical order of (p,q) pairs)
    - valid_responses : list of ints, either [1, -1, 0] (indifference) or [1, -1] (no indifference)
    - response_subset : subset of scenarios S, where S[i] is a list of ints {-1, 0, 1}, of len K
    - eps : epsilon for the decision boundary. if eps = 0, then indifferent responses are unnecessary.
    - logfile: if specified, write a logfile at this path

    output:
    - query_list : a list of Query objects
    - start_rec : dict where keys are response scenarios, values are indices of recommended item
    '''

    assert sorted(valid_responses) == [-1, 0, 1] or sorted(valid_responses) == [-1, 1]

    # number of features for each item
    num_features = len(items[0].features)

    # generate B and b, such that U^0 = {u | B * u >= b}
    B_mat, b_vec = U0_polyhedron(num_features)

    # number of items
    num_items = len(items)

    # lambda variables (dual variables for the initial uncertainty set):
    # lam_vars[r,i] is the i^th dual variable (for i = 1,...,m_const) for the r^th response scenario
    # recall: B_mat (m_const x n), and b_vec (m_const x 1)
    m_const = len(b_vec)
    assert B_mat.shape == (m_const, num_features)

    # define the mip model
    m = create_mip_model(time_lim=time_lim,
                         verbose=verbose)

    # the objective
    eta = m.addVar(vtype=GRB.CONTINUOUS, lb=-GRB.INFINITY, ub=GRB.INFINITY, name='eta')
    m.setObjective(eta, sense=GRB.MAXIMIZE)

    # the possible responses to each query
    if eps == 0.0 and set(valid_responses) == set([-1, 1, 0]):
        raise Exception("with eps = 0, 0 is not a valid response")

    # all possible agent response scenarios

    if response_subset is None:
        r_list = list(itertools.product(valid_responses, repeat=K))
        num_scenarios = int(np.power(len(valid_responses), K))
        assert num_scenarios == len(r_list)
    else:
        # validate response subset. assert that every response in the subset is a valid response
        assert set([ri for r in response_subset for ri in r]).difference(set(valid_responses)) == set([])
        # convert the response scenarios to tuples
        r_list = [tuple(r) for r in response_subset]
        num_scenarios = len(r_list)

    # define integer variables
    p_vars, q_vars, w_vars, y_vars = add_integer_variables(m, num_items, K, r_list,
                                                           start_queries=start_queries,
                                                           cut_1=cut_1,
                                                           cut_2=cut_2,
                                                           fixed_queries=fixed_queries,
                                                           start_rec=start_rec)

    # now add continuous variables for each response scenario
    for i_r, r in enumerate(r_list):
        alpha_vars, beta_vars, lam_vars, gam_vars = add_r_constraints(m,
                                                                      eta,
                                                                      p_vars,
                                                                      q_vars,
                                                                      y_vars,
                                                                      K,
                                                                      r,
                                                                      i_r,
                                                                      m_const,
                                                                      items,
                                                                      num_items,
                                                                      num_features,
                                                                      B_mat,
                                                                      b_vec,
                                                                      eps)

    m.update()

    # uncomment if m.status == GRB.INF_OR_UNBD, to determine whether the model is infeasible or unbounded
    m.params.DualReductions = 0

    optimize(m, raise_warnings=False)

    if m.status == GRB.TIME_LIMIT:
        time_limit_reached = True
    else:
        time_limit_reached = False

    # get the indices of the optimal queries
    p_inds = [-1 for _ in range(K)]
    q_inds = [-1 for _ in range(K)]
    for k in range(K):
        try:
            p_list = [np.round(p_vars[i, k].x) for i in range(num_items)]
            p_inds[k] = int(np.argwhere(p_list))
            q_list = [np.round(q_vars[i, k].x) for i in range(num_items)]
            q_inds[k] = int(np.argwhere(q_list))
        except:
            raise Exception("static_mip_optimal decision variables are not available. time limit probably needs to be increased")

        # make sure queries don't ask about the same items
        if p_inds[k] == q_inds[k]:
            raise Exception("query number {} has the same item A and item B (item {})".format(k, q_inds[k]))

    # get indices of recommended items
    rec_inds = {}
    for i_r, r in enumerate(r_list):
        y_list = [np.round(y_vars[i_r][i].x) for i in range(num_items)]
        rec_inds[r] = int(np.argwhere(y_list))

    return [Query(items[p_inds[k]], items[q_inds[k]]) for k in range(K)], m.objVal, time_limit_reached, rec_inds


def add_integer_variables(model, num_items, K, r_list,
                          start_queries=None,
                          cut_1=True,
                          cut_2=True,
                          use_sos=True,
                          fixed_queries=None,
                          start_rec=None):
    '''
    :param model:
    :param num_items:
    :param K:
    :param r_list:
    :param start_queries: list of K queries to use as a warm start. do not need to be sorted.
    :param cut_1:
    :param cut_2:
    :param use_sos:
    :param fixed_queries : list of queries to FIX. length of this list must be <K. these are fixed as the FIRST queries (order is arbitrary anyhow)
    :param start_rec: a dict with keys corresponding to response scenarios, and values corresponding to the
            index of recommended item : { r : ind, r : ind , ...}, to be used for warm starts. the response scenarios
            here correspond to the start_queries -- i.e., if start_rec is used, then start_queries *must*
            be used as well
    '''
    # p and 1 vars : to select the k^th comparison
    # z^k = \sum_i (p^k_i - q^k_i) x^i
    # p_vars[i,k] = p^k_i
    # q_vars[i,k] = q^k_i
    p_vars = model.addVars(num_items, K, vtype=GRB.BINARY, name='p')
    q_vars = model.addVars(num_items, K, vtype=GRB.BINARY, name='q')

    # auxiliary variable
    new_start_rec = None

    model.update()
    for _, var in p_vars.iteritems():
        var.BranchPriority = 1

    for _, var in q_vars.iteritems():
        var.BranchPriority = 2

    # exactly one item can be selected in p^k and q^k

    # fix queries if fixed_queries is specified
    if fixed_queries is not None:
        if len(fixed_queries) >= K:
            raise Exception("number of fixed queries must be < K")

        if cut_2:
            raise Exception("cut_2 must be off in order to use fixed queries")

        # item_A.id is the index of p, and item_B.id is the index of q
        for i_q, q in enumerate(fixed_queries):
            model.addConstr(p_vars[q.item_A.id, i_q] == 1)
            model.addConstr(q_vars[q.item_B.id, i_q] == 1)

            # make sure this query isn't repeated later. ("cut off" this query, making it infeasible)
            for i_q_free in range(len(fixed_queries), K):
                model.addConstr(p_vars[q.item_A.id, i_q_free] + q_vars[q.item_B.id, i_q_free] <= 1)

    for k in range(K):
        if use_sos:
            model.addSOS(GRB.SOS_TYPE1, [p_vars[i, k] for i in range(num_items)])
            model.addSOS(GRB.SOS_TYPE1, [q_vars[i, k] for i in range(num_items)])

        model.addConstr(quicksum(p_vars[i, k] for i in range(num_items)) == 1, name=('p_constr_k%d' % k))
        model.addConstr(quicksum(q_vars[i, k] for i in range(num_items)) == 1, name=('q_constr_k%d' % k))

    # add warm start queries if they're provided
    if start_queries is not None:
        if len(start_queries) != K:
            raise Exception("must provide exactly K start queries")

        # build (p,q) list, and sort s.t. p<q for each
        pq_list = [(min([q.item_A.id, q.item_B.id]), max([q.item_A.id, q.item_B.id])) for q in start_queries]

        # order the queries (w is an auxiliary base-10 number indicating the order of queries)
        w_list = [(num_items + 1) * a + b for a, b in pq_list]

        # this is the correct order of comparisons... :  reversed(np.array(w_list).argsort())
        k_order = list(reversed(np.array(w_list).argsort()))
        pq_list_sorted = [pq_list[i] for i in k_order]

        # if the start responses were added, re-order the keys (we assume they correspond to the new comparison
        if start_rec is not None:
            new_start_rec = {}
            for key, val in start_rec.iteritems():
                new_key = tuple([key[i] for i in k_order])
                new_start_rec[new_key] = val

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
                model.addConstr(1 - q_vars[i, k] >= quicksum([p_vars[j, k] for j in range(num_items) if j <= i]),
                                name=('q_cut_k%d_i%d' % (k, i)))

    if cut_2:
        # w vars : w^k represents k^th comparison
        # w^k = p^k + q^k
        w_vars = model.addVars(num_items, K, vtype=GRB.BINARY, name='w')
        for i in range(num_items):
            for k in range(K):
                model.addConstr(w_vars[i, k] == p_vars[i, k] + q_vars[i, k], name=('w_constr_i%d_k%d' % (i, k)))
                # add warm start values for w, if provided
                if start_queries is not None:
                    w_vars[i, k].start = p_vars[i, k].start + q_vars[i, k].start

        # v^{kk'}_i = 1 iff w^k_i != w^k'_i
        # only need to define these for k<k'
        v_vars = {}
        for k in range(K - 1):
            for k_prime in range(k + 1, K):
                v_vars[k, k_prime] = model.addVars(num_items, vtype=GRB.BINARY, name=('v_k%d,kp%d' % (k, k_prime)))
                for i in range(num_items):
                    # constraints to define v_vars
                    model.addConstr(v_vars[k, k_prime][i] <= w_vars[i, k] + w_vars[i, k_prime],
                                    name=('v_constrA_k%d_kp%d_i%d' % (k, k_prime, i)))
                    model.addConstr(v_vars[k, k_prime][i] <= 2 - w_vars[i, k] - w_vars[i, k_prime],
                                    name=('v_constrB_k%d_kp%d_i%d' % (k, k_prime, i)))
                    model.addConstr(v_vars[k, k_prime][i] >= w_vars[i, k] - w_vars[i, k_prime],
                                    name=('v_constrC_k%d_kp%d_i%d' % (k, k_prime, i)))
                    model.addConstr(v_vars[k, k_prime][i] >= - w_vars[i, k] + w_vars[i, k_prime],
                                    name=('v_constrD_k%d_kp%d_i%d' % (k, k_prime, i)))

                    # cut 2: now enforce lex. ordering of w vectors
                    model.addConstr(w_vars[i, k_prime] >= w_vars[i, k] - quicksum(
                        v_vars[k, k_prime][j] for j in range(num_items) if j < i),
                                    name=('lex_cut_k%d_kp%d_i%d' % (k, k_prime, i)))

        # finally, ban identical queries (using the v_vars..
        for k in range(K - 1):
            model.addConstr(quicksum(v_vars[k, k + 1]) >= 1)

    else:
        w_vars = []

    # loop over all response scenarios...
    y_vars_list = []
    for i_r, r in enumerate(r_list):
        # Note: all variables defined here are only for the current response scenario r

        # y vars : to select x^r, the recommended item in scenario r
        y_vars = model.addVars(num_items, vtype=GRB.BINARY, name="y_r" + str(i_r))

        if new_start_rec is None:
            new_start_rec = start_rec

        # if start y_vars are provided
        if start_rec is not None:
            for i_n in range(num_items):
                y_vars[i_n].start = 0
            model.update()
            y_vars[new_start_rec[r]].start = 1
            model.update()

        y_vars_list.append(y_vars)
        # exactly one item must be selected
        if use_sos:
            model.addSOS(GRB.SOS_TYPE1, [y_vars[i] for i in range(num_items)])

        model.addConstr(quicksum(y_vars[i] for i in range(num_items)) == 1, name=('y_constr_r%d' % i_r))

    return p_vars, q_vars, w_vars, y_vars_list


def add_r_constraints(m,
                      eta,
                      p_vars,
                      q_vars,
                      y_vars,
                      K,
                      r,
                      i_r,
                      m_const,
                      items,
                      num_items,
                      num_features,
                      B_mat,
                      b_vec,
                      eps):
    '''
    add constraints for a single response scenario

    input vars:
    - m : gurobi model
    - eta : gurobi variable eta from the model
    - r : response scenario (K-length vector)
    - i_r : index of r

    '''

    # define alpha vars (dual variables of the epigraph constraints)
    alpha_vars = m.addVars(K, vtype=GRB.CONTINUOUS, lb=-GRB.INFINITY, ub=GRB.INFINITY, name="alpha_r" + str(i_r))

    # bound alpha according to r:
    for k in range(K):
        if (r[k] != 0):
            m.addConstr(r[k] * alpha_vars[k] >= 0, name=('alpha_constr_r%d_k%d' % (i_r, k)))

    # define beta vars (more dual variables)
    beta_vars = m.addVars(m_const, vtype=GRB.CONTINUOUS, lb=0, ub=GRB.INFINITY, name="beta_r" + str(i_r))

    # define lambda and gamma vars (dual variables of the epigraph constraints, for linearization)
    gam_vars = m.addVars(num_items, K, vtype=GRB.CONTINUOUS, lb=-GRB.INFINITY, ub=GRB.INFINITY,
                         name="gamma_r" + str(i_r))
    lam_vars = m.addVars(num_items, K, vtype=GRB.CONTINUOUS, lb=-GRB.INFINITY, ub=GRB.INFINITY,
                         name="lambda_r" + str(i_r))

    # constraints defining gamma and lambda
    for k in range(K):

        for i in range(num_items):
            m.addConstr(gam_vars[i, k] <= M * p_vars[i, k], name=('gam_constrA_r%d_k%d_i%d' % (i_r, k, i)))
            m.addConstr(gam_vars[i, k] >= - M * p_vars[i, k], name=('gam_constrB_r%d_k%d_i%d' % (i_r, k, i)))
            m.addConstr(gam_vars[i, k] <= alpha_vars[k] + M * (1 - p_vars[i, k]),
                        name=('gam_constrC_r%d_k%d_i%d' % (i_r, k, i)))
            m.addConstr(gam_vars[i, k] >= alpha_vars[k] - M * (1 - p_vars[i, k]),
                        name=('gam_constD_r%d_k%d_i%d' % (i_r, k, i)))

            m.addConstr(lam_vars[i, k] <= M * q_vars[i, k], name=('lam_constrA_r%d_k%d_i%d' % (i_r, k, i)))
            m.addConstr(lam_vars[i, k] >= - M * q_vars[i, k], name=('lam_constrB_r%d_k%d_i%d' % (i_r, k, i)))
            m.addConstr(lam_vars[i, k] <= alpha_vars[k] + M * (1 - q_vars[i, k]),
                        name=('lam_constrC_r%d_k%d_i%d' % (i_r, k, i)))
            m.addConstr(lam_vars[i, k] >= alpha_vars[k] - M * (1 - q_vars[i, k]),
                        name=('lam_constrD_r%d_k%d_i%d' % (i_r, k, i)))

    # the big constraint ...
    for f in range(num_features):
        lhs_1 = quicksum(
            quicksum((gam_vars[i, k] - lam_vars[i, k]) * items[i].features[f] for i in range(num_items)) for k in
            range(K))
        lhs_2 = quicksum(B_mat[j, f] * beta_vars[j] for j in range(m_const))
        m.addConstr(lhs_1 + lhs_2 == quicksum(y_vars[i_r][i] * items[i].features[f] for i in range(num_items)),
                    name=('big_r%d_i%d' % (i_r, f)))

    # bound eta
    if eps == 0.0:
        m.addConstr(eta <= quicksum(b_vec[j] * beta_vars[j] for j in range(m_const)), name=('eta_r%d' % i_r))
    else:
        m.addConstr(eta <= eps * quicksum(r[k] * alpha_vars[k] for k in range(K)) + quicksum(
            b_vec[j] * beta_vars[j] for j in range(m_const)), name=('eta_r%d' % i_r))

    return alpha_vars, beta_vars, lam_vars, gam_vars


def solve_warm_start(items, K, eps, valid_responses,
                     cut_1=True,
                     time_lim=TIME_LIM,
                     time_lim_overall=True,
                     verbose=False,
                     logfile=None,
                     displayinterval=None):
    '''
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
    '''

    assert isinstance(time_lim, int) or isinstance(time_lim, float)

    start_time = time.time()

    solve_opt = lambda k, queries_apx, time_lim, start_rec: static_mip_optimal(items, k, eps, valid_responses,
                                                                               cut_1=cut_1,
                                                                               cut_2=True,
                                                                               start_queries=queries_apx,
                                                                               time_lim=time_lim,
                                                                               start_rec=start_rec,
                                                                               verbose=verbose,
                                                                               logfile=logfile,
                                                                               displayinterval=displayinterval)

    # this is the time budget; subtract from it each time we run anything...
    t_remaining = time_lim

    t0 = time.time()
    k = 1

    if logfile is not None:
        with open(logfile, 'a') as f:
            f.write("WARM START: k=%d; time=%f\n" % (k, (time.time() - start_time)))

    queries_opt, objval, time_lim_reached, rec_inds = static_mip_optimal(items, k, eps, valid_responses,
                                                                         cut_1=cut_1,
                                                                         cut_2=False,
                                                                         time_lim=time_lim,
                                                                         verbose=verbose,
                                                                         logfile=logfile,
                                                                         displayinterval=displayinterval)

    # if we apply the time limit to the overall run, then subtract after each iteration. otherwise, never subtract.
    if time_lim_overall:
        t_remaining -= (time.time() - t0)

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
            with open(logfile, 'a') as f:
                f.write("WARM START: k=%d; time=%f\n" % (k, (time.time() - start_time)))

        t0 = time.time()
        queries_opt, objval, time_lim_reached, rec_inds = solve_opt(k, queries_apx, t_remaining, start_rec_list)

        if time_lim_overall:
            t_remaining -= (time.time() - t0)

        if t_remaining <= 0:
            # if fewer than K queries were found return only the queries already identified (possisbly fewer than K)
            return queries_opt, objval, True

    return queries_opt, objval, time_lim_reached


# heuristics for solving the static questionnaire problem

def solve_warm_start_decomp_heuristic(items, K, eps, valid_responses,
                                      time_lim=TIME_LIM,
                                      verbose=False,
                                      time_lim_overall=True,
                                      logfile=None,
                                      displayinterval=None):
    '''
    incrementally build a solution - solving first the K=1 problem to opimality, then incrementally adding more queries
    by solving the K=1 problem (using the scenario decomp.)
    '''

    rs = np.random.RandomState()

    # note: cut_2 must be false because fixed_queries are used
    solve_opt = lambda k, fixed_queries, time_lim: solve_scenario_decomposition(items, k, rs, eps,
                                                                                valid_responses,
                                                                                max_iter=10000,
                                                                                cut_2=False,
                                                                                verbose=verbose,
                                                                                time_limit=time_lim,
                                                                                fixed_queries=fixed_queries)

    # this is the time budget; subtract from it each time we run anything...
    t_remaining = time_lim
    t0 = time.time()

    k = 1
    if verbose:
        print("WARM+DECOMP HEURISTIC: solving K=1 problem")
    try:
        queries_opt, objval, time_time_lim_reached, rec_inds = static_mip_optimal(items, k, eps, valid_responses,
                                                                                  cut_2=False,
                                                                                  verbose=verbose,
                                                                                  time_lim=time_lim)
    except StaticOptimalMIPFailed:
        raise WarmDecompHeuristicFailed("static MIP failed. time limit probably needs to be increased.")

    if time_lim_overall:
        t_remaining -= (time.time() - t0)

    if verbose:
        print("WARM+DECOMP HEURISTIC: identified optimal query:")
        print(str(queries_opt[0]))

    for k in range(2, K + 1):

        queries_fixed = queries_opt

        if verbose:
            print("WARM+DECOMP HEURISTIC: solving K=%d problem" % k)

        t0 = time.time()
        queries_opt, objval, time_lim_reached, rec_inds = solve_opt(k, queries_fixed, t_remaining)

        if time_lim_overall:
            t_remaining -= (time.time() - t0)

        if verbose:
            print("WARM+DECOMP HEURISTIC: identified optimal queries:")
            for q in queries_opt:
                print(str(q))

        if t_remaining <= 0:
            # if time limit reached, return all of the queries found, and the current objval
            time_limit_reached = True
            return queries_opt, objval, time_limit_reached

    return queries_opt, objval, time_lim_reached


def solve_scenario_decomposition(items, K, rs, eps, valid_responses,
                                 max_iter=10000,
                                 cut_2=True,
                                 verbose=False,
                                 verbose_gurobi=False,
                                 start_queries=None,
                                 fixed_queries=None,
                                 eps_optimal=1e-4,
                                 time_limit=1e10,
                                 logfile=None,
                                 displayinterval=None):
    assert sorted(valid_responses) == [-1, 0, 1] or sorted(valid_responses) == [-1, 1]

    start_time = time.time()

    if logfile is not None:
        with open(logfile, 'a') as f:
            f.write("SCENARIO DECOMP: start_time=%f\n" % start_time)

    # initialize with a single random response scenario
    s_init = rs.choice(valid_responses, K, replace=True)

    num_features = len(items[0].features)

    # generate B and b, such that U^0 = {u | B * u >= b}
    B_mat, b_vec = U0_polyhedron(num_features)

    S = [list(s_init)]

    if verbose:
        print('S0 = %s' % str(S[0]))

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
            print('iter %d:' % i)
            print('solving RMP with S:')
            print(str(S))

        t0 = time.time()

        # solve reduced problem with scenarios S

        if fixed_queries is not None:
            start_queries = None

        if (start_queries is None) and (fixed_queries is None):
            start_queries = rmp_queries

        if logfile is not None:
            with open(logfile, 'a') as f:
                f.write("SCENARIO DECOMP: begin iter=%d; time=%f\n" % (i, (time.time() - start_time)))

        rmp_queries_new, RMP_objval, time_lim_reached, rec_inds = static_mip_optimal(items, K, eps, valid_responses,
                                                                                     time_lim=time_remaining,
                                                                                     cut_1=True,
                                                                                     cut_2=cut_2,
                                                                                     start_queries=start_queries,
                                                                                     fixed_queries=fixed_queries,
                                                                                     response_subset=S,
                                                                                     verbose=verbose_gurobi)

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
            with open(logfile, 'a') as f:
                f.write("SCENARIO DECOMP: end iter %d; new UB=%f; time=%f\n" % (i, UB, (start_time - time.time())))

        rmp_queries = rmp_queries_new
        if verbose:
            print('RMP objval = %e' % RMP_objval)
            print('RMP queries: %s' % str([(q.item_A.id, q.item_B.id) for q in rmp_queries]))

        s_opt, SP_objval = feasibility_subproblem([q.z for q in rmp_queries],
                                                  valid_responses,
                                                  K,
                                                  items,
                                                  eps,
                                                  B_mat,
                                                  b_vec,
                                                  time_lim=TIME_LIM,
                                                  verbose=verbose_gurobi)

        LB = SP_objval

        if logfile is not None:
            with open(logfile, 'a') as f:
                f.write("SCENARIO DECOMP: end iter %d; new LB=%f; time=%f\n" % (i, LB, (start_time - time.time())))

        if verbose:
            print('SP objval = %e' % SP_objval)
            print('new scenario: %s' % str(s_opt))

        if s_opt in S:
            if verbose:
                print('warning: SP identified a scenario that is already in S')

        S.append(s_opt)

    return rmp_queries, RMP_objval, False, rec_inds


def feasibility_subproblem(z_vec_list,
                           valid_responses,
                           K,
                           items,
                           eps,
                           B_mat,
                           b_vec,
                           time_lim=TIME_LIM,
                           verbose=False):
    # solve the scenario decomposition subproblem.

    if set(valid_responses) == set([-1, 1]):
        use_indifference = False
    elif set(valid_responses) == set([-1, 1, 0]):
        use_indifference = True
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
    theta_var = m.addVar(vtype=GRB.CONTINUOUS, lb=-GRB.INFINITY, ub=GRB.INFINITY, name='theta')

    # decision variables for response scenario
    s_plus_vars = m.addVars(K, vtype=GRB.BINARY, name='s_plus')
    s_minus_vars = m.addVars(K, vtype=GRB.BINARY, name='s_minus')

    if use_indifference:
        s_0_vars = m.addVars(K, vtype=GRB.BINARY, name='s_0')

    # only one response is possible
    for k in range(K):
        if use_indifference:
            m.addConstr(s_plus_vars[k] + s_minus_vars[k] + s_0_vars[k] == 1, name='s_const')
            m.addSOS(GRB.SOS_TYPE1, [s_plus_vars[k], s_minus_vars[k], s_0_vars[k]])
        else:
            m.addConstr(s_plus_vars[k] + s_minus_vars[k] == 1, name='s_const')
            m.addSOS(GRB.SOS_TYPE1, [s_plus_vars[k], s_minus_vars[k]])

    # add constraints for the utility of each item x
    # u_vars for each item
    u_vars = m.addVars(num_items, num_features,
                       vtype=GRB.CONTINUOUS,
                       lb=-GRB.INFINITY,
                       ub=GRB.INFINITY,
                       name='u')
    for i_item, item in enumerate(items):

        # U^0 constraints
        for i_row in range(m_const):
            m.addConstr(quicksum(B_mat[i_row, i_feat] * u_vars[i_item, i_feat]
                                 for i_feat in range(num_features)) >= b_vec[i_row], name=('U0_const_row_%d' % i_row))

        # m.addConstr(theta_var >= item_util[i_item], name=('theta_constr_%d' % i_item))
        m.addConstr(
            theta_var >= quicksum([u_vars[i_item, i_feat] * item.features[i_feat] for i_feat in range(num_features)]),
            name=('theta_constr_%d' % i_item))

        # add constraints on U(z, s)
        for i_k, z_vec in enumerate(z_vec_list):
            m.addConstr(quicksum([u_vars[i_item, i_feat] * z_vec[i_feat] for i_feat in range(num_features)]) \
                        >= eps - M * (1 - s_plus_vars[i_k]),
                        name=('U_s_plus_k%d' % i_k))
            m.addConstr(quicksum([u_vars[i_item, i_feat] * z_vec[i_feat] for i_feat in range(num_features)]) \
                        <= - eps + M * (1 - s_minus_vars[i_k]),
                        name=('U_s_minus_k%d' % i_k))

            if use_indifference:
                m.addConstr(quicksum([u_vars[i_item, i_feat] * z_vec[i_feat] for i_feat in range(num_features)]) \
                            <= M * (1 - s_0_vars[i_k]),
                            name=('U_s_0+_k%d' % i_k))
                m.addConstr(quicksum([u_vars[i_item, i_feat] * z_vec[i_feat] for i_feat in range(num_features)]) \
                            >= - M * (1 - s_0_vars[i_k]),
                            name=('U_s_0-_k%d' % i_k))

    m.setObjective(theta_var, sense=GRB.MINIMIZE)

    m.update()

    # set dualreductions = 0 to distinguish betwetween infeasible/unbounded
    # m.params.DualReductions = 0
    optimize(m, raise_warnings=True)

    try:
        # get the optimal response scenario
        # s_opt = [- s_plus_vars[k].x + s_minus_vars[k].x for k in range(K)]
        s_opt = [int(round(s_plus_vars[i_k].x - s_minus_vars[i_k].x)) for i_k in range(K)]
        objval = m.objval
    except:
        # if failed for some reason...
        raise FeasibilitySubproblemFailed
        s_opt = None
        objval = 999

    return s_opt, objval

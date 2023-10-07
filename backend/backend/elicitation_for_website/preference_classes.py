# This module contains classes for implementing preference elicitation with linear utility, and both static and active
# preference learning.
#
# Also implements function for the approach of Bertsimas & O'Hair (Learning Preferences Under
# Noise and Loss Aversion: An Optimization Approach). For identifying the highest-utility item x \in X, using an adaptive
# survey.
#
# Author: Duncan McElfresh
# July 2018
#
# This module contains the following classes:
#
# Item : an item x \in X.
# Agent : a decision-maker, whose utility function we are tying to learn.
# Query : a pairwise comparison between two Items

import numpy as np
from gurobipy import *
import sys
from .gurobi_functions import create_mip_model

# this is the *ASSUMED* threshold for the agent being ambivalent
EPS_ANSWER = 1e-5

# this is the *ACTUAL* threshold for the agent being ambivalent
EPS_ANSWER_ACTUAL = 1e-5


class Item(object):

    def __init__(self, features, id, feature_names=None):
        self.features = np.array(features)
        self.feature_names = feature_names
        self.id = id

    def __eq__(self, other):
        if len(self.features) != len(other.features):
            return False
        else:
            return np.isclose(self.features, other.features, 0.001).all()

    @classmethod
    def random(cls, num_features,
               id=None,
               sphere_size=1.0,
               rs=None,
               positive=False):
        # generate a random item, with features uniformly drawn from the num_features-dimensional sphere
        # rs (optional) : provide a random state
        if rs is None:
            rs = np.random.RandomState(0)

        x = sphere_size * generate_random_point_nsphere(num_features, rs=rs)

        if positive:
            x = np.abs(x)

        return cls(x, id)


class Query(object):
    '''
    'response' is:
    item_A > item_B : response = 1
    item_A < item_B : response = -1
    item_A = item_B : response = 0
    '''
    valid_responses = [0, 1, -1]

    def __init__(self, item_A, item_B,
                 response=None):
        self.item_A = item_A
        self.item_B = item_B
        self.response = response

    def __hash__(self):
        return hash(self.to_tuple())

    def __eq__(self, other):
        """two queries are equivalent if their items are equivalent (order doesn't matter)"""
        return ((self.item_A == other.item_A) and (self.item_B == other.item_B)) or (
                    (self.item_A == other.item_B) and (self.item_B == other.item_A))

    def __str__(self):
        return "Query(%d, %d, response=%s)" % (self.item_A.id, self.item_B.id, str(self.response))

    def to_tuple(self):
        return self.item_A.id, self.item_B.id

    @classmethod
    def from_tuple(cls, a_index, b_index, items, response=None):
        return cls(items[a_index], items[b_index], response=response)

    @classmethod
    def from_z_vec(cls, z_vec, response=None):
        item_A = Item(z_vec, None)
        item_B = Item(np.zeros(len(z_vec)), None)
        return cls(item_A, item_B, response=response)

    def unanswered_copy(self):
        # return an identical query, with no response
        return Query(self.item_A, self.item_B, response=None)

    @property
    def z(self):
        # difference in feature vectors between A, B
        return self.item_A.features - self.item_B.features

    def dist_to_point(self, p):
        # return the distance of self.z (a hyperplane) to the point p
        # np.linalg.norm is 2-norm, by default
        return np.abs(np.dot(p, self.z)) / np.linalg.norm(self.z)


class Agent(object):
    '''
    answered_queries: answered_queries
    u_true : true utility vector, if known
    '''

    def __init__(self, answered_queries, u_true=None):
        self.answered_queries = answered_queries
        self.u_true = u_true

    @classmethod
    def random(cls, num_features,
               id=None,
               sphere_size=1.0,
               seed=None,
               positive=False):
        # generate a random agent, with utility vector uniformly drawn from num_features-dimensional sphere
        # seed (optional) : provide a random seed
        rs = np.random.RandomState(seed)
        x = sphere_size * generate_random_point_nsphere(num_features, rs=rs)

        if positive:
            x = np.abs(x)

        return cls(id, num_features, u_true=x)

    def true_utility(self, item):
        # return the individual's utility of the item, if u_true is known
        if self.u_true is None:
            return None
        else:
            return np.dot(self.u_true, item.features)

    def robust_recommend_lazy(self, items, gamma):
        # robustly recommend an item for the individual, from the provided set of items, by exhaustively searching
        # through all items.
        rob_util = [robust_utility(item,
                                   answered_queries=self.answered_queries,
                                   gamma_inconsistencies=gamma)[0] for item in items]

        # get the maximum utility
        u_max_ind = np.argmax(rob_util)

        return items[u_max_ind], rob_util[u_max_ind]

    # unused
    # def worst_case_rec_util(self, q, items):
    #     # return the worst-case recommendation utility, after asking query q. consider each possible response
    #     # (1, -1, 0), and find the robust recommendation utility for each potential response
    #
    #     # indifferent response
    #     self.answer_query(q, response=0)
    #     if is_feasible(self.answered_queries):
    #         _, rob_u_0 = self.robust_recommend_lazy(items)
    #     else:
    #         rob_u_0 = None
    #     self.remove_last_query()  # remove this query
    #
    #     # item_A > item_B
    #     self.answer_query(q, response=1)
    #     if is_feasible(self.answered_queries):
    #         _, rob_u_1 = self.robust_recommend_lazy(items)
    #     else:
    #         rob_u_1 = None
    #     self.remove_last_query()  # remove this query
    #
    #     # item_A < item_B
    #     self.answer_query(q, response=-1)
    #     if is_feasible(self.answered_queries):
    #         _, rob_u_2 = self.robust_recommend_lazy(items)
    #     else:
    #         rob_u_2 = None
    #     self.remove_last_query()  # remove this query
    #
    #     # the minimum utility of all responses is...
    #     return min([u for u in [rob_u_0, rob_u_1, rob_u_2] if u is not None])



    # unused
    # def robust_rec_true_rank(self, items, gamma):
    #     # find the robust-recommended item, and find its true rank (using true utility)
    #
    #     rob_item, rob_util = self.robust_recommend_lazy(items, gamma)
    #
    #     return self.true_item_rank(rob_item, items)

    def true_item_rank(self, item, items):
        # find the *true* rank of item, among all items

        # true utility of all items
        true_util = [self.true_utility(i) for i in items if (i != item)]

        # get the item's true utility -- append to the end (so use index -1 later
        true_util.append(self.true_utility(item))

        # find the rank of this item in the true utility
        order = np.array(true_util).argsort()
        ranks = order.argsort()

        return len(items) - ranks[-1]

    def get_true_response(self, query,
                          eps=EPS_ANSWER):
        # get the agent's response to a query

        if self.u_true is not None:
            d = np.dot(query.z, self.u_true)
            if np.abs(d) <= eps:  # indifferent
                return 0
            elif d > eps:  # item_A > item_B
                return 1
            else:
                return -1
        else:
            raise Warning("query must have a response, unless self.u_true is defined")

    def answer_query(self, query,
                     response=None,
                     eps=0.0):
        # add an answered query to the individual's list if the response is None, use the true utility (u_true)
        # if it is defined

        # don't edit the query
        q_copy = query.unanswered_copy()
        if response is not None:
            q_copy.response = response
            self.answered_queries.append(q_copy)
        elif self.u_true is not None:
            d = np.dot(q_copy.z, self.u_true)
            if np.abs(d) <= eps:
                # indifferent
                q_copy.response = 0
            elif d > eps:
                # item_A > item_B
                q_copy.response = 1
            else:
                # item_A < item_B
                q_copy.response = -1

            self.answered_queries.append(q_copy)
        else:
            raise Warning("query must have a response, unless self.u_true is defined")

    def remove_last_query(self):
        self.answered_queries = self.answered_queries[:-1]

class User(Agent):
    """
    a User (for the web interface).
    """

    def __init__(self, username):
        """
        username: (str)
        """
        answered_queries = []
        Agent.__init__(self, answered_queries)
        self.username = username

# general functions, for sets of answered queries


def is_feasible(answered_queries,
                gamma_inconsistencies=0.0, u0_type="positive_normed"):
    # return True if the answered_queries result in a non-empty uncertainty set U (i.e., U is the feasible region for u)
    # if gamma is not None, allow total absolute inconsistencies up to gamma:
    # - add eps to each evaluation
    # - limit sum |eps| < \Gamma
    num_features = len(answered_queries[0].item_A.features)
    return not robust_utility(Item(np.zeros(num_features), None),
                              answered_queries=answered_queries,
                              gamma_inconsistencies=gamma_inconsistencies,u0_type=u0_type)[0] is None


def robust_utility(item, answered_queries,
                    verbose=False,
                    eps=0.0,
                   gamma_inconsistencies=0.0,u0_type="positive_normed"):
    # return the item's minimum utility within uncertainty set U generated by answered_queries
    # also return the u-vector that produces this minimum value

    num_features = len(item.features)

    # create the u-set model
    m = create_mip_model()

    u_vars = u_set_model(answered_queries, num_features, m,
                         eps=eps,
                         gamma_inconsistencies=gamma_inconsistencies,u0_type=u0_type)

    # add the objective -- the valuation of the item
    obj_expr = quicksum([u_vars[i] * item.features[i] for i in range(num_features)])

    m.setObjective(obj_expr, sense=GRB.MINIMIZE)

    m.optimize()

    # check for infeasiblity...
    if m.status == GRB.INFEASIBLE:
        if verbose:
            raise Warning("agent utility model is infeasible")
        return None, None

    # return the objective value
    return m.ObjVal, [var.x for var in u_vars.values()]


def u_set_model(answered_queries,
                num_features,
                m,
                eps=0.0,
                gamma_inconsistencies=0.0,u0_type="positive_normed"):
    # a gurobi model of the uncertainty set (the current feasible region for U)
    # if gamma is not None, allow total absolute inconsistencies up to gamma:
    # - add eps to each evaluation
    # - limit sum |eps| < \Gamma

    # define the feasible set of utilities


    if u0_type=="positive_normed":
        u_vars = m.addVars(num_features, vtype=GRB.CONTINUOUS, lb=0.0, ub=1.0)
        #partworth utilities
        m.addConstr(quicksum(u_vars) == 1)

    elif u0_type == "positive_box":
        u_vars = m.addVars(num_features, vtype=GRB.CONTINUOUS, lb=0.0, ub=1.0)

    elif u0_type == "box":
        u_vars = m.addVars(num_features, vtype=GRB.CONTINUOUS, lb=-1.0, ub=1.0)
    else:
        raise Exception("u0_type value unexpected:", u0_type)

    K = len(answered_queries)
    # if we assume agent inconsistencies
    # TODO: change U0 when in gamma > 0 (needs to be normalized)
    if gamma_inconsistencies > 0:
        xi_vars = m.addVars(K, lb=0.0, ub=GRB.INFINITY)
        m.addConstr(quicksum(xi_vars) <= gamma_inconsistencies)
    else:
        xi_vars = np.zeros(K)

    for i_q, q in enumerate(answered_queries):
        assert q.response in Query.valid_responses
        utility = quicksum([u_vars[i] * q.z[i] for i in range(num_features)])

        if q.response == 1:  # item_A > item_B
            m.addConstr(utility + xi_vars[i_q] >= eps, name='i_q=%d; q=1, LB' % i_q)

        elif q.response == -1:  # item_A < item_B
            m.addConstr(utility - xi_vars[i_q] <= - eps, name='i_q=%d; q=2, UB' % i_q)

        elif q.response == 0:  # item_A = item_B
            m.addConstr(utility - xi_vars[i_q] <= eps, name='i_q=%d; q=0, UB' % i_q)
            m.addConstr(utility + xi_vars[i_q] >= - eps, name='i_q=%d; q=0, LB' % i_q)

    return u_vars


def generate_items(num_features, num_items,
                   item_sphere_size=None,
                   seed=None,
                   positive=False):
    rs = np.random.RandomState(seed)
    return [Item.random(num_features,
                        id=i,
                        sphere_size=item_sphere_size,
                        rs=rs,
                        positive=positive) for i in range(num_items)]

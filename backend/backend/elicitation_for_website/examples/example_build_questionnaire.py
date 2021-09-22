# demonstrates behavior of build_questionnaire()

import time

from ..data_functions import get_test_items, get_data_items
from ..static_elicitation import build_questionnaire


def main():

    # create example items (these would be read from the database)
    items, num_features = get_test_items()

    # set a time limit of 10 minutes per query
    time_lim = 1.5 * 60 * 60

    K = 20

    # find the queries, using a fixed time limit
    t0 = time.time()
    queries, objval = build_questionnaire(items, K, time_lim)
    total_time = time.time() - t0

    print('found the the following {} queries in {} seconds:'.format(K, total_time))
    for q in queries:
        print(str(q))
    print('final objective value (larger is better): {}'.format(objval))

    print('--- Now using data from CSV ---')
    data_file = '/Users/duncan/research/ActivePreferenceLearning/PrefElicitationModule_github/module/data/PolicyQuestion-2019-12-19.csv'
    data_items = get_data_items(data_file)

    t0 = time.time()
    queries, objval = build_questionnaire(data_items, K, time_lim)
    total_time = time.time() - t0
    print('found the the following {} queries in {} seconds:'.format(K, total_time))
    for q in queries:
        print(str(q))
    print('final objective value (larger is better): {}'.format(objval))

    # ------------------------------------------------------------------------------------------------------------------
    # --- Expected output (exact queries may be different, but the objective value should be the same) ---
    # ------------------------------------------------------------------------------------------------------------------
    # found the the following 20 queries in 34.89380884170532 seconds:
    # Query(14, 11, response=None)
    # Query(10, 2, response=None)
    # Query(17, 2, response=None)
    # Query(11, 8, response=None)
    # Query(14, 3, response=None)
    # Query(9, 2, response=None)
    # Query(9, 8, response=None)
    # Query(17, 14, response=None)
    # Query(18, 9, response=None)
    # Query(15, 7, response=None)
    # Query(18, 0, response=None)
    # Query(19, 18, response=None)
    # Query(19, 1, response=None)
    # Query(18, 1, response=None)
    # Query(19, 0, response=None)
    # Query(19, 3, response=None)
    # Query(19, 2, response=None)
    # Query(16, 1, response=None)
    # Query(18, 4, response=None)
    # Query(18, 5, response=None)
    # final objective value (larger is better): -0.0
    # --- Now using data from CSV ---
    # found the the following 20 queries in 19.9566969871521 seconds:
    # Query(10, 4, response=None)
    # Query(4, 0, response=None)
    # Query(7, 2, response=None)
    # Query(12, 1, response=None)
    # Query(9, 1, response=None)
    # Query(2, 0, response=None)
    # Query(10, 9, response=None)
    # Query(13, 1, response=None)
    # Query(11, 9, response=None)
    # Query(10, 1, response=None)
    # Query(4, 3, response=None)
    # Query(11, 4, response=None)
    # Query(11, 1, response=None)
    # Query(12, 8, response=None)
    # Query(13, 12, response=None)
    # Query(12, 7, response=None)
    # Query(2, 1, response=None)
    # Query(13, 2, response=None)
    # Query(13, 3, response=None)
    # Query(12, 0, response=None)
    # final objective value (larger is better): -4.501852439

if __name__ == "__main__":
    main()
# demonstrate the behavior of get_next_query()

from ..get_next_query import get_next_query
from ..data_functions  import get_test_items, get_test_users, get_data_items
from ..preference_classes import Query


def main():

    # create example items (these would be read from the database)
    items, num_features = get_test_items()

    # get the user objects (these would be read from the database, as needed -- not all at once)
    user_dict = get_test_users(items)

    # simulate get_next_query
    for username, user in user_dict.items():
        print('simulating get_next_query for user {}...'.format(username))
        _ = get_next_query(user, items, verbose=True)

    # simulate elicitation
    username = 'new_user'
    user = user_dict[username]
    print('simulating get_next_query for user {}, with no answered queries'.format(username))
    for i in range(5):
        a_id, b_id, _, objval = get_next_query(user_dict[username], items, verbose=True)
        user.answer_query(Query(items[a_id], items[b_id]))
        print('query {}: ({}, {}). answer: {}. objval: {}'.format(i, a_id, b_id, user.answered_queries[-1].response, objval))


    # now simulate with data from the CSV
    # print('--- Now using data from CSV ---')
    # data_file = '/Users/duncan/research/ActivePreferenceLearning/PrefElicitationModule_github/module/data/PolicyQuestion-2019-12-19.csv'
    # data_items = get_data_items(data_file)
    # data_user_dict = get_test_users(data_items)
    #
    # username = 'new_user'
    # user = data_user_dict[username]
    # print('simulating get_next_query for user {}, with no answered queries'.format(username))
    # for i in range(5):
    #     a_id, b_id, _, objval = get_next_query(data_user_dict[username], data_items, verbose=True)
    #     user.answer_query(Query(data_items[a_id], data_items[b_id]))
    #     print('query {}: ({}, {}). answer: {}. objval: {}'.format(i, a_id, b_id, user.answered_queries[-1].response, objval))



    # ------------------------------------------------------------------------------------------------------------------
    # --- Expected output ---
    # ------------------------------------------------------------------------------------------------------------------
    # simulating get_next_query for user a...
    # Academic license - for non-commercial use only
    # next query for user a: item_A=18, item_B=19
    # simulating get_next_query for user d...
    # next query for user d: item_A=0, item_B=2
    # simulating get_next_query for user e...
    # next query for user e: item_A=18, item_B=19
    # simulating get_next_query for user new_user...
    # next query for user new_user: item_A=0, item_B=18
    # simulating get_next_query for user new_user, with no answered queries
    # next query for user new_user: item_A=1, item_B=9
    # query 0: (1, 9). answer: 1. objval: None
    # next query for user new_user: item_A=18, item_B=19
    # query 1: (18, 19). answer: 1. objval: -1.1260250287891678
    # next query for user new_user: item_A=17, item_B=19
    # query 2: (17, 19). answer: -1. objval: -0.8254620694257426
    # next query for user new_user: item_A=17, item_B=18
    # query 3: (17, 18). answer: -1. objval: -0.05639266801591408
    # next query for user new_user: item_A=16, item_B=19
    # query 4: (16, 19). answer: -1. objval: -0.056392668015913694
    # --- Now using data from CSV ---
    # simulating get_next_query for user new_user, with no answered queries
    # next query for user new_user: item_A=0, item_B=6
    # query 0: (0, 6). answer: -1. objval: None
    # next query for user new_user: item_A=12, item_B=13
    # query 1: (12, 13). answer: -1. objval: -1.0027576907541431
    # next query for user new_user: item_A=11, item_B=13
    # query 2: (11, 13). answer: -1. objval: -0.9599118514113755
    # next query for user new_user: item_A=11, item_B=12
    # query 3: (11, 12). answer: -1. objval: -0.9599118514113755
    # next query for user new_user: item_A=10, item_B=13
    # query 4: (10, 13). answer: -1. objval: -0.9599118514113755


if __name__ == "__main__":
    main()
# placeholder functions for interacting with a database

import numpy as np
import pandas as pd

from ..preference_classes import Item, Query, User

def get_test_items():
    """
    create a list of item objects
    """
    rs = np.random.RandomState(0)

    feature_names = ['f1', 'f2', 'f3', 'f4', 'f5']
    num_features = 5
    num_items = 20
    random_features = lambda: rs.rand(num_features) * 10 - 5

    items = []
    for i in range(num_items):
        features = random_features()
        items.append(Item(features, i, feature_names=feature_names))

    return items, num_features


def get_test_users(items):
    """
    create a dict of user obejcts. key = username, value = User object

    input:
    - items: (list(Item)). a list of preference_classes.Item objects
    """

    num_features = len(items[0].features)

    a = User('a')
    a.answered_queries = [
            Query(items[0], items[1], response=1),
        ]

    d = User('d')
    d.answered_queries = []

    # e = User('e')
    # e.answered_queries = [
    #     Query(items[4], items[6], response=1),
    #     Query(items[4], items[6], response=-1),
    #     Query(items[2], items[4], response=0),
    #     Query(items[1], items[3], response=0),
    # ]

    new_user = User('new_user')
    new_user.u_true = np.random.rand(num_features)

    user_dict = {'a': a,
                 'd': d,
                 # 'e': e,
                 'new_user': new_user,
                 }

    return user_dict


def get_data_items(data_file):
    df = pd.read_csv(data_file)

    feature_names = list(df.columns[1:])

    items = []
    for i, row in df.iterrows():
        features = np.array(row)[1:]
        items.append(Item(features, i, feature_names=feature_names))

    return items

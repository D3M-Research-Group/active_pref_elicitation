import time
import os
import numpy as np

def generate_filepath(output_dir, name, extension):
    # generate filepath, of the format <name>_YYYYMMDD_HHMMDD<extension>
    timestr = time.strftime("%Y%m%d_%H%M%S")
    output_string = (name + '_%s.' + extension) % timestr
    return os.path.join(output_dir, output_string)

def U0_polyhedron(num_features):
    # create the B matrix and b vector (this is for the initial set U^0 = [-1,1]^n
    # that is: U^0 = {u | B * u >= b}, in this case:
    B_mat = np.concatenate((np.eye(num_features), -np.eye(num_features)))
    b_vec = -np.ones(2 * num_features)
    return B_mat, b_vec

def get_u0(u0_type, num_features):
    """return a polyhedral definition for U^0, B_mat and b_vec"""

    assert u0_type in ["box", "positive_normed"]

    if u0_type == "box":
        B_mat, b_vec = U0_box(num_features)
    if u0_type == "positive_normed":
        B_mat, b_vec = U0_positive_normed(num_features)
    return B_mat, b_vec

def U0_box(num_features):
    # create the B matrix and b vector for the set u \in [0,1]^n, and ||u||_1 = 1
    # that is: U^0 = {u | B * u >= b}, in this case:
    B_mat = np.concatenate((np.eye(num_features), -np.eye(num_features)))
    b_vec = -np.ones(2 * num_features)
    return B_mat, b_vec

def U0_positive_normed(num_features):

    # create the B matrix and b vector for the box u \in [-1, 1]^n
    # that is: U^0 = {u | B * u >= b}, in this case:
    B_mat = np.concatenate(
        (
            np.eye(num_features),
            -np.eye(num_features),
            np.stack((np.repeat(1.0, num_features), np.repeat(-1.0, num_features))),
        )
    )
    b_vec = np.concatenate(
        (np.repeat(0.0, num_features), np.repeat(-1.0, num_features), [1.0], [-1.0])
    )
    return B_mat, b_vec

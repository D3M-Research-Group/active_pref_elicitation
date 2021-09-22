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

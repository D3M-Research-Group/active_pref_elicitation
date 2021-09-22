# PrefElicitationModule
preference elicitation module for CAIS-LAHSA website interface. written in Python 3. 

these elicitation functions use instances of User and Item objects (defined in preference_classes.py). In order to connect this functionality to an app or database, you will need to create User and Item instances, and pass these

dependencies: 
- gurobipy (and Gurobi)
- numpy 

## Files:

- **preference_classes.py**: contains primary classes used for elicitation
- **data_funcation.py**: the functions in this file provide Item and User objects to test the elicitation functions -- simulates the behavior of interacting with a database or app
- **gurobi_functions.py**: helper functions for dealing with Gurobi
- **static_elicitation.py**: functions for building a questionnaire
- **get_next_query.py**: higher-level functions for elicitation, heavily depends on preference_classes

### Example Scripts
- examples/**example_get_next_query.py**: demonstrates the behavior of get_next_query
- examples/**example_build_questionnaire.py**: demonstrates the behavior of example_build_questionnaire

## Run it!

Run module.examples.example_get_next_query or module.examples.example_build_questionnaire

Example:
```
 python3.7 -m module.examples.example_get_next_query
```

Expected output:

```
simulating get_next_query for user alice - who has answered only one query
next query for user alice: item_A=7, item_B=8
simulating get_next_query for user bob - who has answered two queries
next query for user bob: item_A=2, item_B=8
simulating get_next_query for user bob - who has answered three queries
next query for user cam: item_A=5, item_B=9
simulating get_next_query for user bob - who has answered **zero** queries
next query for user noel: item_A=9, item_B=1
simulating get_next_query for user ian - who has answered several queries **inconsistently**
next query for user ian: item_A=8, item_B=9
```

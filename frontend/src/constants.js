export const DEBUG = false;

export const SERVER_URL = DEBUG ? "http://localhost:8000" : "https://api.cais-preference-elicitation.com";
export const DATASET_NAME = "UK_6781beds-25policies";

export const USER_CHOICES_MAP = {
    "1" : "policy_A",
    "-1" : "policy_B",
    "0" : "indifferent",
  }
  
export const PREDICTIONS_MAP = {
    "1" : "policy_A",
    "-1" : "policy_B",
    "0" : "indifferent",
    "garbage_validation": "garbage_validation"
  }
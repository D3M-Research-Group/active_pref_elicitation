const schema = {
    "title": "User Information",
    "description": "",
    "type": "object",
    "required": ["age", "race_ethnicity", "gender", "marital_status", "education", "political",
    "positive_family", "positive_anyone","healthcare_yn"],
    "properties": {
        "username": {
          "title": "Worker ID (Please use the MTurk Worker ID that we use to verify payment)",
          "type": "string"
        },
      "age": {
        "title": "What is your age group?",
        "type": "string",
        "enum": ["18-39","40-49", "50-59","60-69", "70-79","80+"]
      },
      "race_ethnicity": {
        "title": "What is your race/ethnicity?",
        "type": "string",
        "enum": ["American Indian or Alaska Native",
                    "Asian",
                    "Black or African American",
                    "Hispanic or Latino",
                    "Multiracial",
                    "Native Hawaiian or Other Pacific Islander",
                    "White",
                    "Prefer not to Answer"]
      },
      "gender": {
        "title": "What is your gender?",
        "type": "string",
        "enum": ["Female","Male","Other","Prefer not to answer"]
      },
      "marital_status": {
        "title": "What is your marital status?",
        "type": "string",
        "enum": ["Single (Never Married)",
                    "Married",
                    "In a domestic relationship",
                    "Divorced",
                    "Widowed",
                    "Other",
                    "Prefer not to Answer"]
      },
      "education": {
        "title": "What is the highest degree or level of school you have completed?",
        "type": "string",
        "enum": ["No schooling completed",
                    "Nursery school to 8th grade",
                    "Some high school, no diploma",
                    "High school graduate, diploma or the equivalent (for example: GED)",
                    "Some college credit, no degree",
                    "Trade/technical/vocational training",
                    "Associate degree",
                    "Bachelor’s degree",
                    "Master’s degree",
                    "Professional degree",
                    "Doctorate degree"]
      },
      "political": {
        "title": "What is your political party affiliation?",
        "type": "string",
        "enum": ["Constitution",
                "Democratic",
                "Green",
                "Independent",
                "Libertarian",
                "Republican",
                "Other",
                "Prefer not to Answer"]
      },
      "positive_family": {
        "title": "Do you have family members who tested positive for COVID-19?",
        "type": "string",
        "enum": [
            "Yes",
            "No",
            "Unsure"
        ]
      },
      "positive_anyone": {
        "title": "Do you know anyone (other than family members) who tested positive for COVID-19?",
        "type": "string",
        "enum": [
            "Yes",
            "No",
            "Unsure"
        ]
      },
      "healthcare_yn": {
        "title": "Do you work in health care?",
        "type": "string",
        "enum": [
            "Yes",
            "No"
        ]
      },

      "healthcare_role": {
        "title": "If yes, what is your role?",
        "type": "string"
      }

    },
      "if": {
        "properties": {
          "healthcare_yn": {"const" : "Yes"}
        }
      },
      "then": {
        "required" : [
          "healthcare_role"
        ]
      }

      // "unidirectional": {
      //     "title": "",
      //     "type": "object",
      //     "properties": {
      //       "healthcare_yn": {
      //           "title": "Do you work in health care?",
      //           "type": "string",
      //           "enum": [
      //               "Yes",
      //               "No"
      //           ]
      //       },
      
      //       "healthcare_role": {
      //         "title": "If yes, what is your role?",
      //         "type": "string"
      //       }
      //     },
      //     "if": {
      //       "properties": {
      //         "healthcare_yn": {"const" : "Yes"}
      //       }
      //     },
      //     "then": {
      //       "required" : [
      //         "healthcare_role"
      //     ]
      //     },
      //     // "required" : [
      //     //     "healthcare_yn"
      //     // ],
      //     "dependencies": {
      //         "healthcare_yn" : [
      //             "healthcare_role"
      //         ]
      //     }
        
      // }
      

    // }
}
export default schema;
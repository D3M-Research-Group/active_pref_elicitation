const UserInfoSchema = {
    type: "object",
    properties: {
        turker_id: {
            type: 'string', minLength: 1
        },
      age: {
        type: 'object',
			properties: {
				label: { type: 'string', minimum: 1 },
				name: { type: 'string', minimum: 1 },
				value: { type: 'string', minimum: 1 },
			}
      },
      race_ethnicity: {
        type: 'object',
			properties: {
				label: { type: 'string', minimum: 1 },
				name: { type: 'string', minimum: 1 },
				value: { type: 'string', minimum: 1 },
			}
      },
      gender: {
        type: 'object',
			properties: {
				label: { type: 'string', minimum: 1 },
				name: { type: 'string', minimum: 1 },
				value: { type: 'string', minimum: 1 },
			}
      },
      marital_status: {
        type: 'object',
			properties: {
				label: { type: 'string', minimum: 1 },
				name: { type: 'string', minimum: 1 },
				value: { type: 'string', minimum: 1 },
			}
      },
      education: {
        type: 'object',
			properties: {
				label: { type: 'string', minimum: 1 },
				name: { type: 'string', minimum: 1 },
				value: { type: 'string', minimum: 1 },
			}
      },
      political: {
        type: 'object',
			properties: {
				label: { type: 'string', minimum: 1 },
				name: { type: 'string', minimum: 1 },
				value: { type: 'string', minimum: 1 },
			}
      },
      positive_family: {
        type: 'object',
			properties: {
				label: { type: 'string', minimum: 1 },
				name: { type: 'string', minimum: 1 },
				value: { type: 'string', minimum: 1 },
			}
      },
      positive_anyone: {
        type: 'object',
			properties: {
				label: { type: 'string', minimum: 1 },
				name: { type: 'string', minimum: 1 },
				value: { type: 'string', minimum: 1 },
			}
      }
//      healthcare_yn: {
//        type: 'object',
//			properties: {
//				label: { type: 'string', minimum: 1 },
//				name: { type: 'string', minimum: 1 },
//				value: { type: 'string', minimum: 1 },
//			}
//      },

//      healthcare_role: {
//        type: 'string', minLength: 1
//      }

    },
    required: ["age", "race_ethnicity", "gender", "marital_status", "education", "political",
    "positive_family", "positive_anyone"]
}
export default UserInfoSchema;
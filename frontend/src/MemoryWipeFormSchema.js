const MemoryWipeSchema = {
    type: "object",
    properties: {
        question_1: {
            type: 'string', minLength: 1
        },
        question_2: {
            type: 'string', minLength: 1
        },
        question_3: {
            type: 'string', minLength: 1
        },
    },
    required: ["question_1", "question_2", "question_3"]
}
export default MemoryWipeSchema;
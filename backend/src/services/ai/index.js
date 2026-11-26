const llmClient = require("./llmClient");
const observability = require("./observability");
const contextAssembler = require("./contextAssembler");
const guardrails = require("./guardrails");
const compression = require("./compression");
const evaluationPromptV1 = require("./prompts/evaluation.v1");
const evaluationSchema = require("./schemas/evaluation.schema");

module.exports = {
  llmClient,
  observability,
  contextAssembler,
  guardrails,
  compression,
  prompts: {
    evaluationV1: evaluationPromptV1,
  },
  schemas: {
    evaluation: evaluationSchema,
  },
};

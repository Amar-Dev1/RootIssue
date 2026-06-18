import { IExplorerBody, IPlannerBody } from "../types";
import { SetupLLM } from "../utils/SetupLLM";
import { ExplorerLLMPrompt, PlannerLLMPrompt } from "./prompts";

export const getExplorerLLM = async (args: IExplorerBody) => {
  const { provider, model, apiKey, issue, context } = args;

  console.log("body from llm: ", args);

  const llm = SetupLLM({ provider, model, apiKey, maxTokens: 750 });

  const answer = await ExplorerLLMPrompt.pipe(llm).invoke({
    issue,
    context,
  });
  return answer.content;
};

export const getPlannerLLM = async (args: IPlannerBody) => {
  const { provider, model, apiKey, issue, filesContent } = args;

  const llm = SetupLLM({ provider, model, apiKey, maxTokens: 1500 });

  const answer = await PlannerLLMPrompt.pipe(llm).invoke({
    issue,
    filesContent,
  });
  return answer.content;
};

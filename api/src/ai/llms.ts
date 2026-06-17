import { IExplorerBodyType, IPlannerBodyType } from "../types";
import { SetupLLM } from "../utils/SetupLLM";
import { ExplorerLLMPrompt, PlannerLLMPrompt } from "./Prompts";

export const getExplorerLLM = async (args: IExplorerBodyType) => {
  const { provider, model, apiKey, issue, context } = args;

  const llm = SetupLLM({ provider, model, apiKey, maxTokens: 750 });

  const answer = await ExplorerLLMPrompt.pipe(llm).invoke({
    issue,
    context,
  });
  return answer.content;
};

export const getPlannerLLM = async (args: IPlannerBodyType) => {
  const { provider, model, apiKey, issue, filesContent } = args;

  const llm = SetupLLM({ provider, model, apiKey, maxTokens: 1500 });

  const answer = await PlannerLLMPrompt.pipe(llm).invoke({
    issue,
    filesContent,
  });
  return answer.content;
};

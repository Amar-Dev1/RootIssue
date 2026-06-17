import { Context } from "hono";
import { getExplorerLLM, getPlannerLLM } from "../ai/llms";
import { explorerBodyType, plannerBodyType } from "../types";


export const ExploreTreeService = async (
  c: Context,
  input: explorerBodyType,
) => {
  return await getExplorerLLM(c.env, input);
};

export const GeneratePlanService = async (
  c: Context,
  input: plannerBodyType,
) => {
  return await getPlannerLLM(c.env, input);
};

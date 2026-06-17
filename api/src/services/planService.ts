import { getExplorerLLM, getPlannerLLM } from "../ai/llms";
import {  IExplorerBody, IPlannerBody } from "../types";

export const ExploreTreeService = async (
  data: IExplorerBody,
) => {  
  return await getExplorerLLM(data);
};

export const GeneratePlanService = async (
  data: IPlannerBody,
) => {
  return await getPlannerLLM(data);
};

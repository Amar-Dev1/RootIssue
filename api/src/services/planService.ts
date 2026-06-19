import { Context } from "hono";
import { getExplorerLLM, getPlannerLLM } from "../ai/llms";
import { IExplorerBody, IPlannerBody } from "../types";

export const ExploreTreeService = async (data: IExplorerBody) => {
  return await getExplorerLLM(data);
};

export const GeneratePlanService = async (data: IPlannerBody) => {
  return await getPlannerLLM(data);
};

export const FetchModelsService = async (c: Context, provider: string) => {
  let response;
  let allModels: any;
  let latestModels: string[] = [];
  switch (provider) {
    case "google":
      response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models?key=${c.env.GEMINI_API_KEY}`,
      );
      allModels = (await response.json()) || {};

      latestModels =
        allModels.models
          .map((model: any) => model.name.replace("models/", ""))
          .filter((id: string) => id.includes("gemini"))
          .slice(0, 3) || [];

      break;
    case "openai":
      response = await fetch(`https://api.openai.com/v1/models`, {
        headers: {
          Authorization: `Bearer ${c.env.OPENAI_API_KEY}`,
        },
      });
      allModels = (await response.json()) || {};
      latestModels =
        allModels.data
          ?.map((m: any) => m.id)
          .filter(
            (id: string) => id.startsWith("gpt-5") || id.startsWith("gpt-4"),
          )
          .slice(0, 3) || [];
      break;
    case "anthropic":
      response = await fetch(`https://api.anthropic.com/v1/models`, {
        headers: {
          "anthropic-api-key": process.env.ANTHROPIC_API_KEY || "",
          "anthropic-version": "2023-06-01",
        },
      });
      allModels = (await response.json()) || {};

      latestModels = allModels.data?.map((m: any) => m.id).slice(0, 3) || [];
      break;
    default:
      latestModels = ["gemini-3.5-flash", "gpt-5.5", "claude-opus-4.8"];
  }

  if (!latestModels || latestModels.length === 0) {
    const fallbacks: Record<string, string[]> = {
      google: ["gemini-3.5-flash", "gemini-3.1-pro", "gemini-2.5-pro"],
      openai: ["gpt-5.5", "gpt-5.4-thinking", "gpt-5.3-codex"],
      anthropic: ["claude-opus-4.8", "claude-opus-4.7"],
    };
    return fallbacks[provider] || fallbacks["google"];
  }

  return latestModels;
};

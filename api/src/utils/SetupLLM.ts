import { ChatOpenAI } from "@langchain/openai";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { ChatAnthropic } from "@langchain/anthropic";
import { modelArguments } from "../types";
import { HTTPException } from "hono/http-exception";

export const SetupLLM = (args: modelArguments) => {
  const { provider, model, apiKey, maxTokens } = args;

  if (!apiKey) {
    throw new HTTPException(401, {
      message: `Missing API Key for provider: ${provider}`,
    });
  }
  if (!provider || !model) {
    throw new HTTPException(400, {
      message: "Missing required provider or model target",
    });
  }

  if (provider === "openai") {
    return new ChatOpenAI({ model, temperature: 0, maxTokens, apiKey });
  }
  if (provider === "google") {
    return new ChatGoogleGenerativeAI({
      model,
      temperature: 0,
      maxOutputTokens: maxTokens,
      apiKey,
    });
  }
  if (provider === "anthropic") {
    return new ChatAnthropic({ model, temperature: 0, maxTokens, apiKey });
  }

  throw new HTTPException(400, {
    message: `Unsupported LLM Provider: ${provider}`,
  });
};

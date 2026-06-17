import { ChatOpenAI } from "@langchain/openai";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { ChatAnthropic } from "@langchain/anthropic";
import { modelArguments } from "../types";

export const SetupLLM = (args: modelArguments) => {
  const { provider, model, apiKey, maxTokens } = args;

  if (!provider || !model || !apiKey)
    throw new Error("Missing provider, model or API key");

  return provider === "openai"
    ? new ChatOpenAI({
        model,
        temperature: 0,
        maxTokens,
        apiKey,
      })
    : provider === "google"
      ? new ChatGoogleGenerativeAI({
          model,
          temperature: 0,
          maxOutputTokens: maxTokens,
          apiKey,
        })
      : provider === "anthropic"
        ? new ChatAnthropic({
            model,
            temperature: 0,
            maxTokens,
            apiKey,
          })
        : null;
};

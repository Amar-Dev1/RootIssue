export type modelArguments = {
  provider?: "google" | "openai" | "anthropic";
  model?: string;
  apiKey?: string;
  maxTokens?: number;
};

export interface IExplorerBody extends modelArguments {
  issue: string;
  context: string;
}

export interface IPlannerBody extends modelArguments {
  issue: string;
  filesContent: string;
}

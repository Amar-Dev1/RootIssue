export type State = 'onboarding' | 'idle' | 'loading' | 'result' | 'error';

export interface IssueContext {
  owner: string;
  repo: string;
  issueNumber: string;
  title: string;
  body: string;
  fullText: string;
}

export type modelArguments = {
  provider?: "google" | "openai" | "anthropic";
  model?: string;
  apiKey?: string;
  maxTokens?:number;
};

export interface IExplorerBodyType extends modelArguments {
  issue: string;
  context: string;
}

export interface IPlannerBodyType extends modelArguments {
  issue: string;
  filesContent: string;
}

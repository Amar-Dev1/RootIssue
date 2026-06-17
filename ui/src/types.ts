export type State = 'onboarding' | 'idle' | 'loading' | 'result' | 'error';

export interface IssueContext {
  owner: string;
  repo: string;
  issueNumber: string;
  title: string;
  body: string;
  fullText: string;
}

## Major Changes:

- The project will be Fully open source.
- The project will be web-based.
- The api expect this :
  - /api/v1/explore-tree: expect => Body: {issue: "", context: "", provider: "", model: ""}, Header: {..., LLM_API_KEY (if applicable)}
  - /api/v1/generate-plan: expect => Body: {issue: "", filesContent: "", provider: "", model: ""}, Header: {..., LLM_API_KEY (if applicable)}

## User-flow:

- Enter the issue url in the main input element (No sign-in, No UUID generation), only ask user to enter: `github access token` and `llm API key` (first let him to select the provider then let him enter the api key, after that let him to select the model) all that should be in smooth dropdown element. First: select the provider, Second: Select the model based on that provider, Third: Enter the API key, All this after getting the github token definiately. After everything is setup correctly, the user can paste the issue url and the screen splits into 2 sides, the left side for letting the user to enter the issue url and like this, and the right side shows loading skiliton effect with the 3 steps, after the loading complete, it shows the markdown in a smooth nice way. I NEED THIS PROCESS TO BE LOGICAL.`

## UI: 
- Dont chage the main vibe, just turn this into web-based ui and make it smooth as possible without bugs and not over-engineered, simple as possible. For Type safety, its better to use these types:  
```ts
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
```

## Major Changes: 
- The project will be Fully open source.
- The project will be web-based.
- The api remain the same.

## User-flow: 
1. Enter the issue url in the main input element (No sign-in, No UUID generation), only ask user to enter: `github access token` and `llm API key (first let him to select the provider then let him enter the api key)`
2. If the app could not found `github access token` | `llm API key` in local-storage, a popup appear asking to enter these keys.
3. No credits system anymore
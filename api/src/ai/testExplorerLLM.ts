import { IExplorerBodyType } from "../types";
import { getExplorerLLM } from "./llms";
import * as dotenv from 'dotenv';

dotenv.config();

async function testExplorerLLM(args: IExplorerBodyType) {
  return await getExplorerLLM(args);
}

console.log(
  await testExplorerLLM({
    provider: "google",
    issue:
      "Bug: User session tokens do not expire after 24h of inactivity, keeping users permanently logged in. The middleware checks for the token presence but never evaluates the timestamp inside the JWT payload.",
    apiKey: process.env.GEMINI_API_KEY1,
    model: "gemini-2.5-flash-lite",
    context: `src/middleware/auth.ts, src/utils/jwt.ts, .dockerignore, package.json, src/index.ts, src/utils/serializeUser`,
  }),
);

import { IPlannerBodyType } from "../types";
import { getPlannerLLM } from "./llms";

import * as dotenv from 'dotenv';

dotenv.config();

async function testPlannerLLM(args: IPlannerBodyType) {
  return await getPlannerLLM(args);
}

console.log(
  await testPlannerLLM({
    provider: "google",
    issue:
      "Bug: User session tokens do not expire after 24h of inactivity, keeping users permanently logged in. The middleware checks for the token presence but never evaluates the timestamp inside the JWT payload.",
    apiKey: process.env.GEMINI_API_KEY2,
    model: "gemini-2.5-flash-lite",
    filesContent: `--- START OF FILE: src/middleware/auth.ts ---\nimport { Context, Next } from 'hono';\nimport { verify } from 'hono/jwt';\n\nexport async function authMiddleware(c: Context, next: Next) {\n  const authHeader = c.req.header('Authorization');\n  if (!authHeader || !authHeader.startsWith('Bearer ')) {\n    return c.json({ error: 'Unauthorized' }, 401);\n  }\n\n  const token = authHeader.split(' ')[1];\n  try {\n    const payload = await verify(token, c.env.JWT_SECRET);\n    c.set('jwtPayload', payload);\n    await next();\n  } catch (err) {\n    return c.json({ error: 'Invalid token signature' }, 401);\n  }\n}\n--- END OF FILE: src/middleware/auth.ts ---\n\n--- START OF FILE: src/utils/jwt.ts ---\nimport { sign } from 'hono/jwt';\n\nexport async function generateSessionToken(userId: string, secret: string) {\n  const payload = {\n    sub: userId,\n    iat: Math.floor(Date.now() / 1000),\n    expCustom: Math.floor(Date.now() / 1000) + (24 * 60 * 60)\n  };\n  return await sign(payload, secret);\n}\n--- END OF FILE: src/utils/jwt.ts ---`,
  }),
);
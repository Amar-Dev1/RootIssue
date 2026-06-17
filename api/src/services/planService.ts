import { Context } from "hono";
import { getExplorerLLM, getPlannerLLM } from "../ai/llms";
import { explorerBodyType, urlParamsType, plannerBodyType } from "../types";

export const AuthorizeService = async (
  c: Context,
  user_info: urlParamsType,
) => {
  const { user_id, plan } = user_info;
  const db = c.env.rootIssue_db;
  const dbResult = await db
    .prepare(
      `
    INSERT OR IGNORE INTO users (user_id, plan)
    VALUES (?, ?)
    `,
    )
    .bind(user_id, plan)
    .run();

  if (dbResult.changes === 0) console.log("User already exists");
  else if (dbResult.changes === 1) console.log("Added the user DB ✅");

  return "User authorized successflly ✅";
};

export const ExploreTreeService = async (
  c: Context,
  input: explorerBodyType,
) => {
  return await getExplorerLLM(c.env, input);
};

export const GeneratePlanService = async (
  c: Context,
  input: plannerBodyType,
) => {
  return await getPlannerLLM(c.env, input);
};

import { Context } from "hono";
import { explorerBodyType, plannerBodyType } from "../types";
import {
  ExploreTreeService,
  GeneratePlanService,
} from "../services/planService";


export const ExploreTreeController = async (c: Context) => {
  try {
    const input = await c.req.json<explorerBodyType>();
    const params = c.req.param();

    if (!params.user_id || !params.plan) {
      return c.json({ error: "Missing user_id or plan in URL" }, 400);
    }
    // @ts-ignore
    const answer = await ExploreTreeService(c, input, params);
    return c.json({ result: answer });
  } catch (err) {
    console.error(err);
  }
};

export const GeneratePlanController = async (c: Context) => {
  try {
    const input = await c.req.json<plannerBodyType>();
    // @ts-ignore
    const answer = await GeneratePlanService(c, input);
    return c.json({ result: answer });
  } catch (err) {
    console.error(err);
  }
};

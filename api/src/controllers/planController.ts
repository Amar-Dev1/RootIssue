import { Context } from "hono";
import { IExplorerBody, IPlannerBody } from "../types";
import {
  ExploreTreeService,
  FetchModelsService,
  GeneratePlanService,
} from "../services/planService";

export const ExploreTreeController = async (c: Context) => {
  const body = await c.req.json<IExplorerBody>();
  const apiKey = c.req.header("api-key");

  if (!apiKey) {
    return c.json({ error: "API key is missing from headers" }, 401);
  }

  const answer = await ExploreTreeService({ ...body, apiKey });
  return c.json({ result: answer });
};

export const GeneratePlanController = async (c: Context) => {
  const body = await c.req.json<IPlannerBody>();
  const apiKey = c.req.header("api-key");

  if (!apiKey) {
    return c.json({ error: "API key is missing from headers" }, 401);
  }

  const answer = await GeneratePlanService({ ...body, apiKey });
  return c.json({ result: answer });
};

export const FetchModelsController = async (c: Context) => {
  const { provider } = c.req.param();

  return c.json({ result: await FetchModelsService(c, provider) });
};

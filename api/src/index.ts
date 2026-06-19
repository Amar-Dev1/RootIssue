import { Context, Hono } from "hono";
import { cors } from "hono/cors";
import { RequestIdVariables } from "hono/request-id";
// @ts-ignore
import type { Env } from "../worker-configuration";
import {
  ExploreTreeController,
  FetchModelsController,
  GeneratePlanController,
} from "./controllers/planController";

export type App = {
  Bindings: Env;
  Variables: RequestIdVariables;
};

const app = new Hono<App>();

app.use(async (c:Context, next)=>{
  const allowedOrigin = c.env.ALLOWED_ORIGIN || 'http://localhost:5173'

  const corsMiddleware =  cors({
    origin: allowedOrigin,
    allowMethods: ["GET", "POST", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization", 'api-key'],
    credentials: true,
  })

  return corsMiddleware(c, next);
});

app.get("/h", async (c) => {
  try {
    return c.text("Server is healthy!");
  } catch (err) {
    console.error(err);
  }
});
app.post("/api/v1/explore-tree", ExploreTreeController);
app.post("/api/v1/generate-plan", GeneratePlanController);
app.get("/api/v1/fetch-models/:provider", FetchModelsController);

export default app;

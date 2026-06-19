import { Hono } from "hono";
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
app.use(
  "/api/*",
  cors({
    origin: "http://localhost:5173",
    allowMethods: ["GET", "POST", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization", 'api-key'],
    credentials: true,
  }),
);

app.get("/h", async (c) => {
  try {
    return c.text("Server is healthy!");
  } catch (err) {
    console.error(err);
  }
});
app.post("/api/v1/explore-tree", ExploreTreeController);
app.post("api/v1/generate-plan", GeneratePlanController);
app.get("/api/v1/fetch-models/:provider", FetchModelsController);

export default app;

import { Hono } from "hono";
import { cors } from "hono/cors";
import { RequestIdVariables } from "hono/request-id";
import type { Env } from "../worker-configuration";
import {
  ExploreTreeController,
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
    allowMethods: ["GET", "POST"],
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

export default app;
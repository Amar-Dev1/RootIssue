import { Hono } from "hono";
import { cors } from "hono/cors";
import { RequestIdVariables } from "hono/request-id";
import type { Env } from "../worker-configuration";
import {
  AuthorizeController,
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
    credentials:true
  }),
);

app.get("/h", async (c) => {
  try {
    const db = c.env.rootIssue_db;
    await db.prepare(`SELECT 1`).all();
    return c.text("Server is healthy!");
  } catch (err) {
    console.error(err);
  }
});
app.get("api/v1/authorize/:user_id/:plan", AuthorizeController);
app.post(`/api/v1/explore-tree/:user_id/:plan`, ExploreTreeController);
app.post("api/v1/generate-plan", GeneratePlanController);

export default app;

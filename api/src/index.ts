import { Hono } from "hono";
import { RequestIdVariables } from "hono/request-id";
import type { Env } from "./worker";

export type App = {
  Bindings: Env;
  Variables: RequestIdVariables;
};

const app = new Hono<App>();

app.get("/h", async (c) => {
  try {
    const db = c.env.rootIssue_db;
    await db.prepare(`SELECT 1`).all();
    return c.text("Server is healthy!");
  } catch (err) {
    console.error(err);
  }
});

export default app;

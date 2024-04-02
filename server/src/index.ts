import { Hono } from "hono";
import { userRouter } from "./routes/user";
import { postRouter } from "./routes/post";
import { authRouter } from "./routes/auth";
import { matchesRouter } from "./routes/matches";
import { cors } from "hono/cors";

const app = new Hono<{
  Bindings: {
    DATABASE_URL: string;
    JWT_SECRET: string;
  };
}>();
app.get("/", (c) => {
  return c.text("Hono server is live!");
});
app.use("/*", cors());
app.route("/api/server/v1/user", userRouter);
app.route("/api/server/v1/post", postRouter);
app.route("/api/server/v1/auth", authRouter);
app.route("/api/server/v1/matches", matchesRouter);

export default app;
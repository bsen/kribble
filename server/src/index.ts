import { Hono } from "hono";
import { userRouter } from "./routes/user";
import { postRouter } from "./routes/post";
import { feedRouter } from "./routes/feed";
import { authRouter } from "./routes/auth";
import { konnectRouter } from "./routes/konnect";
import { communityRouter } from "./routes/community";
import { searchRouter } from "./routes/search";
import { commentRouter } from "./routes/comment";

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
app.route("/api/server/v1/feed", feedRouter);
app.route("/api/server/v1/comment", commentRouter);
app.route("/api/server/v1/auth", authRouter);
app.route("/api/server/v1/konnect", konnectRouter);
app.route("/api/server/v1/community", communityRouter);
app.route("/api/server/v1/search", searchRouter);
export default app;

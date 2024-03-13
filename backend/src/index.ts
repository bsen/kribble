import { Hono } from "hono";
import { userRouter } from "./routes/user";
import { postRouter } from "./routes/post";

const app = new Hono<{
  Bindings: {
    DATABASE_URL: string;
    JWT_SECRET: string;
  };
}>();

app.route("/cloudflare/undate/server/api", userRouter);
app.route("/cloudflare/undate/server/api", postRouter);

export default app;

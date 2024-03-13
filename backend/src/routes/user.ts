import { Hono } from "hono";
import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";
import { decode, sign, verify } from "hono/jwt";

export const userRouter = new Hono<{
  Bindings: {
    DATABASE_URL: string;
    JWT_SECRET: string;
  };
}>();

userRouter.post("/signup", async (c) => {
  const body = await c.req.json();
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());
  try {
    const user = await prisma.user.create({
      data: {
        name: body.name,
        username: body.username,
        email: body.email,
        gender: body.gender,
        password: body.password,
      },
    });
    const jwt = await sign({ id: user.id }, c.env.JWT_SECRET);
    console.log(user);
    return c.text(jwt);
  } catch (e) {
    console.log(e);
    c.status(403);
    return c.json({ message: "user signup failed" });
  }
});

userRouter.post("/signin", async (c) => {
  const body = await c.req.json();
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());
  try {
    const user = await prisma.user.findFirst({
      where: {
        email: body.email,
        password: body.password,
      },
    });

    if (!user) {
      c.status(403);
      return c.json({ message: "user not found or authentication error" });
    }
    c.status(200);
    const jwt = await sign({ id: user.id }, c.env.JWT_SECRET);
    console.log(user);
    return c.text(jwt);
  } catch (e) {
    console.log(e);
  }
});

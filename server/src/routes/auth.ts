import { Hono } from "hono";
import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";
import { sign } from "hono/jwt";
import { z } from "zod";
export const authRouter = new Hono<{
  Bindings: {
    DATABASE_URL: string;
    JWT_SECRET: string;
    CLOUDFLARE_IMGAES_ACCOUNT_ID: string;
    CLOUDFLARE_IMGAES_API_TOKEN: string;
    CLOUDFLARE_IMGAES_POST_URL: string;
  };
}>();
const nameSchema = z.string().max(30);
const usernameSchema = z.string().max(20);
const emailSchema = z.string().email();
const genderSchema = z.string();
const passwordSchema = z.string().min(6);

authRouter.post("/signup", async (c) => {
  try {
    const body = await c.req.json();
    const nameRes = nameSchema.safeParse(body.name);
    const usernameRes = usernameSchema.safeParse(body.username);
    const emailRes = emailSchema.safeParse(body.email);
    const genderRes = genderSchema.safeParse(body.gender);
    const passwordRes = passwordSchema.safeParse(body.password);
    if (
      !nameRes.success ||
      !usernameRes.success ||
      !emailRes.success ||
      !passwordRes.success ||
      !genderRes.success
    ) {
      return c.json({ status: 400, message: "Invalid user inputs" });
    }
    const prisma = new PrismaClient({
      datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate());
    const email = await prisma.user.findUnique({
      where: {
        email: body.email,
      },
    });

    if (email) {
      return c.json({ status: 401, message: "This email is already in use" });
    }
    const username = await prisma.user.findUnique({
      where: {
        username: body.username,
      },
    });
    if (username) {
      return c.json({ status: 401, message: "This Userame is already taken" });
    }
    const user = await prisma.user.create({
      data: {
        name: body.name,
        username: body.username,
        email: body.email,
        gender: body.gender,
        password: body.password,
      },
    });
    if (!user) {
      return c.json({
        status: 401,
        message: "signup failed",
      });
    }
    const jwt = await sign({ id: user.id }, c.env.JWT_SECRET);
    return c.json({ status: 200, token: jwt, message: "Signup successful" });
  } catch (error) {
    return c.json({ status: 400, message: "Signup failed" });
  }
});

authRouter.post("/login", async (c) => {
  try {
    const body = await c.req.json();
    const emailRes = emailSchema.safeParse(body.email);
    const passwordRes = passwordSchema.safeParse(body.password);
    if (!emailRes.success || !passwordRes.success) {
      return c.json({
        status: 400,
        message: "Invalid email address and password",
      });
    }
    console.log(emailRes);
    const prisma = new PrismaClient({
      datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate());

    const user = await prisma.user.findFirst({
      where: {
        email: body.email,
        password: body.password,
      },
    });

    if (!user) {
      return c.json({
        status: 401,
        message: "User not found, Please check your email and password",
      });
    }
    const jwt = await sign({ id: user.id }, c.env.JWT_SECRET);
    return c.json({ status: 200, token: jwt, message: "Login successful" });
  } catch (error) {
    console.log(error);
    return c.json({ status: 400, message: "Login failed" });
  }
});

authRouter.get("/users-count", async (c) => {
  try {
    const prisma = new PrismaClient({
      datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate());
    const users = await prisma.user.count({});
    if (!users) {
      return c.json({ status: 400, message: "Failed to fetch users count" });
    }
    return c.json({ status: 200, message: users });
  } catch (error) {
    console.log(error);
  }
});

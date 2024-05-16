import { Hono } from "hono";
import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";
import { sign, verify } from "hono/jwt";
import { date, z } from "zod";
import bcrypt from "bcryptjs";
import { BalancedPool } from "undici";
export const userAuthRouter = new Hono<{
  Bindings: {
    DATABASE_URL: string;
    JWT_SECRET: string;
    CLOUDFLARE_IMGAES_ACCOUNT_ID: string;
    CLOUDFLARE_IMGAES_API_TOKEN: string;
    CLOUDFLARE_IMGAES_POST_URL: string;
  };
}>();
const fullNameSchema = z.string().max(20);
const usernameSchema = z.string().max(20);
const emailSchema = z.string().email();
const passwordSchema = z.string().min(6);
const dateSchema = z.string().length(2);
const monthSchema = z.string().length(2);
const yearSchema = z.string().length(4);

userAuthRouter.post("/username/check", async (c) => {
  try {
    const body = await c.req.json();
    const username = body.username;
    const prisma = new PrismaClient({
      datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate());
    const checkUsername = await prisma.user.findFirst({
      where: {
        username: username,
      },
    });
    if (checkUsername) {
      return c.json({ status: 101, message: "Username is already in use" });
    } else {
      return c.json({ status: 102, message: "" });
    }
  } catch (error) {
    console.log(error);
  }
});

userAuthRouter.post("/verify", async (c) => {
  try {
    const body = await c.req.json();
    const token = body.token;
    const userId = await verify(token, c.env.JWT_SECRET);
    const prisma = new PrismaClient({
      datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate());
    const person = await prisma.user.findFirst({
      where: { id: userId.id },
      select: {
        id: true,
        username: true,
      },
    });
    if (!person) {
      return c.json({ status: 401, message: "Not verified" });
    }
    return c.json({
      status: 200,
      data: person.username,
    });
  } catch (error) {
    return c.json({ status: 400 });
  }
});

userAuthRouter.post("/signup", async (c) => {
  try {
    const body = await c.req.json();
    const fullnameRes = fullNameSchema.safeParse(body.fullname);
    const usernameRes = usernameSchema.safeParse(body.username);
    const emailRes = emailSchema.safeParse(body.email);
    const passwordRes = passwordSchema.safeParse(body.password);
    const dateRes = dateSchema.safeParse(body.date);
    const monthRes = monthSchema.safeParse(body.month);
    const yearRes = yearSchema.safeParse(body.year);
    if (
      !fullnameRes.success ||
      !usernameRes.success ||
      !emailRes.success ||
      !passwordRes.success ||
      !dateRes.success ||
      !monthRes.success ||
      !yearRes
    ) {
      return c.json({ status: 400, message: "Invalid inputs" });
    }

    let birthday = `${body.year}/${body.month}/${body.date}`;

    const prisma = new PrismaClient({
      datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate());
    const email = await prisma.user.findFirst({
      where: {
        email: body.email,
      },
    });

    if (body.username === "unknown" || body.username === "anonymous") {
      return c.json({
        message: "This username can't be taken",
      });
    }
    const username = await prisma.user.findFirst({
      where: {
        username: body.username,
      },
    });
    if (username) {
      return c.json({ message: "Username is already in use" });
    }
    if (email) {
      return c.json({ message: "Email is already in use" });
    }

    const hashedPassword = await bcrypt.hash(body.password, 12);

    const newUser = await prisma.user.create({
      data: {
        fullname: body.fullname,
        username: body.username,
        email: body.email,
        password: hashedPassword,
        birthday: birthday,
      },
    });
    if (!newUser) {
      return c.json({
        message: "signup failed",
      });
    }
    const jwt = await sign({ id: newUser.id }, c.env.JWT_SECRET);
    return c.json({
      status: 200,
      username: newUser.username,
      token: jwt,
      message: "Signup successful",
    });
  } catch (error) {
    return c.json({ status: 400, message: "Signup failed" });
  }
});

userAuthRouter.post("/login", async (c) => {
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
    const prisma = new PrismaClient({
      datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate());

    const findUser = await prisma.user.findFirst({
      where: {
        email: body.email,
      },
    });

    if (!findUser) {
      return c.json({
        status: 401,
        message: "User not found, Please check your email",
      });
    }
    const isPasswordValid = await bcrypt.compare(
      body.password,
      findUser.password
    );

    if (!isPasswordValid) {
      return c.json({
        status: 401,
        message: "Invalid email or password",
      });
    }
    const jwt = await sign({ id: findUser.id }, c.env.JWT_SECRET);
    return c.json({
      status: 200,
      username: findUser.username,
      token: jwt,
      message: "Login successful",
    });
  } catch (error) {
    console.log(error);
    return c.json({ status: 400, message: "Login failed" });
  }
});

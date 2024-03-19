import { Hono } from "hono";
import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";
import { decode, jwt, sign, verify } from "hono/jwt";

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
    const email = await prisma.user.findUnique({
      where: {
        email: body.email,
      },
    });

    if (email) {
      return c.json({ status: 409, message: "email is already used" });
    }
    const username = await prisma.user.findUnique({
      where: {
        username: body.username,
      },
    });
    if (username) {
      return c.json({ status: 411, message: "userame is already taken" });
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
    const jwt = await sign({ id: user.id }, c.env.JWT_SECRET);
    console.log(user);
    return c.json({ status: 200, message: jwt });
  } catch (e) {
    console.log(e);
    c.status(403);
    return c.json({ message: "user signup failed" });
  }
});

userRouter.post("/login", async (c) => {
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
      return c.json({
        status: 403,
        message: "user not found or authentication error",
      });
    }
    c.status(200);
    const jwt = await sign({ id: user.id }, c.env.JWT_SECRET);
    console.log(user);
    return c.json({ status: 200, message: jwt });
  } catch (e) {
    console.log(e);
  }
});

userRouter.post("/userdata", async (c) => {
  const body = await c.req.json();
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());

  const token = body.token;
  const userId = await verify(token, c.env.JWT_SECRET);

  try {
    const user = await prisma.user.findFirst({
      where: { id: userId.id },
      select: {
        id: true,
        name: true,
        email: true,
        username: true,
        gender: true,
        bio: true,
        posts: true,
      },
    });

    if (!user) {
      return c.json({ status: 404, message: "user not found" });
    }

    return c.json({ status: 200, message: user });
  } catch (e) {
    return c.text("error while fetching data");
  }
});

userRouter.post("/bioupdate", async (c) => {
  const body = await c.req.json();
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());

  const token = body.token;
  const userId = await verify(token, c.env.JWT_SECRET);

  try {
    const user = await prisma.user.update({
      where: { id: userId.id },
      data: { bio: body.bio },
    });

    if (!user) {
      return c.json({ status: 404, message: "user not found" });
    }

    return c.json({ status: 200, message: "bio updated successfully" });
  } catch (e) {
    console.log(e);
    return c.text("error while updating bio");
  }
});

userRouter.post("/post", async (c) => {
  const body = await c.req.json();
  const formData = await c.req.formData();
  const file = formData.get("image");
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());
  console.log(file);
  const token = body.token;
  const userId = await verify(token, c.env.JWT_SECRET);
  try {
    const post = await prisma.post.create({
      data: {
        content: body.post,
        creator: { connect: { id: userId.id } },
      },
    });

    if (!post) {
      return c.json({ status: 403, message: "failed to create new post" });
    }

    return c.json({ status: 200, message: "post created successfully" });
  } catch (error) {
    console.error(error);
    return c.json({ status: 500, message: "Internal server error" });
  }
});

const accountId = "35c5d12b3a2b0aaa7a3bf9a1c579fed5";
const apiToken = "L0efpQDU91oUs9S9D1FsPRoejzx98kfRxnuyN3CM";
const url = `https://api.cloudflare.com/client/v4/accounts/${accountId}/images/v1`;

userRouter.post("/image", async (c) => {
  try {
    const formData = await c.req.formData();
    const file = formData.get("image");
    if (!file) {
      return c.json({ status: 400, message: "No image provided" }, 400);
    }
    const data = new FormData();
    const blob = new Blob([file]);
    data.append("file", blob, "cloudflare_image");

    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiToken}`,
      },
      body: data,
    });

    console.log(await response.json());

    return c.json({ status: 200 });
  } catch (e) {
    console.log(e);
    return c.json({ status: 404 });
  }
});

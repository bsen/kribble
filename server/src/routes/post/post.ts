import { Hono } from "hono";
import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";
import { verify } from "hono/jwt";

export const postRouter = new Hono<{
  Bindings: {
    DATABASE_URL: string;
    JWT_SECRET: string;
    CLOUDFLARE_IMGAES_ACCOUNT_ID: string;
    CLOUDFLARE_IMGAES_API_TOKEN: string;
    CLOUDFLARE_IMGAES_POST_URL: string;
  };
}>();

postRouter.post("/data", async (c) => {
  try {
    const body = await c.req.json();
    const token = body.token;
    const postId = body.postId;
    const prisma = new PrismaClient({
      datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate());
    const userId = await verify(token, c.env.JWT_SECRET);
    const findUser = await prisma.user.findUnique({ where: { id: userId.id } });
    if (!findUser) {
      return c.json({ status: 401, message: "User not authenticated" });
    }
    const findPost = await prisma.post.findUnique({
      where: {
        id: postId,
      },
      include: {
        creator: {
          select: {
            id: true,
            username: true,
            image: true,
          },
        },
      },
    });
    if (!findPost) {
      return c.json({ status: 401, message: "Post not found" });
    }
    return c.json({ status: 200, message: "Post found", data: findPost });
  } catch (error) {
    console.log(error);
  }
});

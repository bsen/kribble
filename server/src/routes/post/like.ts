import { Hono } from "hono";
import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";
import { verify } from "hono/jwt";

export const postLikeRouter = new Hono<{
  Bindings: {
    DATABASE_URL: string;
    JWT_SECRET: string;
    CLOUDFLARE_IMGAES_ACCOUNT_ID: string;
    CLOUDFLARE_IMGAES_API_TOKEN: string;
    CLOUDFLARE_IMGAES_POST_URL: string;
  };
}>();

postLikeRouter.post("/like/unlike", async (c) => {
  try {
    const body = await c.req.json();
    const token = body.token;
    const postId = body.postId;
    const prisma = new PrismaClient({
      datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate());
    const userId = await verify(token, c.env.JWT_SECRET);
    const findUser = await prisma.user.findUnique({
      where: {
        id: userId.id,
      },
    });
    if (!findUser) {
      return c.json({ status: 401, message: "User not authenticated" });
    }

    const findLike = await prisma.like.findUnique({
      where: {
        userId_postId: {
          userId: findUser.id,
          postId: postId,
        },
      },
    });
    if (!findLike) {
      const createLike = await prisma.like.create({
        data: {
          userId: findUser.id,
          postId: postId,
        },
      });

      const incLikes = await prisma.post.update({
        where: {
          id: postId,
        },
        data: {
          likesCount: {
            increment: 1,
          },
        },
      });

      if (!createLike || !incLikes) {
        return c.json({ status: 400, message: "Liking post failed" });
      }
      return c.json({
        status: 200,
        message: "User liked the post successfully",
      });
    } else {
      const deleteLike = await prisma.like.delete({
        where: {
          userId_postId: {
            userId: findUser.id,
            postId: postId,
          },
        },
      });
      const decLikes = await prisma.post.update({
        where: {
          id: postId,
        },
        data: {
          likesCount: {
            decrement: 1,
          },
        },
      });

      if (!deleteLike || decLikes) {
        return c.json({ status: 400, message: "Liking post failed" });
      }
      return c.json({
        status: 200,
        message: "User unliked the post successfully",
      });
    }
  } catch (error) {
    console.log(error);
    return c.json({ status: 500, error: "Something went wrong" });
  }
});

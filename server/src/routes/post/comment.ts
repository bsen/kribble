import { Hono } from "hono";
import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";
import { verify } from "hono/jwt";
import { string } from "zod";

export const postCommentRouter = new Hono<{
  Bindings: {
    DATABASE_URL: string;
    JWT_SECRET: string;
    CLOUDFLARE_IMGAES_ACCOUNT_ID: string;
    CLOUDFLARE_IMGAES_API_TOKEN: string;
    CLOUDFLARE_IMGAES_POST_URL: string;
  };
}>();
postCommentRouter.post("/all/comments", async (c) => {
  try {
    const body = await c.req.json();
    const token = body.token;
    const postId = body.postId;
    const cursor = body.cursor || null;
    const take = 10;

    const prisma = new PrismaClient({
      datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate());

    const userId = await verify(token, c.env.JWT_SECRET);
    const findUser = await prisma.user.findUnique({ where: { id: userId.id } });

    if (!findUser) {
      return c.json({ status: 401, message: "User not authenticated" });
    }

    const findComments = await prisma.comment.findMany({
      where: {
        postId: postId,
      },
      include: {
        creator: {
          select: {
            username: true,
            name: true,
            image: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      cursor: cursor ? { id: cursor } : undefined,
      take: take + 1,
    });

    const hasMore = findComments.length > take;
    const comments = hasMore ? findComments.slice(0, -1) : findComments;
    const nextCursor = hasMore
      ? findComments[findComments.length - 1].id
      : null;

    const commentsWithAnonymity = comments.map((comment) => {
      const creatorDetails = comment.anonymity
        ? {
            username: "unknown",
            name: "unknown",
            image: null,
          }
        : {
            username: comment.creator.username,
            name: comment.creator.name,
            image: comment.creator.image,
          };

      return {
        ...comment,
        creator: {
          ...comment.creator,
          ...creatorDetails,
        },
      };
    });

    return c.json({ status: 200, data: commentsWithAnonymity, nextCursor });
  } catch (error) {
    console.log(error);
    return c.json({ status: 500, message: "Internal Server Error" });
  }
});

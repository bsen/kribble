import { Hono } from "hono";
import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";
import { verify } from "hono/jwt";
import { string } from "zod";

export const userCommentRouter = new Hono<{
  Bindings: {
    DATABASE_URL: string;
    JWT_SECRET: string;
    CLOUDFLARE_IMGAES_ACCOUNT_ID: string;
    CLOUDFLARE_IMGAES_API_TOKEN: string;
    CLOUDFLARE_IMGAES_POST_URL: string;
  };
}>();

userCommentRouter.post("/all/comments", async (c) => {
  const body = await c.req.json();
  const token = body.token;
  const cursor = body.cursor || null;
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());
  const userId = await verify(token, c.env.JWT_SECRET);
  const findUser = await prisma.user.findUnique({ where: { id: userId.id } });
  if (!findUser) {
    return c.json({ status: 400, message: "User not authenticated" });
  }

  const take = 15;
  const findComments = await prisma.comment.findMany({
    where: {
      creatorId: findUser.id,
    },
    orderBy: {
      createdAt: "desc",
    },
    cursor: cursor ? { id: cursor } : undefined,
    take: take + 1,
  });

  const hasMore = findComments.length > take;
  const comments = hasMore ? findComments.slice(0, -1) : findComments;
  const nextCursor = hasMore ? findComments[findComments.length - 1].id : null;

  if (!findComments) {
    return c.json({ status: 404, message: "Comments not found" });
  }
  return c.json({ status: 200, comments: comments, nextCursor });
});

userCommentRouter.post("/create", async (c) => {
  try {
    const body = await c.req.json();
    const token = body.token;
    const comment = body.comment;
    const postId = body.postId;
    const anonymity = body.anonymity;
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
      return c.json({ status: 401, message: "Authentication error" });
    }

    const createComment = await prisma.comment.create({
      data: {
        content: comment,
        creator: { connect: { id: findUser.id } },
        post: { connect: { id: postId } },
        anonymity: anonymity,
      },
    });

    const incCount = await prisma.post.update({
      where: {
        id: postId,
      },
      data: {
        commentsCount: {
          increment: 1,
        },
      },
    });
    const updatePoints = await prisma.user.update({
      where: { id: userId.id },
      data: {
        weeklyPoints: {
          increment: 3,
        },
        totalPoints: {
          increment: 3,
        },
      },
    });
    if (!createComment || !incCount || !updatePoints) {
      return c.json({ status: 400, message: "Failed to create comment" });
    }
    return c.json({ satus: 200, message: "Commnet created successfully" });
  } catch (error) {
    console.log(error);
  }
});

userCommentRouter.post("/delete", async (c) => {
  try {
    const body = await c.req.json();
    const token = body.token;
    const commentId = body.deleteCommentId;
    const postId = body.deleteCommentPostId;
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
      return c.json({ status: 400, message: "User not authenticated" });
    }

    const decCount = await prisma.post.update({
      where: {
        id: postId,
      },
      data: {
        commentsCount: {
          decrement: 1,
        },
      },
    });
    const updatePoints = await prisma.user.update({
      where: { id: userId.id },
      data: {
        weeklyPoints: {
          decrement: 3,
        },
        totalPoints: {
          decrement: 3,
        },
      },
    });

    const deleteComment = await prisma.comment.delete({
      where: {
        creatorId: findUser.id,
        id: commentId,
      },
    });

    if (!deleteComment || !decCount || !updatePoints) {
      return c.json({ status: 400, message: "Comment count decrement failed" });
    }
    return c.json({ status: 200, message: "Comment Deleted successfully" });
  } catch (error) {
    console.log(error);
  }
});

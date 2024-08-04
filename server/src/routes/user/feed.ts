import express from "express";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();
const userFeedRouter = express.Router();

userFeedRouter.post("/posts/home", async (req, res) => {
  try {
    const token = req.body.token;
    const cursor = req.body.cursor ? new Date(req.body.cursor) : null;

    const userId = jwt.verify(token, process.env.JWT_SECRET as string) as {
      id: string;
    };
    if (!userId) {
      return res.json({ status: 901, message: "Invalid token" });
    }

    const findUser = await prisma.user.findUnique({
      where: { id: userId.id },
      include: {
        following: {
          select: {
            followingId: true,
          },
        },
      },
    });

    if (!findUser) {
      return res.json({ status: 401, message: "Unverified User" });
    }

    const take = 20;
    let posts = [];
    let nextCursor = null;

    if (findUser.following.length > 10) {
      const followingIds = findUser.following.map((f) => f.followingId);
      const followingPosts = await prisma.post.findMany({
        where: {
          status: true,
          creatorId: { in: followingIds },
          ...(cursor && { createdAt: { lt: cursor } }),
        },
        select: {
          id: true,
          caption: true,
          image: true,
          video: true,
          likesCount: true,
          creator: {
            select: {
              username: true,
            },
          },
          createdAt: true,
          commentsCount: true,
        },
        orderBy: {
          createdAt: "desc",
        },
        take: take + 1,
      });

      posts = followingPosts.slice(0, take);
      nextCursor =
        followingPosts.length > take
          ? followingPosts[take - 1].createdAt.toISOString()
          : null;

      if (posts.length < take) {
        const remainingCount = take - posts.length;
        const existingPostIds = posts.map((p) => p.id);

        const randomPosts = await prisma.post.findMany({
          where: {
            status: true,
            id: { notIn: existingPostIds },
            creatorId: { notIn: followingIds },
            ...(cursor && { createdAt: { lt: cursor } }),
          },
          select: {
            id: true,
            caption: true,
            image: true,
            video: true,
            likesCount: true,
            creator: {
              select: {
                username: true,
              },
            },
            createdAt: true,
            commentsCount: true,
          },
          orderBy: {
            createdAt: "desc",
          },
          take: remainingCount + 1,
        });

        posts = [...posts, ...randomPosts.slice(0, remainingCount)];
        if (randomPosts.length > remainingCount) {
          nextCursor = randomPosts[remainingCount - 1].createdAt.toISOString();
        }
      }
    } else {
      posts = await prisma.post.findMany({
        where: {
          status: true,
          ...(cursor && { createdAt: { lt: cursor } }),
        },
        select: {
          id: true,
          caption: true,
          image: true,
          video: true,
          likesCount: true,
          creator: {
            select: {
              username: true,
            },
          },
          createdAt: true,
          commentsCount: true,
        },
        orderBy: {
          createdAt: "desc",
        },
        take: take + 1,
      });

      nextCursor =
        posts.length > take ? posts[take - 1].createdAt.toISOString() : null;
      posts = posts.slice(0, take);
    }

    const postsWithLikedState = await Promise.all(
      posts.map(async (post) => {
        const isLiked = await prisma.postLike.findUnique({
          where: {
            userId_postId: {
              userId: findUser.id,
              postId: post.id,
            },
          },
        });
        return {
          ...post,
          isLiked: !!isLiked,
          createdAt: post.createdAt.toISOString(),
        };
      })
    );

    return res.json({ status: 200, data: postsWithLikedState, nextCursor });
  } catch (error) {
    console.error("Error in userFeedRouter:", error);
    return res.json({ status: 400, message: "An error occurred" });
  }
});

export default userFeedRouter;

import { Hono } from "hono";
import { PrismaClient, Prisma } from "@prisma/client/edge";
import { verify } from "hono/jwt";

export const userFeedRouter = new Hono<{
  Bindings: {
    DATABASE_URL: string;
    JWT_SECRET: string;
  };
}>();

userFeedRouter.post("/posts", async (c) => {
  try {
    const body = await c.req.json();
    const token = body.token;
    const userId = await verify(token, c.env.JWT_SECRET);

    const prisma = new PrismaClient({
      datasourceUrl: c.env.DATABASE_URL,
    });

    const findUser = await prisma.user.findUnique({ where: { id: userId.id } });

    if (!findUser) {
      return c.json({ status: 401, message: "Unauthorized Main User" });
    }

    const cursor = body.cursor || null;
    const take = 10;
    const allPosts = await prisma.post.findMany({
      select: {
        id: true,
        image: true,
        content: true,
        likesCount: true,
        anonymity: true,
        task: true,
        taggedUser: {
          select: {
            id: true,
            username: true,
            image: true,
          },
        },
        creator: {
          select: {
            id: true,
            username: true,
            image: true,
          },
        },
        community: {
          select: {
            name: true,
            image: true,
          },
        },
        createdAt: true,
        commentsCount: true,
      },
      orderBy: {
        createdAt: "desc",
      },
      cursor: cursor ? { id: cursor } : undefined,
      take: take + 1,
    });

    const hasMore = allPosts.length > take;
    const posts = hasMore ? allPosts.slice(0, -1) : allPosts;
    const nextCursor = hasMore ? allPosts[allPosts.length - 1].id : null;
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
        const creatorDetails = post.anonymity
          ? {
              username: "unknown",
              image: null,
            }
          : {
              username: post.creator.username,
              image: post.creator.image,
            };
        return {
          ...post,
          creator: {
            ...post.creator,
            ...creatorDetails,
          },
          isLiked: isLiked ? true : false,
        };
      })
    );
    return c.json({ status: 200, data: postsWithLikedState, nextCursor });
  } catch (error) {
    console.log(error);
    return c.json({ status: 400 });
  }
});

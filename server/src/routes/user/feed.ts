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

    type PostWithDetails = Prisma.PostGetPayload<{
      include: {
        creator: {
          select: {
            id: true;
            username: true;
            image: true;
            college: true;
          };
        };
      };
    }>;

    const uniqueById = (posts: PostWithDetails[]): PostWithDetails[] => {
      const uniquePosts = new Map<string, PostWithDetails>();
      posts.forEach((post) => uniquePosts.set(post.id, post));
      return Array.from(uniquePosts.values());
    };

    const sameColegePostsWithUser = await prisma.post.findMany({
      where: {
        creator: {
          college: findUser.college,
        },
      },
      include: {
        creator: {
          select: {
            id: true,
            username: true,
            image: true,
            college: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      cursor: cursor ? { id: cursor } : undefined,
      take: take,
    });

    const userPosts: PostWithDetails[] = await prisma.post.findMany({
      where: {
        creatorId: findUser.id,
      },
      include: {
        creator: {
          select: {
            id: true,
            username: true,
            image: true,
            college: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: take,
    });

    let allPosts: PostWithDetails[] = [
      ...sameColegePostsWithUser,
      ...userPosts,
    ];
    allPosts = uniqueById(allPosts);

    allPosts.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    const start = cursor
      ? allPosts.findIndex((post) => post.id === cursor) + 1
      : 0;
    const paginatedPosts = allPosts.slice(start, start + take);
    const nextCursor =
      paginatedPosts.length === take
        ? paginatedPosts[paginatedPosts.length - 1].id
        : null;

    const postsWithLikedState = await Promise.all(
      paginatedPosts.map(async (post) => {
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

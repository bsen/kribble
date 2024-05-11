import { Hono } from "hono";
import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";
import { verify } from "hono/jwt";

export const userFollowRouter = new Hono<{
  Bindings: {
    DATABASE_URL: string;
    JWT_SECRET: string;
    CLOUDFLARE_IMGAES_ACCOUNT_ID: string;
    CLOUDFLARE_IMGAES_API_TOKEN: string;
    CLOUDFLARE_IMGAES_POST_URL: string;
  };
}>();
userFollowRouter.post("/follow/unfollow", async (c) => {
  try {
    const body = await c.req.json();
    const token = body.token;
    const followingUser = body.username;
    const prisma = new PrismaClient({
      datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate());

    const userId = await verify(token, c.env.JWT_SECRET);

    const currentUser = await prisma.user.findUnique({
      where: {
        id: userId.id,
      },
    });
    const otherUser = await prisma.user.findUnique({
      where: {
        username: followingUser,
      },
    });

    if (!otherUser) {
      return c.json({ status: 404, error: "User not found" });
    }
    console.log(currentUser, otherUser);
    const isFollowing = await prisma.following.findUnique({
      where: {
        followerId_followingId: {
          followerId: currentUser!.id,
          followingId: otherUser.id,
        },
      },
    });
    if (!isFollowing) {
      await prisma.following.create({
        data: {
          followerId: currentUser!.id,
          followingId: otherUser.id,
        },
      });
      await prisma.user.update({
        where: {
          id: currentUser!.id,
        },
        data: {
          followingCount: {
            increment: 1,
          },
        },
      });
      await prisma.user.update({
        where: {
          id: otherUser!.id,
        },
        data: {
          followersCount: { increment: 1 },
        },
      });
      return c.json({ status: 200, message: "User followed successfully" });
    } else {
      await prisma.following.delete({
        where: {
          followerId_followingId: {
            followerId: currentUser!.id,
            followingId: otherUser.id,
          },
        },
      });
      await prisma.user.update({
        where: {
          id: currentUser!.id,
        },
        data: {
          followingCount: {
            decrement: 1,
          },
        },
      });
      await prisma.user.update({
        where: {
          id: otherUser!.id,
        },
        data: {
          followersCount: { decrement: 1 },
        },
      });
      return c.json({ status: 200, message: "User unfollowed successfully" });
    }
  } catch (error) {
    console.error(error);
    return c.json({ status: 500, error: "Something went wrong" });
  }
});

userFollowRouter.post("/following/list", async (c) => {
  try {
    const body = await c.req.json();
    const token = body.token;
    const username = body.username;
    const prisma = new PrismaClient({
      datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate());
    const userId = await verify(token, c.env.JWT_SECRET);
    if (!userId) {
      return c.json({ status: 401, message: "Unauthorized" });
    }
    const cursor = body.cursor || null;
    const take = 30;
    const profileUser = await prisma.user.findUnique({
      where: {
        username: username,
      },
    });
    if (!profileUser) {
      return c.json({ status: 401, message: "No user found" });
    }
    const allFollowing = await prisma.following.findMany({
      where: {
        followerId: profileUser.id,
      },
      select: {
        id: true,
        following: {
          select: {
            id: true,
            name: true,
            username: true,
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
    const hasMore = allFollowing.length > take;
    const following = hasMore ? allFollowing.slice(0, -1) : allFollowing;
    const nextCursor = hasMore
      ? allFollowing[allFollowing.length - 1].id
      : null;
    return c.json({ status: 200, data: following, nextCursor });
  } catch (error) {
    console.log(error);
    return c.json({ status: 400 });
  }
});

userFollowRouter.post("/followers/list", async (c) => {
  try {
    const body = await c.req.json();
    const token = body.token;
    const username = body.username;
    const prisma = new PrismaClient({
      datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate());
    const userId = await verify(token, c.env.JWT_SECRET);
    if (!userId) {
      return c.json({ status: 401, message: "Unauthorized" });
    }
    const cursor = body.cursor || null;
    const take = 30;
    const profileUser = await prisma.user.findUnique({
      where: {
        username: username,
      },
    });
    if (!profileUser) {
      return c.json({ status: 401, message: "No user found" });
    }
    const allFollowers = await prisma.following.findMany({
      where: {
        followingId: profileUser.id,
      },
      select: {
        id: true,
        follower: {
          select: {
            id: true,
            name: true,
            username: true,
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
    const hasMore = allFollowers.length > take;
    const followers = hasMore ? allFollowers.slice(0, -1) : allFollowers;
    const nextCursor = hasMore
      ? allFollowers[allFollowers.length - 1].id
      : null;
    return c.json({ status: 200, data: followers, nextCursor });
  } catch (error) {
    console.log(error);
    return c.json({ status: 400 });
  }
});

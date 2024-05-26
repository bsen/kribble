import { Hono } from "hono";
import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";

export const adminRouter = new Hono<{
  Bindings: {
    DATABASE_URL: string;
    JWT_SECRET: string;
    ADMINTOKEN: string;
  };
}>();

adminRouter.post("/delete-account", async (c) => {
  const body = await c.req.json();
  const adminToken = body.adminToken;
  const userId = body.userId;
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());
  if (typeof adminToken !== "string" || typeof userId !== "string") {
    return c.json({ status: 400, message: "Invalid request" });
  }

  if (c.env.ADMINTOKEN !== adminToken) {
    return c.json({ status: 401, message: "Unauthorized" });
  }

  const findUser = await prisma.user.findUnique({
    where: {
      id: userId,
    },
  });

  if (!findUser) {
    return c.json({ status: 404, message: "User not found" });
  }
  try {
    const deleteUser = async (userId: string) => {
      await prisma.match.deleteMany({
        where: {
          initiatorId: userId,
        },
      });

      await prisma.match.deleteMany({
        where: {
          matchedUserId: userId,
        },
      });
      await prisma.following.deleteMany({
        where: {
          OR: [{ followerId: userId }, { followingId: userId }],
        },
      });

      const userPosts = await prisma.post.findMany({
        where: {
          creatorId: userId,
        },
      });

      for (const post of userPosts) {
        await prisma.postLike.deleteMany({
          where: {
            postId: post.id,
          },
        });
        await prisma.comment.deleteMany({
          where: {
            postId: post.id,
          },
        });
        await prisma.notification.deleteMany({
          where: {
            postId: post.id,
          },
        });
      }
      await prisma.post.deleteMany({
        where: {
          creatorId: userId,
        },
      });

      await prisma.comment.deleteMany({
        where: {
          creatorId: userId,
        },
      });

      await prisma.postLike.deleteMany({
        where: {
          userId: userId,
        },
      });

      await prisma.communityMembership.deleteMany({
        where: {
          userId: userId,
        },
      });

      await prisma.notification.deleteMany({
        where: {
          userId: userId,
        },
      });

      await prisma.user.delete({
        where: {
          id: userId,
        },
      });

      return { status: 200, message: "Account deleted successfully" };
    };

    const result = await deleteUser(userId);
    return c.json(result);
  } catch (error) {
    console.error(error);
    return c.json({ status: 500, message: "Internal server error" });
  }
});

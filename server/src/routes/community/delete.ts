import { Hono } from "hono";
import { PrismaClient } from "@prisma/client/edge";
import { verify } from "hono/jwt";
import { withAccelerate } from "@prisma/extension-accelerate";

export const communityDeleteRouter = new Hono<{
  Bindings: {
    DATABASE_URL: string;
    JWT_SECRET: string;
    CLOUDFLARE_IMAGES_ACCOUNT_ID: string;
    CLOUDFLARE_IMAGES_API_TOKEN: string;
    CLOUDFLARE_IMAGES_POST_URL: string;
  };
}>();

communityDeleteRouter.post("/delete/community", async (c) => {
  try {
    const body = await c.req.json();
    const token = body.token;
    const communityId = body.communityId;

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
      return c.json({ status: 401, message: "Unauthorized" });
    }

    await prisma.$transaction(async (tx) => {
      const deleteCommunityPosts = await tx.post.findMany({
        where: {
          communityId: communityId,
        },
        select: {
          id: true,
        },
      });

      await tx.postLike.deleteMany({
        where: {
          postId: {
            in: deleteCommunityPosts.map((post) => post.id),
          },
        },
      });

      await tx.comment.deleteMany({
        where: {
          postId: {
            in: deleteCommunityPosts.map((post) => post.id),
          },
        },
      });

      await tx.postTagging.deleteMany({
        where: {
          postId: {
            in: deleteCommunityPosts.map((post) => post.id),
          },
        },
      });

      await tx.post.deleteMany({
        where: {
          communityId: communityId,
        },
      });

      await tx.communityMembership.deleteMany({
        where: {
          communityId: communityId,
        },
      });

      await tx.community.delete({
        where: {
          id: communityId,
          creatorId: findUser.id,
        },
      });
    });

    return c.json({ status: 200, message: "Community deletion successful" });
  } catch (error) {
    return c.json({ status: 500, message: "Network error" });
  }
});

import { Hono } from "hono";
import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";
import { sign, verify } from "hono/jwt";
import { date, string, z } from "zod";
export const communityDeleteRouter = new Hono<{
  Bindings: {
    DATABASE_URL: string;
    JWT_SECRET: string;
    CLOUDFLARE_IMGAES_ACCOUNT_ID: string;
    CLOUDFLARE_IMGAES_API_TOKEN: string;
    CLOUDFLARE_IMGAES_POST_URL: string;
  };
}>();

communityDeleteRouter.post("/delete", async (c) => {
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
    const deleteCommunityPosts = await prisma.post.deleteMany({
      where: {
        communityId: communityId,
      },
    });
    const deleteAssociatedMemberships =
      await prisma.communityMembership.deleteMany({
        where: {
          communityId: communityId,
        },
      });
    const deleteCommunity = await prisma.community.delete({
      where: {
        id: communityId,
        creatorId: findUser.id,
      },
    });

    if (
      !deleteCommunityPosts ||
      !deleteAssociatedMemberships ||
      !deleteCommunity
    ) {
      return c.json({ status: 400, message: "Community deletion failed" });
    }
    return c.json({ status: 200, message: "Community deletion successful" });
  } catch (error) {
    return c.json({ status: 500, message: "Network error" });
  }
});

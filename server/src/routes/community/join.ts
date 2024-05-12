import { Hono } from "hono";
import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";
import { sign, verify } from "hono/jwt";
import { date, string, z } from "zod";
export const communityJoinRouter = new Hono<{
  Bindings: {
    DATABASE_URL: string;
    JWT_SECRET: string;
    CLOUDFLARE_IMGAES_ACCOUNT_ID: string;
    CLOUDFLARE_IMGAES_API_TOKEN: string;
    CLOUDFLARE_IMGAES_POST_URL: string;
  };
}>();

communityJoinRouter.post("/join/leave", async (c) => {
  try {
    const body = await c.req.json();
    const token = body.token;
    const communityName = body.name;

    const prisma = new PrismaClient({
      datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate());

    const userId = await verify(token, c.env.JWT_SECRET);
    const currentUser = await prisma.user.findUnique({
      where: {
        id: userId.id,
      },
    });

    const community = await prisma.community.findFirst({
      where: {
        name: communityName,
      },
    });

    if (!community) {
      return c.json({ status: 404, error: "Community not found" });
    }

    const isMember = await prisma.communityMembership.findUnique({
      where: {
        userId_communityId: {
          userId: currentUser!.id,
          communityId: community.id,
        },
      },
    });
    if (!isMember) {
      await prisma.communityMembership.create({
        data: {
          user: { connect: { id: currentUser!.id } },
          community: { connect: { id: community.id } },
        },
      });
      await prisma.community.update({
        where: { id: community.id },
        data: { membersCount: { increment: 1 } },
      });

      return c.json({ status: 200, message: "Joined community successfully" });
    } else {
      await prisma.communityMembership.delete({
        where: {
          userId_communityId: {
            userId: currentUser!.id,
            communityId: community.id,
          },
        },
      });

      await prisma.community.update({
        where: { id: community.id },
        data: { membersCount: { decrement: 1 } },
      });

      return c.json({ status: 200, message: "Left community successfully" });
    }
  } catch (error) {
    console.error(error);
    return c.json({ status: 500, error: "Something went wrong" });
  }
});

import { Hono } from "hono";
import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";
import { sign, verify } from "hono/jwt";
import { date, string, z } from "zod";
export const communityCreateRouter = new Hono<{
  Bindings: {
    DATABASE_URL: string;
    JWT_SECRET: string;
    CLOUDFLARE_IMGAES_ACCOUNT_ID: string;
    CLOUDFLARE_IMGAES_API_TOKEN: string;
    CLOUDFLARE_IMGAES_POST_URL: string;
  };
}>();

communityCreateRouter.post("/name/check", async (c) => {
  try {
    const body = await c.req.json();
    const name = body.name;
    const prisma = new PrismaClient({
      datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate());
    const checkName = await prisma.community.findFirst({
      where: {
        name: name,
      },
    });
    if (checkName) {
      return c.json({ status: 101 });
    } else {
      return c.json({ status: 102 });
    }
  } catch (error) {
    console.log(error);
  }
});

communityCreateRouter.post("/create", async (c) => {
  try {
    const body = await c.req.json();
    const { token, name, description } = body;
    if (!token || !name || !description) {
      return c.json({ status: 400, message: "Invalid data" });
    }
    const userId = await verify(token, c.env.JWT_SECRET);
    const prisma = new PrismaClient({
      datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate());

    const findUser = await prisma.user.findUnique({
      where: {
        id: userId.id,
      },
    });
    if (!findUser) {
      return c.json({ status: 400, message: "Authentication error" });
    }

    const checkName = await prisma.community.findFirst({
      where: {
        name: name,
      },
    });
    if (checkName) {
      return c.json({
        status: 400,
        message: "Community name is already taken",
      });
    }
    const createCommunity = await prisma.community.create({
      data: {
        creator: { connect: { id: findUser.id } },
        name: name,
        description: description,
      },
    });

    if (!createCommunity) {
      return c.json({
        status: 400,
        message: "Failed to create a new community",
      });
    }
    const communityMembership = await prisma.communityMembership.create({
      data: {
        userId: findUser.id,
        communityId: createCommunity.id,
      },
    });
    const membersCountIncrease = await prisma.community.update({
      where: {
        id: createCommunity.id,
      },
      data: {
        membersCount: { increment: 1 },
      },
    });
    if (!communityMembership || !membersCountIncrease) {
      return c.json({
        status: 400,
        message: "Server error to add the creator in community",
      });
    }
    return c.json({
      status: 200,
      message: "Successfully created a new community",
    });
  } catch (error) {
    console.log(error);
  }
});

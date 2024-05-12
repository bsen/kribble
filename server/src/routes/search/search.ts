import { Hono } from "hono";
import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";
import { sign, verify } from "hono/jwt";
import { date, string, z } from "zod";
export const searchRouter = new Hono<{
  Bindings: {
    DATABASE_URL: string;
    JWT_SECRET: string;
    CLOUDFLARE_IMGAES_ACCOUNT_ID: string;
    CLOUDFLARE_IMGAES_API_TOKEN: string;
    CLOUDFLARE_IMGAES_POST_URL: string;
  };
}>();

searchRouter.post("/data", async (c) => {
  try {
    const body = await c.req.json();
    const token = body.token;
    const searchingText = body.search;
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
    const searchUsers = await prisma.user.findMany({
      where: {
        OR: [
          {
            name: {
              contains: searchingText,
            },
          },
          {
            username: {
              contains: searchingText,
            },
          },
        ],
      },
      select: {
        username: true,
        name: true,
        image: true,
      },
      take: 15,
    });
    const searchCommunity = await prisma.community.findMany({
      where: {
        name: {
          contains: searchingText,
        },
      },
      select: {
        name: true,
        image: true,
      },
      take: 15,
    });

    if (!searchUsers && !searchCommunity) {
      return c.json({ status: 404, message: "No search found" });
    }
    return c.json({
      status: 200,
      message: "User or Community found",
      users: searchUsers,
      communities: searchCommunity,
    });
  } catch (error) {
    console.log(error);
  }
});

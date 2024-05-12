import { Hono } from "hono";
import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";
import { sign, verify } from "hono/jwt";
import { date, string, z } from "zod";
export const communitiesRouter = new Hono<{
  Bindings: {
    DATABASE_URL: string;
    JWT_SECRET: string;
    CLOUDFLARE_IMGAES_ACCOUNT_ID: string;
    CLOUDFLARE_IMGAES_API_TOKEN: string;
    CLOUDFLARE_IMGAES_POST_URL: string;
  };
}>();

communitiesRouter.post("/all/communities", async (c) => {
  try {
    const body = await c.req.json();
    const prisma = new PrismaClient({
      datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate());
    const token = body.token;
    const userId = await verify(token, c.env.JWT_SECRET);
    const findUser = await prisma.user.findUnique({ where: { id: userId.id } });
    if (!findUser) {
      return c.json({ status: 401, message: "Unauthorized" });
    }
    const cursor = body.cursor || null;
    const take = 15;
    const allCommunities = await prisma.community.findMany({
      select: {
        id: true,
        image: true,
        name: true,
        description: true,
        membersCount: true,
        postsCount: true,
      },
      orderBy: {
        membersCount: "asc",
      },
      cursor: cursor ? { id: cursor } : undefined,
      take: take + 1,
    });

    const hasMore = allCommunities.length > take;
    const communities = hasMore ? allCommunities.slice(0, -1) : allCommunities;
    const nextCursor = hasMore
      ? allCommunities[allCommunities.length - 1].id
      : null;

    return c.json({ status: 200, data: communities, nextCursor });
  } catch (error) {
    console.log(error);
    return c.json({ status: 400 });
  }
});

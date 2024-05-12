import { Hono } from "hono";
import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";
import { verify } from "hono/jwt";

export const userCommunitiesRouter = new Hono<{
  Bindings: {
    DATABASE_URL: string;
    JWT_SECRET: string;
    CLOUDFLARE_IMGAES_ACCOUNT_ID: string;
    CLOUDFLARE_IMGAES_API_TOKEN: string;
    CLOUDFLARE_IMGAES_POST_URL: string;
  };
}>();

userCommunitiesRouter.post("/all/communities", async (c) => {
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
      where: { creatorId: findUser.id },
      select: {
        id: true,
        image: true,
        name: true,
        description: true,
        membersCount: true,
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
userCommunitiesRouter.post("/all/joined/communities", async (c) => {
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

    const joinedCommunities = await prisma.communityMembership.findMany({
      where: { userId: findUser.id },
      select: {
        community: {
          select: {
            id: true,
            image: true,
            name: true,
            description: true,
            membersCount: true,
          },
        },
        userId: true,
        communityId: true,
      },
      orderBy: {
        community: {
          membersCount: "asc",
        },
      },
      cursor: cursor
        ? {
            userId_communityId: {
              userId: findUser.id,
              communityId: cursor,
            },
          }
        : undefined,
      take: take + 1,
    });

    const hasMore = joinedCommunities.length > take;
    const communities = hasMore
      ? joinedCommunities.map((membership) => membership.community).slice(0, -1)
      : joinedCommunities.map((membership) => membership.community);

    const nextCursor = hasMore
      ? joinedCommunities[joinedCommunities.length - 1].communityId
      : null;

    return c.json({ status: 200, data: communities, nextCursor });
  } catch (error) {
    console.log(error);
    return c.json({ status: 400 });
  }
});

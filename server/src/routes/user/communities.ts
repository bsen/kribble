import { Hono } from "hono";
import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";
import { verify } from "hono/jwt";

export const userCommunitiesRouter = new Hono<{
  Bindings: {
    DATABASE_URL: string;
    JWT_SECRET: string;
    CLOUDFLARE_IMAGES_ACCOUNT_ID: string;
    CLOUDFLARE_IMAGES_API_TOKEN: string;
    CLOUDFLARE_IMAGES_POST_URL: string;
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

    const createdCommunities = await prisma.community.findMany({
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

    const hasMoreCreated = createdCommunities.length > take;
    const createdCommunityData = hasMoreCreated
      ? createdCommunities.slice(0, -1)
      : createdCommunities;
    const nextCreatedCursor = hasMoreCreated
      ? createdCommunities[createdCommunities.length - 1].id
      : null;

    const joinedCommunityIds = createdCommunities.map(
      (community) => community.id
    );

    const joinedCommunities = await prisma.communityMembership.findMany({
      where: {
        userId: findUser.id,
        communityId: { notIn: joinedCommunityIds },
      },
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

    const hasMoreJoined = joinedCommunities.length > take;
    const joinedCommunityData = hasMoreJoined
      ? joinedCommunities.map((membership) => membership.community).slice(0, -1)
      : joinedCommunities.map((membership) => membership.community);
    const nextJoinedCursor = hasMoreJoined
      ? joinedCommunities[joinedCommunities.length - 1].communityId
      : null;

    const allCommunities = [...createdCommunityData, ...joinedCommunityData];
    const nextCursor = nextJoinedCursor || nextCreatedCursor;

    return c.json({ status: 200, data: allCommunities, nextCursor });
  } catch (error) {
    console.log(error);
    return c.json({ status: 400 });
  }
});

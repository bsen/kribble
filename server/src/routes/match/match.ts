import { Hono } from "hono";
import { PrismaClient } from "@prisma/client/edge";
import { verify } from "hono/jwt";
import { withAccelerate } from "@prisma/extension-accelerate";

export const matchRouter = new Hono<{
  Bindings: {
    DATABASE_URL: string;
    JWT_SECRET: string;
  };
}>();
matchRouter.post("/find/match", async (c) => {
  try {
    const body = await c.req.json();
    const token = body.token;
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
      return c.json({ status: 404, message: "Not verified" });
    }

    const existingMatch = await prisma.match.findFirst({
      where: {
        OR: [
          {
            person1Id: userId.id,
            expiresAt: { gt: new Date() },
          },
          {
            person2Id: userId.id,
            expiresAt: { gt: new Date() },
          },
        ],
      },
      include: {
        person1: {
          select: {
            id: true,
            username: true,
            bio: true,
            image: true,
            college: true,
            interest: true,
          },
        },
        person2: {
          select: {
            id: true,
            username: true,
            bio: true,
            image: true,
            college: true,
            interest: true,
          },
        },
      },
    });

    if (existingMatch) {
      const matchedUser =
        existingMatch.person1Id === userId.id
          ? existingMatch.person2
          : existingMatch.person1;

      return c.json({ status: 200, matchedUser });
    }

    const potentialMatches = await prisma.user.findMany({
      where: {
        id: {
          not: {
            in: [
              userId.id,
              ...(
                await prisma.match.findMany({
                  where: {
                    OR: [{ person1Id: userId.id }, { person2Id: userId.id }],
                  },
                  select: {
                    person1Id: true,
                    person2Id: true,
                  },
                })
              ).flatMap((match) => [match.person1Id, match.person2Id]),
            ],
          },
        },
        OR: [
          { college: findUser.college },
          {
            id: {
              in: await prisma.following
                .findMany({
                  where: {
                    followingId: userId.id,
                  },
                  select: {
                    followerId: true,
                  },
                })
                .then((followings) =>
                  followings.map(({ followerId }) => followerId)
                ),
            },
          },
          {
            id: {
              in: await prisma.following
                .findMany({
                  where: {
                    followerId: userId.id,
                  },
                  select: {
                    followingId: true,
                  },
                })
                .then((followers) =>
                  followers.map(({ followingId }) => followingId)
                ),
            },
          },
          { interest: findUser.interest },
        ],
      },
    });

    if (potentialMatches.length === 0) {
      return c.json({
        status: 404,
        message: "No potential matches found",
      });
    }

    const randomMatch =
      potentialMatches[Math.floor(Math.random() * potentialMatches.length)];

    const createMatch = await prisma.match.create({
      data: {
        person1Id: userId.id,
        person2Id: randomMatch.id,
      },
    });
    console.log(createMatch);
    if (!createMatch) {
      return c.json({
        status: 404,
        message: "Match creation failed, Network error",
      });
    }

    return c.json({ status: 200, message: "Match created" });
  } catch (error) {
    console.error(error);
    return c.json({ status: 500, message: "Internal Server Error" });
  }
});

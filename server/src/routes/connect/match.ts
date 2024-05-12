import { Hono } from "hono";
import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";
import { verify } from "hono/jwt";

export const connectRouter = new Hono<{
  Bindings: {
    DATABASE_URL: string;
    JWT_SECRET: string;
    CLOUDFLARE_IMGAES_ACCOUNT_ID: string;
    CLOUDFLARE_IMGAES_API_TOKEN: string;
    CLOUDFLARE_IMGAES_POST_URL: string;
  };
}>();
connectRouter.post("/matchable/users", async (c) => {
  try {
    const body = await c.req.json();
    const token = body.token;
    const gender = body.gender;
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
      return c.json({ status: 404, message: "User not found" });
    }

    const userMatcherIds = await prisma.match.findMany({
      where: {
        matcherUserId: userId.id,
      },
      select: {
        matchedByUserId: true,
      },
    });

    const matchedByUserIds = userMatcherIds.map(
      (match) => match.matchedByUserId
    );

    let matchedUser = null;

    const totalUsers = await prisma.user.count({
      where: {
        gender: gender,
        id: {
          notIn: matchedByUserIds,
        },
      },
    });
    const randomOffset = Math.floor(Math.random() * totalUsers);
    matchedUser = await prisma.user.findMany({
      where: {
        gender: gender,
        id: {
          notIn: matchedByUserIds,
          not: userId.id,
        },
      },
      take: 1,
      skip: randomOffset,
      select: {
        id: true,
        username: true,
        name: true,
        bio: true,
        image: true,
      },
    });

    return c.json({ status: 200, message: matchedUser });
  } catch (error) {
    console.error(error);
    return c.json({ status: 500, message: "Internal Server Error" });
  }
});
connectRouter.post("/match", async (c) => {
  try {
    const body = await c.req.json();
    const token = body.token;
    const otherPersonsId = body.otherPersonsId;
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
      return c.json({ status: 404, message: "User not found" });
    }

    const alreadyMatched = await prisma.match.findUnique({
      where: {
        matcherUserId_matchedByUserId: {
          matcherUserId: findUser.id,
          matchedByUserId: otherPersonsId,
        },
      },
    });
    console.log("already a  like match", alreadyMatched);
    if (alreadyMatched) {
      return c.json({
        status: 400,
        message: "User has already liked this profile",
      });
    }
    const otherPersonMatch = await prisma.match.findUnique({
      where: {
        matcherUserId_matchedByUserId: {
          matcherUserId: otherPersonsId,
          matchedByUserId: findUser.id,
        },
      },
    });

    if (otherPersonMatch) {
      console.log("creating matches its a match");
      const createMatches = await prisma.matches.create({
        data: {
          userOneId: findUser.id,
          userTwoId: otherPersonsId,
        },
      });

      if (!createMatches) {
        return c.json({ status: 404, message: "Network error" });
      }

      return c.json({ status: 200, message: "Successful match!" });
    }

    const createMatch = await prisma.match.create({
      data: {
        matcherUserId: findUser.id,
        matchedByUserId: otherPersonsId,
      },
    });
    console.log("new match ", createMatch);
    if (!createMatch) {
      return c.json({ status: 404, message: "Network error" });
    }

    return c.json({ status: 200, message: "Match request sent" });
  } catch (error) {
    console.log(error);
    return c.json({ status: 404 });
  }
});

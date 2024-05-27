import { Hono } from "hono";
import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";
import { sign, verify } from "hono/jwt";
export const leaderBoardRouter = new Hono<{
  Bindings: {
    DATABASE_URL: string;
    JWT_SECRET: string;
    CLOUDFLARE_IMGAES_ACCOUNT_ID: string;
    CLOUDFLARE_IMGAES_API_TOKEN: string;
    CLOUDFLARE_IMGAES_POST_URL: string;
  };
}>();

leaderBoardRouter.post("/weekly-leaderboard", async (c) => {
  const body = await c.req.json();
  const token = body.token;
  const userId = await verify(token, c.env.JWT_SECRET);
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());

  const findUser = await prisma.user.findFirst({
    where: { id: userId.id },
  });
  if (!findUser) {
    return c.json({ status: 401, message: "Unauthorised" });
  }

  const findWeeklyLeaderBoardUsersFromSameCollege = await prisma.user.findMany({
    where: {
      college: findUser.college,
    },
    orderBy: {
      weeklyPoints: "desc",
    },
    select: {
      id: true,
      username: true,
      image: true,
    },
    take: 50,
  });

  const findWeeklyLeaderBoardUsersAllCollege = await prisma.user.findMany({
    orderBy: {
      weeklyPoints: "desc",
    },
    select: {
      id: true,
      username: true,
      image: true,
    },
    take: 50,
  });

  if (
    !findWeeklyLeaderBoardUsersFromSameCollege ||
    findWeeklyLeaderBoardUsersAllCollege
  ) {
    return c.json({ status: 404, message: "No leaders found" });
  }
  return c.json({
    status: 200,
    WeeklyLeaderFromSameCollege: findWeeklyLeaderBoardUsersFromSameCollege,
    AllTimeLeaderSameCollege: findWeeklyLeaderBoardUsersAllCollege,
  });
});

leaderBoardRouter.post("/alltime-leaderboard", async (c) => {
  const body = await c.req.json();
  const token = body.token;
  const userId = await verify(token, c.env.JWT_SECRET);
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());

  const findUser = await prisma.user.findFirst({
    where: { id: userId.id },
  });
  if (!findUser) {
    return c.json({ status: 401, message: "Unauthorised" });
  }
  const findAllTimeLeaderBoardUsersFromSameCollege = await prisma.user.findMany(
    {
      where: {
        college: findUser.college,
      },
      orderBy: {
        totalPoints: "desc",
      },
      select: {
        id: true,
        username: true,
        image: true,
      },
      take: 50,
    }
  );
  const findAllTimeLeaderBoardUsersFromAllColleges = await prisma.user.findMany(
    {
      orderBy: {
        totalPoints: "desc",
      },
      select: {
        id: true,
        username: true,
        image: true,
      },
      take: 50,
    }
  );

  if (
    !findAllTimeLeaderBoardUsersFromSameCollege ||
    !findAllTimeLeaderBoardUsersFromAllColleges
  ) {
    return c.json({
      status: 404,
      message: "No leaders found",
    });
  }

  return c.json({
    status: 200,
    AllTimeLeaderAllColleges: findAllTimeLeaderBoardUsersFromAllColleges,
    findAllTimeLeaderSameCollege: findAllTimeLeaderBoardUsersFromSameCollege,
  });
});

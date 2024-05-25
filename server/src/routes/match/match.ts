import { Hono } from "hono";
import { PrismaClient } from "@prisma/client/edge";
import { verify } from "hono/jwt";
import { withAccelerate } from "@prisma/extension-accelerate";
import { tasks } from "./tasks";
export const matchRouter = new Hono<{
  Bindings: {
    DATABASE_URL: string;
    JWT_SECRET: string;
  };
}>();

type Tasks = {
  Programming: string[];
  Startup: string[];
  Drama: string[];
  Singing: string[];
  Dancing: string[];
  Writing: string[];
  Music: string[];
  Fashion: string[];
  Art: string[];
};
matchRouter.post("/create/match", async (c) => {
  try {
    const body = await c.req.json();
    const token = body.token;
    const SelectedCollege = body.college;
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

    const existingMatches = await prisma.match.findMany({
      where: {
        initiatorId: userId.id,
        expiresAt: { gt: new Date() },
      },
    });

    if (existingMatches.length >= 5) {
      return c.json({ status: 400, message: "Maximum matches reached" });
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
                    initiatorId: userId.id,
                  },
                  select: {
                    matchedUserId: true,
                  },
                })
              ).map((match) => match.matchedUserId),
            ],
          },
        },
        college: SelectedCollege,
      },
    });

    if (potentialMatches.length === 0) {
      return c.json({
        status: 404,
        message: "No potential matches found based on your college",
      });
    }

    const randomMatch =
      potentialMatches[Math.floor(Math.random() * potentialMatches.length)];

    const taskKeys = Object.keys(tasks) as (keyof Tasks)[];
    const randomTaskKey = taskKeys[Math.floor(Math.random() * taskKeys.length)];
    const randomTask =
      tasks[randomTaskKey][
        Math.floor(Math.random() * tasks[randomTaskKey].length)
      ];

    const createMatch = await prisma.match.create({
      data: {
        initiatorId: userId.id,
        matchedUserId: randomMatch.id,
        task: randomTask,
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

matchRouter.post("/matches", async (c) => {
  try {
    const body = await c.req.json();
    const token = body.token;
    const userId = await verify(token, c.env.JWT_SECRET);

    const prisma = new PrismaClient({
      datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate());

    const matches = await prisma.match.findMany({
      where: {
        initiatorId: userId.id,
        expiresAt: { gt: new Date() },
      },
      select: {
        id: true,
        matchedUser: {
          select: {
            id: true,
            username: true,
            image: true,
          },
        },
        task: true,
        isTaskCompleted: true,
        expiresAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return c.json({ status: 200, data: matches });
  } catch (error) {
    console.error(error);
    return c.json({ status: 500, message: "Internal Server Error" });
  }
});

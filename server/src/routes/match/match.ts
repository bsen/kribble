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
    const SelectedInterest: keyof Tasks = body.interest;
    const userId = await verify(token, c.env.JWT_SECRET);
    console.log(userId, SelectedCollege, SelectedInterest);
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
        AND: [{ college: SelectedCollege }, { interest: SelectedInterest }],
      },
    });

    if (potentialMatches.length === 0) {
      return c.json({
        status: 404,
        message: "No potential matches found based on your preferences",
      });
    }

    const randomMatch =
      potentialMatches[Math.floor(Math.random() * potentialMatches.length)];

    const randomTask =
      tasks[SelectedInterest][
        Math.floor(Math.random() * tasks[SelectedInterest].length)
      ];

    const createMatch = await prisma.match.create({
      data: {
        person1Id: userId.id,
        person2Id: randomMatch.id,
        task: randomTask,
      },
    });
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
      select: {
        id: true,
        person1: true,
        person2: true,
        task: true,
        isTaskCompleted: true,
        expiresAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const formattedMatches = matches.map((match) => {
      const formattedMatch: {
        person1?: {
          id: string;
          username: string;
          interest: string | null;
          college: string | null;
          image: string | null;
        };
        person2?: {
          id: string;
          username: string;
          interest: string | null;
          college: string | null;
          image: string | null;
        };
        id: string | null;
        task: string | null;
        isTaskCompleted: boolean;
        expiresAt: Date;
      } = {
        id: match.id,
        task: match.task,
        isTaskCompleted: match.isTaskCompleted,
        expiresAt: match.expiresAt,
      };
      if (userId.id === match.person1?.id) {
        formattedMatch.person2 = {
          id: match.person2.id,
          username: match.person2.username,
          interest: match.person2.interest,
          college: match.person2.college,
          image: match.person2.image,
        };
      }
      if (userId.id === match.person2?.id) {
        formattedMatch.person1 = {
          id: match.person1.id,
          username: match.person1.username,
          interest: match.person1.interest,
          college: match.person1.college,
          image: match.person1.image,
        };
      }
      return formattedMatch;
    });
    return c.json({ status: 200, data: formattedMatches });
  } catch (error) {
    console.error(error);
    return c.json({ status: 500, message: "Internal Server Error" });
  }
});

import { Hono } from "hono";
import { PrismaClient, Prisma } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";
import { verify } from "hono/jwt";

export const matchRouter = new Hono<{
  Bindings: {
    DATABASE_URL: string;
    JWT_SECRET: string;
  };
}>();
matchRouter.post("/matchable/users", async (c) => {
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

    const initiatedMatchIds = await prisma.profileMatch.findMany({
      where: {
        initiatorId: userId.id,
      },
      select: {
        recipientId: true,
      },
    });

    const initiatedMatchRecipientIds = initiatedMatchIds.map(
      (match) => match.recipientId
    );

    const receivedMatchIds = await prisma.profileMatch.findMany({
      where: {
        recipientId: userId.id,
      },
      select: {
        initiatorId: true,
      },
    });

    const receivedMatchInitiatorIds = receivedMatchIds.map(
      (match) => match.initiatorId
    );

    const suggestedUsers = await prisma.user.findMany({
      where: {
        id: {
          notIn: [...initiatedMatchRecipientIds, userId.id],
        },
      },
      take: 5,
      orderBy: [
        {
          id:
            receivedMatchInitiatorIds.length > 0
              ? Prisma.SortOrder.desc
              : undefined,
        },
        {
          id: Prisma.SortOrder.asc,
        },
      ],
      select: {
        id: true,
        username: true,
        bio: true,
        image: true,
      },
    });
    return c.json({ status: 200, user: suggestedUsers });
  } catch (error) {
    console.error(error);
    return c.json({ status: 500, message: "Internal Server Error" });
  }
});

matchRouter.post("/create/connection", async (c) => {
  try {
    const body = await c.req.json();
    const token = body.token;
    const recipientId = body.recipientId;
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

    const existingMatch = await prisma.profileMatch.findUnique({
      where: {
        initiatorId_recipientId: {
          initiatorId: userId.id,
          recipientId,
        },
      },
    });

    if (existingMatch) {
      return c.json({ status: 400, message: "Match already exists" });
    }

    const createMatch = await prisma.profileMatch.create({
      data: {
        initiatorId: userId.id,
        recipientId,
      },
    });

    if (!createMatch) {
      return c.json({
        status: 404,
        message: "Match creation failed, Network error",
      });
    }
    const recipientMatch = await prisma.profileMatch.findUnique({
      where: {
        initiatorId_recipientId: {
          initiatorId: recipientId,
          recipientId: userId.id,
        },
      },
    });

    if (recipientMatch) {
      const confirmMatches = await prisma.profileMatch.updateMany({
        where: {
          OR: [
            {
              initiatorId: userId.id,
              recipientId,
            },
            {
              initiatorId: recipientId,
              recipientId: userId.id,
            },
          ],
        },
        data: {
          isConfirmed: true,
        },
      });

      if (!confirmMatches) {
        return c.json({
          status: 404,
          message: "Connection failed, Network error",
        });
      }
      return c.json({ status: 200, message: "Connection successful" });
    }

    return c.json({ status: 200, message: "Match created" });
  } catch (error) {
    console.log(error);
    return c.json({ status: 500, message: "Internal Server Error" });
  }
});

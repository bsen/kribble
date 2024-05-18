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

interface SuggestedUser {
  id: string;
  username: string;
  bio: string | null;
  image: string | null;
}

matchRouter.post("/matchable/users", async (c) => {
  try {
    const body = await c.req.json();
    const token = body.token;
    const interests = body.interests || [];
    const colleges = body.colleges || [];
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

    const excludedIds = [
      ...initiatedMatchIds.map((match) => match.recipientId),
      userId.id,
    ];
    const passedUserIds = body.passedUserIds || [];

    let suggestedUser: SuggestedUser | null = null;

    const allUsers = await prisma.user.findMany({
      where: {
        id: {
          notIn: [...excludedIds, ...passedUserIds],
        },
        ...(interests.length > 0 && { interest: { in: interests } }),
        ...(colleges.length > 0 && { college: { in: colleges } }),
      },
      select: {
        id: true,
        username: true,
        bio: true,
        image: true,
        college: true,
        interest: true,
      },
    });

    const remainingUsers = allUsers.filter(
      (user) => !passedUserIds.includes(user.id)
    );

    if (remainingUsers.length > 0) {
      const randomIndex = Math.floor(Math.random() * remainingUsers.length);
      suggestedUser = remainingUsers[randomIndex];
    }

    return c.json({ status: 200, user: suggestedUser });
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

import { Hono } from "hono";
import { PrismaClient, Prisma } from "@prisma/client/edge";
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

connectRouter.post("/connectable/users", async (c) => {
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

    const userConnectIds = await prisma.connect.findMany({
      where: {
        mainUserId: userId.id,
      },
      select: {
        otherUserId: true,
      },
    });

    const connectById = userConnectIds.map((connect) => connect.otherUserId);

    const likedUserIds = await prisma.connect.findMany({
      where: {
        otherUserId: userId.id,
      },
      select: {
        mainUserId: true,
      },
    });

    const likedByIds = likedUserIds.map((like) => like.mainUserId);

    const suggestedUsers = await prisma.user.findMany({
      where: {
        id: {
          notIn: connectById,
          not: userId.id,
        },
      },
      take: 5,
      orderBy: [
        {
          id: likedByIds.length > 0 ? Prisma.SortOrder.desc : undefined,
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
    console.log(suggestedUsers);
    return c.json({ status: 200, user: suggestedUsers });
  } catch (error) {
    console.error(error);
    return c.json({ status: 500, message: "Internal Server Error" });
  }
});

connectRouter.post("/create/connection", async (c) => {
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
      return c.json({ status: 404, message: "Not verified" });
    }

    const alreadyLiked = await prisma.connect.findUnique({
      where: {
        mainUserId_otherUserId: {
          mainUserId: findUser.id,
          otherUserId: otherPersonsId,
        },
      },
    });
    if (alreadyLiked) {
      return c.json({
        status: 400,
        message: "Already liked",
      });
    }
    const otherPersonLike = await prisma.connect.findUnique({
      where: {
        mainUserId_otherUserId: {
          mainUserId: otherPersonsId,
          otherUserId: findUser.id,
        },
      },
    });

    if (otherPersonLike) {
      const createFirstConnections = await prisma.connections.create({
        data: {
          mainUserId: findUser.id,
          otherUserId: otherPersonsId,
        },
      });
      const createSecondConnections = await prisma.connections.create({
        data: {
          mainUserId: otherPersonsId,
          otherUserId: findUser.id,
        },
      });

      if (!createFirstConnections || !createSecondConnections) {
        return c.json({
          status: 404,
          message: "Conection failed, Network error",
        });
      }
      return c.json({ status: 200, message: "Connection successful" });
    }

    const createLike = await prisma.connect.create({
      data: {
        mainUserId: findUser.id,
        otherUserId: otherPersonsId,
      },
    });

    if (!createLike) {
      return c.json({ status: 404, message: "Like failed, Network error" });
    }
    return c.json({ status: 200, message: "Like created" });
  } catch (error) {
    console.log(error);
    return c.json({ status: 404 });
  }
});

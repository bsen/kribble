import { Hono } from "hono";
import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";
import { verify } from "hono/jwt";

export const userConnectionsRouter = new Hono<{
  Bindings: {
    DATABASE_URL: string;
    JWT_SECRET: string;
    CLOUDFLARE_IMGAES_ACCOUNT_ID: string;
    CLOUDFLARE_IMGAES_API_TOKEN: string;
    CLOUDFLARE_IMGAES_POST_URL: string;
  };
}>();

userConnectionsRouter.post("/all/connections", async (c) => {
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
    const userConnections = await prisma.connections.findMany({
      where: {
        mainUserId: findUser.id,
      },
      select: {
        otherUser: {
          select: { id: true, fullname: true, username: true, image: true },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    if (!userConnections) {
      return c.json({ status: 404, message: "No connection found" });
    }
    return c.json({
      status: 200,
      data: userConnections,
      message: "Connections found",
    });
  } catch (error) {
    return c.json({ status: 500, message: "Internal Server Error" });
  }
});

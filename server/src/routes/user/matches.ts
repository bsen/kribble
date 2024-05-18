import { Hono } from "hono";
import { PrismaClient } from "@prisma/client/edge";
import { verify } from "hono/jwt";
import { withAccelerate } from "@prisma/extension-accelerate";

export const userMatchesRouter = new Hono<{
  Bindings: {
    DATABASE_URL: string;
    JWT_SECRET: string;
    CLOUDFLARE_IMGAES_ACCOUNT_ID: string;
    CLOUDFLARE_IMGAES_API_TOKEN: string;
    CLOUDFLARE_IMGAES_POST_URL: string;
  };
}>();

userMatchesRouter.post("/all/matches", async (c) => {
  try {
    const body = await c.req.json();
    const token = body.token;
    const prisma = new PrismaClient({
      datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate());
    const userId = await verify(token, c.env.JWT_SECRET);
    const cursor = body.cursor || null;
    const take = 30;
    const findUser = await prisma.user.findUnique({
      where: {
        id: userId.id,
      },
    });

    if (!findUser) {
      return c.json({ status: 404, message: "Not verified" });
    }

    const userMatches = await prisma.profileMatch.findMany({
      where: {
        recipientId: findUser.id,
        isConfirmed: true,
      },
      select: {
        initiatorId: true,
        initiator: {
          select: {
            id: true,
            username: true,
            image: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      cursor: cursor ? { id: cursor } : undefined,
      take: take + 1,
    });

    const hasMore = userMatches.length > take;
    const matches = hasMore ? userMatches.slice(0, -1) : userMatches;
    const nextCursor = hasMore
      ? userMatches[userMatches.length - 1].initiatorId
      : null;
    return c.json({ status: 200, data: matches, nextCursor });
  } catch (error) {
    console.log(error);
    return c.json({ status: 400 });
  }
});

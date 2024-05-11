import { Hono } from "hono";
import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";
import { verify } from "hono/jwt";

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

    const userMatches = await prisma.matches.findMany({
      where: {
        userOneId: findUser.id,
      },
      select: {
        userTwo: {
          select: { id: true, name: true, username: true, image: true },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    return c.json({
      status: 200,
      data: userMatches,
      message: "Matches found",
    });
  } catch (error) {
    console.error("Error fetching user matches:", error);
    return c.json({ status: 500, message: "Internal Server Error" });
  }
});

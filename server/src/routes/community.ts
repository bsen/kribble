import { Hono } from "hono";
import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";
import { sign, verify } from "hono/jwt";
import { date, z } from "zod";
export const communityRouter = new Hono<{
  Bindings: {
    DATABASE_URL: string;
    JWT_SECRET: string;
    CLOUDFLARE_IMGAES_ACCOUNT_ID: string;
    CLOUDFLARE_IMGAES_API_TOKEN: string;
    CLOUDFLARE_IMGAES_POST_URL: string;
  };
}>();

communityRouter.post("/create", async (c) => {
  const body = await c.req.json();
  const token = body.token;
  const communityName = body.communityName;
  const communityType = body.communityType;
  const communityDescription = body.communityDescription;
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
    return c.json({ status: 400, message: "Authentication error" });
  }
});

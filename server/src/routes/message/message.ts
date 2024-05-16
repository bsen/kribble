// Backend code
import { Hono } from "hono";
import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";
import { verify } from "hono/jwt";
import { z } from "zod";

export const messageRouter = new Hono<{
  Bindings: {
    DATABASE_URL: string;
    JWT_SECRET: string;
    CLOUDFLARE_IMGAES_ACCOUNT_ID: string;
    CLOUDFLARE_IMGAES_API_TOKEN: string;
    CLOUDFLARE_IMGAES_POST_URL: string;
  };
}>();

const sendMessageSchema = z.object({
  token: z.string(),
  receiverId: z.string().uuid(),
  message: z.string().max(300),
});

const getMessagesSchema = z.object({
  token: z.string(),
  receiverId: z.string().uuid(),
  page: z.number().optional(),
  limit: z.number().optional(),
});

messageRouter.post("/send", async (c) => {
  try {
    const body = await c.req.json();
    const { token, receiverId, message } = sendMessageSchema.parse(body);

    const prisma = new PrismaClient({
      datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate());

    const userId = await verify(token, c.env.JWT_SECRET);

    const findUser = await prisma.user.findUnique({
      where: {
        id: userId.id,
      },
    });

    if (!findUser) {
      return c.json({ status: 400, message: "User not authenticated" });
    }

    const createMessage = await prisma.message.create({
      data: {
        message: message,
        sender: { connect: { id: findUser.id } },
        receiver: { connect: { id: receiverId } },
      },
    });

    if (!createMessage) {
      return c.json({ status: 400, message: "Failed to send a message" });
    }

    return c.json({ status: 200, message: "Message sent successfully" });
  } catch (error) {
    console.error(error);
    return c.json({ status: 500, message: "Internal Server Error" });
  }
});

messageRouter.post("/get", async (c) => {
  try {
    const body = await c.req.json();
    const {
      token,
      receiverId,
      page = 1,
      limit = 20,
    } = getMessagesSchema.parse(body);

    const prisma = new PrismaClient({
      datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate());

    const userId = await verify(token, c.env.JWT_SECRET);

    const findUser = await prisma.user.findUnique({
      where: {
        id: userId.id,
      },
    });

    if (!findUser) {
      return c.json({ status: 401, message: "Unauthorised user" });
    }

    const findSendMessages = await prisma.message.findMany({
      where: {
        senderId: findUser.id,
        receiverId: receiverId,
      },
      select: {
        message: true,
        createdAt: true,
      },
      take: limit,
      skip: (page - 1) * limit,
      orderBy: {
        createdAt: "desc",
      },
    });

    const findReceivedMessages = await prisma.message.findMany({
      where: {
        senderId: receiverId,
        receiverId: findUser.id,
      },
      select: {
        message: true,
        createdAt: true,
      },
      take: limit,
      skip: (page - 1) * limit,
      orderBy: {
        createdAt: "desc",
      },
    });

    if (!findSendMessages && !findReceivedMessages) {
      return c.json({ status: 404, message: "NO messages found" });
    }

    return c.json({
      status: 200,
      message: "Your messages are fetched",
      sendMessages: findSendMessages,
      receivedMessages: findReceivedMessages,
    });
  } catch (error: unknown) {
    return c.json({ status: 500, message: "Internal Server Error" });
  }
});

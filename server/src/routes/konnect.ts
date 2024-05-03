import { Hono } from "hono";
import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";
import { verify } from "hono/jwt";

export const konnectRouter = new Hono<{
  Bindings: {
    DATABASE_URL: string;
    JWT_SECRET: string;
    CLOUDFLARE_IMGAES_ACCOUNT_ID: string;
    CLOUDFLARE_IMGAES_API_TOKEN: string;
    CLOUDFLARE_IMGAES_POST_URL: string;
  };
}>();

konnectRouter.post("/users-for-match", async (c) => {
  try {
    const body = await c.req.json();
    const token = body.token;
    const gender = body.gender;
    const userId = await verify(token, c.env.JWT_SECRET);
    const prisma = new PrismaClient({
      datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate());

    const userData = await prisma.user.findUnique({
      where: {
        id: userId.id,
      },
    });

    if (!userData) {
      return c.json({ status: 404, message: "User not found" });
    }

    const userInterests = await prisma.matching.findMany({
      where: {
        personId: userId.id,
      },
      select: {
        interestedInId: true,
      },
    });

    const interestedUserIds = userInterests.map(
      (interest) => interest.interestedInId
    );

    let matchedUser = null;

    const totalMaleUsers = await prisma.user.count({
      where: {
        gender: gender,
        id: {
          notIn: interestedUserIds,
        },
      },
    });
    const randomOffset = Math.floor(Math.random() * totalMaleUsers);
    matchedUser = await prisma.user.findMany({
      where: {
        gender: gender,
        id: {
          notIn: interestedUserIds,
          not: userId.id,
        },
      },
      take: 1,
      skip: randomOffset,
      select: {
        id: true,
        username: true,
        name: true,
        bio: true,
        interest: true,
        image: true,
      },
    });

    return c.json({ status: 200, message: matchedUser });
  } catch (error) {
    console.error(error);
    return c.json({ status: 500, message: "Internal Server Error" });
  }
});

konnectRouter.post("/match-people", async (c) => {
  try {
    const body = await c.req.json();
    const token = body.token;
    const otherPersonsId = body.otherPersonsId;

    const userId = await verify(token, c.env.JWT_SECRET);

    const prisma = new PrismaClient({
      datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate());

    const alreadyLiked = await prisma.matching.findFirst({
      where: {
        personId: userId.id,
        interestedInId: otherPersonsId,
      },
    });
    if (alreadyLiked) {
      return c.json({
        status: 400,
        message: "user already have shown interest in this person",
      });
    }
    const checkDateMatch = await prisma.matching.findFirst({
      where: {
        personId: otherPersonsId,
        interestedInId: userId.id,
      },
    });
    if (checkDateMatch) {
      await prisma.user.update({
        where: { id: userId.id },
        data: {
          matchedUsers: { push: otherPersonsId },
        },
      });

      await prisma.user.update({
        where: { id: otherPersonsId },
        data: {
          matchedUsers: { push: userId.id },
        },
      });
    }

    const createMatch = await prisma.matching.create({
      data: {
        personId: userId.id,
        interestedInId: otherPersonsId,
      },
    });
    if (!createMatch) {
      return c.json({ status: 404, message: "network error" });
    }
    return c.json({ status: 200 });
  } catch (error) {
    console.log(error);
    return c.json({ status: 404 });
  }
});

konnectRouter.post("/user-matches", async (c) => {
  try {
    const body = await c.req.json();
    const token = body.token;
    const prisma = new PrismaClient({
      datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate());
    const userId = await verify(token, c.env.JWT_SECRET);
    const findDates = await prisma.user.findUnique({
      where: {
        id: userId.id,
      },
      select: {
        matchedUsers: true,
      },
    });
    if (!findDates) {
      return c.json({ status: 404, message: "user not found or auth error" });
    }

    const userPromises = findDates.matchedUsers.map(async (userId) => {
      const userDetails = await prisma.user.findUnique({
        where: {
          id: userId,
        },
        select: {
          id: true,
          name: true,
          username: true,
          image: true,
        },
      });
      return userDetails;
    });

    const userMatchData = await Promise.all(userPromises);

    return c.json({ status: 200, message: userMatchData });
  } catch (error) {
    console.error("Error fetching user details:", error);
    return c.json({ status: 500, message: "Internal Server Error" });
  }
});
konnectRouter.post("/send-message", async (c) => {
  try {
    const body = await c.req.json();
    const token = body.token;
    const receiverId = body.receiverId;
    const message = body.message;
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
    console.log(error);
  }
});
konnectRouter.post("/get-messages", async (c) => {
  try {
    const body = await c.req.json();
    const token = body.token;
    const receiverId = body.receiverId;
    const page = body.page || 1;
    const limit = 20;
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
    const findSendMesssages = await prisma.message.findMany({
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

    if (!findSendMesssages && !findReceivedMessages) {
      return c.json({ status: 404, message: "NO messages found" });
    }

    return c.json({
      status: 200,
      message: "Your messages are fetcehd",
      sendMessages: findSendMesssages,
      receivedMessages: findReceivedMessages,
    });
  } catch (error) {
    console.log(error);
  }
});
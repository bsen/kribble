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

    const findUser = await prisma.user.findUnique({
      where: {
        id: userId.id,
      },
    });

    if (!findUser) {
      return c.json({ status: 404, message: "User not found" });
    }

    const userMatcherIds = await prisma.match.findMany({
      where: {
        matcherUserId: userId.id,
      },
      select: {
        matchedByUserId: true,
      },
    });

    const matchedByUserIds = userMatcherIds.map(
      (match) => match.matchedByUserId
    );

    let matchedUser = null;

    const totalUsers = await prisma.user.count({
      where: {
        gender: gender,
        id: {
          notIn: matchedByUserIds,
        },
      },
    });
    const randomOffset = Math.floor(Math.random() * totalUsers);
    matchedUser = await prisma.user.findMany({
      where: {
        gender: gender,
        id: {
          notIn: matchedByUserIds,
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
    const findUser = await prisma.user.findUnique({
      where: {
        id: userId.id,
      },
    });

    if (!findUser) {
      return c.json({ status: 404, message: "User not found" });
    }

    const alreadyMatched = await prisma.match.findUnique({
      where: {
        matcherUserId_matchedByUserId: {
          matcherUserId: findUser.id,
          matchedByUserId: otherPersonsId,
        },
      },
    });
    console.log("already a  like match", alreadyMatched);
    if (alreadyMatched) {
      return c.json({
        status: 400,
        message: "User has already shown interest in this person",
      });
    }
    const otherPersonMatch = await prisma.match.findUnique({
      where: {
        matcherUserId_matchedByUserId: {
          matcherUserId: otherPersonsId,
          matchedByUserId: findUser.id,
        },
      },
    });

    if (otherPersonMatch) {
      console.log("creating matches its a match");
      const createMatches = await prisma.matches.create({
        data: {
          userOneId: findUser.id,
          userTwoId: otherPersonsId,
        },
      });

      if (!createMatches) {
        return c.json({ status: 404, message: "Network error" });
      }

      return c.json({ status: 200, message: "Successful match!" });
    }

    const createMatch = await prisma.match.create({
      data: {
        matcherUserId: findUser.id,
        matchedByUserId: otherPersonsId,
      },
    });
    console.log("new match ", createMatch);
    if (!createMatch) {
      return c.json({ status: 404, message: "Network error" });
    }

    return c.json({ status: 200, message: "Match request sent" });
  } catch (error) {
    console.log(error);
    return c.json({ status: 404 });
  }
});
konnectRouter.post("/user-matches", async (c) => {
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

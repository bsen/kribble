import express from "express";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();
const notificationRouter = express.Router();

notificationRouter.post("/all/notifications", async (req, res) => {
  try {
    const token = req.body.token;
    if (!token) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const userId = jwt.verify(token, process.env.JWT_SECRET as string) as {
      id: string;
    };

    const cursor = req.body.cursor || null;
    const take = 20;

    const allNotifications = await prisma.notification.findMany({
      where: {
        receiverId: userId.id,
      },
      select: {
        id: true,
        message: true,
        createdAt: true,
        sender: {
          select: {
            id: true,
            username: true,
          },
        },
        post: {
          select: {
            id: true,
          },
        },
        comment: {
          select: {
            id: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      cursor: cursor ? { id: cursor } : undefined,
      take: take + 1,
    });

    const hasMore = allNotifications.length > take;
    const notifications = hasMore
      ? allNotifications.slice(0, -1)
      : allNotifications;
    const nextCursor = hasMore
      ? allNotifications[allNotifications.length - 1].id
      : null;
    return res.status(200).json({ data: notifications, nextCursor });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Something went wrong" });
  }
});

notificationRouter.post("/unread", async (req, res) => {
  try {
    const token = req.body.token;
    if (!token) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const userId = jwt.verify(token, process.env.JWT_SECRET as string) as {
      id: string;
    };

    const user = await prisma.user.findUnique({
      where: {
        id: userId.id,
      },
      select: {
        unreadNotification: true,
      },
    });

    return res
      .status(200)
      .json({ unreadNotification: user?.unreadNotification });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

notificationRouter.post("/update-read", async (req, res) => {
  try {
    const token = req.body.token;
    if (!token) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const userId = jwt.verify(token, process.env.JWT_SECRET as string) as {
      id: string;
    };

    await prisma.user.update({
      where: {
        id: userId.id,
      },
      data: {
        unreadNotification: false,
      },
    });

    return res.status(200).json({ message: "Notifications marked as read" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

export default notificationRouter;

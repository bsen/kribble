import express from "express";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
import jwt from "jsonwebtoken";

const userFollowRouter = express.Router();

userFollowRouter.post("/follow/unfollow", async (req, res) => {
  try {
    const token = req.body.token;
    const followingUser = req.body.username;

    const userId = jwt.verify(token, process.env.JWT_SECRET as string) as {
      id: string;
    };
    const currentUser = await prisma.user.findUnique({
      where: {
        id: userId.id,
      },
    });
    const otherUser = await prisma.user.findUnique({
      where: {
        username: followingUser,
      },
    });

    if (!otherUser) {
      return res.json({ status: 404, error: "User not found" });
    }
    const isFollowing = await prisma.following.findUnique({
      where: {
        followerId_followingId: {
          followerId: currentUser!.id,
          followingId: otherUser.id,
        },
      },
    });
    if (!isFollowing) {
      await prisma.following.create({
        data: {
          followerId: currentUser!.id,
          followingId: otherUser.id,
        },
      });
      await prisma.user.update({
        where: {
          id: currentUser!.id,
        },
        data: {
          followingCount: {
            increment: 1,
          },
        },
      });
      await prisma.user.update({
        where: {
          id: otherUser!.id,
        },
        data: {
          followersCount: { increment: 1 },
        },
      });
      const createNotification = await prisma.notification.create({
        data: {
          receiverId: otherUser?.id,
          senderId: currentUser!.id,
          message: "followed you.",
        },
      });

      if (createNotification) {
        await prisma.user.update({
          where: {
            id: otherUser.id,
          },
          data: {
            unreadNotification: true,
          },
        });
      }

      return res.json({ status: 200, message: "User followed successfully" });
    } else {
      await prisma.following.delete({
        where: {
          followerId_followingId: {
            followerId: currentUser!.id,
            followingId: otherUser.id,
          },
        },
      });
      await prisma.user.update({
        where: {
          id: currentUser!.id,
        },
        data: {
          followingCount: {
            decrement: 1,
          },
        },
      });
      await prisma.user.update({
        where: {
          id: otherUser!.id,
        },
        data: {
          followersCount: { decrement: 1 },
        },
      });
      const notificationToDelete = await prisma.notification.findFirst({
        where: {
          receiverId: otherUser.id,
          senderId: currentUser?.id,
          message: "followed you.",
        },
      });

      if (notificationToDelete) {
        await prisma.notification.delete({
          where: {
            id: notificationToDelete.id,
          },
        });
      }

      return res.json({ status: 200, message: "User unfollowed successfully" });
    }
  } catch (error) {
    console.error(error);
    return res.json({ status: 500, error: "Something went wrong" });
  }
});

userFollowRouter.post("/following/list", async (req, res) => {
  try {
    const token = req.body.token;
    const username = req.body.username;

    const userId = jwt.verify(token, process.env.JWT_SECRET as string) as {
      id: string;
    };
    if (!userId) {
      return res.json({ status: 401, message: "Unauthorized" });
    }
    const cursor = req.body.cursor || null;
    const take = 20;
    const profileUser = await prisma.user.findUnique({
      where: {
        username: username,
      },
    });
    if (!profileUser) {
      return res.json({ status: 401, message: "No user found" });
    }
    const allFollowing = await prisma.following.findMany({
      where: {
        followerId: profileUser.id,
      },
      select: {
        id: true,
        following: {
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
    const hasMore = allFollowing.length > take;
    const following = hasMore ? allFollowing.slice(0, -1) : allFollowing;
    const nextCursor = hasMore
      ? allFollowing[allFollowing.length - 1].id
      : null;
    return res.json({ status: 200, data: following, nextCursor });
  } catch (error) {
    console.log(error);
    return res.json({ status: 400 });
  }
});

userFollowRouter.post("/followers/list", async (req, res) => {
  try {
    const token = req.body.token;
    const username = req.body.username;

    const userId = jwt.verify(token, process.env.JWT_SECRET as string) as {
      id: string;
    };
    if (!userId) {
      return res.json({ status: 401, message: "Unauthorized" });
    }
    const cursor = req.body.cursor || null;
    const take = 20;
    const profileUser = await prisma.user.findUnique({
      where: {
        username: username,
      },
    });
    if (!profileUser) {
      return res.json({ status: 401, message: "No user found" });
    }
    const allFollowers = await prisma.following.findMany({
      where: {
        followingId: profileUser.id,
      },
      select: {
        id: true,
        follower: {
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
    const hasMore = allFollowers.length > take;
    const followers = hasMore ? allFollowers.slice(0, -1) : allFollowers;
    const nextCursor = hasMore
      ? allFollowers[allFollowers.length - 1].id
      : null;
    return res.json({ status: 200, data: followers, nextCursor });
  } catch (error) {
    console.log(error);
    return res.json({ status: 400 });
  }
});

export default userFollowRouter;

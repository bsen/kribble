import express from "express";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const adminRouter = express.Router();

adminRouter.post("/delete-account", async (req, res) => {
  const adminToken = req.body.adminToken;
  const userId = req.body.userId;

  if (typeof adminToken !== "string" || typeof userId !== "string") {
    return res.json({ status: 400, message: "Invalid request" });
  }

  if (process.env.ADMINTOKEN !== adminToken) {
    return res.json({ status: 401, message: "Unauthorized" });
  }

  const findUser = await prisma.user.findUnique({
    where: {
      id: userId,
    },
  });

  if (!findUser) {
    return res.json({ status: 404, message: "User not found" });
  }
  try {
    const deleteUser = async (userId: string) => {
      await prisma.following.deleteMany({
        where: {
          OR: [{ followerId: userId }, { followingId: userId }],
        },
      });

      const userPosts = await prisma.post.findMany({
        where: {
          creatorId: userId,
        },
      });

      for (const post of userPosts) {
        await prisma.postLike.deleteMany({
          where: {
            postId: post.id,
          },
        });
        await prisma.comment.deleteMany({
          where: {
            postId: post.id,
          },
        });
        await prisma.notification.deleteMany({
          where: {
            postId: post.id,
          },
        });
      }
      await prisma.post.deleteMany({
        where: {
          creatorId: userId,
        },
      });

      await prisma.comment.deleteMany({
        where: {
          creatorId: userId,
        },
      });

      await prisma.postLike.deleteMany({
        where: {
          userId: userId,
        },
      });

      await prisma.notification.deleteMany({
        where: {
          receiverId: userId,
        },
      });

      await prisma.user.delete({
        where: {
          id: userId,
        },
      });

      return { status: 200, message: "Account deleted successfully" };
    };

    const result = await deleteUser(userId);
    return res.json(result);
  } catch (error) {
    console.error(error);
    return res.json({ status: 500, message: "Internal server error" });
  }
});

export default adminRouter;

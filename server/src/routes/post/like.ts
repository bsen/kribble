import express from "express";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
import jwt from "jsonwebtoken";

const postLikeRouter = express.Router();

postLikeRouter.post("/like/unlike", async (req, res) => {
  try {
    const token = req.body.token;
    const postId = req.body.postId;

    const userId = jwt.verify(token, process.env.JWT_SECRET as string) as {
      id: string;
    };
    const findUser = await prisma.user.findUnique({
      where: {
        id: userId.id,
      },
    });
    if (!findUser) {
      return res.json({ status: 401, message: "User not authenticated" });
    }

    const findLike = await prisma.postLike.findUnique({
      where: {
        userId_postId: {
          userId: findUser.id,
          postId: postId,
        },
      },
    });

    const findPost = await prisma.post.findFirst({
      where: {
        id: postId,
      },
      select: {
        creatorId: true,
      },
    });

    if (!findLike) {
      const createLike = await prisma.postLike.create({
        data: {
          userId: findUser.id,
          postId: postId,
        },
      });

      const incLikes = await prisma.post.update({
        where: {
          id: postId,
        },
        data: {
          likesCount: {
            increment: 1,
          },
        },
      });
      if (findPost) {
        const createNotification = await prisma.notification.create({
          data: {
            receiverId: findPost.creatorId,
            postId: postId,
            message: "Your Post got a like.",
          },
        });
        if (createNotification) {
          await prisma.user.update({
            where: {
              id: findPost.creatorId,
            },
            data: {
              unreadNotification: true,
            },
          });
        }
      }

      if (!createLike || !incLikes) {
        return res.json({ status: 400, message: "Liking post failed" });
      }
      return res.json({
        status: 200,
        message: "User liked the post successfully",
      });
    } else {
      const deleteLike = await prisma.postLike.delete({
        where: {
          userId_postId: {
            userId: findUser.id,
            postId: postId,
          },
        },
      });
      const decLikes = await prisma.post.update({
        where: {
          id: postId,
        },
        data: {
          likesCount: {
            decrement: 1,
          },
        },
      });

      if (!deleteLike || decLikes) {
        return res.json({ status: 400, message: "Liking post failed" });
      }
      return res.json({
        status: 200,
        message: "User unliked the post successfully",
      });
    }
  } catch (error) {
    console.log(error);
    return res.json({ status: 500, error: "Something went wrong" });
  }
});

export default postLikeRouter;

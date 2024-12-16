import express from "express";
import { PrismaClient, Prisma } from "@prisma/client";
const prisma = new PrismaClient();
import jwt from "jsonwebtoken";

const postLikeRouter = express.Router();

postLikeRouter.post("/like/unlike", async (req, res) => {
  try {
    const token = req.body.token;
    const postId = req.body.postId;

    if (!token || !postId) {
      return res.status(400).json({
        status: 400,
        message: "Missing required fields",
      });
    }

    let userId;
    try {
      userId = jwt.verify(token, process.env.JWT_SECRET as string) as {
        id: string;
      };
    } catch (jwtError) {
      return res.status(401).json({
        status: 401,
        message: "Invalid token",
      });
    }

    const [findUser, findPost] = await Promise.all([
      prisma.user.findUnique({
        where: { id: userId.id },
      }),
      prisma.post.findUnique({
        where: { id: postId },
        select: { creatorId: true },
      }),
    ]);

    if (!findUser) {
      return res.status(401).json({
        status: 401,
        message: "User not authenticated",
      });
    }

    if (!findPost) {
      return res.status(404).json({
        status: 404,
        message: "Post not found",
      });
    }

    try {
      const result = await prisma.$transaction(async (tx) => {
        try {
          await tx.postLike.delete({
            where: {
              userId_postId: {
                userId: findUser.id,
                postId: postId,
              },
            },
          });

          await tx.post.update({
            where: { id: postId },
            data: { likesCount: { decrement: 1 } },
          });

          return { action: "unlike" };
        } catch (deleteError) {
          if (
            deleteError instanceof Prisma.PrismaClientKnownRequestError &&
            deleteError.code === "P2025"
          ) {
            await tx.postLike.create({
              data: {
                userId: findUser.id,
                postId: postId,
              },
            });

            await tx.post.update({
              where: { id: postId },
              data: { likesCount: { increment: 1 } },
            });

            if (findPost.creatorId !== findUser.id) {
              const notification = await tx.notification.create({
                data: {
                  receiverId: findPost.creatorId,
                  postId: postId,
                  message: "Your Post got a like.",
                },
              });

              if (notification) {
                await tx.user.update({
                  where: { id: findPost.creatorId },
                  data: { unreadNotification: true },
                });
              }
            }

            return { action: "like" };
          }
          throw deleteError;
        }
      });

      return res.json({
        status: 200,
        message:
          result.action === "like"
            ? "User liked the post successfully"
            : "User unliked the post successfully",
      });
    } catch (txError) {
      console.error("Transaction error:", txError);

      if (txError instanceof Prisma.PrismaClientKnownRequestError) {
        if (txError.code === "P2002") {
          return res.status(409).json({
            status: 409,
            message: "Like operation failed due to concurrent request",
          });
        }
      }
      throw txError;
    }
  } catch (error) {
    console.error("Error in like/unlike route:", error);

    return res.status(500).json({
      status: 500,
      message: "Something went wrong",
    });
  }
});

export default postLikeRouter;

import express from "express";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
import jwt from "jsonwebtoken";

const reportRouter = express.Router();

reportRouter.post("/report-content", async (req, res) => {
  try {
    const token = req.body.token;
    const contentId = req.body.reportingContentId;
    const userId = jwt.verify(token, process.env.JWT_SECRET as string) as {
      id: string;
    };
    const findUser = await prisma.user.findUnique({
      where: {
        id: userId.id,
      },
    });
    if (!findUser) {
      return res.json({ status: 401, message: "Unverified" });
    }
    const findPost = await prisma.post.findFirst({
      where: {
        id: contentId,
      },
    });
    if (findPost) {
      const findPostReport = await prisma.reportedPost.findUnique({
        where: {
          userId_postId: {
            userId: findUser.id,
            postId: contentId,
          },
        },
      });

      if (!findPostReport) {
        const createReport = await prisma.reportedPost.create({
          data: {
            user: {
              connect: {
                id: findUser.id,
              },
            },
            post: {
              connect: {
                id: contentId,
              },
            },
          },
        });

        if (!createReport) {
          return res.json({ status: 400, message: "Reporting failed" });
        }

        return res.json({ status: 200, message: "Post reported successfully" });
      } else {
        return res.json({
          status: 400,
          message: "User already reported this post",
        });
      }
    } else {
      return res.json({ status: 404, message: "No Post found" });
    }
  } catch (error) {
    return res.json({ status: 500, error: "Something went wrong" });
  }
});

export default reportRouter;

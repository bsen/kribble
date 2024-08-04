import express from "express";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
import jwt from "jsonwebtoken";

const postCommentRouter = express.Router();

postCommentRouter.post("/all/comments", async (req, res) => {
  try {
    const token = req.body.token;
    const postId = req.body.postId;
    const cursor = req.body.cursor || null;
    const take = 20;
    const userId = jwt.verify(token, process.env.JWT_SECRET as string) as {
      id: string;
    };
    const findUser = await prisma.user.findUnique({ where: { id: userId.id } });
    if (!findUser) {
      return res.json({ status: 401, message: "User not authenticated" });
    }

    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { creatorId: true },
    });

    if (!post) {
      return res.json({ status: 404, message: "Post not found" });
    }

    const findComments = await prisma.comment.findMany({
      where: { postId: postId, status: true },
      select: {
        id: true,
        comment: true,
        createdAt: true,
        likesCount: true,
        creator: {
          select: {
            id: true,
            username: true,
            image: true,
          },
        },
      },
      orderBy: [
        { creator: { id: post.creatorId ? "asc" : "desc" } },
        { createdAt: "desc" },
      ],
      cursor: cursor ? { id: cursor } : undefined,
      take: take + 1,
    });

    const hasMore = findComments.length > take;
    const comments = hasMore ? findComments.slice(0, -1) : findComments;
    const nextCursor = hasMore
      ? findComments[findComments.length - 1].id
      : null;

    const commentsWithLikeState = await Promise.all(
      comments.map(async (comment) => {
        const isLiked = await prisma.commentLike.findUnique({
          where: {
            userId_commentId: {
              userId: findUser.id,
              commentId: comment.id,
            },
          },
        });
        return {
          ...comment,
          isLiked: isLiked ? true : false,
          isCreator: comment.creator.id === post.creatorId,
        };
      })
    );

    return res.json({
      status: 200,
      data: commentsWithLikeState,
      nextCursor,
    });
  } catch (error) {
    console.log(error);
    return res.json({ status: 500, message: "Internal Server Error" });
  }
});

postCommentRouter.post("/like/unlike", async (req, res) => {
  try {
    const token = req.body.token;
    const commentId = req.body.commentId;
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

    const findLike = await prisma.commentLike.findUnique({
      where: {
        userId_commentId: {
          userId: findUser.id,
          commentId: commentId,
        },
      },
    });

    if (!findLike) {
      const createLike = await prisma.commentLike.create({
        data: {
          userId: findUser.id,
          commentId: commentId,
        },
      });

      const incLikes = await prisma.comment.update({
        where: {
          id: commentId,
        },
        data: {
          likesCount: {
            increment: 1,
          },
        },
      });

      if (!createLike || !incLikes) {
        return res.json({ status: 400, message: "Liking comment failed" });
      }

      return res.json({
        status: 200,
        message: "User liked the comment successfully",
      });
    } else {
      const deleteLike = await prisma.commentLike.delete({
        where: {
          userId_commentId: {
            userId: findUser.id,
            commentId: commentId,
          },
        },
      });

      const decLikes = await prisma.comment.update({
        where: {
          id: commentId,
        },
        data: {
          likesCount: {
            decrement: 1,
          },
        },
      });

      if (!deleteLike || decLikes) {
        return res.json({ status: 400, message: "Unliking comment failed" });
      }

      return res.json({
        status: 200,
        message: "User unliked the comment successfully",
      });
    }
  } catch (error) {
    console.log(error);
    return res.json({ status: 500, error: "Something went wrong" });
  }
});

postCommentRouter.post("/create", async (req, res) => {
  try {
    const { token, comment, postId } = req.body;

    const userId = jwt.verify(token, process.env.JWT_SECRET as string) as {
      id: string;
    };
    const findUser = await prisma.user.findUnique({
      where: {
        id: userId.id,
      },
    });
    if (!findUser) {
      return res.json({ status: 401, message: "Authentication error" });
    }
    const findPost = await prisma.post.findFirst({
      where: {
        id: postId,
      },
    });
    const createComment = await prisma.comment.create({
      data: {
        comment: comment,
        creator: { connect: { id: findUser.id } },
        post: { connect: { id: postId } },
      },
    });

    const incCount = await prisma.post.update({
      where: {
        id: postId,
      },
      data: {
        commentsCount: {
          increment: 1,
        },
      },
    });

    if (findPost) {
      await prisma.notification.create({
        data: {
          receiverId: findPost.creatorId,
          postId: postId,
          message: "Your post got a comment.",
        },
      });

      await prisma.user.update({
        where: {
          id: findPost.creatorId,
        },
        data: {
          unreadNotification: true,
        },
      });
    }
    if (!createComment || !incCount) {
      return res.json({ status: 400, message: "Failed to create comment" });
    }
    return res.json({ status: 200, message: "Commnet created successfully" });
  } catch (error) {
    console.log(error);
  }
});

postCommentRouter.post("/delete", async (req, res) => {
  try {
    const { token, commentId } = req.body;
    const userId = jwt.verify(token, process.env.JWT_SECRET as string) as {
      id: string;
    };

    const findUser = await prisma.user.findUnique({
      where: {
        id: userId.id,
      },
    });

    if (!findUser) {
      return res.json({ status: 400, message: "User not authenticated" });
    }

    const findPost = await prisma.comment.findFirst({
      where: {
        id: commentId,
      },
      select: {
        postId: true,
      },
    });

    const decCount = await prisma.post.update({
      where: {
        id: findPost?.postId,
      },
      data: {
        commentsCount: {
          decrement: 1,
        },
      },
    });

    const updateCommentStatus = await prisma.comment.update({
      where: {
        creatorId: findUser.id,
        id: commentId,
      },
      data: {
        status: false,
      },
    });

    if (!updateCommentStatus || !decCount) {
      return res.json({
        status: 400,
        message: "Functions failed",
      });
    }
    return res.json({
      status: 200,
      message: "Comment status updated successfully",
    });
  } catch (error) {
    console.log(error);
  }
});

export default postCommentRouter;

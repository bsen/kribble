import express from "express";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";
import multer from "multer";
const prisma = new PrismaClient();
const postRouter = express.Router();
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const s3 = new S3Client({
  region: process.env.BUCKET_REGION,
  credentials: {
    accessKeyId: process.env.ACCESS_KEY as string,
    secretAccessKey: process.env.SECRET_ACCESS_KEY as string,
  },
});

const upload = multer({
  limits: { fileSize: 15 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (
      file.mimetype.startsWith("image/") ||
      file.mimetype.startsWith("video/")
    ) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type. Only images and videos are allowed."));
    }
  },
}).fields([
  { name: "image", maxCount: 1 },
  { name: "file", maxCount: 1 },
]);

postRouter.post("/create", upload, async (req, res) => {
  try {
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    const file = files.image?.[0] || files.file?.[0] || null;
    const { token, caption, anonymity } = req.body;
    console.log("Received data:", { token, caption, anonymity });

    if (anonymity !== "false" && anonymity !== "true") {
      return res.json({
        status: 400,
        message: "Invalid post anonymity status",
      });
    }

    if (typeof token !== "string") {
      return res.json({ status: 400, message: "Invalid post data or token" });
    }

    if (!caption) {
      return res.json({ status: 400, message: "Caption is required" });
    }

    const isAnonymous = anonymity === "true";

    const userId = jwt.verify(token, process.env.JWT_SECRET as string) as {
      id: string;
    };
    const findUser = await prisma.user.findUnique({ where: { id: userId.id } });
    if (!findUser) {
      return res.json({ status: 401, message: "Unverified" });
    }

    let fileUrl = null;
    if (file) {
      if (file.size > 15 * 1024 * 1024) {
        return res.json({
          status: 400,
          message: "Try to upload a file sized less than 15 MB",
        });
      }

      const params = {
        Bucket: process.env.BUCKET_NAME,
        Key: `${userId.id}/${
          file.mimetype.startsWith("image/") ? "Post-Images" : "Post-Videos"
        }/${Date.now()}_${file.originalname}`,
        Body: file.buffer,
        ContentType: file.mimetype,
      };

      try {
        const command = new PutObjectCommand(params);
        await s3.send(command);
        fileUrl = `https://${process.env.CLOUDFRONT_DISTRIBUTION_DOMAIN}/${params.Key}`;
      } catch (error) {
        console.error("File upload error:", error);
        return res.json({
          status: 500,
          message: "Failed to upload file",
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }

    const createPost = await prisma.post.create({
      data: {
        creator: { connect: { id: userId.id } },
        caption: caption,
        anonymity: isAnonymous,
        image: file && file.mimetype.startsWith("image/") ? fileUrl : null,
        video: file && file.mimetype.startsWith("video/") ? fileUrl : null,
      },
    });

    if (!createPost) {
      return res.json({ status: 403, message: "Failed to create the post" });
    }

    return res.json({
      status: 200,
      message: "Post created successfully",
      post: createPost,
    });
  } catch (error) {
    console.error("Post creation error:", error);
    return res.json({
      status: 500,
      message: "Try again later, Network error",
      error: error instanceof Error ? error.message : String(error),
    });
  }
});

postRouter.post("/delete", async (req, res) => {
  try {
    const { token, postId } = req.body;
    if (typeof token !== "string" || typeof postId !== "string") {
      return res.json({ status: 400, message: "Invalid input data" });
    }

    let userId;
    try {
      userId = jwt.verify(token, process.env.JWT_SECRET as string) as {
        id: string;
      };
    } catch (error) {
      return res.json({ status: 401, message: "Invalid token" });
    }

    const findUser = await prisma.user.findUnique({ where: { id: userId.id } });
    if (!findUser) {
      return res.json({ status: 401, message: "User not found" });
    }

    const post = await prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      return res.json({ status: 404, message: "Post not found" });
    }

    if (post.creatorId !== findUser.id) {
      return res.json({
        status: 403,
        message: "Unauthorized to delete this post",
      });
    }

    const updatePostStatus = await prisma.post.update({
      where: {
        id: postId,
      },
      data: {
        status: false,
      },
    });
    if (!updatePostStatus) {
      return res.json({
        status: 400,
        message: "Post status updation failed",
      });
    }
    return res.json({
      status: 200,
      message: "Post status updated successfully",
    });
  } catch (error) {
    console.error("Error in delete post endpoint:", error);
    return res.json({
      status: 500,
      message: "Internal server error. Please try again later.",
    });
  }
});

postRouter.post("/profile/all/posts", async (req, res) => {
  try {
    const { username, token } = req.body;
    const cursor = req.body.cursor ? new Date(req.body.cursor) : null;
    const take = 20;
    console.log(username);

    const posts = await prisma.post.findMany({
      where: {
        creator: { username: username },
        status: true,
        anonymity: false,
        ...(cursor && { createdAt: { lt: cursor } }),
      },
      select: {
        id: true,
        caption: true,
        image: true,
        video: true,
        likesCount: true,
        anonymity: true,
        creator: {
          select: {
            id: true,
            username: true,
            image: true,
          },
        },
        createdAt: true,
        commentsCount: true,
      },
      orderBy: { createdAt: "desc" },
      take: take + 1,
    });

    const hasMore = posts.length > take;
    const returnPosts = hasMore ? posts.slice(0, take) : posts;
    const nextCursor = hasMore ? posts[take - 1].createdAt.toISOString() : null;

    const postsWithLikedState = await Promise.all(
      returnPosts.map(async (post) => {
        let isLiked = false;
        if (token) {
          const userId = jwt.verify(
            token,
            process.env.JWT_SECRET as string
          ) as { id: string };
          const like = await prisma.postLike.findUnique({
            where: { userId_postId: { userId: userId.id, postId: post.id } },
          });
          isLiked = !!like;
        }
        return {
          ...post,
          creator: post.creator, // No need to check anonymity here since we're filtering them out
          isLiked,
          createdAt: post.createdAt.toISOString(),
        };
      })
    );

    return res.json({ status: 200, posts: postsWithLikedState, nextCursor });
  } catch (error) {
    console.error("Error in postRouter /all/posts:", error);
    return res.json({ status: 500, message: "Try again later, Network error" });
  }
});

postRouter.post("/data", async (req, res) => {
  try {
    const { postId } = req.body;
    console.log(postId);
    const post = await prisma.post.findUnique({
      where: { id: postId, status: true },
      select: {
        id: true,
        image: true,
        video: true,
        anonymity: true,
        creator: {
          select: {
            id: true,
            username: true,
            image: true,
          },
        },
        createdAt: true,
      },
    });

    if (!post) {
      return res.status(404).json({ status: 404, message: "Post not found" });
    }

    // Modify the response to handle anonymous posts
    const responseData = {
      ...post,
      creator: post.anonymity
        ? {
            id: "anonymous",
            username: "Anonymous",
            image: null,
          }
        : post.creator,
    };

    return res.json({ status: 200, data: responseData });
  } catch (error) {
    console.error("Error fetching post:", error);
    return res
      .status(500)
      .json({ status: 500, message: "Internal server error" });
  }
});

export default postRouter;

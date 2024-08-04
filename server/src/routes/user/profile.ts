import express from "express";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";
import multer from "multer";
const prisma = new PrismaClient();
const upload = multer();
const userProfileRouter = express.Router();
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";

const s3 = new S3Client({
  region: process.env.BUCKET_REGION,
  credentials: {
    accessKeyId: process.env.ACCESS_KEY as string,
    secretAccessKey: process.env.SECRET_ACCESS_KEY as string,
  },
});

userProfileRouter.post("/data", async (req, res) => {
  try {
    const { token, username } = req.body;
    if (!token) {
      const person = await prisma.user.findUnique({
        where: { username: username },
        select: {
          id: true,
          username: true,
          image: true,
          bio: true,
          link: true,
          followersCount: true,
          followingCount: true,
        },
      });

      return res.json({
        status: 200,
        userdata: person,
      });
    }

    if (token) {
      const userId = jwt.verify(token, process.env.JWT_SECRET as string) as {
        id: string;
      };

      const userData = await prisma.user.findUnique({
        where: { id: userId.id },
      });
      if (!userData) {
        return res.json({ status: 401, message: "Unauthorized" });
      }

      const person = await prisma.user.findUnique({
        where: { username: username },
        select: {
          id: true,
          username: true,
          image: true,
          bio: true,
          link: true,
          followersCount: true,
          followingCount: true,
        },
      });
      if (!person) {
        return res.json({ status: 404, message: "user not found" });
      }
      const checkFollowStatus = await prisma.following.findFirst({
        where: {
          followerId: userId.id,
          followingId: person.id,
        },
      });
      if (!checkFollowStatus) {
        return res.json({
          status: 200,
          userdata: person,
          following: false,
        });
      }

      return res.json({
        status: 200,
        userdata: person,
        following: true,
      });
    }
  } catch (error) {
    console.log(error);
    return res.json({ status: 500, message: "error while fetching data" });
  }
});

userProfileRouter.post("/update", upload.single("image"), async (req, res) => {
  try {
    const file = req.file || null;
    const { token, bio, link } = req.body;
    if (
      typeof token !== "string" ||
      typeof bio !== "string" ||
      typeof link !== "string"
    ) {
      return res.json({ status: 400, message: "Invalid data or token" });
    }

    const userId = jwt.verify(token, process.env.JWT_SECRET as string) as {
      id: string;
    };

    const findUser = await prisma.user.findUnique({ where: { id: userId.id } });
    if (!findUser) {
      return res.json({ status: 401, message: "Unauthorized user" });
    }

    let imageUrl = findUser.image;

    if (file) {
      if (findUser.image) {
        const fileUrl = findUser.image;
        if (fileUrl) {
          const key = fileUrl.replace(
            `https://${process.env.CLOUDFRONT_DISTRIBUTION_DOMAIN}/`,
            ""
          );

          const deleteParams = {
            Bucket: process.env.BUCKET_NAME as string,
            Key: key,
          };

          try {
            const command = new DeleteObjectCommand(deleteParams);
            await s3.send(command);
          } catch (error) {
            console.error("Error deleting file from S3:", error);
          }
        }
      }
      const params = {
        Bucket: process.env.BUCKET_NAME,
        Key: `${userId.id}/Profile-Images/${Date.now()}-${file.originalname}`,
        Body: file.buffer,
        ContentType: file.mimetype,
      };

      try {
        const command = new PutObjectCommand(params);
        await s3.send(command);
      } catch (error) {
        return res.json({ status: 500, message: "Failed to upload image" });
      }
      imageUrl = `https://${process.env.CLOUDFRONT_DISTRIBUTION_DOMAIN}/${params.Key}`;
    }

    const success = await prisma.user.update({
      where: { id: userId.id },
      data: {
        bio,
        link,
        image: imageUrl,
      },
    });

    if (!success) {
      return res.json({ status: 403, message: "Failed to update profile" });
    }

    return res.json({ status: 200, message: "Profile updated successfully" });
  } catch (error) {
    console.error(error);
    return res.json({ status: 500, message: "Profile update failed" });
  }
});

userProfileRouter.post("/check-username", async (req, res) => {
  try {
    const { username } = req.body;

    if (!username || typeof username !== "string") {
      return res.json({ status: 400, message: "Invalid username" });
    }

    const checkUserName = await prisma.user.findFirst({
      where: {
        username: { equals: username, mode: "insensitive" },
      },
    });

    if (checkUserName) {
      return res.json({
        status: 409,
        message: "This username is already taken",
      });
    } else {
      return res.json({ status: 200, message: "This username is available" });
    }
  } catch (error) {
    console.error("Error checking username:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

userProfileRouter.post("/update-username", async (req, res) => {
  try {
    const { token, username } = req.body;

    if (!token || !username || typeof username !== "string") {
      return res.status(400).json({ message: "Invalid input" });
    }

    const userId = jwt.verify(token, process.env.JWT_SECRET as string) as {
      id: string;
    };

    const findUser = await prisma.user.findUnique({
      where: { id: userId.id },
    });

    if (!findUser) {
      return res.json({
        status: 401,
        message: "Unverified user",
      });
    }

    const checkUserName = await prisma.user.findFirst({
      where: {
        username: { equals: username, mode: "insensitive" },
        NOT: { id: userId.id },
      },
    });

    if (checkUserName) {
      return res.json({
        status: 409,
        message: "This username is already taken",
      });
    }

    const updateUsername = await prisma.user.update({
      where: { id: findUser.id },
      data: { username: username },
    });

    if (!updateUsername) {
      return res.status(500).json({
        message: "Username update failed due to an internal error",
      });
    }

    return res.json({
      status: 200,
      username: username,
      message: "Your Username has been updated",
    });
  } catch (error) {
    console.error("Error updating username:", error);
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({ message: "Invalid token" });
    }
    return res.status(500).json({ message: "Internal server error" });
  }
});

export default userProfileRouter;

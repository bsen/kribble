import express from "express";
import { PrismaClient } from "@prisma/client";
import admin from "firebase-admin";
const prisma = new PrismaClient();
import jwt from "jsonwebtoken";
import { z } from "zod";
const serviceAccount = require("../../../authkey.json");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});
const userAuthRouter = express.Router();
const emailSchema = z.string().email();
const idTokenSchema = z.string();

userAuthRouter.post("/verify", async (req, res) => {
  try {
    const { token } = req.body;
    if (token) {
      const userId = jwt.verify(token, process.env.JWT_SECRET as string) as {
        id: string;
      };
      if (!userId) {
        return res.json({ status: 901, message: "Not verified" });
      }
      const person = await prisma.user.findFirst({
        where: { id: userId.id },
        select: {
          id: true,
          username: true,
        },
      });
      if (!person) {
        return res.json({ status: 901, message: "Not verified" });
      }
      return res.json({
        status: 200,
        data: person.username,
      });
    } else {
      return res.json({ status: 901, message: "No token" });
    }
  } catch (error) {
    return res.json({ status: 901, message: "Invalid token" });
  }
});

userAuthRouter.post("/authentication", async (req, res) => {
  try {
    const { email, photoURL, idToken } = req.body;
    const emailRes = emailSchema.safeParse(email);
    const idTokenRes = idTokenSchema.safeParse(idToken);
    if (!emailRes.success || !idTokenRes.success) {
      return res
        .status(400)
        .json({ message: "Invalid email or authIdToken format" });
    }
    const decodedToken = await admin.auth().verifyIdToken(idToken);

    if (decodedToken.email !== email) {
      return res.status(400).json({ message: "Email mismatch" });
    }

    let user = await prisma.user.findFirst({
      where: { email: email },
    });

    if (!user) {
      const baseUsername = email.split("@")[0];
      let username = baseUsername;
      const generateRandomString = (length = 6) => {
        const characters = "abcdefghijklmnopqrstuvwxyz0123456789";
        return Array.from(
          { length },
          () => characters[Math.floor(Math.random() * characters.length)]
        ).join("");
      };

      let attempts = 0;
      while (await prisma.user.findFirst({ where: { username: username } })) {
        username = `${baseUsername}_${generateRandomString()}`;
        attempts++;
        if (attempts > 10) {
          return res.status(500).json({
            message: "Unable to generate unique username",
          });
        }
      }

      user = await prisma.user.create({
        data: {
          email: email,
          username: username,
          image: photoURL,
        },
      });

      if (!user) {
        return res.status(500).json({ message: "Account creation failed" });
      }
    }

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET as string);
    return res.json({
      status: 200,
      username: user.username,
      token: token,
      message: "Authentication successful",
    });
  } catch (error) {
    console.error("Authentication error:", error);
    if (error) {
      switch (error) {
        case "auth/id-token-expired":
          return res.status(401).json({ message: "Token expired" });
        case "auth/id-token-revoked":
          return res.status(401).json({ message: "Token revoked" });
        case "auth/invalid-id-token":
          return res.status(401).json({ message: "Invalid token" });
        default:
          return res.status(401).json({ message: "Authentication failed" });
      }
    }

    if (error instanceof Error) {
      console.error("Error message:", error.message);
    }

    return res.status(500).json({ message: "Internal server error" });
  }
});

export default userAuthRouter;

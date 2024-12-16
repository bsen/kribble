import express from "express";
import { PrismaClient } from "@prisma/client";
import admin from "firebase-admin";
const prisma = new PrismaClient();
import jwt from "jsonwebtoken";
import { z } from "zod";
// const serviceAccount = require("../../../authkey.json");
// admin.initializeApp({
//   credential: admin.credential.cert(serviceAccount),
// });
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
  console.log("[AUTH] Starting authentication process");
  try {
    const { email, photoURL, idToken } = req.body;
    console.log("[AUTH] Received authentication request for email:", email);

    const emailRes = emailSchema.safeParse(email);
    // const idTokenRes = idTokenSchema.safeParse(idToken);

    if (!emailRes.success) {
      console.warn("[AUTH] Invalid email format:", email);
      return res
        .status(400)
        .json({ message: "Invalid email or authIdToken format" });
    }

    // const decodedToken = await admin.auth().verifyIdToken(idToken);
    // console.log("[AUTH] Token verification result:", decodedToken);

    // if (decodedToken.email !== email) {
    //   console.warn("[AUTH] Email mismatch. Token email:", decodedToken.email, "Request email:", email);
    //   return res.status(400).json({ message: "Email mismatch" });
    // }

    let user = await prisma.user.findFirst({
      where: { email: email },
    });
    console.log(
      "[AUTH] User lookup result:",
      user ? "User found" : "User not found"
    );

    if (!user) {
      console.log("[AUTH] Creating new user account for email:", email);
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
        console.log(
          "[AUTH] Username collision, attempt",
          attempts + 1,
          "- Generating new username"
        );
        username = `${baseUsername}_${generateRandomString()}`;
        attempts++;
        if (attempts > 10) {
          console.error(
            "[AUTH] Failed to generate unique username after 10 attempts"
          );
          return res.status(500).json({
            message: "Unable to generate unique username",
          });
        }
      }

      console.log("[AUTH] Creating new user with username:", username);
      user = await prisma.user.create({
        data: {
          email: email,
          username: username,
          image: photoURL,
        },
      });

      if (!user) {
        console.error("[AUTH] User creation failed");
        return res.status(500).json({ message: "Account creation failed" });
      }
      console.log("[AUTH] New user account created successfully");
    }

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET as string);
    console.log(
      "[AUTH] JWT token generated successfully for user:",
      user.username
    );

    return res.json({
      status: 200,
      username: user.username,
      token: token,
      message: "Authentication successful",
    });
  } catch (error) {
    console.error("[AUTH] Authentication error:", error);
    if (error) {
      switch (error) {
        case "auth/id-token-expired":
          console.error("[AUTH] Token expired");
          return res.status(401).json({ message: "Token expired" });
        case "auth/id-token-revoked":
          console.error("[AUTH] Token revoked");
          return res.status(401).json({ message: "Token revoked" });
        case "auth/invalid-id-token":
          console.error("[AUTH] Invalid token");
          return res.status(401).json({ message: "Invalid token" });
        default:
          console.error("[AUTH] Authentication failed with unknown error");
          return res.status(401).json({ message: "Authentication failed" });
      }
    }

    if (error instanceof Error) {
      console.error("[AUTH] Detailed error message:", error.message);
    }

    console.error("[AUTH] Internal server error occurred");
    return res.status(500).json({ message: "Internal server error" });
  }
});

export default userAuthRouter;

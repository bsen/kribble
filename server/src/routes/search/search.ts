import express from "express";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
import jwt from "jsonwebtoken";

const searchRouter = express.Router();

searchRouter.post("/users", async (req, res) => {
  try {
    const searchingText = req.body.search;

    const searchUsers = await prisma.user.findMany({
      where: {
        OR: [
          {
            username: {
              contains: searchingText,
            },
          },
        ],
      },
      select: {
        username: true,
        image: true,
      },
      take: 25,
    });

    if (!searchUsers) {
      return res.json({ status: 404, message: "No search found" });
    }
    return res.json({
      status: 200,
      message: "User or Community found",
      users: searchUsers,
    });
  } catch (error) {
    console.log(error);
    return res.json({ status: 500, message: "Internal error" });
  }
});

export default searchRouter;

import { Hono } from "hono";
import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";
import { sign, verify } from "hono/jwt";
import { z } from "zod";
import { nanoid } from "nanoid";

export const kribtvRouter = new Hono<{
  Bindings: {
    DATABASE_URL: string;
    JWT_SECRET: string;
  };
}>();

interface Room {
  id: string;
  users: string[];
}

let roomQueue: string[] = [];
let rooms: { [key: string]: Room } = {};

kribtvRouter.post("/join-rooms", async (c) => {
  try {
    const body = await c.req.json();
    const token = body.token;

    const prisma = new PrismaClient({
      datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate());

    const userId = await verify(token, c.env.JWT_SECRET);

    const findUser = await prisma.user.findUnique({
      where: {
        id: userId.id,
      },
    });

    if (!findUser) {
      return c.json({ status: 401, message: "User is not authorised" });
    }

    if (findUser) {
      const availableRoom = Object.values(rooms).find(
        (room) => room.users.length === 1
      );

      if (availableRoom) {
        availableRoom.users.push(findUser.id);

        const roomId = availableRoom.id;

        if (availableRoom.users.length === 2) {
          const index = roomQueue.indexOf(availableRoom.id);
          if (index !== -1) {
            roomQueue.splice(index, 1);
          }
        }
        return c.json({ roomId });
      } else {
        const roomId = nanoid();
        const newRoom: Room = { id: roomId, users: [findUser.id] };
        rooms[roomId] = newRoom;
        roomQueue.push(roomId);
        return c.json({ status: 200, room: roomId });
      }
    }
  } catch (error) {
    console.log(error);
  }
});

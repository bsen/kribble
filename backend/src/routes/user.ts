import { Hono } from "hono";
import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";
import { decode, jwt, sign, verify } from "hono/jwt";

export const userRouter = new Hono<{
  Bindings: {
    DATABASE_URL: string;
    JWT_SECRET: string;
    CLOUDFLARE_IMGAES_ACCOUNT_ID: string;
    CLOUDFLARE_IMGAES_API_TOKEN: string;
    CLOUDFLARE_IMGAES_POST_URL: string;
  };
}>();

userRouter.post("/userdata", async (c) => {
  const body = await c.req.json();
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());

  const token = body.token;
  const userId = await verify(token, c.env.JWT_SECRET);

  try {
    const user = await prisma.user.findFirst({
      where: { id: userId.id },
      select: {
        id: true,
        name: true,
        email: true,
        username: true,
        gender: true,
        bio: true,
        followers: true,
        following: true,
        image: true,
        posts: true,
      },
    });

    if (!user) {
      return c.json({ status: 404, message: "user not found" });
    }

    return c.json({ status: 200, message: user });
  } catch (e) {
    return c.text("error while fetching data");
  }
});

userRouter.post("/bioupdate", async (c) => {
  const body = await c.req.json();
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());

  const token = body.token;
  const userId = await verify(token, c.env.JWT_SECRET);

  try {
    const user = await prisma.user.update({
      where: { id: userId.id },
      data: { bio: body.bio },
    });

    if (!user) {
      return c.json({ status: 404, message: "user not found" });
    }

    return c.json({ status: 200, message: "bio updated successfully" });
  } catch (e) {
    console.log(e);
    return c.text("error while updating bio");
  }
});

userRouter.post("/profile-picture-update", async (c) => {
  const formData = await c.req.formData();
  const file = formData.get("image");
  const token = formData.get("token");

  if (typeof token !== "string") {
    return c.json({ status: 400, message: "Invalid post or token" });
  }
  if (!file) {
    return c.json({ status: 400, message: "No image provided" }, 400);
  }
  const data = new FormData();
  const blob = new Blob([file]);
  data.append("file", blob, "profile-image");
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());
  const userId = await verify(token, c.env.JWT_SECRET);
  try {
    const response = await fetch(c.env.CLOUDFLARE_IMGAES_POST_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${c.env.CLOUDFLARE_IMGAES_API_TOKEN}`,
      },
      body: data,
    });
    const imgUrl = (await response.json()) as {
      result: { variants: string[] };
    };
    if (
      imgUrl.result &&
      imgUrl.result.variants &&
      imgUrl.result.variants.length > 0
    ) {
      const variantUrl = imgUrl.result.variants[0];
      const success = await prisma.user.update({
        where: { id: userId.id },
        data: {
          image: variantUrl,
        },
      });

      if (!success) {
        return c.json({ status: 403, message: "failed to create new post" });
      }
    } else {
      console.error("No variants found in the response.");
    }

    return c.json({ status: 200 });
  } catch (e) {
    console.log(e);
    return c.json({ status: 404 });
  }
});

userRouter.post("/follow-unfollow", async (c) => {
  const body = await c.req.json();
  const token = body.token;
  const otherUserName = body.otherUser;
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());

  const userId = await verify(token, c.env.JWT_SECRET);

  try {
    const currentUser = await prisma.user.findUnique({
      where: {
        id: userId.id,
      },
    });
    const otherUser = await prisma.user.findUnique({
      where: {
        username: otherUserName,
      },
    });

    if (!otherUser) {
      return c.json({ status: 404, error: "User not found" });
    }
    const isFollowing = await prisma.following.findUnique({
      where: {
        followerId_followingId: {
          followerId: currentUser!.id,
          followingId: otherUser.id,
        },
      },
    });
    if (!isFollowing) {
      await prisma.following.create({
        data: {
          followerId: currentUser!.id,
          followingId: otherUser.id,
        },
      });
      return c.json({ status: 200, message: "User followed successfully" });
    } else {
      await prisma.following.delete({
        where: {
          followerId_followingId: {
            followerId: currentUser!.id,
            followingId: otherUser.id,
          },
        },
      });
      return c.json({ status: 200, message: "User unfollowed successfully" });
    }
  } catch (error) {
    console.error(error);
    return c.json({ status: 500, error: "Something went wrong" });
  }
});

userRouter.post("/otheruser-data", async (c) => {
  const body = await c.req.json();
  const otherUser = body.otherUser;
  const token = body.token;
  const userId = await verify(token, c.env.JWT_SECRET);
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());
  try {
    const data = await prisma.user.findUnique({
      where: {
        username: otherUser,
      },
      select: {
        id: true,
        name: true,
        username: true,
        gender: true,
        bio: true,
        image: true,
        posts: true,
        followers: true,
        following: true,
      },
    });

    if (!data) {
      return c.json({ status: 404, message: "user not found" });
    }

    const checkFollowStatus = await prisma.following.findFirst({
      where: {
        followerId: userId.id,
        followingId: data.id,
      },
    });
    if (!checkFollowStatus) {
      return c.json({ status: 200, message: data, following: false });
    }
    return c.json({ status: 200, message: data, following: true });
  } catch (error) {
    console.log(error);
  }
});

userRouter.post("/matched-dates", async (c) => {
  const body = await c.req.json();
  const token = body.token;
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());
  const userId = await verify(token, c.env.JWT_SECRET);
  const findDates = await prisma.user.findUnique({
    where: {
      id: userId.id,
    },
    select: {
      matchedUsers: true,
    },
  });
  if (!findDates) {
    return c.json({ status: 404, message: "user not found or auth error" });
  }

  try {
    const userPromises = findDates.matchedUsers.map(async (userId) => {
      const userDetails = await prisma.user.findUnique({
        where: {
          id: userId,
        },
        select: {
          name: true,
          username: true,
          image: true,
        },
      });
      return userDetails;
    });

    const userMatchData = await Promise.all(userPromises);

    return c.json({ status: 200, message: userMatchData });
  } catch (error) {
    console.error("Error fetching user details:", error);
    return c.json({ status: 500, message: "Internal Server Error" });
  }
});

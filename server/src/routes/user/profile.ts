import { Hono } from "hono";
import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";
import { verify } from "hono/jwt";

export const userProfileRouter = new Hono<{
  Bindings: {
    DATABASE_URL: string;
    JWT_SECRET: string;
    CLOUDFLARE_IMGAES_ACCOUNT_ID: string;
    CLOUDFLARE_IMGAES_API_TOKEN: string;
    CLOUDFLARE_IMGAES_POST_URL: string;
  };
}>();

userProfileRouter.post("/data", async (c) => {
  try {
    const body = await c.req.json();
    const token = body.token;
    const username = body.username;
    const userId = await verify(token, c.env.JWT_SECRET);

    const prisma = new PrismaClient({
      datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate());

    const userData = await prisma.user.findUnique({ where: { id: userId.id } });
    if (!userData) {
      return c.json({ status: 401, message: "Unauthorized" });
    }

    const person = await prisma.user.findUnique({
      where: { username: username },
      select: {
        id: true,
        fullname: true,
        username: true,
        image: true,
        bio: true,
        website: true,
        college: true,
        interest: true,
        followersCount: true,
        followingCount: true,
      },
    });
    if (!person) {
      return c.json({ status: 404, message: "user not found" });
    }
    const checkFollowStatus = await prisma.following.findFirst({
      where: {
        followerId: userId.id,
        followingId: person.id,
      },
    });
    if (!checkFollowStatus) {
      return c.json({
        status: 200,
        message: person,
        following: false,
        currentUser: userData.username,
      });
    }
    return c.json({
      status: 200,
      message: person,
      following: true,
      currentUser: userData.username,
    });
  } catch (error) {
    console.log(error);
    return c.json({ status: 500, message: "error while fetching data" });
  }
});

userProfileRouter.post("/update", async (c) => {
  try {
    const formData = await c.req.formData();
    const file = formData.get("image");
    const token = formData.get("token");
    const newFullName = formData.get("fullname");
    const newBio = formData.get("bio");
    const newWebsite = formData.get("website");
    const newCollege = formData.get("college");
    const newInterest = formData.get("interest");

    const prisma = new PrismaClient({
      datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate());
    if (
      typeof token !== "string" ||
      typeof newBio !== "string" ||
      typeof newFullName !== "string" ||
      typeof newWebsite !== "string" ||
      typeof newCollege !== "string" ||
      typeof newInterest !== "string"
    ) {
      return c.json({ status: 400, message: "Invalid data or token" });
    }
    const userId = await verify(token, c.env.JWT_SECRET);
    const userData = await prisma.user.findUnique({ where: { id: userId.id } });
    if (!userData) {
      return c.json({ status: 401, message: "Unauthorized user" });
    }
    if (!file) {
      try {
        const updateProfile = await prisma.user.update({
          where: { id: userId.id },
          data: {
            fullname: newFullName,
            bio: newBio,
            website: newWebsite,
            college: newCollege,
            interest: newInterest,
          },
        });
        if (!updateProfile) {
          return c.json({ status: 400, message: "profile update failed" });
        }
        return c.json({ status: 200, mesgage: "profile updated successfuly" });
      } catch (error) {
        return c.json({ status: 500, message: "error" });
      }
    }
    const data = new FormData();
    const blob = new Blob([file]);
    data.append(
      "file",
      blob,
      "picture" + "-" + userData.username + ":" + userId.id
    );

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
          fullname: newFullName,
          bio: newBio,
          website: newWebsite,
          college: newCollege,
          interest: newInterest,
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
  } catch (error) {
    console.log(error);
    return c.json({ status: 500, message: "profile photo update failed" });
  }
});

userProfileRouter.post("/data/editting", async (c) => {
  try {
    const body = await c.req.json();
    const token = body.token;
    const userId = await verify(token, c.env.JWT_SECRET);
    const prisma = new PrismaClient({
      datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate());
    const person = await prisma.user.findFirst({
      where: { id: userId.id },
      select: {
        id: true,
        fullname: true,
        username: true,
        image: true,
        website: true,
        bio: true,
      },
    });
    if (!person) {
      return c.json({ status: 401, message: "Unauthorized" });
    }
    return c.json({
      status: 200,
      data: person.username,
      editdata: person,
    });
  } catch (error) {
    return c.json({ status: 400 });
  }
});

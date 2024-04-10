import { Hono } from "hono";
import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";
import { verify } from "hono/jwt";
import { BalancedPool } from "undici";

export const postRouter = new Hono<{
  Bindings: {
    DATABASE_URL: string;
    JWT_SECRET: string;
    CLOUDFLARE_IMGAES_ACCOUNT_ID: string;
    CLOUDFLARE_IMGAES_API_TOKEN: string;
    CLOUDFLARE_IMGAES_POST_URL: string;
  };
}>();
postRouter.post("/paginated-allposts", async (c) => {
  try {
    const body = await c.req.json();
    const prisma = new PrismaClient({
      datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate());

    const token = body.token;
    const userId = await verify(token, c.env.JWT_SECRET);
    const userData = await prisma.user.findUnique({ where: { id: userId.id } });

    if (!userData) {
      return c.json({ status: 401, message: "Unauthorized" });
    }

    const cursor = body.cursor || null;
    const take = 5;
    const allPosts = await prisma.post.findMany({
      include: {
        creator: {
          select: {
            id: true,
            username: true,
            name: true,
            image: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      cursor: cursor ? { id: cursor } : undefined,
      take: take + 1,
    });

    const hasMore = allPosts.length > take;
    const posts = hasMore ? allPosts.slice(0, -1) : allPosts;
    const nextCursor = hasMore ? allPosts[allPosts.length - 1].id : null;

    return c.json({
      status: 200,
      message: posts,
      nextCursor,
    });
  } catch (error) {
    console.log(error);
    return c.json({ status: 400 });
  }
});

postRouter.post("/create-full-post", async (c) => {
  try {
    const formData = await c.req.formData();
    const file = formData.get("image");
    const post = formData.get("post");
    const token = formData.get("token");

    if (typeof post !== "string" || typeof token !== "string") {
      return c.json({ status: 400, message: "Invalid post or token" });
    }
    const prisma = new PrismaClient({
      datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate());
    const userId = await verify(token, c.env.JWT_SECRET);
    const userData = await prisma.user.findUnique({ where: { id: userId.id } });
    if (!userData) {
      return c.json({ status: 401, message: "Unauthorized user" });
    }
    if (!file) {
      return c.json({ status: 400, message: "No image provided" });
    }
    const data = new FormData();
    const blob = new Blob([file]);
    data.append(
      "file",
      blob,
      "post" + "-" + userData.username + ":" + userId.id
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

      const success = await prisma.post.create({
        data: {
          content: post,
          creator: { connect: { id: userId.id } },
          image: variantUrl,
        },
      });

      if (!success) {
        return c.json({ status: 403, message: "Failed to create the post" });
      }
    } else {
      console.error("No variants found in the response.");
    }

    return c.json({ status: 200, message: "Post created successfully" });
  } catch (error) {
    return c.json({ status: 400, message: "Try again later, Network error" });
  }
});

postRouter.post("/create-text-post", async (c) => {
  try {
    const body = await c.req.json();
    const post = body.post;
    const token = body.token;
    const userId = await verify(token, c.env.JWT_SECRET);
    const prisma = new PrismaClient({
      datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate());
    const userData = await prisma.user.findUnique({ where: { id: userId.id } });
    if (!userData) {
      return c.json({ status: 401, message: "Unauthorized user" });
    }

    const createPost = await prisma.post.create({
      data: {
        content: post,
        creator: { connect: { id: userId.id } },
      },
    });

    if (!createPost) {
      return c.json({ status: 403, message: "Failed to create the post" });
    }

    return c.json({ status: 200, message: "Post created successfully" });
  } catch (error) {
    return c.json({ status: 400, message: "Try again later, Network error" });
  }
});

postRouter.post("/delete-post", async (c) => {
  try {
    const body = await c.req.json();
    const token = body.token;
    const postId = body.postDeleteId;
    const prisma = new PrismaClient({
      datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate());

    const userId = await verify(token, c.env.JWT_SECRET);
    const userData = await prisma.user.findUnique({ where: { id: userId.id } });
    if (!userData) {
      return c.json({ status: 401, message: "Unauthorized" });
    }
    const deletepost = await prisma.post.delete({
      where: {
        id: postId,
      },
    });

    if (!deletepost) {
      return c.json({ status: 403, message: "post deletion failed" });
    }

    return c.json({ status: 200, message: "post deleted successfuly" });
  } catch (error) {
    console.log(error);
    return c.json({ status: 400 });
  }
});

postRouter.post("/one-post-data", async (c) => {
  const body = await c.req.json();
  const token = body.token;
  const postId = body.postId;
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());
  const userId = await verify(token, c.env.JWT_SECRET);
  const findUser = await prisma.user.findUnique({ where: { id: userId.id } });
  if (!findUser) {
    return c.json({ status: 401, message: "User not authenticated" });
  }
  const findPost = await prisma.post.findUnique({
    where: {
      id: postId,
    },
    include: {
      creator: {
        select: {
          id: true,
          username: true,
          name: true,
          image: true,
        },
      },
    },
  });
  if (!findPost) {
    return c.json({ status: 401, message: "Post not found" });
  }
  return c.json({ status: 200, message: "Post found", data: findPost });
});

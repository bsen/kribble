import { Hono } from "hono";
import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";
import { decode, jwt, sign, verify } from "hono/jwt";
import { errorMonitor } from "form-data";
import { BalancedPool, RetryHandler } from "undici";
import { jsx } from "hono/jsx";

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
      console.log("user not authenticated");
      return c.json({ status: 400, message: "user not authenticated" });
    }
    const allPosts = await prisma.post.findMany({
      include: {
        creator: {
          select: {
            id: true,
            username: true,
            name: true,
            image: true,
            createdAt: true,
          },
        },
      },
    });

    if (!allPosts) {
      console.log("posts not found");
      return c.json({
        status: 400,
        message: "req failed, posts not found",
      });
    }

    return c.json({ status: 200, message: allPosts, user: userData.username });
  } catch (error) {
    console.log(error);
    return c.json({ status: 404 });
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
    if (!file) {
      return c.json({ status: 400, message: "No image provided" }, 400);
    }
    const data = new FormData();
    const blob = new Blob([file]);
    data.append("file", blob, "user_post_cloudflare_images");
    const prisma = new PrismaClient({
      datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate());
    const userId = await verify(token, c.env.JWT_SECRET);

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
        return c.json({ status: 403, message: "failed to create new post" });
      }
    } else {
      console.error("No variants found in the response.");
    }

    return c.json({ status: 200 });
  } catch (error) {
    console.log(error);
    return c.json({ status: 404 });
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

    const createPost = await prisma.post.create({
      data: {
        content: post,
        creator: { connect: { id: userId.id } },
      },
    });

    if (!createPost) {
      return c.json({ status: 400, message: "post creation failed" });
    }

    return c.json({ status: 200, message: "post created successfully" });
  } catch (error) {
    return c.json({ status: 500, message: "network error" });
  }
});

postRouter.post("/delete-post", async (c) => {
  try {
    const body = await c.req.json();
    const token = body.token;
    const postId = body.postId;
    const prisma = new PrismaClient({
      datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate());

    const userId = await verify(token, c.env.JWT_SECRET);
    const checkUser = await prisma.user.findUnique({
      where: {
        id: userId.id,
      },
    });
    if (!checkUser) {
      return c.json({ status: 400, message: "user not authenticated" });
    }
    const deletepost = await prisma.post.delete({
      where: {
        id: postId,
      },
    });

    if (!deletepost) {
      return c.json({ status: 404, message: "post deletion failed" });
    }

    return c.json({ status: 200, message: "post deleted successfuly" });
  } catch (error) {
    console.log(error);
    return c.json({ status: 404 });
  }
});

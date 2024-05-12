import { Hono } from "hono";
import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";
import { sign, verify } from "hono/jwt";
export const communityPostRouter = new Hono<{
  Bindings: {
    DATABASE_URL: string;
    JWT_SECRET: string;
    CLOUDFLARE_IMGAES_ACCOUNT_ID: string;
    CLOUDFLARE_IMGAES_API_TOKEN: string;
    CLOUDFLARE_IMGAES_POST_URL: string;
  };
}>();
communityPostRouter.post("/create", async (c) => {
  try {
    const formData = await c.req.formData();
    const file = formData.get("image") || null;
    const post = formData.get("post");
    const token = formData.get("token");
    const communityName = formData.get("communityName");
    const anonymity = formData.get("anonymity");
    let anonymityBollean;

    if (
      typeof post !== "string" ||
      typeof token !== "string" ||
      typeof communityName !== "string" ||
      typeof anonymity !== "string"
    ) {
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

    const findCommunity = await prisma.community.findFirst({
      where: { name: communityName },
    });
    if (!findCommunity) {
      return c.json({ status: 404, message: "No community found" });
    }

    if (anonymity === "false") {
      anonymityBollean = false;
    }
    if (anonymity === "true") {
      anonymityBollean = true;
    }

    let variantUrl = null;
    if (file) {
      const data = new FormData();
      const blob = new Blob([file]);
      data.append(
        "file",
        blob,
        "community:" + findCommunity.id + "postby" + userData.id
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
        variantUrl = imgUrl.result.variants[0];
      } else {
        console.error("No variants found in the response.");
      }
    }

    const createPost = await prisma.post.create({
      data: {
        content: post,
        anonymity: anonymityBollean,
        creator: { connect: { id: userId.id } },
        community: { connect: { id: findCommunity.id } },
        image: variantUrl || null,
      },
    });

    const countInc = await prisma.community.update({
      where: { id: findCommunity.id },
      data: {
        postsCount: { increment: 1 },
      },
    });

    if (!createPost || !countInc) {
      return c.json({
        status: 403,
        message: "Failed to create the community post",
      });
    }

    return c.json({
      status: 200,
      message: "Community post created successfully",
    });
  } catch (error) {
    return c.json({ status: 400, message: "Try again later, Network error" });
  }
});
communityPostRouter.post("/delete", async (c) => {
  try {
    const body = await c.req.json();
    const token = body.token;
    const postId = body.deletingPostId;
    const communityId = body.id;

    const prisma = new PrismaClient({
      datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate());

    const userId = await verify(token, c.env.JWT_SECRET);
    const findUser = await prisma.user.findUnique({ where: { id: userId.id } });

    if (!findUser) {
      return c.json({ status: 401, message: "Unauthorized" });
    }

    const findCommunity = await prisma.community.findUnique({
      where: { id: communityId },
      select: { creatorId: true },
    });

    if (!findCommunity) {
      return c.json({ status: 400, message: "No community found" });
    }

    if (findCommunity.creatorId === findUser.id) {
      const deleteLikes = await prisma.like.deleteMany({
        where: {
          postId: postId,
        },
      });

      const deleteComments = await prisma.comment.deleteMany({
        where: {
          postId: postId,
        },
      });

      const deletePost = await prisma.post.delete({
        where: {
          id: postId,
        },
      });

      const updateCount = await prisma.community.update({
        where: {
          id: communityId,
        },
        data: {
          postsCount: { decrement: 1 },
        },
      });

      if (!deletePost || !deleteLikes || !deleteComments || !updateCount) {
        return c.json({ status: 403, message: "Post deletion failed" });
      }

      return c.json({ status: 200, message: "Post deleted successfully" });
    }

    return c.json({
      status: 403,
      message: "Post can't be deleted by other parties",
    });
  } catch (error) {
    console.log(error);
    return c.json({ status: 400 });
  }
});

communityPostRouter.post("/all/posts", async (c) => {
  try {
    const body = await c.req.json();
    const prisma = new PrismaClient({
      datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate());
    const communityName = body.name;
    const token = body.token;
    const userId = await verify(token, c.env.JWT_SECRET);
    const findUser = await prisma.user.findUnique({ where: { id: userId.id } });
    if (!findUser) {
      return c.json({ status: 401, message: "Unauthorized" });
    }
    const cursor = body.cursor || null;
    const take = 10;
    const allPosts = await prisma.post.findMany({
      where: {
        community: { name: communityName },
      },
      select: {
        id: true,
        image: true,
        content: true,
        likesCount: true,
        anonymity: true,
        creator: {
          select: {
            id: true,
            username: true,
            name: true,
            image: true,
          },
        },
        community: {
          select: {
            name: true,
            image: true,
          },
        },
        createdAt: true,
        commentsCount: true,
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
    const postsWithLikedState = await Promise.all(
      posts.map(async (post) => {
        const isLiked = await prisma.like.findUnique({
          where: {
            userId_postId: {
              userId: findUser.id,
              postId: post.id,
            },
          },
        });
        const creatorDetails = post.anonymity
          ? {
              username: "Anonymous post",
              image: null,
            }
          : {
              username: post.creator.username,
              image: post.creator.image,
            };
        return {
          ...post,
          creator: {
            ...post.creator,
            ...creatorDetails,
          },
          isLiked: isLiked ? true : false,
        };
      })
    );
    return c.json({ status: 200, data: postsWithLikedState, nextCursor });
  } catch (error) {
    console.log(error);
    return c.json({ status: 400 });
  }
});

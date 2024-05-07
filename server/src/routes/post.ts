import { Hono } from "hono";
import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";
import { verify } from "hono/jwt";
import { string } from "zod";
import { poweredBy } from "hono/powered-by";

export const postRouter = new Hono<{
  Bindings: {
    DATABASE_URL: string;
    JWT_SECRET: string;
    CLOUDFLARE_IMGAES_ACCOUNT_ID: string;
    CLOUDFLARE_IMGAES_API_TOKEN: string;
    CLOUDFLARE_IMGAES_POST_URL: string;
  };
}>();
postRouter.post("/home-all-posts", async (c) => {
  try {
    const body = await c.req.json();
    const prisma = new PrismaClient({
      datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate());
    const token = body.token;
    const userId = await verify(token, c.env.JWT_SECRET);
    const findUser = await prisma.user.findUnique({ where: { id: userId.id } });
    if (!findUser) {
      return c.json({ status: 401, message: "Unauthorized" });
    }
    const cursor = body.cursor || null;
    const take = 10;
    const allPosts = await prisma.post.findMany({
      select: {
        id: true,
        image: true,
        content: true,
        likesCount: true,
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
        return {
          ...post,
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

postRouter.post("/user-all-posts", async (c) => {
  try {
    const body = await c.req.json();
    const username = body.username;
    const token = body.token;
    const userId = await verify(token, c.env.JWT_SECRET);
    const prisma = new PrismaClient({
      datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate());
    const findUser = await prisma.user.findUnique({ where: { id: userId.id } });
    if (!findUser) {
      return c.json({ status: 401, message: "Unauthorized Main User" });
    }
    const profileUser = await prisma.user.findUnique({
      where: { username: username },
    });
    if (!profileUser) {
      return c.json({ status: 401, message: "Unauthorized Other User" });
    }
    const cursor = body.cursor || null;
    const take = 10;

    const userposts = await prisma.post.findMany({
      where: { creatorId: profileUser?.id },
      select: {
        id: true,
        image: true,
        content: true,
        likesCount: true,
        creator: {
          select: {
            id: true,
            username: true,
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

    if (!userposts) {
      return c.json({ status: 400, message: "posts not found" });
    }

    const hasMore = userposts.length > take;
    const posts = hasMore ? userposts.slice(0, -1) : userposts;
    const nextCursor = hasMore ? userposts[userposts.length - 1].id : null;

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
        return {
          ...post,
          isLiked: isLiked ? true : false,
        };
      })
    );

    return c.json({ status: 200, posts: postsWithLikedState, nextCursor });
  } catch (error) {
    console.log(error);
    return c.json({ status: 400 });
  }
});
postRouter.post("/user-following-posts", async (c) => {
  try {
    const body = await c.req.json();
    const username = body.username;
    const token = body.token;
    const userId = await verify(token, c.env.JWT_SECRET);
    const prisma = new PrismaClient({
      datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate());
    const findUser = await prisma.user.findUnique({ where: { id: userId.id } });
    if (!findUser) {
      return c.json({ status: 401, message: "Unauthorized Main User" });
    }
    const profileUser = await prisma.user.findUnique({
      where: { username: username },
    });
    if (!profileUser) {
      return c.json({ status: 401, message: "Unauthorized Other User" });
    }
    const cursor = body.cursor || null;
    const take = 10;

    const followingPosts = await prisma.post.findMany({
      where: {
        OR: [
          {
            creator: {
              followers: {
                some: {
                  followerId: findUser.id,
                },
              },
            },
          },
          {
            community: {
              members: {
                some: {
                  userId: findUser.id,
                },
              },
            },
          },
        ],
      },
      select: {
        id: true,
        image: true,
        content: true,
        likesCount: true,
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
    if (!followingPosts) {
      return c.json({ status: 400, message: "posts not found" });
    }

    const hasMore = followingPosts.length > take;
    const posts = hasMore ? followingPosts.slice(0, -1) : followingPosts;
    const nextCursor = hasMore
      ? followingPosts[followingPosts.length - 1].id
      : null;

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
        return {
          ...post,
          isLiked: isLiked ? true : false,
        };
      })
    );

    return c.json({ status: 200, posts: postsWithLikedState, nextCursor });
  } catch (error) {
    console.log(error);
    return c.json({ status: 400 });
  }
});
postRouter.post("/one-post-data", async (c) => {
  try {
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
  } catch (error) {
    console.log(error);
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
    const deletepost = await prisma.post.delete({
      where: {
        id: postId,
      },
    });

    if (!deletepost || !deleteLikes || !deleteComments) {
      return c.json({ status: 403, message: "Post deletion failed" });
    }

    return c.json({ status: 200, message: "Post deleted successfuly" });
  } catch (error) {
    console.log(error);
    return c.json({ status: 400 });
  }
});

postRouter.post("/post-like-unlike", async (c) => {
  try {
    const body = await c.req.json();
    const token = body.token;
    const postId = body.postId;
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
      return c.json({ status: 401, message: "User not authenticated" });
    }

    const findLike = await prisma.like.findUnique({
      where: {
        userId_postId: {
          userId: findUser.id,
          postId: postId,
        },
      },
    });
    if (!findLike) {
      const createLike = await prisma.like.create({
        data: {
          userId: findUser.id,
          postId: postId,
        },
      });

      const incLikes = await prisma.post.update({
        where: {
          id: postId,
        },
        data: {
          likesCount: {
            increment: 1,
          },
        },
      });

      if (!createLike || !incLikes) {
        return c.json({ status: 400, message: "Liking post failed" });
      }
      return c.json({
        status: 200,
        message: "User liked the post successfully",
      });
    } else {
      const deleteLike = await prisma.like.delete({
        where: {
          userId_postId: {
            userId: findUser.id,
            postId: postId,
          },
        },
      });
      const decLikes = await prisma.post.update({
        where: {
          id: postId,
        },
        data: {
          likesCount: {
            decrement: 1,
          },
        },
      });

      if (!deleteLike || decLikes) {
        return c.json({ status: 400, message: "Liking post failed" });
      }
      return c.json({
        status: 200,
        message: "User unliked the post successfully",
      });
    }
  } catch (error) {
    console.log(error);
    return c.json({ status: 500, error: "Something went wrong" });
  }
});

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
userRouter.post("/user", async (c) => {
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
        username: true,
      },
    });
    if (!person) {
      return c.json({ status: 401, message: "Unauthorized" });
    }
    return c.json({ status: 200, message: person });
  } catch (error) {
    return c.json({ status: 400 });
  }
});

userRouter.post("/userdata", async (c) => {
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
        name: true,
        username: true,
        image: true,
        bio: true,
        website: true,
        interest: true,
        followers: true,
        following: true,
        matchedUsers: true,
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
userRouter.post("/posts", async (c) => {
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
    const take = 3;

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
userRouter.post("/comments", async (c) => {
  const body = await c.req.json();
  const token = body.token;
  const username = body.username;
  const cursor = body.cursor || null;
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());
  const userId = await verify(token, c.env.JWT_SECRET);
  const findUser = await prisma.user.findUnique({ where: { id: userId.id } });
  if (!findUser) {
    return c.json({ status: 400, message: "User not authenticated" });
  }
  const profileUser = await prisma.user.findUnique({
    where: { username: username },
  });
  if (!profileUser) {
    return c.json({ status: 401, message: "Unauthorized Other User" });
  }
  const take = 6;
  const findComments = await prisma.comment.findMany({
    where: {
      creatorId: profileUser.id,
    },
    orderBy: {
      createdAt: "desc",
    },
    cursor: cursor ? { id: cursor } : undefined,
    take: take + 1,
  });

  const hasMore = findComments.length > take;
  const comments = hasMore ? findComments.slice(0, -1) : findComments;
  const nextCursor = hasMore ? findComments[findComments.length - 1].id : null;

  if (!findComments) {
    return c.json({ status: 404, message: "Comments not found" });
  }
  return c.json({ status: 200, comments: comments, nextCursor });
});

userRouter.post("/profile/update", async (c) => {
  try {
    const formData = await c.req.formData();
    const file = formData.get("image");
    const token = formData.get("token");
    const newName = formData.get("name");
    const newBio = formData.get("bio");
    const newWebsite = formData.get("website");
    const newInterest = formData.get("interest");
    const prisma = new PrismaClient({
      datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate());
    if (
      typeof token !== "string" ||
      typeof newBio !== "string" ||
      typeof newName !== "string" ||
      typeof newWebsite !== "string" ||
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
            name: newName,
            bio: newBio,
            website: newWebsite,
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
          name: newName,
          bio: newBio,
          website: newWebsite,
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

userRouter.post("/follow-unfollow", async (c) => {
  try {
    const body = await c.req.json();
    const token = body.token;
    const followingUser = body.username;
    const prisma = new PrismaClient({
      datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate());

    const userId = await verify(token, c.env.JWT_SECRET);

    const currentUser = await prisma.user.findUnique({
      where: {
        id: userId.id,
      },
    });
    const otherUser = await prisma.user.findUnique({
      where: {
        username: followingUser,
      },
    });

    if (!otherUser) {
      return c.json({ status: 404, error: "User not found" });
    }
    console.log(currentUser, otherUser);
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

userRouter.post("/matched-dates", async (c) => {
  try {
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

    const userPromises = findDates.matchedUsers.map(async (userId) => {
      const userDetails = await prisma.user.findUnique({
        where: {
          id: userId,
        },
        select: {
          id: true,
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

userRouter.post("/following", async (c) => {
  try {
    const body = await c.req.json();
    const token = body.token;
    const username = body.username;
    const prisma = new PrismaClient({
      datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate());
    const userId = await verify(token, c.env.JWT_SECRET);
    if (!userId) {
      return c.json({ status: 401, message: "Unauthorized" });
    }
    const cursor = body.cursor || null;
    const take = 20;
    const profileUser = await prisma.user.findUnique({
      where: {
        username: username,
      },
    });
    if (!profileUser) {
      return c.json({ status: 401, message: "No user found" });
    }
    const allFollowing = await prisma.following.findMany({
      where: {
        followerId: profileUser.id,
      },
      select: {
        id: true,
        following: {
          select: {
            id: true,
            name: true,
            username: true,
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
    const hasMore = allFollowing.length > take;
    const following = hasMore ? allFollowing.slice(0, -1) : allFollowing;
    const nextCursor = hasMore
      ? allFollowing[allFollowing.length - 1].id
      : null;
    return c.json({ status: 200, data: following, nextCursor });
  } catch (error) {
    console.log(error);
    return c.json({ status: 400 });
  }
});

userRouter.post("/followers", async (c) => {
  try {
    const body = await c.req.json();
    const token = body.token;
    const username = body.username;
    const prisma = new PrismaClient({
      datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate());
    const userId = await verify(token, c.env.JWT_SECRET);
    if (!userId) {
      return c.json({ status: 401, message: "Unauthorized" });
    }
    const cursor = body.cursor || null;
    const take = 20;
    const profileUser = await prisma.user.findUnique({
      where: {
        username: username,
      },
    });
    if (!profileUser) {
      return c.json({ status: 401, message: "No user found" });
    }
    const allFollowers = await prisma.following.findMany({
      where: {
        followingId: profileUser.id,
      },
      select: {
        id: true,
        follower: {
          select: {
            id: true,
            name: true,
            username: true,
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
    const hasMore = allFollowers.length > take;
    const followers = hasMore ? allFollowers.slice(0, -1) : allFollowers;
    const nextCursor = hasMore
      ? allFollowers[allFollowers.length - 1].id
      : null;
    return c.json({ status: 200, data: followers, nextCursor });
  } catch (error) {
    console.log(error);
    return c.json({ status: 400 });
  }
});

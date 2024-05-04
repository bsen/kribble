import { Hono } from "hono";
import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";
import { sign, verify } from "hono/jwt";
import { date, string, z } from "zod";
export const communityRouter = new Hono<{
  Bindings: {
    DATABASE_URL: string;
    JWT_SECRET: string;
    CLOUDFLARE_IMGAES_ACCOUNT_ID: string;
    CLOUDFLARE_IMGAES_API_TOKEN: string;
    CLOUDFLARE_IMGAES_POST_URL: string;
  };
}>();

communityRouter.post("/community-all-posts", async (c) => {
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

communityRouter.post("/community-name-check", async (c) => {
  try {
    const body = await c.req.json();
    const name = body.name;
    const prisma = new PrismaClient({
      datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate());
    const checkName = await prisma.community.findFirst({
      where: {
        name: name,
      },
    });
    if (checkName) {
      return c.json({ status: 101 });
    } else {
      return c.json({ status: 102 });
    }
  } catch (error) {
    console.log(error);
  }
});

communityRouter.post("/create-community", async (c) => {
  try {
    const body = await c.req.json();
    const { token, name, catagory, description } = body;
    if (!token || !name || !catagory || !description) {
      return c.json({ status: 400, message: "Invalid data" });
    }
    const userId = await verify(token, c.env.JWT_SECRET);
    const prisma = new PrismaClient({
      datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate());
    console.log(name, catagory, description);
    const findUser = await prisma.user.findUnique({
      where: {
        id: userId.id,
      },
    });
    if (!findUser) {
      return c.json({ status: 400, message: "Authentication error" });
    }

    const checkName = await prisma.community.findFirst({
      where: {
        name: name,
      },
    });
    if (checkName) {
      return c.json({
        status: 400,
        message: "Community name is already taken",
      });
    }
    const createCommunity = await prisma.community.create({
      data: {
        creator: { connect: { id: findUser.id } },
        name: name,
        description: description,
        category: catagory,
      },
    });

    if (!createCommunity) {
      return c.json({
        status: 400,
        message: "Failed to create a new community",
      });
    }
    const communityMembership = await prisma.communityMembership.create({
      data: {
        userId: findUser.id,
        communityId: createCommunity.id,
      },
    });
    const membersCountIncrease = await prisma.community.update({
      where: {
        id: createCommunity.id,
      },
      data: {
        membersCount: { increment: 1 },
      },
    });
    if (!communityMembership || !membersCountIncrease) {
      return c.json({
        status: 400,
        message: "Server error to add the creator in community",
      });
    }
    return c.json({
      status: 200,
      message: "Successfully created a new community",
    });
  } catch (error) {
    console.log(error);
  }
});

communityRouter.post("/all-communities", async (c) => {
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
    const take = 15;
    const allCommunities = await prisma.community.findMany({
      select: {
        id: true,
        image: true,
        name: true,
        category: true,
        description: true,
        membersCount: true,
      },
      orderBy: {
        membersCount: "asc",
      },
      cursor: cursor ? { id: cursor } : undefined,
      take: take + 1,
    });

    const hasMore = allCommunities.length > take;
    const communities = hasMore ? allCommunities.slice(0, -1) : allCommunities;
    const nextCursor = hasMore
      ? allCommunities[allCommunities.length - 1].id
      : null;

    return c.json({ status: 200, data: communities, nextCursor });
  } catch (error) {
    console.log(error);
    return c.json({ status: 400 });
  }
});
communityRouter.post("/one-community-data", async (c) => {
  const body = await c.req.json();
  const token = body.token;
  const name = body.name;

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

  const findCommunityData = await prisma.community.findFirst({
    where: {
      name: name,
    },
    select: {
      id: true,
      name: true,
      description: true,
      category: true,
      image: true,
      membersCount: true,
      postsCount: true,
      creatorId: true,
      creator: { select: { username: true } },
    },
  });

  if (!findCommunityData) {
    return c.json({ status: 404, message: "No community found" });
  }
  if (findUser.id === findCommunityData.creatorId) {
    return c.json({
      status: 200,
      data: findCommunityData,
      joined: true,
      creator: true,
    });
  }
  const checkJoinedStatus = await prisma.communityMembership.findUnique({
    where: {
      userId_communityId: {
        userId: findUser.id,
        communityId: findCommunityData.id,
      },
    },
  });

  if (!checkJoinedStatus) {
    return c.json({
      status: 200,
      data: findCommunityData,
      joined: false,
      creator: false,
    });
  }

  return c.json({
    status: 200,
    data: findCommunityData,
    joined: true,
    creator: false,
  });
});
communityRouter.post("/join-leave-community", async (c) => {
  try {
    const body = await c.req.json();
    const token = body.token;
    const communityName = body.name;

    const prisma = new PrismaClient({
      datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate());

    const userId = await verify(token, c.env.JWT_SECRET);
    const currentUser = await prisma.user.findUnique({
      where: {
        id: userId.id,
      },
    });

    const community = await prisma.community.findFirst({
      where: {
        name: communityName,
      },
    });

    if (!community) {
      return c.json({ status: 404, error: "Community not found" });
    }

    const isMember = await prisma.communityMembership.findUnique({
      where: {
        userId_communityId: {
          userId: currentUser!.id,
          communityId: community.id,
        },
      },
    });
    if (!isMember) {
      await prisma.communityMembership.create({
        data: {
          user: { connect: { id: currentUser!.id } },
          community: { connect: { id: community.id } },
        },
      });
      await prisma.community.update({
        where: { id: community.id },
        data: { membersCount: { increment: 1 } },
      });

      return c.json({ status: 200, message: "Joined community successfully" });
    } else {
      await prisma.communityMembership.delete({
        where: {
          userId_communityId: {
            userId: currentUser!.id,
            communityId: community.id,
          },
        },
      });

      await prisma.community.update({
        where: { id: community.id },
        data: { membersCount: { decrement: 1 } },
      });

      return c.json({ status: 200, message: "Left community successfully" });
    }
  } catch (error) {
    console.error(error);
    return c.json({ status: 500, error: "Something went wrong" });
  }
});

communityRouter.post("/create-community-full-post", async (c) => {
  try {
    const formData = await c.req.formData();
    const file = formData.get("image");
    const post = formData.get("post");
    const token = formData.get("token");
    const communityName = formData.get("communityName");

    if (
      typeof post !== "string" ||
      typeof token !== "string" ||
      typeof communityName !== "string"
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

    if (!file) {
      return c.json({ status: 400, message: "No image provided" });
    }
    const data = new FormData();
    const blob = new Blob([file]);
    data.append(
      "file",
      blob,
      "community-post" + "-" + findCommunity.name + userData.username
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

      const createPost = await prisma.post.create({
        data: {
          content: post,
          creator: { connect: { id: userId.id } },
          community: { connect: { id: findCommunity.id } },
          image: variantUrl,
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
    } else {
      console.error("No variants found in the response.");
    }

    return c.json({
      status: 200,
      message: "Community post created successfully",
    });
  } catch (error) {
    return c.json({ status: 400, message: "Try again later, Network error" });
  }
});

communityRouter.post("/create-community-text-post", async (c) => {
  try {
    const body = await c.req.json();
    const post = body.post;
    const token = body.token;
    const communityName = body.communityName;
    const userId = await verify(token, c.env.JWT_SECRET);
    const prisma = new PrismaClient({
      datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate());
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
    const createPost = await prisma.post.create({
      data: {
        content: post,
        creator: { connect: { id: userId.id } },
        community: { connect: { id: findCommunity.id } },
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
      message: "Pommunity post created successfully",
    });
  } catch (error) {
    return c.json({ status: 400, message: "Try again later, Network error" });
  }
});

communityRouter.post("/update-details", async (c) => {
  try {
    const formData = await c.req.formData();
    const file = formData.get("image");
    const token = formData.get("token");
    const communityId = formData.get("id");
    const newDescription = formData.get("description");
    const newCategory = formData.get("category");
    const prisma = new PrismaClient({
      datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate());
    console.log(file);
    if (
      typeof token !== "string" ||
      typeof communityId !== "string" ||
      typeof newDescription !== "string" ||
      typeof newCategory !== "string"
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
        const updateDetails = await prisma.community.update({
          where: { id: communityId },
          data: {
            description: newDescription,
            category: newCategory,
          },
        });
        if (!updateDetails) {
          return c.json({
            status: 400,
            message: "Community profile updation failed",
          });
        }
        return c.json({
          status: 200,
          mesgage: "Community profile updated successfuly",
        });
      } catch (error) {
        return c.json({
          status: 500,
          message: "Community profile updation failed",
        });
      }
    }
    const data = new FormData();
    const blob = new Blob([file]);
    data.append("file", blob, "comunity-profile-picture" + "-" + communityId);
    console.log(data);
    const response = await fetch(c.env.CLOUDFLARE_IMGAES_POST_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${c.env.CLOUDFLARE_IMGAES_API_TOKEN}`,
      },
      body: data,
    });
    console.log(response);
    const imgUrl = (await response.json()) as {
      result: { variants: string[] };
    };
    if (
      imgUrl.result &&
      imgUrl.result.variants &&
      imgUrl.result.variants.length > 0
    ) {
      const variantUrl = imgUrl.result.variants[0];
      const success = await prisma.community.update({
        where: { id: communityId },
        data: {
          description: newDescription,
          category: newCategory,
          image: variantUrl,
        },
      });
      console.log(success);

      if (!success) {
        return c.json({
          status: 403,
          message: "Failed to create update community profile photo",
        });
      }
    } else {
      console.error("No variants found in the response.");
    }
    return c.json({
      status: 200,
      message: "Community profile updated successfuly",
    });
  } catch (error) {
    console.log(error);
    return c.json({
      status: 500,
      message: "Community profile photo updation failed",
    });
  }
});
communityRouter.post("/delete-community-post", async (c) => {
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

communityRouter.post("/one-user-communities", async (c) => {
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
    const take = 15;
    const allCommunities = await prisma.community.findMany({
      where: { creatorId: findUser.id },
      select: {
        id: true,
        image: true,
        name: true,
        category: true,
        description: true,
        membersCount: true,
      },
      orderBy: {
        membersCount: "asc",
      },
      cursor: cursor ? { id: cursor } : undefined,
      take: take + 1,
    });

    const hasMore = allCommunities.length > take;
    const communities = hasMore ? allCommunities.slice(0, -1) : allCommunities;
    const nextCursor = hasMore
      ? allCommunities[allCommunities.length - 1].id
      : null;

    return c.json({ status: 200, data: communities, nextCursor });
  } catch (error) {
    console.log(error);
    return c.json({ status: 400 });
  }
});

communityRouter.post("delete-community", async (c) => {
  try {
    const body = await c.req.json();
    const token = body.token;
    const communityId = body.communityId;

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
      return c.json({ status: 401, message: "Unauthorized" });
    }
    const deleteCommunityPosts = await prisma.post.deleteMany({
      where: {
        communityId: communityId,
      },
    });
    const deleteAssociatedMemberships =
      await prisma.communityMembership.deleteMany({
        where: {
          communityId: communityId,
        },
      });
    const deleteCommunity = await prisma.community.delete({
      where: {
        id: communityId,
        creatorId: findUser.id,
      },
    });

    if (
      !deleteCommunityPosts ||
      !deleteAssociatedMemberships ||
      !deleteCommunity
    ) {
      return c.json({ status: 400, message: "Community deletion failed" });
    }
    return c.json({ status: 200, message: "Community deletion successful" });
  } catch (error) {
    console.log(error);
  }
});

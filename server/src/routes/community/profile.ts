import { Hono } from "hono";
import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";
import { sign, verify } from "hono/jwt";

export const communityProfileRouter = new Hono<{
  Bindings: {
    DATABASE_URL: string;
    JWT_SECRET: string;
    CLOUDFLARE_IMGAES_ACCOUNT_ID: string;
    CLOUDFLARE_IMGAES_API_TOKEN: string;
    CLOUDFLARE_IMGAES_POST_URL: string;
  };
}>();

communityProfileRouter.post("/data", async (c) => {
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

communityProfileRouter.post("/update", async (c) => {
  try {
    const formData = await c.req.formData();
    const file = formData.get("image");
    const token = formData.get("token");
    const communityId = formData.get("id");
    const newDescription = formData.get("description");
    const prisma = new PrismaClient({
      datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate());
    if (
      typeof token !== "string" ||
      typeof communityId !== "string" ||
      typeof newDescription !== "string"
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
          where: { id: communityId, creatorId: userData.id },
          data: {
            description: newDescription,
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
      const success = await prisma.community.update({
        where: { id: communityId },
        data: {
          description: newDescription,
          image: variantUrl,
        },
      });

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
communityProfileRouter.post("/edit/data", async (c) => {
  try {
    const body = await c.req.json();
    const token = body.token;
    const name = body.name;

    const userId = await verify(token, c.env.JWT_SECRET);

    if (!userId || !userId.id) {
      return c.json({ status: 401, message: "Invalid token" });
    }

    const prisma = new PrismaClient({
      datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate());

    const findUser = await prisma.user.findUnique({
      where: {
        id: userId.id,
      },
    });

    if (!findUser) {
      console.log("User not found");
      return c.json({ status: 401, message: "Unauthorised" });
    }

    const community = await prisma.community.findFirst({
      where: { name, creatorId: findUser.id },
      select: {
        id: true,
        name: true,
        image: true,
        description: true,
      },
    });

    if (!community) {
      return c.json({ status: 404, message: "Community not found" });
    }

    return c.json({
      status: 200,
      data: community,
    });
  } catch (error) {
    console.error("Error:", error);
    return c.json({ status: 500, message: "Internal server error" });
  }
});

import { Hono } from "hono";
import { cors } from "hono/cors";
// USER ROUTERS IMPORT
import { userAuthRouter } from "./routes/user/auth";
import { userCommentRouter } from "./routes/user/comment";
import { userCommunitiesRouter } from "./routes/user/communities";
import { userFeedRouter } from "./routes/user/feed";
import { userFollowRouter } from "./routes/user/follow";
import { userConnectionsRouter } from "./routes/user/connections";
import { userPostRouter } from "./routes/user/post";
import { userProfileRouter } from "./routes/user/profile";
// SEARCH ROUTER IMPORT
import { searchRouter } from "./routes/search/search";
// POST ROUTERS IMPORT
import { postRouter } from "./routes/post/post";
import { postCommentRouter } from "./routes/post/comment";
import { postLikeRouter } from "./routes/post/like";
// MESSAGE ROUTER IMPORT
import { messageRouter } from "./routes/message/message";
// CONNECT ROUTER IMPORT
import { matchRouter } from "./routes/match/match";
// COMMUNITY ROUTER IMPORT
import { communitiesRouter } from "./routes/community/communities";
import { communityCreateRouter } from "./routes/community/create";
import { communityJoinRouter } from "./routes/community/join";
import { communityPostRouter } from "./routes/community/post";
import { communityProfileRouter } from "./routes/community/profile";

const app = new Hono<{
  Bindings: {
    DATABASE_URL: string;
    JWT_SECRET: string;
  };
}>();
app.get("/", (c) => {
  return c.text("Hono server is live!");
});
app.use("/*", cors());
// USER ROUTERS
app.route("/api/user/auth", userAuthRouter);
app.route("/api/user/feed", userFeedRouter);
app.route("/api/user/post", userPostRouter);
app.route("/api/user/profile", userProfileRouter);
app.route("/api/user/follow", userFollowRouter);
app.route("/api/user/connections", userConnectionsRouter);
app.route("/api/user/comment", userCommentRouter);
app.route("/api/user/communities", userCommunitiesRouter);
// SEARCH ROUTER
app.route("/api/search", searchRouter);
// POST ROUTERS
app.route("/api/post", postRouter);
app.route("/api/post/like", postLikeRouter);
app.route("/api/post/comment", postCommentRouter);
// MESSAGE ROUTER
app.route("/api/message", messageRouter);
// CONNECT ROUTER
app.route("/api/match", matchRouter);
// COMMUNITY ROUTER
app.route("/api/community/communities", communitiesRouter);
app.route("/api/community/create", communityCreateRouter);
app.route("/api/community/join", communityJoinRouter);
app.route("/api/community/post", communityPostRouter);
app.route("/api/community/profile", communityProfileRouter);

export default app;

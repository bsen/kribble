import express from "express";
import dotenv from "dotenv";
import cors from "cors";
const app = express();
app.use(cors());
app.use(express.json());
dotenv.config();
import userAuthRouter from "./routes/user/auth";
import userFeedRouter from "./routes/user/feed";
import userProfileRouter from "./routes/user/profile";
import userFollowRouter from "./routes/user/follow";
import notificationRouter from "./routes/user/notification";
import searchRouter from "./routes/search/search";
import postRouter from "./routes/post/post";
import postLikeRouter from "./routes/post/like";
import postCommentRouter from "./routes/post/comment";
import reportRouter from "./routes/post/report";
import adminRouter from "./routes/admin/admin";

app.get("/", (req, res) => {
  res.json({ status: 200, message: "SERVER IS LIVE" });
});
// USER ROUTER
app.use("/api/user/auth", userAuthRouter);
app.use("/api/user/feed", userFeedRouter);
app.use("/api/user/profile", userProfileRouter);
app.use("/api/user/follow", userFollowRouter);
app.use("/api/user/notifications", notificationRouter);
// SEARCH ROUTER
app.use("/api/search", searchRouter);
// POST ROUTERS
app.use("/api/post", postRouter);
app.use("/api/post/like", postLikeRouter);
app.use("/api/post/comment", postCommentRouter);

//REPORT ROUTER
app.use("/api/report/post-comment", reportRouter);
// ADMIN ROUTER
app.use("/api/admin/v1/user", adminRouter);

const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log(`http://localhost:${port}`);
});

export default app;

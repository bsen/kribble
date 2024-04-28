const http = require("http");
const express = require("express");
const { Server } = require("socket.io");
const { UserManager } = require("./managers/UserManager");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

const userManager = new UserManager();

app.get("/api/v1/test", (req, res) => {
  res.json({ message: "Server is live" });
});

io.on("connection", (socket) => {
  console.log("a user connected");
  userManager.addUser("randomName", socket);
  socket.on("disconnect", () => {
    console.log("user disconnected");
    userManager.removeUser(socket.id);
  });
});

const PORT = 3000;
server.listen(PORT, () => {
  console.log("SERVER IS LIVE");
  console.log(`http://localhost:${PORT}`);
});

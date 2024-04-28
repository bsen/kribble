const http = require("http");
const { Server } = require("socket.io");
const { UserManager } = require("./managers/UserManager");

const server = http.createServer(http);

const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

const userManager = new UserManager();

io.on("connection", (socket) => {
  console.log("a user connected");
  userManager.addUser("randomName", socket);
  socket.on("disconnect", () => {
    console.log("user disconnected");
    userManager.removeUser(socket.id);
  });
});

server.listen(3000, () => {
  console.log("localhost:3000");
});

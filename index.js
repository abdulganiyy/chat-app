const express = require("express");
const http = require("http");
const socketio = require("socket.io");
const cors = require("cors");

const { addUser, removeUser, getUser, getUsersInRoom } = require("./users");

const app = express();
const server = http.createServer(app);
const io = socketio(server);

// const io = socketio(server, {
//   cors: {
//     origin: "http://localhost:3000",
//     credentials: true,
//   },
// });

app.use(cors());
app.use(require("./routes"));

io.on("connect", (socket) => {
  socket.on("join", ({ name, room }, callback) => {
    const { user, error } = addUser({ id: socket.id, name, room });

    if (error) callback(error);

    socket.join(user.room);

    socket.emit("message", {
      user: "admin",
      text: `${user.name} welcome to room ${user.room}`,
    });

    socket.broadcast
      .to(user.room)
      .emit("message", { user: "admin", text: `${user.name} just joined` });

    callback();
  });

  socket.on("sendMessage", (message, callback) => {
    const user = getUser(socket.id);

    io.to(user.room).emit("message", { user: user.name, text: message });

    callback();
  });

  socket.on("disconnect", () => {
    console.log("User has left");
  });
});

const PORT = process.env.PORT || 8000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

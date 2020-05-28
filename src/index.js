// require http module for server
const http = require("http");
const express = require("express");
const socketio = require("socket.io");
const Filter = require("bad-words"); // back words check
const {
  generateMessage,
  generateLocationMessage,
} = require("./utils/messages");
const {
  addUser,
  getUser,
  removeUser,
  getUsersInRoom,
} = require("./utils/users");

const app = express();
app.use(express.static("public"));
const server = http.createServer(app);
const io = socketio(server); // socketio must be called with raw html server passed in

// callback arg "socket" is an object contains info about the new connection
io.on("connection", (socket) => {
  console.log(`New WebSocket connection...`);

  socket.on("join", ({ username, room }, ackCallback) => {
    const { error, user } = addUser({ id: socket.id, username, room });
    if (error) {
      return ackCallback(error);
    }
    socket.join(user.room); // server specific method
    // emit to this connection
    socket.emit("message", generateMessage("Admin", "Welcome!"));
    // emit to all other connections except for this (to the room)
    socket.broadcast
      .to(user.room)
      .emit(
        "message",
        generateMessage("Admin", `${user.username} has joined.`)
      );
    // update room user list for client side rendering
    io.to(user.room).emit("roomData", {
      room: user.room,
      users: getUsersInRoom(user.room),
    });
    ackCallback();
  });

  socket.on("sendMessage", (clientMsg, ackCallback) => {
    const filter = new Filter();
    if (filter.isProfane(clientMsg)) {
      return ackCallback("Profanity is not allowed!");
    }
    const user = getUser(socket.id);
    // emit to all connections
    io.to(user.room).emit("message", generateMessage(user.username, clientMsg));
    ackCallback(); // send back acknowlegement
  });

  socket.on("sendLocation", (location, ackCallback) => {
    const { latitude, longitude } = location;
    const user = getUser(socket.id);
    io.to(user.room).emit(
      "locationMessage",
      generateLocationMessage(
        user.username,
        `https://google.com/maps?q=${latitude},${longitude}`
      )
    );
    ackCallback();
  });

  socket.on("disconnect", () => {
    const removedUser = removeUser(socket.id);
    if (removedUser) {
      io.to(removedUser.room).emit(
        "message",
        generateMessage("Admin", `${removedUser.username} has left the chat.`)
      );
      io.to(removedUser.room).emit("roomData", {
        room: removedUser.room,
        users: getUsersInRoom(removedUser.room),
      });
    }
  });
});

const port = process.env.PORT || 3000;
server.listen(port, () => console.log(`Server running on port ${port}...`));

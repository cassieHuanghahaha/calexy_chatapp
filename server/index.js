const path = require("path");
const http = require("http");
const express = require("express");
const socketio = require("socket.io");
const Filter = require("bad-words");
const {
  generateMessage,
  generateLocationMessage
} = require("./utils/messages");
const {
  addUser,
  removeUser,
  getUser,
  getUsersInRoom,
  getUserbyNameRoom,
  isRealString,
  getPrivateVal
} = require("./utils/users");
// const { isRealString, isPrivate } = require("./utils/validation");

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const port = process.env.PORT || 3000;
const publicDirectoryPath = path.join(__dirname, "../client");

app.use(express.static(publicDirectoryPath));

// sever(emit) -> client(receive) - acknowledgement -->server
// client(emit) -> server(receive) - acknowledgement -->client

io.on("connection", socket => {
  // server
  console.log("New WebSocket connection");

  socket.on("join", (options, callback) => {
    const { error, user } = addUser({ id: socket.id, ...options });

    if (error) {
      return callback(error);
    }
    socket.join(user.room); // emit event in that room; only users in that room can see the messages

    socket.emit(
      "message",
      generateMessage(
        "Admin",
        `Hello, ${
          user.username
        }, welcome to our chat room! Say Hi to everybody!`
      )
    );
    //broadcast send the event to every connection except the current one
    socket.broadcast
      .to(user.room)
      .emit(
        "message",
        generateMessage(
          "Admin",
          `${user.username} has joined! Say Hi to ${user.username}!`
        )
      );
    io.to(user.room).emit("roomData", {
      room: user.room,
      users: getUsersInRoom(user.room)
    });

    callback();
  });

  socket.on("createMessage", (message, callback) => {
    const user = getUser(socket.id);
    const filter = new Filter();

    if (filter.isProfane(message)) {
      return callback("Profanity is not allowed!");
    }
    // console.log("in create message");

    if (user && isRealString(message)) {
      var { targetName, room, realMessage } = getPrivateVal({
        text: message,
        room: user.room
      });
      targetName = targetName.trim().toLowerCase();
      room = room.trim().toLowerCase();
      var users = getUsersInRoom(room);
      const targetUser = users.filter(
        user => user.username === targetName && user.room === room
      )[0];

      if (targetUser) {
        targetID = targetUser.id;
        socket.broadcast
          .to(targetID)
          .emit(
            "message",
            generateMessage(user.username, realMessage + " (private)")
          );
        socket.emit(
          "message",
          generateMessage(user.username, message + " (private)")
        );
      } else {
        // io.to(user.room).emit(
        //   "message",
        //   generateMessage(user.username, message)
        // );
        socket.emit(
          "message",
          generateMessage(
            user.username,
            `Message sent failure. ${targetName} is not in this chat room.` +
              " (private)"
          )
        );
      }
    }

    callback();
  });

  socket.on("sendMessage", (message, callback) => {
    const user = getUser(socket.id);
    const filter = new Filter();

    if (filter.isProfane(message)) {
      return callback("Profanity is not allowed!");
    }

    // const usersInRoom = getUsersInRoom(user.room);
    io.to(user.room).emit("message", generateMessage(user.username, message));
    callback();
  });
  socket.on("sendLocation", (coords, callback) => {
    const user = getUser(socket.id);

    io.to(user.room).emit(
      "locationMessage",
      generateLocationMessage(
        user.username,
        `https://google.com/maps?q=${coords.latitude},${coords.longitude}`
      )
    );
    callback();
  });

  socket.on("findSomeone", callback => {
    const user = getUser(socket.id);
    var users = getUsersInRoom(user.room);
    if (users.length < 2) {
      const error = "There are no other users!";
      return callback(error);
    } else {
      const randomUsers = users.filter(
        randuser =>
          randuser.username != user.username && randuser.room === user.room
      );
      var randomUser =
        randomUsers[Math.floor(Math.random() * randomUsers.length)];
      // console.log("in index.js");
      // console.log(randomUser);
      socket.emit("updateMessage", randomUser);
    }
    callback();
  });

  socket.on("disconnect", () => {
    const user = removeUser(socket.id);

    if (user) {
      io.to(user.room).emit(
        "message",
        generateMessage("Admin", `${user.username} has left!`)
      );
      io.to(user.room).emit("roomData", {
        room: user.room,
        users: getUsersInRoom(user.room)
      });
    }
  });
});

server.listen(port, () => {
  console.log(`Server is up on port ${port}!`);
});

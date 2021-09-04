import express from "express";
// import WebSocket from "ws";
import SocketIO from "socket.io";
import http from "http";

const app = express();
const PORT = 5000;

app.set("view engine", "pug");
app.set("views", __dirname + "/views");
app.use("/public", express.static(__dirname + "/public"));

app.get("/", (req, res) => res.render("home"));
app.get("/*", (_, res) => res.redirect("/"));

const handleListen = () =>
  console.log(`Listening on http://localhost:${PORT}/`);

const httpServer = http.createServer(app);
const ioServer = SocketIO(httpServer);

function publicRooms() {
  const {
    sockets: {
      adapter: { sids, rooms },
    },
  } = ioServer;
  const publicRooms = [];
  rooms.forEach((_, key) => {
    if (sids.get(key) === undefined) {
      publicRooms.push(key);
    }
  });
  return publicRooms;
}

function countRoom(roomName) {
  return ioServer.sockets.adapter.rooms.get(roomName)?.size;
}

ioServer.on("connection", (socket) => {
  socket.nickname = "Anonymous";
  socket.on("enter_room", (roomName, done) => {
    socket.join(roomName);
    done(roomName, countRoom(roomName));
    socket.to(roomName).emit("welcome", socket.nickname, countRoom(roomName));
    ioServer.sockets.emit("room_change", publicRooms());
  });
  socket.on("nickname", (nickname) => {
    socket.nickname = nickname;
  });
  socket.on("message", (room, msg, done) => {
    socket.to(room).emit("message", `${socket.nickname}: ${msg}`);
    done();
  });
  socket.on("quit_room", (currentRoom, done) => {
    socket.rooms.forEach((room) => {
      socket.to(room).emit("bye", socket.nickname, countRoom(room) - 1);
    });
    socket.leave(currentRoom);
    ioServer.sockets.emit("room_change", publicRooms());
    done();
  });
  socket.on("disconnecting", () => {
    socket.rooms.forEach((room) => {
      socket.to(room).emit("bye", socket.nickname, countRoom(room) - 1);
    });
  });
  socket.on("disconnect", () => {
    ioServer.sockets.emit("room_change", publicRooms());
  });
});

/*
const wss = new WebSocket.Server({ server });

const sockets = [];

wss.on("connection", (socket) => {
  sockets.push(socket);
  socket["nickname"] = "Anonymous";
  console.log("Connected to Browser!!");
  socket.on("message", (message) => {
    const messageJSON = JSON.parse(message.toString("utf-8"));
    switch (messageJSON.type) {
      case "nickname":
        socket["nickname"] = messageJSON.payload;
        break;
      case "message":
        const newMessage = messageJSON.payload;
        sockets.forEach((aSocket) =>
          aSocket.send(`${socket.nickname}: ${newMessage}`)
        );
        break;
    }
  });
  socket.on("close", () => console.log("Disconnected from Browser"));
});
*/

httpServer.listen(PORT, handleListen);

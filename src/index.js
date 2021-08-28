import express from "express";
import WebSocket from "ws";
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

const server = http.createServer(app);

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

server.listen(PORT, handleListen);

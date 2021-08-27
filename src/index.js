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

wss.on("connection", (socket) => {
  console.log(socket);
});

server.listen(PORT, handleListen);

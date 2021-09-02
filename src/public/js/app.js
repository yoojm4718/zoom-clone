const socket = io();

const welcome = document.getElementById("welcome");
const welcomeForm = welcome.querySelector("form");
const room = document.getElementById("room");
const roomForm = room.querySelector("form");

room.hidden = true;
let currentRoom;

function addMessage(message) {
  const ul = room.querySelector("ul");
  const li = document.createElement("li");
  li.innerText = message;
  ul.append(li);
}

function handleQuitRoom() {
  socket.emit("quit_room", currentRoom, goTitle);
}

function showRoom(roomName) {
  currentRoom = roomName;
  welcome.hidden = true;
  room.hidden = false;
  const roomTitle = room.querySelector("h3");
  roomTitle.innerText = `Room Name: ${roomName}`;
  const quit = room.querySelector("#quit");
  quit.addEventListener("click", handleQuitRoom);
}

function goTitle() {
  currentRoom = undefined;
  welcome.hidden = false;
  room.hidden = true;
  const roomTitle = room.querySelector("h3");
  roomTitle.innerText = "";
}

function handleRoomSubmit(event) {
  event.preventDefault();
  const roomInput = welcomeForm.querySelector("#roomName");
  const nicknameInput = welcomeForm.querySelector("#nickname");
  socket.emit("nickname", nicknameInput.value);
  socket.emit("enter_room", roomInput.value, showRoom);
}

function handleRoomMessage(event) {
  event.preventDefault();
  const roomInput = roomForm.querySelector("input");
  const value = roomInput.value;
  socket.emit("message", currentRoom, value, () => {
    addMessage(`You: ${value}`);
  });
  roomInput.value = "";
}

welcomeForm.addEventListener("submit", handleRoomSubmit);
roomForm.addEventListener("submit", handleRoomMessage);

socket.on("welcome", (user) => {
  addMessage(`${user} Joined!`);
});

socket.on("message", (roomMessage) => {
  addMessage(roomMessage);
});

socket.on("bye", (user) => {
  addMessage(`${user} Left TT`);
});

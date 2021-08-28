const nicknameSaved = document.querySelector("h3");
const messageList = document.querySelector("ul");
const messageForm = document.querySelector("#sendMessages");
const nickForm = document.querySelector("#chooseNickname");

const socket = new WebSocket("ws://" + window.location.host);

function makeMessage(type, payload) {
  return JSON.stringify({
    type,
    payload,
  });
}

socket.addEventListener("open", () => {
  console.log("Connected to Server!");
});
socket.addEventListener("message", (message) => {
  const li = document.createElement("li");
  li.innerText = message.data;
  messageList.append(li);
});
socket.addEventListener("close", () => console.log("Disconnected from Server"));

function handleMsgSubmit(event) {
  event.preventDefault();
  const input = messageForm.querySelector("input");
  socket.send(makeMessage("message", input.value));
  input.value = "";
}

function handleNickSubmit(event) {
  event.preventDefault();
  const input = nickForm.querySelector("input");
  socket.send(makeMessage("nickname", input.value));
  nicknameSaved.innerText = "Nickname: " + input.value;
}

messageForm.addEventListener("submit", handleMsgSubmit);
nickForm.addEventListener("submit", handleNickSubmit);

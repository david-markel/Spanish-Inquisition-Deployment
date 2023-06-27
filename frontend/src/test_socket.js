const WebSocket = require("ws");

const socket = new WebSocket("ws://127.0.0.1:8000/ws/quiz/");

socket.on("open", function open() {
  console.log("[open] Connection established!");
  console.log("Sending a test message to server");
  socket.send("Test message from client");
});

socket.on("message", function incoming(data) {
  console.log(`[message] Data received from server: ${data}`);
});

socket.on("error", function error(err) {
  console.log(`[error] ${err.message}`);
});

const WebSocket = require("ws");

const socket = new WebSocket("ws://127.0.0.1:8000/ws/quiz/");

socket.on("open", function open() {
  console.log("[open] Connection established!");
  console.log("Sending a test message to server");

  // Create a message as a JavaScript object
  const message = {
    message: "Test message from client",
  };

  // Convert the message object into a JSON-formatted string and send it
  socket.send(JSON.stringify(message));
});

socket.on("message", function incoming(data) {
  console.log(`[message] Data received from server: ${data}`);
});

socket.on("error", function error(err) {
  console.log(`[error] ${err.message}`);
});

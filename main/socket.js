// express
const express = require("express");

exports.startServer = () => {
  // load socket.io
  console.log("server started");
  const ioApp = express();
  const http = require("http").Server(ioApp);
  const io = require("socket.io")(http);
  const port = process.env.SOCKET_PORT || 8118;

  // Socket.IO Server
  function onConnection(socket) {
    console.log("connected");
    socket.on("nextVideo", () => {
      socket.broadcast.emit("nextVideo");
    });
    socket.on("updateVideos", () => {
      socket.broadcast.emit("updateVideos");
    });
    socket.on("suddenTrigger", () => socket.broadcast.emit("suddenTrigger"));
  }

  io.on("connection", onConnection);
  // Listening for IO Server
  http.listen(port, () => console.log("Socket listening on port " + port));
};

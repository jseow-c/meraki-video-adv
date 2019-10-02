// express
const express = require("express");

exports.startServer = () => {
  // load socket.io
  const ioApp = express();
  const http = require("http").Server(ioApp);
  const io = require("socket.io")(http);
  const port = process.env.SOCKET_PORT || 8118;

  // Socket.IO Server
  function onConnection(socket) {
    console.log("connected");
    socket.on("nextVideo", () => socket.broadcast.emit("nextVideo"));
  }

  io.on("connection", onConnection);
  // Listening for IO Server
  http.listen(port, () => console.log("listening on port " + port));
};

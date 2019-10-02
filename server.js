// load express module
require("dotenv").config();
const express = require("express");
const path = require("path");

// start socket.io
const socketIO = require("./main/socket");
socketIO.startServer();

// start express app
const app = express();

// use jsonParser
app.use(express.json());

// load static html/css/js for testing
app.use("/assets", express.static("assets"));
app.use(express.static(path.join(__dirname, "static")));

//load from router
const indexRouter = require("./main/router");
app.use("/", indexRouter);

// Listening for Express Server
app.listen(process.env.PORT, function() {
  console.log(`Listening on port ${process.env.PORT}!`);
});

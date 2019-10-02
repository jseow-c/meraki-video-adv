// load express module
const express = require("express");

// start socket.io
const socketIO = require("./main/socket");
socketIO.startServer();

// load file system modules
const fs = require("fs");
const path = require("path");
// load aws module
const AWS = require("aws-sdk");

// load socket.io-client
const client = require("socket.io-client");
const socket = client.connect("http://localhost:8118");

const app = express();
app.use(express.json());

// load AWS credentials
AWS.config.loadFromPath("./credentials.json");

// load static html/css/js for testing
app.use(express.static(path.join(__dirname, "static")));

let videoSequence = [],
  videoNum;

// function to read json files
async function readJson(filePath) {
  let jsonData;
  fs.readFile(filePath, "utf8", async (err, jsonString) => {
    if (err) {
      console.log("Error reading file from disk:", err);
      return;
    }
    try {
      jsonData = JSON.parse(jsonString);
    } catch (err) {
      console.log("Error parsing JSON string:", err);
    }
  });
  return jsonData;
}
fs.readFile("./video.json", "utf8", async (err, jsonString) => {
  if (err) {
    console.log("Error reading file from disk:", err);
    return;
  }
  try {
    videoSequence = JSON.parse(jsonString);
    videoNum = videoSequence.length - 1;
  } catch (err) {
    console.log("Error parsing JSON string:", err);
  }
});

// videoSequence = readJson("./video.json");
// Promise.resolve(videoSequence);
console.log(videoSequence);
// videoNum = videoSequence.length - 1;
console.log(videoNum);

app.get("/", function(req, res) {
  res.sendFile(path.join(__dirname + "/index.html"));
});

app.get("/dashboard", function(req, res) {
  res.sendFile(path.join(__dirname + "/dashboard.html"));
});

app.get("/video/:video", function(req, res) {
  const path = `assets/${req.params.video}`;
  console.log(`Loading video ${req.params.video}`);
  const stat = fs.statSync(path);
  const fileSize = stat.size;
  const range = req.headers.range;

  if (range) {
    const parts = range.replace(/bytes=/, "").split("-");
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

    const chunkSize = end - start + 1;
    const file = fs.createReadStream(path, { start, end });
    const head = {
      "Content-Range": `bytes ${start}-${end}/${fileSize}`,
      "Accept-Ranges": "bytes",
      "Content-Length": chunkSize,
      "Content-Type": "video/mp4"
    };

    res.writeHead(206, head);
    file.pipe(res);
  } else {
    const head = {
      "Content-Length": fileSize,
      "Content-Type": "video/mp4"
    };
    res.writeHead(200, head);
    fs.createReadStream(path).pipe(res);
  }
});

app.get("/next", (req, res) => {
  // increment the videoNum
  if (videoNum === videoSequence.length - 1) {
    videoNum = -1;
  }
  videoNum += 1;
  socket.emit("nextVideo");

  res.send(videoSequence[videoNum].video);
});

app.get("/list", (req, res) => {
  const currentList = videoSequence.slice(videoNum);
  currentList.push(...videoSequence.slice(0, videoNum));
  res.send(currentList);
});

app.post("/list/change", (req, res) => {
  videoSequence = req.body;
  videoNum = 0;
  socket.emit("nextVideo");
  res.send("success");
});

// Listening for Express Server
app.listen(3000, function() {
  console.log("Listening on port 3000!");
});

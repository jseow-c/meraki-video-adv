// module imports
const fs = require("fs");
const path = require("path");
const client = require("socket.io-client");
const misc = require("./misc");

// load socket.io-client
const socket = client.connect(`${process.env.HOST}:${process.env.SOCKET_PORT}`);

// load variables
const videoFunction = require("./model");
let offlineSequence, offlineNum, onlineSequence, onlineNum;
videoFunction().then(data => {
  offlineSequence = data.offlineSequence;
  offlineNum = data.offlineNum;
  onlineSequence = data.onlineSequence;
  onlineNum = data.onlineNum;
});

exports.index = (req, res) => {
  res.sendFile(path.join(__dirname + "/html/youtube-index.html"));
};

exports.index_offline = (req, res) => {
  res.sendFile(path.join(__dirname + "/html/index.html"));
};

exports.dashboard = (req, res) => {
  res.sendFile(path.join(__dirname + "/html/youtube-dashboard.html"));
};

exports.dashboard_offline = (req, res) => {
  res.sendFile(path.join(__dirname + "/html/dashboard.html"));
};

exports.test = (req, res) => {
  res.sendFile(path.join(__dirname + "/html/test.html"));
};

exports.loadVideo = (req, res) => {
  const path = `main/assets/${req.params.video}`;
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
};

exports.offline_nextVideo = (req, res) => {
  // increment the offlineNum
  if (offlineNum === offlineSequence.length - 1) {
    offlineNum = -1;
  }
  offlineNum += 1;
  socket.emit("offline_nextVideo");

  res.send(offlineSequence[offlineNum].video);
};

exports.offline_listVideos = (req, res) => {
  const currentList = offlineSequence.slice(offlineNum);
  currentList.push(...offlineSequence.slice(0, offlineNum));
  res.send(currentList);
};

exports.offline_changeVideos = (req, res) => {
  offlineSequence = req.body;
  offlineNum = 0;
  socket.emit("offline_nextVideo");
  res.send("success");
};

// online

exports.nextVideo = (req, res) => {
  // increment the offlineNum
  if (onlineNum === onlineSequence.length - 1) {
    onlineNum = -1;
  }
  onlineNum += 1;
  socket.emit("nextVideo");

  res.send(onlineSequence[onlineNum].video);
};

exports.listVideos = (req, res) => {
  const currentList = onlineSequence.slice(onlineNum);
  currentList.push(...onlineSequence.slice(0, onlineNum));
  res.send(currentList);
};

exports.changeVideos = (req, res) => {
  onlineSequence = req.body;
  onlineNum = 0;
  socket.emit("nextVideo");
  res.send("success");
};

exports.snapPhoto = async (req, res) => {
  const photoUrl = await misc.snapCam();
  res.send(photoUrl);
};

exports.photoAWS = async (req, res) => {
  const photoUrl = await misc.awsCheck(req.body.url);
  res.send(photoUrl);
};

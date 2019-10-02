// module imports
const fs = require("fs");
const path = require("path");
const client = require("socket.io-client");
const misc = require("./misc");

// load socket.io-client
const socket = client.connect(`${process.env.HOST}:8118`);

// load variables
const videoFunction = require("./model");
let videoSequence, videoNum;
videoFunction().then(data => {
  videoSequence = data.videoSequence;
  videoNum = data.videoNum;
});

exports.index = (req, res) => {
  res.sendFile(path.join(__dirname + "/html/index.html"));
};

exports.dashboard = (req, res) => {
  res.sendFile(path.join(__dirname + "/html/dashboard.html"));
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

exports.nextVideo = (req, res) => {
  // increment the videoNum
  if (videoNum === videoSequence.length - 1) {
    videoNum = -1;
  }
  videoNum += 1;
  socket.emit("nextVideo");

  res.send(videoSequence[videoNum].video);
};

exports.listVideos = (req, res) => {
  const currentList = videoSequence.slice(videoNum);
  currentList.push(...videoSequence.slice(0, videoNum));
  res.send(currentList);
};

exports.changeVideos = (req, res) => {
  videoSequence = req.body;
  videoNum = 0;
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

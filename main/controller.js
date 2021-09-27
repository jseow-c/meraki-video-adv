// module imports
const fs = require("fs");
const path = require("path");
const client = require("socket.io-client");
const misc = require("./misc");

// load socket.io-client
const socket = client.connect(`${process.env.HOST}:${process.env.SOCKET_PORT}`);

// load variables
const videoFunction = require("./model");
let videos, videoSequence, rules;
videoFunction().then(data => {
  videos = data.videos;
  videoSequence = data.videoSequence;
  rules = data.rules;
});

exports.index = (_, res) => {
  res.sendFile(path.join(__dirname + "/html/index.html"));
};

exports.dashboard = (_, res) => {
  res.sendFile(path.join(__dirname + "/html/dashboard.html"));
};

exports.admin = (_, res) => {
  res.sendFile(path.join(__dirname + "/html/admin.html"));
};

exports.updateVideos = (req, res) => {
  videos = req.body;
  misc.writeJson("video.json", videos);
  socket.emit("nextVideo");
  res.send("success");
};

exports.updateRules = (req, res) => {
  rules = req.body;
  misc.writeJson("rule.json", rules);
  res.send("success");
};

exports.nextVideo = (_, res) => {
  // shift front to back
  videoSequence = [...videoSequence.slice(1), videoSequence[0]];
  const nextVideo = videoSequence[0];
  socket.emit("nextVideo");

  res.send(videos[nextVideo].video);
};

exports.listVideos = (_, res) => {
  res.send({ videos, videoSequence });
};

exports.listRules = (_, res) => {
  res.send(rules);
};

exports.changeVideos = (req, res) => {
  videoSequence = req.body.map(i => parseInt(i, 10));
  socket.emit("nextVideo");
  res.send("success");
};

exports.snapPhoto = async (_, res) => {
  const photoUrl = await misc.snapCam();
  res.send(photoUrl);
};

exports.photoAWS = async (req, res) => {
  const { url, file } = req.body;
  let awsData;
  if (url) {
    awsData = await misc.awsCheck(url);
  } else if (file) {
    awsData = await misc.awsUploadCheck(file);
  }
  const returnData = misc.ruleCheck(awsData, videoSequence, rules);
  res.send(returnData);
};

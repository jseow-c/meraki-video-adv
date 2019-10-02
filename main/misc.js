const fs = require("fs");
const fetch = require("node-fetch");
const AWS = require("aws-sdk");
const proxy = require("proxy-agent");

// get AWS settings
AWS.config.loadFromPath("./credentials.json");
if (process.env.PROXY) {
  AWS.config.update({
    httpOptions: { agent: proxy(process.env.PROXY) }
  });
}

const readFile = function(path) {
  return new Promise((resolve, reject) => {
    fs.readFile(path, "utf8", function(err, data) {
      if (err) {
        reject(err);
      }
      resolve(data);
    });
  });
};

const sleep = ms => {
  return new Promise(resolve => {
    setTimeout(resolve, ms);
  });
};

//Calls DetectFaces API and shows estimated ages of detected faces
async function DetectFaces(imageData) {
  // AWS.region = "ap-southeast-1";
  var rekognition = new AWS.Rekognition();
  var params = {
    Image: {
      Bytes: imageData
    },
    Attributes: ["ALL"]
  };
  const response = await rekognition.detectFaces(params).promise();
  return response.FaceDetails;
}

function cleanFaceDetails(data) {
  const cleanedData = [];
  for (let img of data) {
    const item = {};
    item["Age"] = (img.AgeRange.High + img.AgeRange.Low) / 2;
    item["Gender"] = img.Gender.Value;
    item["Emotion"] = img.Emotions.reduce(
      (acc, cur) => (acc.Confidence > cur.Confidence ? acc : cur),
      { Type: "None", Confidence: 0 }
    ).Type;
    cleanedData.push(item);
  }
  return cleanedData;
}

exports.readFile = readFile;

exports.snapCam = async () => {
  const rawBuffer = await readFile("meraki.json");
  const { apiKey, networkID, camSerial } = JSON.parse(rawBuffer);

  const url = `https://api.meraki.com/api/v0/networks/${networkID}/cameras/${camSerial}/snapshot`;
  const response = await fetch(url, {
    method: "POST", // *GET, POST, PUT, DELETE, etc.
    headers: {
      "X-Cisco-Meraki-API-Key": apiKey
    }
  });
  const responseJson = await response.json();

  // ensure photo is created by meraki
  for (i = 0; i < 30; i++) {
    const ensurePhoto = await fetch(responseJson.url);
    if (ensurePhoto.status !== 404) break;
    await sleep(500);
  }
  return responseJson.url;
};

exports.awsCheck = async url => {
  const response = await fetch(url);
  const buffer = await response.buffer();
  const data = await DetectFaces(buffer);
  return cleanFaceDetails(data);
};

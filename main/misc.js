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

const readFile = function (path) {
  return new Promise((resolve, reject) => {
    fs.readFile(path, "utf8", function (err, data) {
      if (err) {
        reject(err);
      }
      resolve(data);
    });
  });
};

exports.writeJson = function (path, data) {
  fs.writeFile(path, JSON.stringify(data, null, 2), err => {
    if (err) {
      console.log("Error writing file", err);
    } else {
      console.log("Successfully wrote file");
    }
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
    if (ensurePhoto.status !== 404 && ensurePhoto.status !== 400) break;
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

exports.awsUploadCheck = async image => {
  const buffer = new Buffer.from(
    image.replace(/^data:image\/\w+;base64,/, ""),
    "base64"
  );
  const data = await DetectFaces(buffer);
  return cleanFaceDetails(data);
};

// rules
const shiftIndex = (array, val) => {
  const index = array.findIndex(e => e === val);
  if (index !== 0) {
    array.splice(index, 1);
    array.splice(1, 0, val);
  }
  return array;
};

const eachRuleCheck = (data, newSequence, rule) => {
  const { ageChosen, gender, moodChosen } = data;
  switch (rule.rule) {
    case "kids":
      if (ageChosen === "<10" || ageChosen === "10-15") return true;
      break;
    case "old":
      if (ageChosen === "50-55" || ageChosen === ">55") return true;
      break;
    case "female":
      if (gender[1] > 0 && gender[0] === 0) return true;
      break;
    case "male":
      if (gender[1] === 0 && gender[0] > 0) return true;
      break;
    case "couple":
      if (gender[0] !== 0 && gender[1] !== 0) return true;
      break;
    case "unhappy":
      if (moodChosen === "Negative") return true;
      break;
    case "happy":
      if (moodChosen !== "Negative") return true;
      break;
    case "default":
      return true;
    default:
      return newSequence;
  }
};

function recognitionCheck(data, videoSequence, rules) {
  let newSequence = videoSequence.slice();
  for (let rule of rules) {
    const check = eachRuleCheck(data, newSequence, rule);
    if (check) {
      newSequence = shiftIndex(newSequence, parseInt(rule.video, 10));
      break;
    }
  }
  return newSequence;
}

// get largestIndex
const getLargestIndex = (iMax, x, i, arr) => (x > arr[iMax] ? i : iMax);

// check rules
exports.ruleCheck = (data, videoSequence, rules) => {
  const gender = [0, 0];
  const mood = [0, 0, 0];
  const age = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
  const happyMoods = ["HAPPY", "SURPRISED"];
  const neutralMoods = ["CALM", "CONFUSED"];
  const badMoods = ["FEAR", "SAD", "ANGRY", "DISGUSTED"];
  data.forEach(item => {
    if (item.Gender === "Male") gender[0] += 1;
    else gender[1] += 1;
    if (happyMoods.includes(item.Emotion)) mood[0] += 1;
    else if (neutralMoods.includes(item.Emotion)) mood[1] += 1;
    else mood[2] += 1;
    if (item.Age <= 10) age[0] += 1;
    else if (item.Age > 10 && item.Age <= 15) age[1] += 1;
    else if (item.Age > 15 && item.Age <= 20) age[2] += 1;
    else if (item.Age > 20 && item.Age <= 25) age[3] += 1;
    else if (item.Age > 25 && item.Age <= 30) age[4] += 1;
    else if (item.Age > 30 && item.Age <= 35) age[5] += 1;
    else if (item.Age > 35 && item.Age <= 40) age[6] += 1;
    else if (item.Age > 40 && item.Age <= 45) age[7] += 1;
    else if (item.Age > 45 && item.Age <= 50) age[8] += 1;
    else if (item.Age > 50 && item.Age <= 55) age[9] += 1;
    else age[10] += 1;
  });

  // Highest number in mood
  const idHighMood = mood.reduce(getLargestIndex, 0);
  let moodChosen = "Positive";
  if (idHighMood === 0) moodChosen = "Positive";
  else if (idHighMood === 1) moodChosen = "Neutral";
  else moodChosen = "Negative";

  // Highest number in gender
  const idHighGender = gender.reduce(getLargestIndex, 0);
  let genderChosen = "Male";
  if (idHighGender !== 0) genderChosen = "Female";

  // Highest number in age
  const idHighAge = age.reduce(getLargestIndex, 0);
  let ageChosen = "<10";
  if (idHighAge === 0) ageChosen = "<10";
  else if (idHighAge === 1) ageChosen = "10-15";
  else if (idHighAge === 2) ageChosen = "15-20";
  else if (idHighAge === 3) ageChosen = "20-25";
  else if (idHighAge === 4) ageChosen = "25-30";
  else if (idHighAge === 5) ageChosen = "30-35";
  else if (idHighAge === 6) ageChosen = "35-40";
  else if (idHighAge === 7) ageChosen = "40-45";
  else if (idHighAge === 8) ageChosen = "45-50";
  else if (idHighAge === 9) ageChosen = "50-55";
  else ageChosen = ">55";

  const collatedData = {
    moodChosen,
    genderChosen,
    ageChosen,
    mood,
    age,
    gender
  };

  console.log(videoSequence);
  const newSequence = recognitionCheck(collatedData, videoSequence, rules);

  return { sequence: newSequence, data: collatedData };
};

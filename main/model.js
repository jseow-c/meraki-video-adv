// Model Files
const misc = require("./misc");

module.exports = async () => {
  const rawBuffer = await misc.readFile("video.json");
  const videoSequence = JSON.parse(rawBuffer);
  const videoNum = videoSequence.length - 1;
  return { videoSequence, videoNum };
};

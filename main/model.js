// Model Files
const misc = require("./misc");

module.exports = async () => {
  const videoBuffer = await misc.readFile("video.json");
  const videos = JSON.parse(videoBuffer);
  const ruleBuffer = await misc.readFile("rule.json");
  const rules = JSON.parse(ruleBuffer);
  const videoSequence = [1, 2, 3, 4, 5, 6];
  return { videos, videoSequence, rules };
};

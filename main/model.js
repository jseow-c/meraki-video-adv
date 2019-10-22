// Model Files
const misc = require("./misc");

module.exports = async () => {
  const offlineBuffer = await misc.readFile("video.json");
  const onlineBuffer = await misc.readFile("videoOnline.json");
  const offlineSequence = JSON.parse(offlineBuffer);
  const offlineNum = offlineSequence.length - 1;
  const onlineSequence = JSON.parse(onlineBuffer);
  const onlineNum = onlineSequence.length - 1;
  return { offlineSequence, offlineNum, onlineSequence, onlineNum };
};

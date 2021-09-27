// connect to socket.io
const socket = io(`${server}:${socketPort}`);

socket.on("nextVideo", async () => {
  const data = await getVideos();
  videos = data.videos;
  sequence = data.videoSequence;
  // clear list
  const videoParentElement = document.getElementById("video-content");
  while (videoParentElement.firstChild) {
    videoParentElement.removeChild(videoParentElement.firstChild);
  }
  allVideoShow(videos, sequence);
});

// change the sequence
async function changeVideos(videos, cb = null) {
  await axios.post(`${server}:${port}/list/change`, videos);
  if (cb) cb();
}

// initialize video with animation
const allVideoShow = async (videos, sequence) => {
  for (let current of sequence) {
    const video = videos[current];
    const videoParentElement = document.getElementById("video-content");
    const childTitleElement = document.createElement("div");
    childTitleElement.className = "v-title slide-fade";
    childTitleElement.innerHTML = video.title;
    videoParentElement.appendChild(childTitleElement);
    const childVideoElement = document.createElement("img");
    childVideoElement.src = video.img;
    childVideoElement.alt = video.name;
    childVideoElement.className = "v-img slide-fade";
    videoParentElement.appendChild(childVideoElement);
    await new Promise(resolve =>
      setTimeout(() => {
        childTitleElement.className = "v-title show";
        resolve();
      }, 50)
    );
    await new Promise(resolve =>
      setTimeout(() => {
        childVideoElement.className = "v-img show";
        resolve();
      }, 100)
    );
  }
};

// simulate rules to govern video rotation
function ruleCheck(amt) {
  let sliderSequence = Object.keys(amt).reduce(
    (a, c) => [...a, { index: c, amt: amt[c] }],
    []
  );
  console.log(sliderSequence, amt);

  sliderSequence.sort((a, b) => b.amt - a.amt);
  sliderSequence = sliderSequence.map(i => parseInt(i.index));
  // ensure first video still at top
  const firstElement = sequence[0];
  sliderSequence.splice(sliderSequence.indexOf(firstElement), 1);
  sliderSequence.unshift(firstElement);
  sequenceCheck(sliderSequence);
}

function sequenceCheck(newSequence) {
  if (JSON.stringify(sequence) !== JSON.stringify(newSequence)) {
    changeVideos(newSequence);
  }
}

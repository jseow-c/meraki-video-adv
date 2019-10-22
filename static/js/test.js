// video variables
const video = document.getElementById("videoPlayer");
const source = document.createElement("source");

const listOfVideo = [];

// videoHandler
async function videoHandler(e, cb = null) {
  const response = await axios.get(`${server}:${port}/next`);
  source.setAttribute("src", `${server}:${port}/video/${response.data}`);

  video.load();
  if (cb) cb();
  video.play();
}

// initialize video
videoHandler(null, () => video.appendChild(source));

// handle when video ended
document
  .getElementById("videoPlayer")
  .addEventListener("ended", videoHandler, false);

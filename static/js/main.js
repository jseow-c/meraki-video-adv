// video variables
const video = document.getElementById("videoPlayer");
const source = document.createElement("source");

// videoHandler
async function videoHandler(e, cb = null) {
  const response = await axios.get("http://localhost:3000/next");
  source.setAttribute("src", `http://localhost:3000/video/${response.data}`);

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

// state all videos
let videos = [];

// connect to socket.io
const socket = io(`${server}:${socketPort}`);

socket.on("offline_nextVideo", async () => {
  videos = await getVideos();
  console.log(videos);
  // clear list
  const videoParentElement = document.getElementById("video-content");
  while (videoParentElement.firstChild) {
    videoParentElement.removeChild(videoParentElement.firstChild);
  }
  allVideoShow(videos);
});

// state all videos
async function getVideos() {
  const response = await axios.get(`${server}:${port}/offline/list`);
  return response.data;
}

// change the sequence
async function changeVideos(videos, cb = null) {
  await axios.post(`${server}:${port}/offline/list/change`, videos);
  if (cb) cb();
}

// initialize video with animation
const allVideoShow = async videos => {
  for (let video of videos) {
    const videoParentElement = document.getElementById("video-content");
    const childTitleElement = document.createElement("div");
    childTitleElement.className = "v-title slide-fade";
    childTitleElement.innerHTML = video.title;
    videoParentElement.appendChild(childTitleElement);
    const childVideoElement = document.createElement("img");
    childVideoElement.src = `img/${video.img}`;
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

async function startUp() {
  videos = await getVideos();
  allVideoShow(videos);
}

startUp();

// simulate rules to govern video rotation
function ruleCheck() {
  // check brands
  // const sliders = [
  //   { name: "Apple", tag: "apple", amt: 0.4 },
  //   { name: "Facebook", tag: "facebook", amt: 0.7 },
  //   { name: "Google", tag: "google", amt: 1 }
  // ];
  sliders.sort((a, b) => b.amt - a.amt);
  const newSliders = sliders.map(a => a.tag);
  console.log(sliders, newSliders, originalSlider);
  if (JSON.stringify(originalSlider) !== JSON.stringify(newSliders)) {
    // they are different
    originalSlider = newSliders;
    const firstElement = videos[0].name;
    videos.sort((a, b) => {
      const aIndex = sliders.findIndex(e => e.tag === a.brand);
      const bIndex = sliders.findIndex(e => e.tag === b.brand);
      if (b.name === firstElement) return 1;
      else if (bIndex < aIndex) return 1;
      else return -1;
      // if (b.name === firstElement) return 1;
      // else if (a.brand === sliders[0].tag) return -1;
      // else if (b.brand === sliders[0].tag) return 1;
      // else if (a.brand === sliders[1].tag && b.brand === sliders[2].tag)
      //   return -1;
      // else if (b.brand === sliders[1].tag && a.brand === sliders[2].tag)
      //   return 1;
      // else return 0;
    });
    console.log(firstElement, videos);
    changeVideos(videos);
    // // clear list
    // const videoParentElement = document.getElementById("video-content");
    // while (videoParentElement.firstChild) {
    //   videoParentElement.removeChild(videoParentElement.firstChild);
    // }
    // allVideoShow(videos);
  }
}

function recognitionCheck(mood, gender, age, noMale, noFemale) {
  console.log(mood, gender, age);
}

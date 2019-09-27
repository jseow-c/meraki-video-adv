// state all videos
let videos = [
  {
    img: "airpod.jpg",
    name: "airpod",
    title: "Apple Airpods",
    brand: "apple",
    gender: "female",
    minAge: 20,
    maxAge: 50
  },
  {
    img: "applewatch.jpg",
    name: "applewatch",
    title: "Apple Watch",
    brand: "apple",
    gender: "male",
    minAge: 20,
    maxAge: 50
  },
  {
    img: "iphone11.jpg",
    name: "iphone11",
    title: "Apple Iphone 11",
    brand: "apple",
    gender: "female",
    minAge: 20,
    maxAge: 50
  },
  {
    img: "macbook.jpg",
    name: "macbook",
    title: "Apple Macbook",
    brand: "apple",
    gender: "male",
    minAge: 20,
    maxAge: 50
  },
  {
    img: "oculus.png",
    name: "oculus",
    title: "Facebook Oculus",
    brand: "facebook",
    gender: "female",
    minAge: 20,
    maxAge: 50
  },
  {
    img: "portal.jpg",
    name: "portal",
    title: "Facebook Portal",
    brand: "facebook",
    gender: "female",
    minAge: 20,
    maxAge: 50
  },
  {
    img: "workplace.png",
    name: "workplace",
    title: "Facebook Workplace",
    brand: "facebook",
    gender: "male",
    minAge: 20,
    maxAge: 50
  },
  {
    img: "chromecast.jpg",
    name: "chromecast",
    title: "Google Chromecast",
    brand: "google",
    gender: "female",
    minAge: 20,
    maxAge: 50
  },
  {
    img: "googlehome.jpg",
    name: "googlehome",
    title: "Google Home",
    brand: "google",
    gender: "male",
    minAge: 20,
    maxAge: 50
  },
  {
    img: "pixel3.png",
    name: "pixel3",
    title: "Google Pixel 3",
    brand: "google",
    gender: "male",
    minAge: 20,
    maxAge: 50
  }
];
// initialize video with animation
const allVideoShow = async () => {
  for (let video of videos) {
    const videoParentElement = document.getElementById("video-content");
    const childTitleElement = document.createElement("div");
    childTitleElement.className = "v-title slide-fade";
    childTitleElement.innerHTML = video.title;
    videoParentElement.appendChild(childTitleElement);
    const childVideoElement = document.createElement("img");
    childVideoElement.src = `/assets/img/${video.img}`;
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
      }, 200)
    );
  }
};
allVideoShow();

// simulate rotation of videos
setInterval(() => {
  const element = videos.shift();
  videos.push(element);
  const videoParentElement = document.getElementById("video-content");
  const childTitleElement = videoParentElement.childNodes[0];
  videoParentElement.removeChild(childTitleElement);
  videoParentElement.appendChild(childTitleElement);
  const childVideoElement = videoParentElement.childNodes[0];
  videoParentElement.removeChild(childVideoElement);
  videoParentElement.appendChild(childVideoElement);
}, 10000);

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
  if (JSON.stringify(originalSlider) !== JSON.stringify(newSliders)) {
    // they are different
    originalSlider = newSliders;
    const firstElement = videos[0].name;
    videos.sort((a, b) => {
      if (b.name === firstElement) return 0;
      else if (a.brand === sliders[0].tag) return -1;
      else if (b.brand === sliders[0].tag) return 1;
      else if (a.brand === sliders[1].tag && b.brand === sliders[2].tag)
        return -1;
      else if (b.brand === sliders[1].tag && a.brand === sliders[2].tag)
        return 1;
      else return 0;
    });
    // clear list
    const videoParentElement = document.getElementById("video-content");
    while (videoParentElement.firstChild) {
      videoParentElement.removeChild(videoParentElement.firstChild);
    }
    allVideoShow();
  }
}

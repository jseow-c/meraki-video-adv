let videos = {},
  sequence = [],
  rules = [];

async function getVideos() {
  const response = await axios.get(`${server}:${port}/list`);
  return response.data;
}

async function getRules() {
  const response = await axios.get(`${server}:${port}/rules`);
  return response.data;
}

function fillUpVideo(data) {
  const titleElement = document.getElementById(`video${data.index}_title`);
  const iconElement = document.getElementById(`video${data.index}_icon`);
  const videoElement = document.getElementById(`video${data.index}_video`);
  const imageElement = document.getElementById(`video${data.index}_image`);
  titleElement.value = data.title;
  iconElement.value = data.icon;
  videoElement.value = `https://www.youtube.com/watch?v=${data.video}`;
  imageElement.value = data.img;
}

async function startUp() {
  const data = await getVideos();
  videos = data.videos;
  sequence = data.videoSequence;
  rules = await getRules();
  // fill the video gallery forms
  for (let seq of [...Array(6).keys()].map(i => i + 1)) {
    fillUpVideo(videos[seq]);
  }

  // fill the rules form
  for (let rule of rules) {
    addRuleRow(rule);
  }
}

startUp();

// submission
function isFileImage(file) {
  return file && file["type"].split("/")[0] === "image";
}

function submitCheck(data) {
  // check youtube url
  videoRegex = /https:\/\/www\.youtube\.com\/watch\?v=([0-9a-zA-Z_-]+)/;
  const match = data.video.match(videoRegex);
  if (!match) {
    alert(`${data.video} is invalid video.`);
    return data, false;
  } else data.video = match[1];

  return data, true;
}

function onSubmit(event) {
  event.preventDefault();
  const submitData = {};
  for (let seq of [...Array(6).keys()].map(i => i + 1)) {
    submitData[seq] = {
      index: seq,
      img: event.target.elements[`video${seq}_image`].value,
      video: event.target.elements[`video${seq}_video`].value,
      title: event.target.elements[`video${seq}_title`].value,
      icon: event.target.elements[`video${seq}_icon`].value
    };
    submitCheck(submitData[seq]);
  }
  if (confirm("Submit new videos?")) {
    axios.post(`${server}:${port}/list/update`, submitData);
  }
}

function toggleDashboard() {
  const val = document.querySelector('input[name="dashboard"]:checked').value;
  if (val === "videos")
    document.getElementById("card").className = "card videos-only";
  else if (val === "images")
    document.getElementById("card").className = "card images-only";
  else if (val === "rules")
    document.getElementById("card").className = "card rules-only";
}

// rule page

function addRuleRow(data = {}) {
  if ("content" in document.createElement("template")) {
    var content = document.querySelector("#rules-rows");
    var template = document.querySelector("#rulerow");

    // Clone the new row and insert it into the table
    var clone = template.content.cloneNode(true);
    var selects = clone.querySelectorAll("select");

    let i = -1;
    for (let select of selects[1].children) {
      i += 1;
      if (i === 0) continue;
      select.innerHTML = videos[i].title;
    }

    if (data?.rule && data?.video) {
      selects[0].value = data.rule;
      selects[1].value = data.video;
    }

    content.insertBefore(clone, content.children[content.children.length - 2]);
  }
}

function onRuleDelete(event) {
  event.preventDefault();
  event.target.parentElement.remove();
}

function submitRules(event) {
  event.preventDefault();
  const submitData = [];
  for (let i = 0; i < event.target.elements.length - 1; i += 2) {
    submitData.push({
      rule: event.target.elements[i]?.value,
      video: event.target.elements[i + 1]?.value
    });
  }

  // check if last one is default
  for (let i = 0; i < submitData.length; i++) {
    if (!submitData[i].rule || !submitData[i].video) {
      alert("Rule or Video is empty.");
      return;
    }
    if (i < submitData.length - 1 && submitData[i].rule === "default") {
      alert("Prior rules cannot be default");
      return;
    } else if (
      i === submitData.length - 1 &&
      submitData[i].rule !== "default"
    ) {
      alert("Last rule must be default");
      return;
    }
  }
  //
  if (confirm("Submit new rules?")) {
    axios.post(`${server}:${port}/rules/update`, submitData);
  }
}

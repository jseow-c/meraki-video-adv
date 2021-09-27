// get largestIndex
const getLargestIndex = (iMax, x, i, arr) => (x > arr[iMax] ? i : iMax);

const getCount = (arr, search) => {
  return arr.reduce(function (n, val) {
    return n + (val === search);
  }, 0);
};

// state all videos
async function snapMeraki(url = null) {
  let targetUrl;
  const merakiElement = document.getElementById("meraki");
  merakiElement.src = "img/loading.gif";
  if (url) {
    merakiElement.src = url;
    targetUrl = url;
  } else {
    const response = await axios.post(`${server}:${port}/snap`);
    merakiElement.src = response.data;
    console.log(response.data);
    targetUrl = response.data;
  }
  const awsResponse = await axios.post(`${server}:${port}/image/aws`, {
    url: targetUrl
  });

  chartChange(awsResponse.data);
}

const toBase64 = file =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });

async function uploadMeraki() {
  const files = document.getElementById("imageUpload").files;
  if (files) {
    const file = await toBase64(files[0]);
    const merakiElement = document.getElementById("meraki");
    merakiElement.src = file;

    const awsResponse = await axios.post(`${server}:${port}/image/aws`, {
      file
    });

    chartChange(awsResponse.data);
  }
}

function chartChange(awsData) {
  const { data, sequence } = awsData;

  moodChart.data.datasets[0].data = data.mood;
  // Highest number in mood
  moodChart.options.elements.center.text = data.moodChosen;
  moodChart.update();

  // set genderChart
  genderChart.data.datasets[0].data = data.gender;
  // Highest number in gender
  genderChart.options.elements.center.text = data.genderChosen;
  genderChart.update();

  // set ageChart
  myChart.data.datasets[0].data = data.age;
  // Highest number in age
  myChart.options.title.text = `Age Demographic - ${data.ageChosen}`;
  myChart.update();

  sequenceCheck(sequence);
}

function toggleDashboard() {
  const val = document.querySelector('input[name="dashboard"]:checked').value;
  if (val === "whole") document.getElementById("card").className = "card";
  else if (val === "image")
    document.getElementById("card").className = "card image-only";
}

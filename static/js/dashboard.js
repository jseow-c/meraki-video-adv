// get largestIndex
const getLargestIndex = (iMax, x, i, arr) => (x > arr[iMax] ? i : iMax);

const getCount = (arr, search) => {
  return arr.reduce(function(n, val) {
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
    targetUrl = response.data;
  }
  const awsResponse = await axios.post(`${server}:${port}/image/aws`, {
    url: targetUrl
  });
  const total = awsResponse.data.length;
  const gender = [0, 0];
  const mood = [0, 0, 0];
  const age = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
  const happyMoods = ["HAPPY", "SURPRISED"];
  const neutralMoods = ["CALM", "CONFUSED"];
  const badMoods = ["FEAR", "SAD", "ANGRY", "DISGUSTED"];
  awsResponse.data.forEach(item => {
    if (item.Gender === "Male") gender[0] += 1;
    else gender[1] += 1;
    if (happyMoods.includes(item.Emotion)) mood[0] += 1;
    else if (neutralMoods.includes(item.Emotion)) mood[1] += 1;
    else mood[2] += 1;
    if (item.Age <= 10) age[0] += 1;
    else if (item.Age > 10 && item.Age <= 15) age[1] += 1;
    else if (item.Age > 15 && item.Age <= 20) age[2] += 1;
    else if (item.Age > 20 && item.Age <= 25) age[3] += 1;
    else if (item.Age > 25 && item.Age <= 30) age[4] += 1;
    else if (item.Age > 30 && item.Age <= 35) age[5] += 1;
    else if (item.Age > 35 && item.Age <= 40) age[6] += 1;
    else if (item.Age > 40 && item.Age <= 45) age[7] += 1;
    else if (item.Age > 45 && item.Age <= 50) age[8] += 1;
    else if (item.Age > 50 && item.Age <= 55) age[9] += 1;
    else age[10] += 1;
  });

  moodChart.data.datasets[0].data = mood;
  // Highest number in mood
  const idHighMood = mood.reduce(getLargestIndex, 0);
  let moodChosen = "Positive";
  if (idHighMood === 0) moodChosen = "Positive";
  else if (idHighMood === 1) moodChosen = "Neutral";
  else moodChosen = "Negative";
  moodChart.options.elements.center.text = moodChosen;
  moodChart.update();

  // set genderChart
  genderChart.data.datasets[0].data = gender;
  console.log(gender);
  // Highest number in gender
  const idHighGender = gender.reduce(getLargestIndex, 0);
  let genderChosen = "Male";
  if (idHighGender !== 0) genderChosen = "Female";
  genderChart.options.elements.center.text = genderChosen;
  genderChart.update();

  // set ageChart
  myChart.data.datasets[0].data = age;
  // Highest number in age
  const idHighAge = age.reduce(getLargestIndex, 0);
  let ageChosen = "<10";
  if (idHighAge === 0) ageChosen = "<10";
  else if (idHighAge === 1) ageChosen = "10-15";
  else if (idHighAge === 2) ageChosen = "15-20";
  else if (idHighAge === 3) ageChosen = "20-25";
  else if (idHighAge === 4) ageChosen = "25-30";
  else if (idHighAge === 5) ageChosen = "30-35";
  else if (idHighAge === 6) ageChosen = "35-40";
  else if (idHighAge === 7) ageChosen = "40-45";
  else if (idHighAge === 8) ageChosen = "45-50";
  else if (idHighAge === 9) ageChosen = "50-55";
  else ageChosen = ">55";
  myChart.options.title.text = `Age Demographic - ${ageChosen}`;
  myChart.update();

  recognitionCheck(moodChosen, genderChosen, ageChosen, gender[0], gender[1]);
}

function toggleDashboard() {
  const val = document.querySelector('input[name="dashboard"]:checked').value;
  if (val === "whole") document.getElementById("card").className = "card";
  else if (val === "image")
    document.getElementById("card").className = "card image-only";
  console.log(val);
}

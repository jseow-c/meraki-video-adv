// state all videos
async function snapMeraki(url = null) {
  let targetUrl;
  const merakiElement = document.getElementById("meraki");
  merakiElement.src = "img/loading.gif";
  if (url) {
    merakiElement.src = url;
    targetUrl = url;
  } else {
    const response = await axios.post("http://localhost:3000/snap");
    merakiElement.src = response.data;
    targetUrl = response.data;
  }
  const awsResponse = await axios.post("http://localhost:3000/image/aws", {
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
  console.log(mood, gender, age);
  moodChart.data.datasets[0].data = mood;
  const centerMood = ((mood[0] * 100) / total).toFixed(0);
  moodChart.options.elements.center.text = `${centerMood || "No Data"}`;
  moodChart.update();
  genderChart.data.datasets[0].data = gender;
  const centerGender = ((gender[1] * 100) / total).toFixed(0);
  genderChart.options.elements.center.text = `${centerGender || "No Data"}`;
  genderChart.update();
  myChart.data.datasets[0].data = age;
  myChart.update();
}

function toggleDashboard() {
  const val = document.querySelector('input[name="dashboard"]:checked').value;
  if (val === "whole") document.getElementById("card").className = "card";
  else if (val === "image")
    document.getElementById("card").className = "card image-only";
  console.log(val);
}

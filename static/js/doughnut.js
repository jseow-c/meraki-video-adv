Chart.pluginService.register({
  beforeDraw: function(chart) {
    if (chart.config.options.elements.center) {
      //Get ctx from string
      var ctx = chart.chart.ctx;

      //Get options from the center object in options
      var centerConfig = chart.config.options.elements.center;
      var fontStyle = centerConfig.fontStyle || "san-serif";
      var txt = centerConfig.text;
      var color = centerConfig.color || "#000";
      var sidePadding = centerConfig.sidePadding || 20;
      var sidePaddingCalculated = (sidePadding / 100) * (chart.innerRadius * 2);
      //Start with a base font of 30px
      ctx.font = "30px " + fontStyle;

      //Get the width of the string and also the width of the element minus 10 to give it 5px side padding
      var stringWidth = ctx.measureText(txt).width;
      var elementWidth = chart.innerRadius * 2 - sidePaddingCalculated;

      // Find out how much the font can grow in width.
      var widthRatio = elementWidth / stringWidth;
      var newFontSize = Math.floor(30 * widthRatio);
      var elementHeight = chart.innerRadius * 2;

      // Pick a new font size so it will not be larger than the height of label.
      var fontSizeToUse = Math.min(newFontSize, elementHeight);

      //Set font settings to draw it correctly.
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      var centerX = (chart.chartArea.left + chart.chartArea.right) / 2;
      var centerY = (chart.chartArea.top + chart.chartArea.bottom) / 2;
      ctx.font = fontSizeToUse + "px " + fontStyle;
      ctx.fillStyle = color;

      //Draw text in center
      ctx.fillText(txt, centerX, centerY);
    }
  }
});

const moodConfig = {
  type: "doughnut",
  data: {
    labels: ["Positive", "Neutral", "Negative"],
    datasets: [
      {
        data: [60, 30, 10],
        borderColor: "rgba(0,0,0,0)",
        backgroundColor: ["#a0d911", "#ffa940", "#FF6384"],
        hoverBackgroundColor: ["#a0d911", "#ffa940", "#FF6384"]
      }
    ]
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    cutoutPercentage: 50,
    legend: {
      display: true,
      labels: {
        fontFamily: "Source Sans Pro",
        fontColor: "#fafafa",
        fontSize: 16,
        boxWidth: 15
      }
    },
    elements: {
      center: {
        text: "Positive",
        color: "#fafafa", // Default is #000000
        fontStyle: "Source Sans Pro", // Default is Arial
        sidePadding: 20 // Default is 20 (as a percentage)
      }
    }
  }
};

const moodCtx = document.getElementById("moodChart").getContext("2d");
const moodChart = new Chart(moodCtx, moodConfig);

const genderConfig = {
  type: "doughnut",
  data: {
    labels: ["Male", "Female"],
    datasets: [
      {
        data: [70, 80],
        borderColor: "rgba(0,0,0,0)",
        backgroundColor: ["rgba(95, 209, 249, 1)", "#f759ab"],
        hoverBackgroundColor: ["rgba(95, 209, 249, 1)", "#f759ab"]
      }
    ]
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    cutoutPercentage: 50,
    legend: {
      display: true,
      labels: {
        fontFamily: "Source Sans Pro",
        fontColor: "#fafafa",
        fontSize: 16,
        boxWidth: 15
      }
    },
    elements: {
      center: {
        text: "Female",
        color: "#fafafa", // Default is #000000
        fontStyle: "Source Sans Pro", // Default is Arial
        sidePadding: 30 // Default is 20 (as a percentage)
      }
    }
  }
};

const genderCtx = document.getElementById("genderChart").getContext("2d");
const genderChart = new Chart(genderCtx, genderConfig);

var chartColors = {
  red: "rgb(255, 99, 132)",
  orange: "rgb(255, 159, 64)",
  yellow: "rgb(255, 205, 86)",
  green: "rgb(75, 192, 192)",
  blue: "rgb(54, 162, 235)",
  purple: "rgb(153, 102, 255)",
  grey: "rgb(231,233,237)",
  white: "rgba(255,255,255,0.8)"
};

var randomScalingFactor = function() {
  return (Math.random() > 0.5 ? 1.0 : 1.0) * Math.round(Math.random() * 96) + 4;
};

// draws a rectangle with a rounded top
Chart.helpers.drawRoundedTopRectangle = function(
  ctx,
  x,
  y,
  width,
  height,
  radius
) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  // top right corner
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  // bottom right	corner
  ctx.lineTo(x + width, y + height);
  // bottom left corner
  ctx.lineTo(x, y + height);
  // top left
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
};

Chart.elements.RoundedTopRectangle = Chart.elements.Rectangle.extend({
  draw: function() {
    var ctx = this._chart.ctx;
    var vm = this._view;
    var left, right, top, bottom, signX, signY, borderSkipped;
    var borderWidth = vm.borderWidth;

    if (!vm.horizontal) {
      // bar
      left = vm.x - vm.width / 2;
      right = vm.x + vm.width / 2;
      top = vm.y;
      bottom = vm.base;
      signX = 1;
      signY = bottom > top ? 1 : -1;
      borderSkipped = vm.borderSkipped || "bottom";
    } else {
      // horizontal bar
      left = vm.base;
      right = vm.x;
      top = vm.y - vm.height / 2;
      bottom = vm.y + vm.height / 2;
      signX = right > left ? 1 : -1;
      signY = 1;
      borderSkipped = vm.borderSkipped || "left";
    }

    // Canvas doesn't allow us to stroke inside the width so we can
    // adjust the sizes to fit if we're setting a stroke on the line
    if (borderWidth) {
      // borderWidth shold be less than bar width and bar height.
      var barSize = Math.min(Math.abs(left - right), Math.abs(top - bottom));
      borderWidth = borderWidth > barSize ? barSize : borderWidth;
      var halfStroke = borderWidth / 2;
      // Adjust borderWidth when bar top position is near vm.base(zero).
      var borderLeft =
        left + (borderSkipped !== "left" ? halfStroke * signX : 0);
      var borderRight =
        right + (borderSkipped !== "right" ? -halfStroke * signX : 0);
      var borderTop = top + (borderSkipped !== "top" ? halfStroke * signY : 0);
      var borderBottom =
        bottom + (borderSkipped !== "bottom" ? -halfStroke * signY : 0);
      // not become a vertical line?
      if (borderLeft !== borderRight) {
        top = borderTop;
        bottom = borderBottom;
      }
      // not become a horizontal line?
      if (borderTop !== borderBottom) {
        left = borderLeft;
        right = borderRight;
      }
    }

    // calculate the bar width and roundess
    var barWidth = Math.abs(left - right);
    var roundness = this._chart.config.options.barRoundness || 0.5;
    var radius = barWidth * roundness * 0.5;

    // keep track of the original top of the bar
    var prevTop = top;

    // move the top down so there is room to draw the rounded top
    top = prevTop + radius;
    var barRadius = top - prevTop;

    ctx.beginPath();
    ctx.fillStyle = vm.backgroundColor;
    ctx.strokeStyle = vm.borderColor;
    ctx.lineWidth = borderWidth;

    // draw the rounded top rectangle
    Chart.helpers.drawRoundedTopRectangle(
      ctx,
      left,
      top - barRadius + 1,
      barWidth,
      bottom - prevTop,
      barRadius
    );

    ctx.fill();
    if (borderWidth) {
      ctx.stroke();
    }

    // restore the original top value so tooltips and scales still work
    top = prevTop;
  }
});

Chart.defaults.roundedBar = Chart.helpers.clone(Chart.defaults.bar);

Chart.controllers.roundedBar = Chart.controllers.bar.extend({
  dataElementType: Chart.elements.RoundedTopRectangle
});

var ctx = document.getElementById("myChart").getContext("2d");

var myChart = new Chart(ctx, {
  type: "roundedBar",
  data: {
    labels: [
      "<10",
      "10-15",
      "15-20",
      "20-25",
      "25-30",
      "30-35",
      "35-40",
      "40-45",
      "45-50",
      "50-55",
      ">55"
    ],
    datasets: [
      {
        label: "No. of people",
        data: [0, 0, 0, 10, 20, 30, 10, 5, 3, 0, 0],
        backgroundColor: "rgba(255,255,255, 0.7)",
        borderColor: "rgba(255,255,255,0.1)",
        borderWidth: 1,
        hoverBackgroundColor: "#91d5ff",
        hoverBorderColor: "#91d5ff"
      }
    ]
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      xAxes: [
        {
          barThickness: 19,
          display: false,
          label: {
            display: false
          },
          gridLines: {
            display: false,
            drawBorder: false
          }
        }
      ],
      yAxes: [
        {
          minBarLength: 5,
          display: false,
          label: {
            display: false
          },
          gridLines: {
            display: false,
            drawBorder: false
          }
        }
      ],
      scaleLabel: {
        display: false
      }
    },
    title: {
      display: true,
      text: "Age Demographic - 30-35",
      fontFamily: "Source Sans Pro",
      fontColor: "#fafafa",
      fontSize: 17
    },
    legend: {
      display: false
    },
    responsive: true,
    barRoundness: 0.5
  }
});

function updateBarThickness() {
  const width = window.innerWidth;

  myChart.options.scales.xAxes[0].barThickness = width > 1600 ? 24 : 19;
  myChart.update();
}

window.onresize = updateBarThickness;

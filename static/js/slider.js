const xmlns = "http://www.w3.org/2000/svg",
  select = function (s) {
    return document.querySelector(s);
  },
  selectAll = function (s) {
    return document.querySelectorAll(s);
  },
  maxDrag = 500,
  hash = {};

// state all videos
let videos = {};
let sequence = [];
let amt = {
  1: 0.5,
  2: 0.5,
  3: 0.5,
  4: 0.5,
  5: 0.5,
  6: 0.5
};
const balloonTemplate = document.getElementById("balloon-slider");
const holder = document.getElementById("slider");

// getVideos
// state all videos
async function getVideos() {
  const response = await axios.get(`${server}:${port}/list`);
  return response.data;
}

function decorateSlider(slider) {
  const iconElement = document.getElementById(`slider${slider.index}-icon`);
  const wordElement = document.getElementById(`slider${slider.index}-text`);
  iconElement.className = `${slider.icon} fa-fw`;
  wordElement.innerHTML = slider.title;
}

async function startUp() {
  const data = await getVideos();
  videos = data.videos;
  sequence = data.videoSequence;
  allVideoShow(videos, sequence);

  for (let current of sequence) {
    const slider = videos[current];
    decorateSlider(slider);
    const id = `slider${current}`;
    const parentElement = document.getElementById(id);
    const childElement = document.importNode(balloonTemplate.content, true);
    parentElement.appendChild(childElement);
    TweenMax.set(`#${id} svg`, {
      visibility: "visible"
    });

    TweenMax.set(".upText", {
      alpha: 0,
      transformOrigin: "50% 50%"
    });

    TweenLite.defaultEase = Elastic.easeOut.config(0.4, 0.1);

    // variables
    const draggerName = `#${id} .dragger`;
    const displayName = `#${id} .display`;
    const downTextName = `#${id} .downText`;
    const upTextName = `#${id} .upText`;

    hash[id] = {
      amt: amt[parseInt(current, 10)],
      dragger: select(draggerName),
      dragVal: 0,
      tl: new TimelineMax({ paused: true })
    };

    hash[id].tl
      .addLabel("blobUp")
      .to(displayName, 1, {
        attr: {
          cy: "-=40",
          r: 30
        }
      })
      .to(
        draggerName,
        1,
        {
          attr: {
            //cy:'-=2',
            r: 10
          }
        },
        "-=1"
      )
      .set(
        draggerName,
        {
          strokeWidth: 4
        },
        "-=1"
      )
      .to(
        downTextName,
        1,
        {
          //alpha:0,
          alpha: 0,
          transformOrigin: "50% 50%"
        },
        "-=1"
      )
      .to(
        upTextName,
        1,
        {
          //alpha:1,
          alpha: 1,
          transformOrigin: "50% 50%"
        },
        "-=1"
      )
      .addPause()
      .addLabel("blobDown")
      .to(displayName, 1, {
        attr: {
          cy: 299.5,
          r: 0
        },
        ease: Expo.easeOut
      })
      .to(
        draggerName,
        1,
        {
          attr: {
            //cy:'-=35',
            r: 20
          }
        },
        "-=1"
      )
      .set(
        draggerName,
        {
          strokeWidth: 0
        },
        "-=1"
      )
      .to(
        downTextName,
        1,
        {
          alpha: 1,
          ease: Power4.easeOut
        },
        "-=1"
      )
      .to(
        upTextName,
        0.2,
        {
          alpha: 0,
          ease: Power4.easeOut,
          attr: {
            y: "+=45"
          },
          onComplete: () => dragComplete(current, hash[id].dragVal)
        },
        "-=1"
      );

    Draggable.create(hash[id].dragger, {
      type: "x",
      cursor: "pointer",
      throwProps: true,
      bounds: {
        minX: 0,
        maxX: maxDrag
      },
      onPress: function () {
        hash[id].tl.play("blobUp");
      },
      onRelease: function () {
        hash[id].tl.play("blobDown");
      },
      onDrag: () => dragUpdate(hash, id),
      onThrowUpdate: () => dragUpdate(hash, id)
    });

    TweenMax.to(hash[id].dragger, 1, {
      x: hash[id].amt * maxDrag,
      onUpdate: () => dragUpdate(hash, id),
      ease: Power1.easeInOut
    });
  }
}

startUp();

function dragComplete(current, dragVal) {
  amt[current] = dragVal / 100;
  ruleCheck(amt);
}

function dragUpdate(hash, id) {
  hash[id].dragVal = Math.round(
    (hash[id].dragger._gsTransform.x / maxDrag) * 100
  );
  select(`#${id} .downText`).textContent = select(
    `#${id} .upText`
  ).textContent = hash[id].dragVal;
  TweenMax.to(`#${id} .display`, 1.3, {
    x: hash[id].dragger._gsTransform.x
  });

  TweenMax.staggerTo(
    [`#${id} .downText`, `#${id} .upText`],
    1,
    {
      // x:this.target._gsTransform.x,
      cycle: {
        attr: [
          {
            x: hash[id].dragger._gsTransform.x + 146
          }
        ]
      },
      ease: Elastic.easeOut.config(1, 0.4)
    },
    "0.02"
  );
}

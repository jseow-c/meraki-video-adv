// connect to socket.io
const socket = io(`${server}:${socketPort}`);

// 2. This code loads the IFrame Player API code asynchronously.
var tag = document.createElement("script");

tag.src = "https://www.youtube.com/iframe_api";
var firstScriptTag = document.getElementsByTagName("script")[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

// 3. This function creates an <iframe> (and YouTube player)
//    after the API code downloads.
var player;

async function onYouTubeIframeAPIReady() {
  const response = await axios.get(`${server}:${port}/next`);
  player = new YT.Player("player", {
    videoId: response.data,
    events: {
      onReady: onPlayerReady,
      onStateChange: onPlayerStateChange
    }
  });
}

// 4. The API will call this function when the video player is ready.
function onPlayerReady(event) {
  event.target.playVideo();
}

// 5. The API calls this function when the player's state changes.
//    The function indicates that when playing a video (state=1),
//    the player should play for six seconds and then stop.
async function onPlayerStateChange(event) {
  if (event.data == YT.PlayerState.ENDED) {
    const response = await axios.get(`${server}:${port}/next`);
    player.loadVideoById({
      videoId: response.data
    });
  }
}

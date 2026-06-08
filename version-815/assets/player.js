import { H as Hls } from "./hls-vendor.js";

var video = document.getElementById("movie-player");
var button = document.getElementById("player-cover");
var hlsInstance = null;
var loaded = false;

function hideButton() {
  if (button) {
    button.classList.add("is-hidden");
  }
}

function loadVideo() {
  if (!video || loaded) {
    return;
  }
  var url = video.getAttribute("data-video");
  if (!url) {
    return;
  }
  if (video.canPlayType("application/vnd.apple.mpegurl")) {
    video.src = url;
  } else if (Hls && Hls.isSupported()) {
    hlsInstance = new Hls({ enableWorker: true, lowLatencyMode: true });
    hlsInstance.loadSource(url);
    hlsInstance.attachMedia(video);
  } else {
    video.src = url;
  }
  loaded = true;
}

function playVideo() {
  loadVideo();
  hideButton();
  var promise = video.play();
  if (promise && typeof promise.catch === "function") {
    promise.catch(function () {
      if (button) {
        button.classList.remove("is-hidden");
      }
    });
  }
}

if (video) {
  video.addEventListener("play", hideButton);
  video.addEventListener("click", function () {
    if (video.paused) {
      playVideo();
    }
  });
}

if (button) {
  button.addEventListener("click", playVideo);
}

window.addEventListener("beforeunload", function () {
  if (hlsInstance) {
    hlsInstance.destroy();
  }
});

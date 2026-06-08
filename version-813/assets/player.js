(function () {
  function initMoviePlayer(options) {
    var video = document.querySelector(options.video);
    var overlay = document.querySelector(options.overlay);
    var button = document.querySelector(options.button);
    var status = document.querySelector(options.status);
    var source = options.source;
    var hls = null;
    var prepared = false;

    if (!video || !source) {
      return;
    }

    function setStatus(text) {
      if (status) {
        status.textContent = text || '';
      }
    }

    function hideOverlay() {
      if (overlay) {
        overlay.classList.add('is-hidden');
      }
    }

    function prepare() {
      if (prepared) {
        return Promise.resolve();
      }
      prepared = true;
      setStatus('正在准备播放...');

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
        return Promise.resolve();
      }

      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(source);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          setStatus('');
        });
        hls.on(window.Hls.Events.ERROR, function (event, data) {
          if (data && data.fatal) {
            setStatus('视频暂时无法播放');
          }
        });
        return Promise.resolve();
      }

      setStatus('当前浏览器暂不支持播放');
      return Promise.resolve();
    }

    function play() {
      prepare().then(function () {
        hideOverlay();
        var promise = video.play();
        if (promise && typeof promise.catch === 'function') {
          promise.catch(function () {
            setStatus('点击播放器继续播放');
          });
        }
      });
    }

    if (overlay) {
      overlay.addEventListener('click', play);
    }

    if (button) {
      button.addEventListener('click', function (event) {
        event.preventDefault();
        event.stopPropagation();
        play();
      });
    }

    video.addEventListener('click', function () {
      if (video.paused) {
        play();
      }
    });

    video.addEventListener('playing', function () {
      hideOverlay();
      setStatus('');
    });

    video.addEventListener('pause', function () {
      if (!video.ended && overlay) {
        overlay.classList.remove('is-hidden');
      }
    });

    window.addEventListener('beforeunload', function () {
      if (hls) {
        hls.destroy();
      }
    });
  }

  window.initMoviePlayer = initMoviePlayer;
})();

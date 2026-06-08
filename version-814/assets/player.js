(function () {
    function initialize(source) {
        var video = document.getElementById('movie-player');
        var startButton = document.querySelector('[data-player-start]');
        var started = false;
        var hls = null;

        if (!video || !source) {
            return;
        }

        function attachSource() {
            if (started) {
                return;
            }

            started = true;

            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = source;
            } else if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true,
                    backBufferLength: 90
                });
                hls.loadSource(source);
                hls.attachMedia(video);
            } else {
                video.src = source;
            }
        }

        function play() {
            attachSource();

            if (startButton) {
                startButton.classList.add('is-hidden');
            }

            var promise = video.play();

            if (promise && typeof promise.catch === 'function') {
                promise.catch(function () {
                    if (startButton) {
                        startButton.classList.remove('is-hidden');
                    }
                });
            }
        }

        if (startButton) {
            startButton.addEventListener('click', play);
        }

        video.addEventListener('click', function () {
            if (!started || video.paused) {
                play();
            }
        });

        video.addEventListener('play', function () {
            if (startButton) {
                startButton.classList.add('is-hidden');
            }
        });

        window.addEventListener('beforeunload', function () {
            if (hls && typeof hls.destroy === 'function') {
                hls.destroy();
            }
        });
    }

    window.MovieSitePlayer = {
        initialize: initialize
    };
})();

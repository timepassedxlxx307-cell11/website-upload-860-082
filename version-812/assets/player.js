import { H as Hls } from "./hls-vendor-dru42stk.js";

export function setupPlayer(videoId, sourceUrl) {
    const video = document.getElementById(videoId);

    if (!video || !sourceUrl) {
        return;
    }

    const shell = video.closest(".player-shell");
    const cover = shell?.querySelector(".player-cover");
    let hls = null;
    let attached = false;

    const attach = () => {
        if (attached) {
            return true;
        }

        attached = true;

        if (Hls.isSupported()) {
            hls = new Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hls.loadSource(sourceUrl);
            hls.attachMedia(video);
            return true;
        }

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = sourceUrl;
            return true;
        }

        shell?.classList.add("player-error");
        return false;
    };

    const start = async () => {
        if (!attach()) {
            return;
        }

        cover?.classList.add("is-hidden");
        video.setAttribute("controls", "controls");

        try {
            await video.play();
        } catch (error) {
            cover?.classList.remove("is-hidden");
        }
    };

    cover?.addEventListener("click", start);

    video.addEventListener("click", () => {
        if (!attached || video.paused) {
            start();
        } else {
            video.pause();
        }
    });

    video.addEventListener("play", () => {
        cover?.classList.add("is-hidden");
    });

    window.addEventListener("pagehide", () => {
        if (hls) {
            hls.destroy();
            hls = null;
        }
    });
}

// ORBITAL ENGINEER - reusable launch cinematic.
// Plays the launch video (assets/launch.mp4) after spacecraft validation, with skip support.
// Usage:  OrbitalLaunch.play({ missionName, vehicle, onDone, videoSrc }) -> Promise
(function () {
  'use strict';
  const W = 320, H = 180, DURATION = 10.0;
  const DEFAULT_VIDEO_SRC = 'assets/launch.mp4';
  let active = null;

  function play(opts) {
    opts = opts || {};
    if (active) active.finish(true);
    const videoSrc = opts.videoSrc === undefined ? DEFAULT_VIDEO_SRC : opts.videoSrc;

    return new Promise(resolve => {
      const ov = document.createElement('div');
      ov.id = 'launchOverlay';
      ov.setAttribute('role', 'dialog');
      ov.setAttribute('aria-label', 'Launch sequence');
      ov.style.cssText = 'position:fixed;inset:0;z-index:99999;background:#04060f;display:flex;align-items:center;justify-content:center;overflow:hidden;';

      const vid = document.createElement('video');
      vid.id = 'launchVideo';
      vid.src = videoSrc;
      vid.playsInline = true;
      vid.preload = 'auto';
      vid.style.cssText = 'width:100%;height:100%;max-width:100vw;max-height:100vh;object-fit:contain;image-rendering:pixelated;image-rendering:crisp-edges;display:block;background:#04060f;';

      const hud = document.createElement('div');
      hud.id = 'launchHud';
      hud.style.cssText = "position:absolute;left:18px;top:14px;z-index:3;pointer-events:none;font-family:'Chakra Petch',monospace;letter-spacing:.06em;line-height:1.25;text-shadow:2px 2px 0 #05081a,-1px -1px 0 #05081a,1px -1px 0 #05081a,-1px 1px 0 #05081a,0 0 10px rgba(5,8,26,.9);";

      const statusEl = document.createElement('div');
      statusEl.textContent = 'Mission Successful';
      statusEl.style.cssText = 'font-size:20px;font-weight:700;color:#ffd23f;';

      const missionEl = document.createElement('div');
      missionEl.textContent = opts.missionName || 'Launch';
      missionEl.style.cssText = 'font-size:15px;font-weight:700;color:#eaf4f6;margin-top:2px;';

      hud.appendChild(statusEl);
      hud.appendChild(missionEl);

      const skip = document.createElement('button');
      skip.type = 'button';
      skip.textContent = 'SKIP \u25B6\u25B6';
      skip.style.cssText = "position:absolute;right:14px;top:14px;z-index:3;padding:8px 14px;font:700 14px 'Chakra Petch',monospace;letter-spacing:.08em;color:#eaf4f6;background:rgba(20,62,91,.85);border:2px solid #5da6be;border-radius:6px;cursor:pointer;";

      ov.appendChild(vid);
      ov.appendChild(hud);
      ov.appendChild(skip);
      document.body.appendChild(ov);
      skip.focus({ preventScroll: true });

      let done = false;
      const finish = skipped => {
        if (done) return;
        done = true;
        removeEventListener('keydown', key);
        vid.onended = null;
        vid.onerror = null;
        try {
          vid.pause();
          vid.removeAttribute('src');
          vid.load();
        } catch (e) {}
        ov.remove();
        active = null;
        if (opts.onDone) opts.onDone(!!skipped);
        resolve(!!skipped);
      };

      const key = e => {
        if (['Escape', ' ', 'Enter'].includes(e.key)) {
          e.preventDefault();
          finish(true);
        }
      };

      addEventListener('keydown', key);
      skip.onclick = () => finish(true);
      active = { finish };

      vid.onended = () => finish(false);
      vid.onerror = () => finish(true);

      const p = vid.play();
      if (p && typeof p.catch === 'function') {
        p.catch(() => {
          vid.muted = true;
          vid.play().catch(() => finish(true));
        });
      }
    });
  }

  window.OrbitalLaunch = {
    play,
    skip: () => active && active.finish(true),
    DURATION,
    size: [W, H]
  };
})();

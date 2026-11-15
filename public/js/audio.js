/* ORBITAL ENGINEER - audio engine + audio settings dialog.
 * Loaded on every page. Web Audio API: sound effects and music run on separate gain channels.
 *   OEAudio.play('attach' | 'detach' | 'power' | 'data' | 'click')   - used by game.js
 *   OEAudio.open() / OEAudio.close()                                  - audio settings dialog
 * Music is one seamless loop; because every page is its own HTML document, the playback position is saved when a
 * page is left and resumed on the next one, so the soundtrack carries on instead of restarting. */
(function () {
  'use strict';
  if (window.OEAudio) return;

  var DIR = 'assets/audio/';
  var FILES = { click: 'click.mp3', attach: 'attach.mp3', detach: 'detach.mp3', power: 'power.mp3', data: 'data.mp3' };
  var MUSIC_FILE = 'background_music.mp3', LOOP_SEC = 96;          // exact loop length of the soundtrack
  var GAME_SFX = { attach: 1, detach: 1, power: 1, data: 1 };      // sounds that "claim" a click (no extra click tick)
  var MIN_GAP = { click: 40, attach: 60, detach: 60, power: 120, data: 80 };   // ms; stops accidental double triggers
  var KEY = 'oe_audio', POS_KEY = 'oe_music_pos';
  var DEFAULTS = { music: true, musicVol: 50, sfx: true, sfxVol: 80 };

  // ---------- settings (saved in localStorage) ----------
  var S = load();
  function load() {
    var s = {}, d = DEFAULTS; try { s = JSON.parse(localStorage.getItem(KEY) || '{}') || {}; } catch (e) {}
    var num = function (v, def) { v = Number(v); return isFinite(v) ? Math.max(0, Math.min(100, Math.round(v))) : def; };
    return { music: s.music === undefined ? d.music : !!s.music, musicVol: num(s.musicVol, d.musicVol), sfx: s.sfx === undefined ? d.sfx : !!s.sfx, sfxVol: num(s.sfxVol, d.sfxVol) };
  }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} }
  var curve = function (v) { return Math.pow(v / 100, 2); };       // perceptual volume curve
  function ramp(node, v) { var t = ctx.currentTime, g = node.gain; g.cancelScheduledValues(t); g.setTargetAtTime(v, t, .02); if (v === 0) g.setValueAtTime(0, t + .25); }

  // ---------- state ----------
  var AC = window.AudioContext || window.webkitAudioContext;
  var ctx = null, musicVolNode, sfxVolNode, musicFade = null, musicSrc = null, musicBuf = null, loopStart = 0;
  var buffers = {}, raw = {}, rawMusic = null, musicStartedAt = 0, musicOffset = 0, musicPlaying = false;
  var lastPlay = {}, active = 0, lastGameSfx = 0, history = [], analysers = {};
  var debug = false; try { debug = localStorage.getItem('oe_audio_debug') === '1'; } catch (e) {}

  // Start downloading the files right away (they are small); decoding waits until the browser lets audio start.
  function fetchRaw(url) { return fetch(url).then(function (r) { if (!r.ok) throw new Error(r.status); return r.arrayBuffer(); }); }
  if (AC && window.fetch) {
    Object.keys(FILES).forEach(function (k) { fetchRaw(DIR + FILES[k]).then(function (b) { raw[k] = b; ready(); }).catch(function () {}); });
    fetchRaw(DIR + MUSIC_FILE).then(function (b) { rawMusic = b; ready(); }).catch(function () {});
  }

  function decode(buf) {
    return new Promise(function (res, rej) { var p = ctx.decodeAudioData(buf.slice(0), res, rej); if (p && p.catch) p.catch(rej); });
  }
  var inflight = {};
  function ready() {
    if (!ctx) return;
    Object.keys(raw).forEach(function (k) {
      if (buffers[k] || inflight[k]) return; inflight[k] = 1;
      decode(raw[k]).then(function (b) { buffers[k] = b; }).catch(function () {});
    });
    if (rawMusic && !musicBuf && !inflight.music) { inflight.music = 1; decode(rawMusic).then(function (b) { musicBuf = b; findLoop(b); syncMusic(); }).catch(function () {}); }
  }
  // If a decoder leaves encoder padding at the start, skip it so the loop point stays sample-accurate.
  function findLoop(b) {
    loopStart = 0; var extra = b.duration - LOOP_SEC; if (extra < 0.004) return;
    var d = b.getChannelData(0), lim = Math.min(d.length, 6000);
    for (var i = 0; i < lim; i++) if (Math.abs(d[i]) > 2e-4) { loopStart = i / b.sampleRate; break; }
    if (loopStart + LOOP_SEC > b.duration) loopStart = Math.max(0, b.duration - LOOP_SEC);
  }

  // ---------- audio context (created only when the browser lets audio start) ----------
  function ensureCtx() {
    if (ctx || !AC) return ctx;
    try {
      ctx = new AC();
      sfxVolNode = ctx.createGain(); musicVolNode = ctx.createGain();
      sfxVolNode.gain.value = S.sfx ? curve(S.sfxVol) : 0; musicVolNode.gain.value = S.music ? curve(S.musicVol) : 0;
      sfxVolNode.connect(ctx.destination); musicVolNode.connect(ctx.destination);
      if (debug) ['music', 'sfx'].forEach(function (k) { var a = ctx.createAnalyser(); a.fftSize = 2048; (k === 'music' ? musicVolNode : sfxVolNode).connect(a); analysers[k] = a; });
      try { if (navigator.audioSession) navigator.audioSession.type = 'playback'; } catch (e) {}   // iOS: play even with the silent switch on
      ctx.onstatechange = function () { if (ctx.state === 'running') syncMusic(); };
    } catch (e) { ctx = null; }
    return ctx;
  }
  function unlock() {
    if (!AC) return;
    if (!ensureCtx()) return;
    if (ctx.state === 'suspended' && !document.hidden) { var p = ctx.resume(); if (p && p.catch) p.catch(function () {}); }
    if (ctx.state === 'running') { try { var s = ctx.createBufferSource(); s.buffer = ctx.createBuffer(1, 1, 22050); s.connect(ctx.destination); s.start(0); } catch (e) {} }
    ready(); syncMusic();
    if (ctx.state === 'running') ['pointerdown', 'touchend', 'mousedown', 'keydown', 'click'].forEach(function (t) { window.removeEventListener(t, unlock, true); });
  }
  ['pointerdown', 'touchend', 'mousedown', 'keydown', 'click'].forEach(function (t) { window.addEventListener(t, unlock, true); });

  // ---------- music ----------
  function startMusic(fade) {
    if (musicPlaying || !ctx || ctx.state !== 'running' || !musicBuf || !S.music || document.hidden) return;
    var saved = readPos(), off = 0;
    if (saved) off = (saved.p + (saved.playing ? (Date.now() - saved.t) / 1000 : 0)) % LOOP_SEC;
    musicSrc = ctx.createBufferSource(); musicSrc.buffer = musicBuf; musicSrc.loop = true;
    musicSrc.loopStart = loopStart; musicSrc.loopEnd = Math.min(musicBuf.duration, loopStart + LOOP_SEC);
    musicFade = ctx.createGain(); var t0 = ctx.currentTime, f = fade == null ? (saved ? .35 : 1.5) : fade;
    musicFade.gain.setValueAtTime(0, t0); musicFade.gain.linearRampToValueAtTime(1, t0 + f);
    musicSrc.connect(musicFade); musicFade.connect(musicVolNode);
    musicSrc.start(0, loopStart + off); musicStartedAt = t0; musicOffset = off; musicPlaying = true;
  }
  function stopMusic(fade) {
    if (!musicPlaying) return; var src = musicSrc, fd = musicFade, f = fade == null ? .25 : fade;
    writePos(false); musicPlaying = false; musicSrc = null; musicFade = null;
    try { var t = ctx.currentTime; fd.gain.cancelScheduledValues(t); fd.gain.setValueAtTime(fd.gain.value, t); fd.gain.linearRampToValueAtTime(0, t + f); src.stop(t + f + .02); } catch (e) { try { src.stop(); } catch (e2) {} }
    setTimeout(function () { try { src.disconnect(); fd.disconnect(); } catch (e) {} }, f * 1000 + 100);
  }
  function position() { return musicPlaying ? (musicOffset + (ctx.currentTime - musicStartedAt)) % LOOP_SEC : (readPos() || { p: 0 }).p; }
  function readPos() { try { var v = JSON.parse(sessionStorage.getItem(POS_KEY) || 'null'); return v && isFinite(v.p) ? v : null; } catch (e) { return null; } }
  function writePos(playing) { try { sessionStorage.setItem(POS_KEY, JSON.stringify({ p: position(), t: Date.now(), playing: !!playing })); } catch (e) {} }
  function syncMusic() {
    if (!ctx) return;
    if (S.music && ctx.state === 'running') startMusic(); else if (!S.music) stopMusic();
  }
  setInterval(function () { if (musicPlaying) writePos(true); }, 1000);

  // keep the soundtrack from playing in a hidden tab / after the page is left
  document.addEventListener('visibilitychange', function () {
    if (!ctx) return;
    if (document.hidden) { if (musicPlaying) writePos(true); var p = ctx.suspend(); if (p && p.catch) p.catch(function () {}); }
    else { var q = ctx.resume(); if (q && q.catch) q.catch(function () {}); }
  });
  window.addEventListener('pagehide', function () { if (musicPlaying) writePos(true); if (ctx && ctx.state === 'running') { var p = ctx.suspend(); if (p && p.catch) p.catch(function () {}); } });
  window.addEventListener('pageshow', function (e) {
    if (!e.persisted || !ctx) return;
    if (musicPlaying) { try { musicSrc.stop(); musicSrc.disconnect(); musicFade.disconnect(); } catch (x) {} musicPlaying = false; musicSrc = null; musicFade = null; }
    var p = ctx.resume(); if (p && p.then) p.then(syncMusic).catch(function () {});
  });

  // ---------- sound effects ----------
  function play(name, opts) {
    try {
      var now = performance.now(), claim = !!GAME_SFX[name] && !(opts && opts.preview);
      if (claim) lastGameSfx = now;
      if (!S.sfx || !ctx || ctx.state !== 'running' || !buffers[name]) return false;
      if (now - (lastPlay[name] || -1e9) < MIN_GAP[name]) return false;
      if (active >= 10) return false;
      lastPlay[name] = now;
      var src = ctx.createBufferSource(), g = ctx.createGain(); src.buffer = buffers[name]; g.gain.value = (opts && opts.gain) || 1;
      src.connect(g); g.connect(sfxVolNode); active++; src.onended = function () { active--; try { src.disconnect(); g.disconnect(); } catch (e) {} };
      src.start(0); history.push({ name: name, t: Math.round(now), preview: !!(opts && opts.preview) }); if (history.length > 200) history.shift();
      return true;
    } catch (e) { return false; }
  }

  // ---------- button click sound (one delegated listener for every page) ----------
  var CLICKABLE = 'button, a[href], [role="tab"], [role="button"], summary, .btn, .nav, .tab';
  var down = null;
  window.addEventListener('pointerdown', function (e) { down = { x: e.clientX, y: e.clientY }; }, true);
  window.addEventListener('keydown', function () { down = null; }, true);
  function navigates(a, e) {
    var h = a.getAttribute('href') || '';
    return a.tagName === 'A' && h && h.charAt(0) !== '#' && !/^(javascript|mailto|tel):/i.test(h) && !a.hasAttribute('download') &&
      (!a.target || a.target === '_self') && !e.ctrlKey && !e.metaKey && !e.shiftKey && !e.altKey && e.button === 0 && a.origin === location.origin;
  }
  var leaving = false, cstamp = 0;
  window.addEventListener('click', function () { cstamp = performance.now(); }, true);
  document.addEventListener('click', function (e) {
    var el = e.target && e.target.closest ? e.target.closest(CLICKABLE) : null;
    if (!el || el.disabled || el.getAttribute('aria-disabled') === 'true' || el.closest('[data-sfx="off"]')) return;
    if (el.matches('.tab.active:not([href])')) return;                         // the tab you are already on does nothing
    if (down && Math.hypot(e.clientX - down.x, e.clientY - down.y) > 8) return;   // end of a drag, not a click
    var stamp = cstamp;
    if (navigates(el, e) && !e.defaultPrevented && ctx && ctx.state === 'running' && (S.sfx || musicPlaying)) {
      // let the click sound finish (and the music fade out) before the browser unloads this page
      if (leaving) { e.preventDefault(); return; } leaving = true; e.preventDefault(); play('click');
      if (musicPlaying) { writePos(true); try { var t = ctx.currentTime; musicFade.gain.cancelScheduledValues(t); musicFade.gain.setValueAtTime(musicFade.gain.value, t); musicFade.gain.linearRampToValueAtTime(0, t + .09); } catch (x) {} }
      var url = el.href; setTimeout(function () { leaving = false; window.location.href = url; }, S.sfx ? 130 : 100); return;
    }
    // buttons that trigger a game sound (attach / detach / power) use that sound instead of an extra click
    setTimeout(function () { if (lastGameSfx >= stamp) return; play('click'); }, 0);
  }, false);

  // ---------- audio settings dialog ----------
  var dlg = null, opener = null;
  var GEAR = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8zm9 5v-2l-2.3-.6a7 7 0 0 0-.8-1.8l1.2-2-1.4-1.4-2 1.2a7 7 0 0 0-1.8-.8L13 3h-2l-.6 2.3a7 7 0 0 0-1.8.8l-2-1.2L5.2 6.3l1.2 2a7 7 0 0 0-.8 1.8L3 11v2l2.3.6a7 7 0 0 0 .8 1.8l-1.2 2 1.4 1.4 2-1.2a7 7 0 0 0 1.8.8L11 21h2l.6-2.3a7 7 0 0 0 1.8-.8l2 1.2 1.4-1.4-1.2-2a7 7 0 0 0 .8-1.8z"/></svg>';
  var NOTE = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 3v11.3A3.5 3.5 0 1 0 11 17.500V8h8V3z"/></svg>';
  var WAVE = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 9v6h4l5 4V5L7 9zm12.500 3a4.500 4.500 0 0 0-2.500-4v8a4.500 4.500 0 0 0 2.500-4zM13 3.200v2.100a7 7 0 0 1 0 13.400v2.100a9 9 0 0 0 0-17.600z"/></svg>';
  function row(id, icon, title, sub) {
    return '<section class="oe-row" data-ch="' + id + '"><div class="oe-head"><span class="oe-ico">' + icon + '</span><div class="oe-name"><b>' + title + '</b><small>' + sub + '</small></div>' +
      '<button class="oe-toggle" type="button" role="switch" aria-label="' + title + '" data-toggle="' + id + '"><i class="oe-led"></i><span class="oe-state">ON</span></button></div>' +
      '<div class="oe-slide"><span class="oe-min">0</span><input type="range" min="0" max="100" step="1" data-vol="' + id + '" aria-label="' + title + ' volume"><span class="oe-max">100</span><output class="oe-val" data-out="' + id + '">0%</output></div></section>';
  }
  function build() {
    dlg = document.createElement('div'); dlg.className = 'oe-set'; dlg.hidden = true; dlg.setAttribute('role', 'dialog'); dlg.setAttribute('aria-modal', 'true'); dlg.setAttribute('aria-labelledby', 'oeSetTitle');
    dlg.innerHTML = '<div class="oe-box"><h2 id="oeSetTitle">' + GEAR + 'Audio Settings</h2>' +
      row('music', NOTE, 'Background Music', 'Ambient soundtrack') + row('sfx', WAVE, 'Sound Effects', 'Attach, detach, power and buttons') +
      '<div class="oe-actions"><button class="oe-btn" type="button" data-reset>Reset</button><button class="oe-btn go" type="button" data-done>Done</button></div></div>';
    document.body.appendChild(dlg);
    dlg.addEventListener('click', function (e) {
      var t = e.target; if (t === dlg) return close();
      var b = t.closest && t.closest('[data-toggle]'), id;
      if (b) { id = b.dataset.toggle; set(id === 'music' ? 'music' : 'sfx', !S[id === 'music' ? 'music' : 'sfx']); return; }
      if (t.closest && t.closest('[data-done]')) close();
      else if (t.closest && t.closest('[data-reset]')) { set('musicVol', DEFAULTS.musicVol); set('sfxVol', DEFAULTS.sfxVol); set('music', DEFAULTS.music); set('sfx', DEFAULTS.sfx); }
    });
    dlg.addEventListener('input', function (e) { var id = e.target.dataset && e.target.dataset.vol; if (id) set(id === 'music' ? 'musicVol' : 'sfxVol', +e.target.value); });
    dlg.addEventListener('change', function (e) { if (e.target.dataset && e.target.dataset.vol === 'sfx') play('attach', { preview: true }); });   // hear the new effects level
    dlg.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { e.stopPropagation(); close(); }
      else if (e.key === 'Tab') { var f = dlg.querySelectorAll('button, input'); if (!f.length) return; var first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); } else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); } }
    });
    refresh();
  }
  function refresh() {
    if (!dlg) return;
    [['music', 'music', 'musicVol'], ['sfx', 'sfx', 'sfxVol']].forEach(function (c) {
      var r = dlg.querySelector('[data-ch="' + c[0] + '"]'), on = S[c[1]], v = S[c[2]], tg = r.querySelector('.oe-toggle'), sl = r.querySelector('input');
      r.classList.toggle('off', !on); tg.setAttribute('aria-checked', on ? 'true' : 'false'); tg.querySelector('.oe-state').textContent = on ? 'ON' : 'OFF';
      sl.value = v; sl.style.setProperty('--p', v + '%'); sl.setAttribute('aria-valuetext', v + ' percent' + (on ? '' : ', off')); r.querySelector('.oe-val').textContent = v + '%';
    });
  }
  function open() { if (!dlg) build(); opener = document.activeElement; refresh(); dlg.hidden = false; var d = dlg.querySelector('[data-done]'); if (d) d.focus(); }
  function close() { if (!dlg) return; dlg.hidden = true; if (opener && opener.focus) try { opener.focus(); } catch (e) {} }

  // single entry point for every settings change: applies it immediately, saves it, updates the dialog
  function set(key, val) {
    if (!(key in S)) return; S[key] = (typeof DEFAULTS[key] === 'boolean') ? !!val : Math.max(0, Math.min(100, Math.round(val))); save(); refresh();
    if (ctx) {
      if (key === 'music' || key === 'musicVol') ramp(musicVolNode, S.music ? curve(S.musicVol) : 0);
      if (key === 'sfx' || key === 'sfxVol') ramp(sfxVolNode, S.sfx ? curve(S.sfxVol) : 0);
    }
    if (key === 'music') { if (S.music) { unlock(); syncMusic(); } else stopMusic(.2); }
  }
  // changing settings in another tab / page keeps this one consistent
  window.addEventListener('storage', function (e) { if (e.key === KEY) { S = load(); refresh(); if (ctx) { musicVolNode.gain.value = S.music ? curve(S.musicVol) : 0; sfxVolNode.gain.value = S.sfx ? curve(S.sfxVol) : 0; syncMusic(); } } });

  // ---------- wire the existing Settings buttons ----------
  function wire() {
    var targets = [].slice.call(document.querySelectorAll('.tab')).filter(function (t) { return /^\s*settings\s*$/i.test(t.textContent); });
    var b = document.getElementById('settingsBtn'); if (b) targets.push(b);
    targets.forEach(function (t) {
      t.setAttribute('data-oe-settings', ''); t.setAttribute('aria-haspopup', 'dialog');
      if (t.tagName !== 'BUTTON' && !t.hasAttribute('tabindex')) t.setAttribute('tabindex', '0');
      t.addEventListener('click', function (e) { e.preventDefault(); open(); });
      t.addEventListener('keydown', function (e) { if (t.tagName !== 'BUTTON' && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); t.click(); } });
    });
    if (/[?&]audio=1\b/.test(location.search)) open();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', wire); else wire();

  // The browser may allow audio straight away after a same-tab navigation; otherwise it starts at the first click/tap.
  // Autoplay probe: if the browser would let a (silent) sound play without a click, start the audio right away.
  // A refused probe is silent - no console noise - and audio then simply starts on the first click / tap.
  function probeAutoplay() {
    try {
      var a = new Audio('data:audio/wav;base64,UklGRkQDAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YSADAACAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgA=='); a.volume = 0.01; var pr = a.play();
      if (pr && pr.then) pr.then(function () { try { a.pause(); } catch (e) {} ensureCtx(); ready(); var r = ctx && ctx.resume(); if (r && r.catch) r.catch(function () {}); }).catch(function () {});
    } catch (e) {}
  }
  try { if (navigator.userActivation && navigator.userActivation.hasBeenActive) { ensureCtx(); ready(); var p = ctx && ctx.resume && ctx.resume(); if (p && p.catch) p.catch(function () {}); } else { probeAutoplay(); } } catch (e) {}

  window.OEAudio = {
    play: function (n) { return play(n); }, open: open, close: close, set: set, get settings() { return JSON.parse(JSON.stringify(S)); },
    get history() { return history.slice(); }, clearHistory: function () { history.length = 0; },
    debug: function () {
      var lv = function (a) { if (!a) return null; var d = new Float32Array(a.fftSize); a.getFloatTimeDomainData(d); var s = 0; for (var i = 0; i < d.length; i++) s += d[i] * d[i]; return Math.sqrt(s / d.length); };
      return { state: ctx && ctx.state, music: musicPlaying, pos: ctx ? position() : null, loopStart: loopStart, musicDur: musicBuf && musicBuf.duration, sfxLoaded: Object.keys(buffers),
        musicGain: musicVolNode && musicVolNode.gain.value, sfxGain: sfxVolNode && sfxVolNode.gain.value, musicLevel: lv(analysers.music), sfxLevel: lv(analysers.sfx) };
    }
  };
})();

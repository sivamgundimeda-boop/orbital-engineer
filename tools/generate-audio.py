#!/usr/bin/env python3
"""
ORBITAL ENGINEER - audio generator.

All sounds in public/assets/audio/ are ORIGINAL: they are synthesised by this script (no samples, no
third-party material), so there are no licences or attribution requirements.

Needs: python3, numpy, scipy and ffmpeg (with libmp3lame).   Run from the project root:
    python3 tools/generate-audio.py
It is NOT needed to play the game - the generated .mp3 files are already included.
"""
import os, subprocess, tempfile
import numpy as np
from scipy.io import wavfile
from scipy.signal import butter, sosfilt

SR = 44100
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'public', 'assets', 'audio')
os.makedirs(OUT, exist_ok=True)
rng = np.random.default_rng(20260215)

# ------------------------------------------------------------------ helpers
def t_of(sec): return np.arange(int(sec * SR)) / SR
def noise(n): return rng.standard_normal(n)
def exp_env(t, tau): return np.exp(-t / tau)
def band(x, lo, hi, order=2):
    sos = butter(order, [lo, hi], btype='band', fs=SR, output='sos'); return sosfilt(sos, x)
def hp(x, f, order=2): return sosfilt(butter(order, f, btype='high', fs=SR, output='sos'), x)
def lp(x, f, order=2): return sosfilt(butter(order, f, btype='low', fs=SR, output='sos'), x)
def place(buf, sig, at):
    i = int(at * SR); n = min(len(sig), len(buf) - i)
    if n > 0 and i >= 0: buf[i:i + n] += sig[:n]
def fade_out(x, ms=12):
    n = int(ms / 1000 * SR); x = x.copy(); x[-n:] *= np.linspace(1, 0, n); return x
def attack(x, ms=0.6):
    n = max(1, int(ms / 1000 * SR)); x = x.copy(); x[:n] *= np.linspace(0, 1, n); return x
def finish(x, peak):
    x = np.tanh(x * 1.1) / np.tanh(1.1)
    x = hp(x, 35, 1); x = fade_out(x, 14); x = x / (np.max(np.abs(x)) + 1e-9) * peak; return x
def midi(m): return 440.0 * 2 ** ((m - 69) / 12)

def to_mp3(name, data, bitrate=None, q=None):
    path = os.path.join(OUT, name)
    with tempfile.TemporaryDirectory() as d:
        wav = os.path.join(d, 'x.wav')
        arr = (np.clip(data, -1, 1) * 32767).astype(np.int16)
        wavfile.write(wav, SR, arr)
        cmd = ['ffmpeg', '-y', '-loglevel', 'error', '-i', wav, '-codec:a', 'libmp3lame', '-ar', str(SR)]
        cmd += ['-b:a', bitrate] if bitrate else ['-q:a', str(q if q is not None else 2)]
        subprocess.run(cmd + [path], check=True)
    print('  wrote', os.path.relpath(path), os.path.getsize(path) // 1024, 'KB')

# ------------------------------------------------------------------ sound effects
def sfx_click():
    """Subtle, short UI tick (soft mechanical key)."""
    t = t_of(0.075); y = np.zeros_like(t)
    y += band(noise(len(t)), 2200, 7000) * exp_env(t, .004) * .55
    y += np.sin(2 * np.pi * (2300 - 5500 * t) * t) * exp_env(t, .008) * .35
    y += np.sin(2 * np.pi * 640 * t) * exp_env(t, .011) * .30
    return finish(attack(y, .3), .36)

def sfx_attach():
    """Heavy-ish latch clunk + metallic ring + second lock click + servo settle."""
    t = t_of(0.5); y = np.zeros_like(t)
    y += np.sin(2 * np.pi * (55 + 90 * np.exp(-t / .035)).cumsum() / SR) * exp_env(t, .07) * 1.0            # thump
    y += band(noise(len(t)), 1500, 7500) * exp_env(t, .012) * .55                                          # strike
    for r, a, tau in ((1, .30, .10), (2.76, .20, .075), (5.40, .12, .05), (8.93, .08, .035)):              # ring
        y += np.sin(2 * np.pi * 820 * r * t) * a * exp_env(t, tau)
    lock = np.zeros_like(t); tt = t_of(0.2)
    place(lock, band(noise(len(tt)), 1800, 6500) * exp_env(tt, .008) * .38 + np.sin(2 * np.pi * 1250 * tt) * exp_env(tt, .01) * .3, .092)
    y += lock
    ts = t_of(0.18); sv = np.sin(2 * np.pi * (520 - 700 * ts) * ts + 3 * np.sin(2 * np.pi * 62 * ts)) * np.sin(np.pi * ts / .18) ** 2 * .10
    place(y, sv, .13)
    return finish(attack(y, .3), .80)

def sfx_detach():
    """Unlatch click, pneumatic release hiss and a descending slide."""
    t = t_of(0.55); y = np.zeros_like(t)
    y += band(noise(len(t)), 1800, 7000) * exp_env(t, .007) * .5
    y += np.sin(2 * np.pi * 1000 * t) * exp_env(t, .008) * .25
    th = t_of(0.2); place(y, np.sin(2 * np.pi * (75 + 60 * np.exp(-th / .03)).cumsum() / SR) * exp_env(th, .045) * .45, .05)
    ts = t_of(0.3); sl = band(np.sign(np.sin(2 * np.pi * (950 * np.exp(-ts * 4.5)).cumsum() / SR)) + .0, 250, 2500) * np.sin(np.pi * ts / .3) ** 1.5 * .17
    place(y, sl, .04)
    th = t_of(0.42); h = band(noise(len(th)), 2200, 9000) * (1 - np.exp(-th / .02)) * exp_env(th, .11) * .42
    place(y, h, .03)
    return finish(attack(y, .3), .74)

def sfx_power():
    """Electrical connection: crackle, rising zap, power-on hum, two-note 'connected' chime."""
    t = t_of(0.85); y = np.zeros_like(t)
    for at in (0, .014, .033, .052, .071):                                                                 # crackle
        n = t_of(.012); place(y, hp(noise(len(n)), 3000) * exp_env(n, .003) * .35, at)
    tz = t_of(0.26); ph = (180 * (2200 / 180) ** (tz / .26) * (1 + .03 * np.sin(2 * np.pi * 58 * tz))).cumsum() / SR
    z = (np.sin(2 * np.pi * ph) + .45 * np.sin(4 * np.pi * ph) + .25 * np.sin(6 * np.pi * ph)) * np.sin(np.pi * np.clip(tz / .26, 0, 1) ** .7) * .30
    place(y, z, .0)
    th = t_of(0.6); hum = (np.sin(2 * np.pi * 110 * th) + .5 * np.sin(2 * np.pi * 220 * th) + .25 * np.sin(2 * np.pi * 330 * th)) * (1 + .35 * np.sin(2 * np.pi * 50 * th))
    place(y, hum * (1 - np.exp(-th / .03)) * exp_env(th, .17) * .17, .13)
    for at, f, a in ((.20, 659.26, .30), (.30, 987.77, .27)):                                              # chime E5 -> B5
        tc = t_of(.55); place(y, (np.sin(2 * np.pi * f * tc) + .18 * np.sin(2 * np.pi * f * 2.01 * tc) + .06 * np.sin(2 * np.pi * f * 3.02 * tc)) * exp_env(tc, .17) * a * (1 - np.exp(-tc / .004)), at)
    return finish(attack(y, .3), .78)

def sfx_data():
    """Two quick digital blips (data link established)."""
    t = t_of(0.24); y = np.zeros_like(t)
    for at, f, d in ((0, 1318.5, .05), (.075, 1760, .075)):
        tb = t_of(d + .05); w = np.sin(2 * np.pi * f * tb) + .22 * np.sin(2 * np.pi * 3 * f * tb)
        place(y, w * np.minimum(1, tb / .003) * exp_env(tb, d / 2.2) * .5, at)
    return finish(lp(y, 6500), .55)

# ------------------------------------------------------------------ background music (seamless 96 s loop)
LOOP_SEC = 96.0; BPM = 60; BEAT = 60 / BPM; BAR = 4 * BEAT; SEC = 4 * BAR      # 4 bars = 16 s per chord
NLOOP = int(LOOP_SEC * SR); PRE = 6.0

def make_buf(): return np.zeros((2, int((LOOP_SEC + 2 * PRE) * SR)))
def fold(buf):
    """Circularly fold the padded buffer into exactly one loop length, so tails wrap to the start."""
    p = int(PRE * SR); out = buf[:, p:p + NLOOP].copy()
    out[:, NLOOP - p:] += buf[:, :p]; out[:, :p] += buf[:, p + NLOOP:p + NLOOP + p]; return out
def add(buf, sig, at, pan=0.0):
    i = int((at + PRE) * SR)
    if i < 0 or i >= buf.shape[1]: return
    n = min(len(sig), buf.shape[1] - i); gl, gr = np.cos((pan + 1) * np.pi / 4), np.sin((pan + 1) * np.pi / 4)
    buf[0, i:i + n] += sig[:n] * gl; buf[1, i:i + n] += sig[:n] * gr

CHORDS = [  # (bass midi, pad midi list, arp midi list)
    (45, [52, 57, 60, 64, 67, 71], [57, 60, 64, 67, 71, 72]),   # Am9
    (41, [48, 53, 57, 60, 64, 69], [53, 57, 60, 64, 69, 72]),   # Fmaj7
    (36, [55, 60, 64, 67, 71, 74], [60, 64, 67, 71, 74, 76]),   # Cmaj9
    (43, [50, 55, 59, 62, 64, 67], [55, 59, 62, 64, 67, 71]),   # G6/9
    (38, [53, 57, 60, 64, 69, 72], [57, 60, 64, 65, 69, 72]),   # Dm9
    (40, [55, 59, 62, 64, 67, 71], [59, 62, 64, 67, 71, 74]),   # Em7
]

def pad_note(f, dur, lfo_period, lfo_phase):
    t = t_of(dur); y = np.zeros_like(t)
    for cents in (-7, 0, 7):
        fv = f * 2 ** (cents / 1200)
        for h in range(1, 10):
            if fv * h > 5200: break
            y += np.sin(2 * np.pi * fv * h * t + rng.uniform(0, 6.28)) * h ** -1.5
    return y * (0.8 + 0.2 * np.sin(2 * np.pi * t / lfo_period + lfo_phase))

def pluck(f, vel=1.0):
    t = t_of(2.2)
    y = (np.sin(2 * np.pi * f * t) + .32 * np.sin(4 * np.pi * f * t) * exp_env(t, .12) + .12 * np.sin(6 * np.pi * f * t) * exp_env(t, .06)) * exp_env(t, .34)
    return attack(y, 3) * vel

def bell(f, vel=1.0):
    t = t_of(5.0); idx = 2.2 * exp_env(t, .9)
    y = np.sin(2 * np.pi * f * t + idx * np.sin(2 * np.pi * f * 3.5 * t)) * exp_env(t, 1.7)
    y += .35 * np.sin(2 * np.pi * f * 2.0 * t) * exp_env(t, .8)
    return attack(y, 6) * vel

def kick(vel=1.0):
    t = t_of(.6); return np.sin(2 * np.pi * (46 + 55 * np.exp(-t / .045)).cumsum() / SR) * exp_env(t, .16) * (1 - np.exp(-t / .004)) * vel

def circ_reverb(x, wet_tau=(1.15, .8, .38), seed=1):
    """Stereo circular (loop-safe) convolution reverb built from a synthetic decaying-noise impulse response."""
    r = np.random.default_rng(seed); n = int(5.0 * SR); t = np.arange(n) / SR; out = np.zeros_like(x)
    for ch in range(2):
        ir = np.zeros(n)
        for (lo, hi), tau in zip(((60, 500), (500, 3000), (3000, 9000)), wet_tau):
            ir += band(r.standard_normal(n), lo, hi) * np.exp(-t / tau) * (0.9 if lo < 500 else 1.0)
        ir *= np.minimum(1, t / .03); ir[:int(.02 * SR)] = 0
        ir /= np.sqrt((ir ** 2).sum())
        out[ch] = np.fft.irfft(np.fft.rfft(x[ch]) * np.fft.rfft(ir, n=NLOOP), n=NLOOP)
    return out

def fft_filter(x, resp):
    return np.fft.irfft(np.fft.rfft(x) * resp, n=len(x))

def build_music():
    pad, arp, bells, bass, pulse = make_buf(), make_buf(), make_buf(), make_buf(), make_buf()
    for s, (bnote, pnotes, anotes) in enumerate(CHORDS):
        s0 = s * SEC
        # --- pad: trapezoid envelope overlapping neighbouring chords by 4 s
        for k, m in enumerate(pnotes):
            dur = SEC + 8.0; sig = pad_note(midi(m), dur, [16, 24, 32][k % 3], rng.uniform(0, 6.28))
            env = np.minimum(1, np.arange(len(sig)) / SR / 4.0) * np.minimum(1, (len(sig) - np.arange(len(sig))) / SR / 4.0)
            add(pad, sig * env ** 1.6 * .13, s0 - 4.0, pan=rng.uniform(-.55, .55))
        # --- bass: root + sub octave, soft attack
        tb = t_of(SEC + 5.0); e = np.minimum(1, tb / 2.5) * np.minimum(1, (SEC + 5.0 - tb) / 3.0)
        fb = midi(bnote); b = np.sin(2 * np.pi * fb * tb) * .55 + np.sin(2 * np.pi * fb * 2 * tb) * .17 + np.sin(2 * np.pi * fb * .5 * tb) * .35
        add(bass, b * e ** 1.5 * .55, s0 - 2.5, 0)
        # --- arpeggio (8th notes) from section 1 on, swelling; section 5 thins out so the loop can breathe
        if s >= 1:
            pattern = [0, 2, 4, 2, 1, 3, 5, 3] if s != 5 else [0, 3, 5, 3]
            step = BEAT / 2 if s != 5 else BEAT
            for i in range(int(SEC / step)):
                idx = pattern[i % len(pattern)]; vel = (.55 + .45 * np.sin(np.pi * (i * step / SEC))) * (.8 if s in (1, 5) else 1)
                add(arp, pluck(midi(anotes[idx] + 12 * (i % 16 == 15)), vel * .5), s0 + i * step, pan=((i % 2) * 2 - 1) * .35)
        # --- bells: sparse melodic motif
        motifs = {2: [(1, 0, 76), (2, 2, 74), (3, 0, 71)], 3: [(0, 0, 74), (1, 2, 71), (3, 1, 67)],
                  4: [(0, 0, 81), (1, 2, 77), (2, 2, 76), (3, 0, 72)], 5: [(0, 0, 76), (2, 0, 71)], 1: [(2, 0, 72)], 0: []}
        for bar, beat, m in motifs.get(s, []):
            add(bells, bell(midi(m), .5), s0 + bar * BAR + beat * BEAT, pan=rng.uniform(-.5, .5))
        # --- soft low pulse on beats 1 & 3 (drive) in the middle sections
        if s in (3, 4):
            for bar in range(4):
                for beat in (0, 2):
                    add(pulse, kick(.55 if beat == 0 else .35), s0 + bar * BAR + beat * BEAT, 0)
    P, A, B, Bl, K = (fold(x) for x in (pad, arp, bells, bass, pulse))
    # --- ping-pong delay on the arpeggio (loop-safe via np.roll)
    D = np.zeros_like(A)
    for k in range(1, 7):
        sh = int(k * .75 * SR); g = .5 ** k * 1.5; D[k % 2] += np.roll(A[0] + A[1], sh) * g * .5
    A = A + D
    # --- cosmic wind: circular-filtered noise (periodic, so no seam), slowly breathing
    f = np.fft.rfftfreq(NLOOP, 1 / SR); resp_lo = 1 / (1 + (f / 500) ** 2) ** 1.5; resp_hi = (f / 1800) ** 2 / (1 + (f / 1800) ** 4) ** .9
    tt = np.arange(NLOOP) / SR; W = np.zeros((2, NLOOP))
    for ch in range(2):
        lo = fft_filter(noise(NLOOP), resp_lo); hi = fft_filter(noise(NLOOP), resp_hi)
        lo /= np.abs(lo).max(); hi /= np.abs(hi).max()
        m = .5 + .5 * np.sin(2 * np.pi * tt / 32 + ch * 1.3)
        W[ch] = (lo * (1 - m) * .8 + hi * m * .35) * (.55 + .45 * np.sin(2 * np.pi * tt / 24 + ch)) * .11
    wet = circ_reverb(P * 1.0 + A * .9 + B * .9, seed=3)
    mix = P * .9 + wet * .95 + A * .55 + B * .55 + Bl * 1.0 + K * .6 + W
    mix[0] = fft_filter(mix[0], np.where(f < 28, (f / 28) ** 2, 1.0)); mix[1] = fft_filter(mix[1], np.where(f < 28, (f / 28) ** 2, 1.0))
    mix = np.tanh(mix * .9 / np.abs(mix).max() * 1.15)                # gentle saturation / peak control
    mix = mix / np.abs(mix).max() * .90
    print('  music rms: %.1f dBFS, peak %.1f dBFS' % (20 * np.log10(np.sqrt((mix ** 2).mean())), 20 * np.log10(np.abs(mix).max())))
    return mix

if __name__ == '__main__':
    print('Sound effects')
    for name, fn in (('click', sfx_click), ('attach', sfx_attach), ('detach', sfx_detach), ('power', sfx_power), ('data', sfx_data)):
        to_mp3(name + '.mp3', fn(), q=2)
    print('Music (this takes a little while)')
    m = build_music()
    to_mp3('background_music.mp3', m.T, bitrate='160k')
    print('Loop length: %.3f s' % LOOP_SEC)

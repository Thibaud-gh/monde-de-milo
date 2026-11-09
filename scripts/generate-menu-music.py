#!/usr/bin/env python3
"""Original, sample-free café waltz for Milo. Requires numpy and ffmpeg.

Renders a seamless 64-second loop with soft piano-like tones and a warm bass.
No third-party recordings, samples or existing melody are used.
"""
import hashlib
import json
import subprocess
import wave
from pathlib import Path
import numpy as np

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / 'public' / 'music'
SR = 44100
BEAT = 60 / 90
BARS = 32
COUNT = round(BARS * 3 * BEAT * SR)
rng = np.random.default_rng(17)
mix = np.zeros((COUNT, 2), dtype=np.float64)


def note(midi, beat, length, level, pan=0, soft=False):
    duration = length * BEAT + 1.5
    t = np.arange(round(duration * SR)) / SR
    frequency = 440 * 2 ** ((midi - 69) / 12)
    decay = (1.7 if soft else 3.2) / max(length * BEAT, .45)
    envelope = (1 - np.exp(-t / .012)) * np.exp(-t * decay)
    envelope *= np.minimum(1, (duration - t) / .3)
    tone = np.sin(2 * np.pi * frequency * t)
    for harmonic, amount in [(2, .21), (3, .075), (4, .025)]:
        tone += amount * np.sin(2 * np.pi * frequency * harmonic * (1 + .00009 * harmonic) * t) * np.exp(-t * harmonic)
    tone *= envelope * level
    start = round((beat * BEAT + rng.uniform(-.009, .009)) * SR)
    positions = (start + np.arange(len(tone))) % COUNT
    mix[positions, 0] += tone * np.sqrt((1 - pan) / 2)
    mix[positions, 1] += tone * np.sqrt((1 + pan) / 2)


# Bass and close, gently plucked voicings. The final dominant resolves at the loop.
chords = [
    (48, [60, 64, 67, 71]), (45, [60, 64, 67, 69]),
    (50, [60, 62, 65, 69]), (43, [59, 62, 64, 67]),
    (52, [59, 62, 64, 67]), (45, [60, 64, 67, 69]),
    (50, [60, 62, 65, 69]), (43, [59, 62, 65, 67]),
    (41, [57, 60, 64, 65]), (52, [59, 62, 64, 67]),
    (50, [57, 60, 62, 65]), (43, [59, 62, 64, 67]),
    (48, [59, 60, 64, 67]), (45, [57, 60, 64, 67]),
    (50, [57, 60, 62, 65]), (43, [59, 62, 65, 67]),
]
melody = [
    [(0, 76, 1.3), (1.5, 79, .7)], [(0, 76, 1), (2, 72, .7)],
    [(.5, 74, 1), (2, 77, .7)], [(0, 76, 1), (1.5, 74, .9)],
    [(0, 71, 1.4), (2, 74, .7)], [(.5, 72, 1), (2, 76, .7)],
    [(0, 77, 1.4), (2, 74, .7)], [(0, 71, 1), (2, 67, .6)],
    [(0, 69, 1.3), (1.5, 72, .7)], [(0, 71, 1), (2, 76, .7)],
    [(.5, 74, 1), (2, 69, .7)], [(0, 71, 1.4), (2, 74, .7)],
    [(0, 76, 1), (1.5, 79, .9)], [(0, 76, 1.4), (2, 72, .7)],
    [(0, 74, 1.5), (2, 77, .7)], [(0, 74, 1), (1.5, 71, 1)],
]
for bar in range(BARS):
    bass, chord = chords[bar % 16]
    note(bass, bar * 3, 2, .13, -.12, True)
    for beat in [1, 2]:
        for j, pitch in enumerate(chord[:3]):
            note(pitch, bar * 3 + beat + j * .025, .7, .035, (j - 1) * .2, True)
    for beat, pitch, length in melody[bar % 16]:
        if bar >= 16 and bar % 4 == 2:
            pitch = pitch - 2 if pitch > 74 else pitch + 2
        note(pitch, bar * 3 + beat, length, .105, .16)
    if bar in [3, 11, 19, 27]:
        note(84, bar * 3 + 2.5, .8, .014, -.3)

# Circular room reflections preserve the tail over the loop boundary.
dry = mix.copy()
for delay, amount in [(.11, .15), (.23, .11), (.37, .08), (.61, .045)]:
    mix += np.roll(dry[:, ::-1], round(delay * SR), axis=0) * amount
mix = np.tanh(mix * 1.2)
mix *= .7 / np.max(np.abs(mix))
OUT.mkdir(exist_ok=True)
wav = OUT / 'menu-cafe.tmp.wav'
with wave.open(str(wav), 'wb') as output:
    output.setnchannels(2)
    output.setsampwidth(2)
    output.setframerate(SR)
    output.writeframes((mix * 32767).astype('<i2').tobytes())
mp3 = OUT / 'menu-cafe.mp3'
subprocess.run(['ffmpeg', '-y', '-v', 'error', '-i', str(wav), '-codec:a', 'libmp3lame', '-q:a', '3', str(mp3)], check=True)
wav.unlink()
(OUT / 'catalog.json').write_text(json.dumps({
    'title': 'Le petit café', 'file': mp3.name, 'bpm': 90, 'durationSeconds': BARS * 3 * BEAT,
    'composition': 'Original composition for Le monde de Milo; no third-party samples or melody.',
    'contentHash': hashlib.sha256(mp3.read_bytes()).hexdigest(),
}, ensure_ascii=False, indent=2) + '\n')
print(f'Prepared {mp3.name}: {BARS * 3 * BEAT:.0f}s, {mp3.stat().st_size} bytes')

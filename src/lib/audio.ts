import { setMusicNarrating } from './menuMusic';
import catalog from '../../public/audio/catalog.json';
const clips: Record<string, { file: string; signature: string; contentHash?: string }> = catalog.clips;
// Play prepared voice clips only. Missing audio never falls back to system TTS.
let current: HTMLAudioElement | null = null;
let generation = 0;
export function stopAudio() {
  generation++;
  setMusicNarrating(false);
  if (current) { current.pause(); current.onended = null; current.onerror = null; current.onplaying = null; current = null; }
}
export function playAudio(id: string, caption: string, onEnd?: () => void, onError?: () => void, onStart?: () => void) {
  stopAudio();
  const token = generation;
  const clip = clips[id];
  const audio = new Audio(`${import.meta.env.BASE_URL}audio/${clip?.file ?? `${id}.mp3`}?v=${(clip?.contentHash ?? clip?.signature)?.slice(0, 12) ?? 'missing'}`);
  current = audio;
  setMusicNarrating(true);
  audio.onended = () => { if (token === generation) { current = null; setMusicNarrating(false); onEnd?.(); } };
  let failed = false;
  let started = false;
  const reportStarted = () => {
    if (token !== generation || failed || started) return;
    started = true; onStart?.();
  };
  audio.onplaying = reportStarted;
  const reportError = () => {
    if (token !== generation || failed) return;
    failed = true; audio.onended = null; audio.onplaying = null; audio.pause(); current = null; setMusicNarrating(false);
    console.warn(`Audio could not play: ${caption}`);
    onError?.();
  };
  audio.onerror = reportError;
  void audio.play().then(reportStarted).catch(reportError);
}

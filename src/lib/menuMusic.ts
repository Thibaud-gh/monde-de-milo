import { useSyncExternalStore } from 'react';
import catalog from '../../public/music/catalog.json';

const KEY = 'milo-menu-music';
const listeners = new Set<() => void>();
let enabled = true;
try { enabled = localStorage.getItem(KEY) !== 'off'; } catch { /* Music still works without storage. */ }
let active = false;
let visible = true;
let narrating = false;
let unlocked = false;
let audio: HTMLAudioElement | null = null;
let context: AudioContext | null = null;
let gain: GainNode | null = null;
let pauseTimer: ReturnType<typeof setTimeout> | undefined;

function desiredGain() { return enabled && active && visible ? narrating ? .025 : .25 : 0; }
function update() {
  if (pauseTimer) { clearTimeout(pauseTimer); pauseTimer = undefined; }
  const volume = desiredGain();
  if (gain && context) {
    gain.gain.cancelScheduledValues(context.currentTime);
    gain.gain.setTargetAtTime(volume, context.currentTime, .08);
  }
  if (!volume) {
    pauseTimer = setTimeout(() => {
      if (desiredGain() !== 0) return;
      audio?.pause();
      if (context?.state === 'running') void context.suspend().catch(() => {});
    }, 300);
    return;
  }
  if (!unlocked) return;
  if (!audio) {
    // Web Audio gain works on iPad too, where media-element volume can be fixed.
    try {
      context = new AudioContext();
      gain = context.createGain();
      gain.gain.value = 0;
      audio = new Audio(`${import.meta.env.BASE_URL}music/${catalog.file}?v=${catalog.contentHash.slice(0, 12)}`);
      audio.loop = true;
      audio.preload = 'none';
      context.createMediaElementSource(audio).connect(gain);
      gain.connect(context.destination);
      gain.gain.setTargetAtTime(volume, context.currentTime, .08);
    } catch { return; }
  }
  if (context?.state === 'suspended') void context.resume().catch(() => {});
  // Autoplay denial is harmless; the next deliberate interaction retries.
  if (audio.paused) void audio.play().catch(() => {});
}
export function setMenuMusicActive(value: boolean) { active = value; update(); }
export function setMusicNarrating(value: boolean) { narrating = value; update(); }
export function toggleMenuMusic() {
  enabled = !enabled;
  try { localStorage.setItem(KEY, enabled ? 'on' : 'off'); } catch { /* Keep the preference for this session. */ }
  listeners.forEach(listener => listener());
  update();
}
export function useMenuMusicEnabled() {
  return useSyncExternalStore(listener => { listeners.add(listener); return () => listeners.delete(listener); }, () => enabled);
}
export function initializeMenuMusic() {
  visible = !document.hidden;
  const interact = () => { unlocked = true; if (desiredGain() && (audio?.paused !== false || context?.state !== 'running')) update(); };
  const visibility = () => { visible = !document.hidden; update(); };
  document.addEventListener('pointerdown', interact, { capture: true, passive: true });
  document.addEventListener('keydown', interact, true);
  document.addEventListener('visibilitychange', visibility);
  return () => {
    document.removeEventListener('pointerdown', interact, true);
    document.removeEventListener('keydown', interact, true);
    document.removeEventListener('visibilitychange', visibility);
    if (pauseTimer) clearTimeout(pauseTimer);
    audio?.pause();
    if (context) void context.close().catch(() => {});
    audio = null; gain = null; context = null; unlocked = false;
  };
}

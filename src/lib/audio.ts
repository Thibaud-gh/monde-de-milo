// Play prepared voice clips only. Missing audio never falls back to system TTS.
let current: HTMLAudioElement | null = null;
let generation = 0;
export function stopAudio() {
  generation++;
  if (current) { current.pause(); current.onended = null; current.onerror = null; current = null; }
}
export function playAudio(id: string, caption: string, onEnd?: () => void, onError?: () => void) {
  stopAudio();
  const token = generation;
  const audio = new Audio(`${import.meta.env.BASE_URL}audio/${id}.mp3`);
  current = audio;
  audio.onended = () => { if (token === generation) { current = null; onEnd?.(); } };
  let failed = false;
  const reportError = () => {
    if (token !== generation || failed) return;
    failed = true; current = null;
    console.warn(`Audio could not play: ${caption}`);
    onError?.();
  };
  audio.onerror = reportError;
  void audio.play().catch(reportError);
}

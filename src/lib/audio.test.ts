import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
vi.mock('./menuMusic', () => ({ setMusicNarrating: vi.fn() }));
let instances: FakeAudio[];
class FakeAudio {
  src: string;
  onended: null | (() => void) = null;
  onerror: null | (() => void) = null;
  onplaying: null | (() => void) = null;
  resolve!: () => void;
  reject!: (error: Error) => void;
  pause = vi.fn();
  play = vi.fn(() => new Promise<void>((resolve, reject) => { this.resolve = resolve; this.reject = reject; }));
  constructor(src: string) { this.src = src; instances.push(this); }
}
beforeEach(() => { vi.resetModules(); instances = []; vi.stubGlobal('Audio', FakeAudio); });
afterEach(() => vi.unstubAllGlobals());
describe('responsive voice playback', () => {
  it('enables answering at playback start without waiting for the sentence to end', async () => {
    const { playAudio } = await import('./audio');
    const ready = vi.fn(); const ended = vi.fn();
    playAudio('show-apple', 'Montre-moi la pomme !', ended, undefined, ready);
    expect(ready).not.toHaveBeenCalled();
    instances[0].onplaying?.(); instances[0].resolve(); await Promise.resolve();
    expect(ready).toHaveBeenCalledTimes(1);
    expect(ended).not.toHaveBeenCalled();
    instances[0].onended?.(); expect(ended).toHaveBeenCalledTimes(1);
  });
  it('does not let a cancelled prompt enable objects for the next turn', async () => {
    const { playAudio } = await import('./audio');
    const staleReady = vi.fn(); const nextReady = vi.fn();
    playAudio('show-apple', 'Apple', undefined, undefined, staleReady);
    const stalePlaying = instances[0].onplaying;
    playAudio('give-bread', 'Bread', undefined, undefined, nextReady);
    stalePlaying?.(); instances[0].resolve(); await Promise.resolve();
    expect(staleReady).not.toHaveBeenCalled(); expect(nextReady).not.toHaveBeenCalled();
    instances[1].onplaying?.(); expect(nextReady).toHaveBeenCalledTimes(1);
  });
  it('can carry the same audio player from one story page to the next', async () => {
    const { playAudio } = await import('./audio');
    const player = new Audio();
    const firstEnded = vi.fn();
    const nextEnded = vi.fn();
    playAudio('s2-story-1', 'First page', firstEnded, undefined, undefined, player);
    instances[0].onended?.();
    expect(firstEnded).toHaveBeenCalledTimes(1);
    playAudio('s2-story-2', 'Next page', nextEnded, undefined, undefined, player);
    expect(instances).toHaveLength(1);
    expect(instances[0].src).toContain('s2-story-2.mp3');
    instances[0].onended?.();
    expect(nextEnded).toHaveBeenCalledTimes(1);
  });
});

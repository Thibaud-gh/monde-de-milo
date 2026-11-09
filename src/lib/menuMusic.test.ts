import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

let handlers: Record<string, () => void>;
let media: { paused: boolean; loop: boolean; src: string; play: ReturnType<typeof vi.fn>; pause: ReturnType<typeof vi.fn> }[];
let contexts: { state: string; ramp: ReturnType<typeof vi.fn> }[];
let page: { hidden: boolean; addEventListener: ReturnType<typeof vi.fn>; removeEventListener: ReturnType<typeof vi.fn> };
beforeEach(() => {
  vi.resetModules(); vi.useFakeTimers();
  handlers = {}; media = []; contexts = [];
  page = { hidden: false, addEventListener: vi.fn((type: string, handler: () => void) => { handlers[type] = handler; }), removeEventListener: vi.fn() };
  vi.stubGlobal('document', page);
  vi.stubGlobal('localStorage', { getItem: vi.fn(() => null), setItem: vi.fn() });
  vi.stubGlobal('Audio', class {
    paused = true; loop = false; preload = ''; src: string;
    play = vi.fn(async () => { this.paused = false; });
    pause = vi.fn(() => { this.paused = true; });
    constructor(src: string) { this.src = src; media.push(this); }
  });
  vi.stubGlobal('AudioContext', class {
    state = 'suspended'; currentTime = 0; destination = {};
    ramp = vi.fn();
    constructor() { contexts.push(this); }
    createGain() { return { gain: { value: 0, cancelScheduledValues: vi.fn(), setTargetAtTime: this.ramp }, connect: vi.fn() }; }
    createMediaElementSource() { return { connect: vi.fn() }; }
    resume = vi.fn(async () => { this.state = 'running'; });
    suspend = vi.fn(async () => { this.state = 'suspended'; });
    close = vi.fn(async () => { this.state = 'closed'; });
  });
});
afterEach(() => { vi.clearAllTimers(); vi.useRealTimers(); vi.unstubAllGlobals(); });

describe('quiet menu music', () => {
  it('waits for interaction and remembers mute while keeping one loop', async () => {
    const music = await import('./menuMusic');
    const dispose = music.initializeMenuMusic();
    music.setMenuMusicActive(true);
    expect(media).toHaveLength(0);
    handlers.pointerdown();
    expect(media).toHaveLength(1);
    expect(media[0].loop).toBe(true);
    expect(media[0].paused).toBe(false);
    music.toggleMenuMusic(); vi.advanceTimersByTime(300);
    expect(media[0].paused).toBe(true);
    expect(contexts[0].state).toBe('suspended');
    expect(localStorage.setItem).toHaveBeenCalledWith('milo-menu-music', 'off');
    music.toggleMenuMusic();
    expect(media).toHaveLength(1);
    expect(media[0].paused).toBe(false);
    dispose();
  });
  it('stops for games and cancels an obsolete pause when returning to a menu', async () => {
    const music = await import('./menuMusic');
    const dispose = music.initializeMenuMusic();
    music.setMenuMusicActive(true); handlers.pointerdown();
    music.setMenuMusicActive(false);
    music.setMenuMusicActive(true);
    vi.advanceTimersByTime(300);
    expect(media[0].paused).toBe(false);
    music.setMenuMusicActive(false); vi.advanceTimersByTime(300);
    expect(media[0].paused).toBe(true);
    music.setMusicNarrating(false);
    handlers.pointerdown();
    expect(media[0].play).toHaveBeenCalledTimes(1);
    dispose();
  });
  it('ducks under narration and pauses while the app is hidden', async () => {
    const music = await import('./menuMusic');
    const dispose = music.initializeMenuMusic();
    music.setMenuMusicActive(true); handlers.pointerdown();
    music.setMusicNarrating(true);
    expect(contexts[0].ramp).toHaveBeenLastCalledWith(.025, 0, .08);
    music.setMusicNarrating(false);
    expect(contexts[0].ramp).toHaveBeenLastCalledWith(.25, 0, .08);
    page.hidden = true; handlers.visibilitychange(); vi.advanceTimersByTime(300);
    expect(media[0].paused).toBe(true);
    page.hidden = false; handlers.visibilitychange();
    expect(media[0].paused).toBe(false);
    dispose();
  });
});

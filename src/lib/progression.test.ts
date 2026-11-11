import { describe, expect, it } from 'vitest';
import type { Engagement, LearningEvent } from './model';
import type { Trial } from '../content/week1';
import { activityKey, activityState, canStartActivity, checkpoint, gameStage, stageCompletions } from './progression';
const event = (contentId: string, name: Engagement['event'], extra: Partial<Engagement> = {}): LearningEvent => ({ id: crypto.randomUUID(), profileId: 'p', ownerId: null, synced: false, createdAt: new Date().toISOString(), payload: { kind: 'engagement', contentId, sessionId: 's', event: name, ...extra } });
const plan: Trial[] = ['apple', 'banana', 'water', 'bread'].map((food, i) => ({ id: `t${i}`, food: food as Trial['food'], action: 'show', guided: i === 0 }));
describe('one-time introductions and repeatable practice', () => {
  it('opens only the first game for a new learner', () => {
    expect(activityState([], 1, 'find')).toBe('ready');
    expect(canStartActivity([], 1, 'give')).toBe(false);
    expect(canStartActivity([], 1, 'mission')).toBe(false);
  });
  it('requires both introductions, closes completed introductions and keeps practice replayable', () => {
    const first = event('chapter-2:v2:find', 'activity_complete');
    const second = event('chapter-2:v2:give', 'activity_complete');
    expect(canStartActivity([second], 1, 'mission')).toBe(false);
    expect(activityState([first], 1, 'find')).toBe('done');
    expect(canStartActivity([first], 1, 'give')).toBe(true);
    expect(canStartActivity([first], 1, 'mission')).toBe(false);
    expect(canStartActivity([first, second], 1, 'mission')).toBe(true);
    expect(canStartActivity([first, second, event('chapter-2:v2:mission', 'activity_complete')], 1, 'mission')).toBe(true);
    expect(canStartActivity([first, second], 1, 'find')).toBe(false);
    expect(canStartActivity([first, second], 1, 'give')).toBe(false);
  });
  it('retains old session-two history without treating it as the revised curriculum', () => {
    const old = [event('chapter-2:v2:understanding:find', 'activity_complete'), event('chapter-2:find', 'activity_complete'), event('chapter-2:understanding:find', 'activity_complete')];
    expect(gameStage(old, 1, 'understanding')).toBe(1);
    expect(gameStage(old, 1, 'speaking')).toBe(1);
  });
  it('honours legacy chapter-one completions without unlocking another chapter', () => {
    const events = [event('find', 'activity_complete'), event('give', 'activity_complete')];
    expect(activityKey(0, 'find')).toBe('find');
    expect(canStartActivity(events, 0, 'mission')).toBe(true);
    expect(canStartActivity(events, 1, 'mission')).toBe(false);
    expect(activityState(events, 1, 'find')).toBe('ready');
  });
  it('resumes the saved trial order and next turn, even after an older cloud checkpoint arrives late', () => {
    const events = [event('chapter-2:v2:find', 'activity_checkpoint', { trials: plan, completedTurns: 2 }), event('chapter-2:v2:find', 'activity_checkpoint', { trials: plan, completedTurns: 0 })];
    expect(checkpoint(events, 1, 'find')).toEqual({ trials: plan, completedTurns: 2 });
    expect(activityState(events, 1, 'find')).toBe('resume');
    expect(checkpoint(events, 0, 'find')).toBeUndefined();
    expect(activityState([...events, event('chapter-2:v2:find', 'activity_complete')], 1, 'find')).toBe('done');
  });
  it('ignores invalid checkpoints and starts practice with a fresh round', () => {
    expect(checkpoint([event('find', 'activity_checkpoint', { trials: plan, completedTurns: 99 })], 0, 'find')).toBeUndefined();
    expect(checkpoint([event('mission', 'activity_checkpoint', { trials: plan, completedTurns: 2 })], 0, 'mission')).toBeUndefined();
  });
});

describe('independent game squares', () => {
  it('advances each game square through its own stages and holds at three', () => {
    const speaking = [event('chapter-2:v2:find', 'activity_complete'), event('chapter-2:v2:give', 'activity_complete')];
    const understanding = [event('chapter-2:v3:understanding:find', 'activity_complete')];
    expect(gameStage([], 1, 'understanding')).toBe(1);
    expect(gameStage(speaking, 1, 'speaking')).toBe(3);
    expect(gameStage(speaking, 1, 'understanding')).toBe(1);
    expect(gameStage([...speaking, ...understanding], 1, 'understanding')).toBe(2);
    const all = [...speaking, ...understanding, event('chapter-2:v3:understanding:give', 'activity_complete'), event('chapter-2:v3:understanding:mission', 'activity_complete')];
    expect(gameStage(all, 1, 'understanding')).toBe(3);
    expect(gameStage(all, 1, 'speaking')).toBe(3);
    expect(canStartActivity(all, 1, 'mission', 'understanding')).toBe(true);
  });
  it('keeps legacy speaking checkpoints away from understanding and retains Chapter 1 progress', () => {
    const saved = [event('chapter-2:v2:find', 'activity_checkpoint', { trials: plan, completedTurns: 2 })];
    expect(checkpoint(saved, 1, 'find', 'speaking')?.completedTurns).toBe(2);
    expect(checkpoint(saved, 1, 'find', 'understanding')).toBeUndefined();
    expect(gameStage([event('find', 'activity_complete')], 0, 'understanding')).toBe(2);
    expect(gameStage([event('find', 'activity_complete'), event('give', 'activity_complete')], 0, 'understanding')).toBe(3);
  });
});

describe('stage stars', () => {
  it('awards exactly one star per completed stage, including Stage 3, without adding stars for replays', () => {
    const events = [event('chapter-2:v2:find', 'activity_complete'), event('chapter-2:v2:give', 'activity_complete')];
    expect(stageCompletions([], 1, 'speaking')).toEqual([false, false, false]);
    expect(stageCompletions(events.slice(0, 1), 1, 'speaking')).toEqual([true, false, false]);
    expect(stageCompletions(events, 1, 'speaking')).toEqual([true, true, false]);
    events.push(event('chapter-2:v2:mission', 'activity_complete'), event('chapter-2:v2:mission', 'activity_complete'));
    expect(stageCompletions(events, 1, 'speaking')).toEqual([true, true, true]);
    expect(stageCompletions(events, 1, 'understanding')).toEqual([false, false, false]);
    expect(gameStage(events, 1, 'speaking')).toBe(3);
  });
});

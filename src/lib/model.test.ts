import { describe, expect, it } from 'vitest';
import { makeTrials } from '../content/week1';
import type { Trial } from '../content/week1';
import { assess, attemptPayload, mergeEvents, metrics } from './model';
import type { LearningEvent, Payload } from './model';
const trial: Trial = { id: 'trial', food: 'apple', action: 'show', guided: false };
const event = (id: string, payload: Payload, synced = false): LearningEvent => ({ id, profileId: 'p', ownerId: null, createdAt: '2026-11-08T12:00:00Z', synced, payload });
describe('independent object and action evidence', () => {
  it('separates an incorrect noun from the requested gesture', () => {
    expect(assess(trial, 'banana', 'show')).toEqual({ objectCorrect: false, actionCorrect: true, combinedCorrect: false, outcome: 'retry' });
  });
  it('separates a correct noun from a misunderstood action', () => {
    expect(assess(trial, 'apple', 'give')).toEqual({ objectCorrect: true, actionCorrect: false, combinedCorrect: false, outcome: 'retry' });
  });
  it.each(['tap', 'incomplete'] as const)('leaves action comprehension unknown for %s', gesture => {
    expect(assess(trial, 'apple', gesture)).toEqual({ objectCorrect: true, actionCorrect: null, combinedCorrect: false, outcome: 'motor' });
  });
  it('excludes guidance and motor slips from independent language ratios', () => {
    const records = [
      event('1', attemptPayload('find', 's', trial, 'apple', 'show', false, 1)),
      event('2', attemptPayload('find', 's', trial, 'apple', 'give', false, 2)),
      event('3', attemptPayload('find', 's', trial, 'apple', 'show', true, 3)),
      event('4', attemptPayload('find', 's', trial, 'apple', 'tap', false, 4)),
      event('5', { kind: 'engagement', contentId: 'milo-apple', sessionId: 's', event: 'story_complete' }),
    ];
    const result = metrics(records);
    expect(result.objects).toEqual({ correct: 2, total: 2 });
    expect(result.actions).toEqual({ correct: 1, total: 2 });
    expect(result.combined).toEqual({ correct: 1, total: 2 });
    expect(result.guided).toHaveLength(1);
    expect(result.motor).toBe(1);
  });
});
describe('weekly trials', () => {
  it('keeps bread out of lesson one', () => {
    const trials = makeTrials('find', () => .3);
    expect(trials).toHaveLength(6);
    expect(trials.every(t => t.food !== 'bread' && t.action === 'show')).toBe(true);
    expect(trials.slice(2).every(t => !t.guided)).toBe(true);
  });
  it.each(['give', 'mission'] as const)('uses every food for both actions in %s', activity => {
    const trials = makeTrials(activity, () => .7);
    expect(trials).toHaveLength(8);
    expect(new Set(trials.map(t => `${t.food}:${t.action}`)).size).toBe(8);
    expect(trials[0].food).toBe('apple');
    expect(trials[0].guided).toBe(true);
    expect(new Set(trials.map(t => t.id)).size).toBe(trials.length);
  });
});
describe('cloud/local event merge', () => {
  it('deduplicates uploaded records while preserving new offline events', () => {
    const payload: Payload = { kind: 'engagement', contentId: 'find', sessionId: 's', event: 'activity_open' };
    const local = [event('1', payload), event('2', payload)];
    const remote = [event('1', payload, true), event('3', payload, true)];
    const result = mergeEvents(local, remote);
    expect(result).toHaveLength(3);
    expect(result.find(e => e.id === '1')?.synced).toBe(true);
    expect(result.find(e => e.id === '2')?.synced).toBe(false);
  });
});

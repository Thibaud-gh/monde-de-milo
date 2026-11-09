import { describe, expect, it } from 'vitest';
import { foodLayout, makeTrials } from '../content/week1';
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
  it('leaves action comprehension unknown for an unfinished drag', () => {
    expect(assess(trial, 'apple', 'incomplete')).toEqual({ objectCorrect: true, actionCorrect: null, combinedCorrect: false, outcome: 'motor' });
  });
  it('accepts a tap to show without needing a hold', () => {
    expect(assess(trial, 'apple', 'tap')).toEqual({ objectCorrect: true, actionCorrect: true, combinedCorrect: true, outcome: 'correct' });
    expect(assess(trial, 'banana', 'tap').actionCorrect).toBe(true);
  });
  it('keeps a tap during a give prompt out of language ratios', () => {
    expect(assess({ ...trial, action: 'give' }, 'apple', 'tap').outcome).toBe('motor');
  });
  it('excludes guidance and motor slips from independent language ratios', () => {
    const records = [
      event('1', attemptPayload('find', 's', trial, 'apple', 'show', false, 1)),
      event('2', attemptPayload('find', 's', trial, 'apple', 'give', false, 2)),
      event('3', attemptPayload('find', 's', trial, 'apple', 'show', true, 3)),
      event('4', attemptPayload('give', 's', { ...trial, action: 'give' }, 'apple', 'tap', false, 4)),
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
  it.each(['find', 'give'] as const)('uses all four foods twice, with only the requested action in %s', activity => {
    const trials = makeTrials(activity, () => .3);
    expect(trials).toHaveLength(8);
    for (const food of ['apple', 'banana', 'water', 'bread']) {
      expect(trials.filter(trial => trial.food === food)).toHaveLength(2);
    }
    expect(trials.every(trial => trial.action === (activity === 'find' ? 'show' : 'give'))).toBe(true);
    expect(new Set(foodLayout())).toEqual(new Set(['apple', 'banana', 'water', 'bread']));
  });
  it('mixes both actions for each food only in the mission', () => {
    const trials = makeTrials('mission', () => .7);
    expect(trials).toHaveLength(8);
    expect(new Set(trials.map(t => `${t.food}:${t.action}`)).size).toBe(8);
  });
  it.each(['find', 'give', 'mission'] as const)('demonstrates only the first turn in %s', activity => {
    const trials = makeTrials(activity);
    expect(trials[0].food).toBe('apple');
    expect(trials[0].guided).toBe(true);
    expect(trials.slice(1).every(trial => !trial.guided)).toBe(true);
    expect(new Set(trials.map(trial => trial.id)).size).toBe(trials.length);
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

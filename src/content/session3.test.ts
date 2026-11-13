import { describe, expect, it } from 'vitest';
import { cafeFoods } from './cafe';
import { assessService, makeServiceTurns, matchesNeed, serviceOffer, serviceRequestClip, serviceRequestText, serviceScenes } from './session3';
import { narrationFor } from './narration';
import { activityKey, activityState, serviceCheckpoint } from '../lib/progression';
import type { Engagement, LearningEvent } from '../lib/model';

describe('the café finale', () => {
  it('accepts any familiar food for hunger and either drink for thirst', () => {
    const rounds = makeServiceTurns('find');
    expect(rounds.filter(turn => turn.scene === 'hungry')).toHaveLength(3);
    expect(rounds.filter(turn => turn.scene === 'thirsty')).toHaveLength(3);
    for (const turn of rounds) {
      expect(turn.kind).toBe('need');
      if (turn.kind !== 'need') continue;
      for (const food of cafeFoods) {
        expect(assessService(turn, { food, action: 'give' })?.correct).toBe(matchesNeed(turn.scene, food));
        expect(assessService(turn, { food, action: 'tap' })).toBeUndefined();
      }
    }
    expect(cafeFoods.filter(food => matchesNeed('thirsty', food)).sort()).toEqual(['milk', 'water']);
    expect(cafeFoods.filter(food => matchesNeed('hungry', food)).sort()).toEqual(['apple', 'banana', 'bread', 'cheese']);
  });

  it('contrasts needs with actions, then offers all four pictures', () => {
    const rounds = makeServiceTurns('give');
    expect(rounds.slice(0, 4).every(turn => turn.kind === 'scene' && turn.scenes.length === 2)).toBe(true);
    expect(rounds.slice(4).every(turn => turn.kind === 'scene' && turn.scenes.length === 4)).toBe(true);
    const drinkingProps = rounds.flatMap(turn => turn.kind === 'scene' && turn.scene === 'drinking' ? [turn.sip] : []);
    expect(drinkingProps.sort()).toEqual(['milk', 'water']);
    for (const turn of rounds) {
      if (turn.kind !== 'scene') throw new Error('Expected a picture round');
      expect(matchesNeed('hungry', turn.bite)).toBe(true);
      expect(matchesNeed('thirsty', turn.sip)).toBe(true);
      expect(assessService(turn, { scene: turn.scene })?.correct).toBe(true);
    }
  });

  it('requires the scene, food and gesture and reuses requests across different scenes', () => {
    const rounds = makeServiceTurns('mission');
    expect(rounds).toHaveLength(12);
    for (const turn of rounds) {
      if (turn.kind !== 'combined') throw new Error('Expected a combined turn');
      const { food, form } = turn.request;
      const action = form === 'show' ? 'tap' : 'give';
      const wrongAction = action === 'tap' ? 'give' : 'tap';
      const otherScene = turn.scenes.find(scene => scene !== turn.scene);
      expect(turn.scenes).toHaveLength(2);
      expect(new Set(turn.foods).size).toBe(3);
      expect(turn.foods).toContain(food);
      expect(assessService(turn, { scene: turn.scene })).toBeUndefined();
      expect(assessService(turn, { food, action })).toBeUndefined();
      expect(assessService(turn, { scene: turn.scene, food, action })?.correct).toBe(true);
      expect(assessService(turn, { scene: otherScene, food, action })?.correct).toBe(false);
      expect(assessService(turn, { scene: turn.scene, food, action: wrongAction })?.correct).toBe(false);
      expect(rounds.some(other => other.kind === 'combined' && other.scene !== turn.scene &&
        other.request.food === food && other.request.form === form)).toBe(true);
      expect(narrationFor(serviceRequestClip(turn.request)).text).toBe(serviceRequestText(turn.request));
    }
  });

  it('uses the prepared French scene, offer and reply recordings', () => {
    for (const [scene, { text }] of Object.entries(serviceScenes)) expect(narrationFor(`s3-${scene}`).text).toBe(text);
    for (const food of cafeFoods) expect(narrationFor(`s3-offer-${food}`).text).toBe(serviceOffer(food));
    expect(narrationFor('s3-yes').text).toBe('Oui, s’il te plaît.');
    expect(narrationFor('s3-no').text).toBe('Non, merci.');
  });

  it('resumes listening progress and opens speaking independently', () => {
    const contentId = activityKey(2, 'find', 'understanding');
    const turns = makeServiceTurns('find');
    const payload: Engagement = { kind: 'engagement', contentId, sessionId: 's3', event: 'activity_checkpoint', serviceTurns: turns, completedTurns: 2 };
    const event: LearningEvent = { id: 'event', profileId: 'test', ownerId: null, createdAt: '2026-11-13T08:00:00Z', payload, synced: false };
    const events = [event];
    expect(serviceCheckpoint(events, 'find')).toEqual({ trials: turns, completedTurns: 2 });
    expect(activityState(events, 2, 'find', 'understanding')).toBe('resume');
    expect(activityState(events, 2, 'give', 'understanding')).toBe('locked');
    expect(activityState(events, 2, 'mission', 'speaking')).toBe('ready');
    expect(activityState(events, 1, 'find', 'understanding')).toBe('ready');
    const complete: LearningEvent = { ...event, id: 'complete', payload: { ...payload, event: 'activity_complete' } };
    expect(activityState([...events, complete], 2, 'give', 'understanding')).toBe('ready');
    expect(activityState([...events, complete], 2, 'mission', 'understanding')).toBe('locked');
  });

  it('persists a Session 3 restart and resumes only rounds started after it', () => {
    const contentId = activityKey(2, 'find', 'understanding');
    const turns = makeServiceTurns('find');
    const event = (id: string, payload: Partial<Engagement>): LearningEvent => ({
      id, profileId: 'test', ownerId: null, createdAt: '2026-11-13T08:00:00Z', synced: false,
      payload: { kind: 'engagement', contentId, sessionId: 's3', event: 'activity_complete', ...payload },
    });
    const cafeComplete = event('cafe', { contentId: activityKey(1, 'find', 'understanding') });
    const reset = event('reset', { event: 'activity_reset' });
    const stale = event('stale', { event: 'activity_checkpoint', serviceTurns: turns, completedTurns: 4 });
    const events = JSON.parse(JSON.stringify([cafeComplete, event('finished', {}), reset, stale])) as LearningEvent[];
    expect(activityState(events, 2, 'find', 'understanding')).toBe('ready');
    expect(activityState(events, 2, 'give', 'understanding')).toBe('locked');
    expect(activityState(events, 1, 'give', 'understanding')).toBe('ready');
    const fresh = event('fresh', { event: 'activity_checkpoint', serviceTurns: turns, completedTurns: 1, resetId: reset.id });
    expect(serviceCheckpoint([...events, fresh], 'find')).toEqual({ trials: turns, completedTurns: 1 });
  });
});

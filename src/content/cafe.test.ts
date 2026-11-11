import { describe, expect, it } from 'vitest';
import { cafeClip, cafeFoods, cafeHasSupport, cafeText, makeCafeTrials, makeSpeakingTrials } from './cafe';
import { have, request, snackStory } from './session2';
import { foodLayout, makeTrials } from './week1';
import { narrationFor } from './narration';
import { metrics, type LearningEvent, type Attempt } from '../lib/model';

describe('a contrast that requires listening to the sentence', () => {
  it.each(['give', 'mission'] as const)('%s defeats first/last noun, a favourite food and fixed-position shortcuts', stage => {
    const plan = makeCafeTrials(stage, () => .42);
    const firstNounWins = plan.filter(t => t.cafe.requestFirst).length;
    expect(firstNounWins).toBe(plan.length / 2);
    for (const food of new Set(plan.map(t => t.food))) {
      expect(plan.filter(t => t.food === food).length).toBe(plan.filter(t => t.cafe.held === food).length);
    }
    for (const t of plan) {
      expect(t.food).not.toBe(t.cafe.held);
      expect(t.cafe.choices).toContain(t.food);
      expect(t.cafe.choices).toContain(t.cafe.held);
      expect(t.guided).toBe(false);
      expect(cafeText(t)).toContain(have(t.cafe.held));
      expect(cafeText(t)).toContain(request(t.food));
    }
    const slots = plan.map(t => t.cafe.choices.indexOf(t.food));
    expect(new Set(slots).size).toBeGreaterThan(1);
    // For each unordered pair the SAME two nouns have both possible answers.
    const first = plan[0];
    expect(plan.some(t => t.food === first.cafe.held && t.cafe.held === first.food)).toBe(true);
  });
  it('teaches new nouns before the contrast and keeps first contrasts familiar', () => {
    const plan = makeCafeTrials('find');
    expect(plan.slice(0, 2).every(t => t.guided && t.cafe.kind === 'word')).toBe(true);
    expect(plan.slice(2, 4).every(t => !t.guided && t.cafe.kind === 'word')).toBe(true);
    expect(new Set(plan.slice(0, 4).map(t => t.food))).toEqual(new Set(['milk', 'cheese']));
    expect(plan.slice(4).every(t => t.guided && ['apple', 'banana'].includes(t.food))).toBe(true);
    expect(makeCafeTrials('mission').every(t => t.cafe.choices.length === 6)).toBe(true);
  });
  it('leaves chapter one at four foods and its original show/give progression', () => {
    expect(foodLayout()).toHaveLength(4);
    for (const stage of ['find', 'give', 'mission'] as const) expect(makeTrials(stage).every(t => !['milk', 'cheese'].includes(t.food))).toBe(true);
  });
  it('gives equal speaking turns to both phrases and preserves the paired role-play', () => {
    expect(makeSpeakingTrials().map(t => t.frame)).toEqual(['have', 'want', 'have', 'want', 'have', 'want']);
  });
  it('uses a complete prepared utterance for every possible contrast and spoken model', () => {
    for (const stage of ['find', 'give', 'mission'] as const) for (const t of makeCafeTrials(stage)) {
      expect(narrationFor(cafeClip(t)).text).toBe(cafeText(t));
    }
    for (const food of cafeFoods) {
      expect(narrationFor(`cafe-have-${food}`).text).toBe(have(food));
      expect(narrationFor(`s2-request-${food}`).text).toBe(request(food));
    }
  });
  it('has a story reveal, then resolves the missing cheese before the drink', () => {
    expect(snackStory.map(p => p.scene)).toEqual(['search', 'napkin', 'hat', 'sandwich', 'request', 'goodbye']);
    expect(snackStory[2].text).toContain('sur la tête');
    expect(snackStory.at(-1)?.text).toContain('plus de fromage sur la tête');
  });
});
describe('honest learning observations', () => {
  it('remembers a visual hint across leaving and resuming the same turn', () => {
    const trial = makeCafeTrials('give')[0];
    const hint: LearningEvent = { id: 'hint', profileId: 'test', ownerId: null, synced: false, createdAt: new Date().toISOString(), payload: { kind: 'engagement', contentId: 'test', sessionId: 'test', event: 'activity_hint', trialId: trial.id } };
    expect(cafeHasSupport([], trial)).toBe(false);
    expect(cafeHasSupport([hint], trial)).toBe(true);
    expect(cafeHasSupport([hint], makeCafeTrials('give')[0])).toBe(false);
  });
  it('does not label sentence contrast errors as noun or gesture errors', () => {
    const payload: Attempt = { kind: 'attempt', interactionVersion: 'cafe-contrast-v1', learningTarget: 'have-want', chapter: 'session-2', activity: 'give', sessionId: 'test', trialId: 'test', phrase: 'J’ai une pomme. Je voudrais une banane.', targetObject: 'banana', heldObject: 'apple', targetAction: 'give', selectedObject: 'apple', performedAction: 'give', assisted: false, attemptNumber: 1, objectCorrect: false, actionCorrect: null, combinedCorrect: false, outcome: 'retry' };
    const event = (p: Attempt): LearningEvent => ({ id: crypto.randomUUID(), profileId: 'test', ownerId: null, synced: false, createdAt: new Date().toISOString(), payload: p });
    const result = metrics([event(payload), event({ ...payload, assisted: true, combinedCorrect: true })]);
    expect(result.wants).toEqual({ correct: 0, total: 1 });
    expect(result.objects.total).toBe(0); expect(result.actions.total).toBe(0);
    expect(result.guided).toHaveLength(1);
    const vocab = metrics([event({ ...payload, learningTarget: 'vocabulary', targetObject: 'milk' })]);
    expect(vocab.objects.total).toBe(1); expect(vocab.wants.total).toBe(0);
  });
});

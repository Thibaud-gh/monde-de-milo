import { describe, expect, it } from 'vitest';
import { assessCafe, assessCafeChoices, cafeClip, cafeFoods, smallCafeFoods, cafeHasSupport, cafeText, makeCafeTrials, makeSpeakingTrials } from './cafe';
import { have, request, snackStory } from './session2';
import { foodLayout, makeTrials, phrase } from './week1';
import { narrationFor } from './narration';
import { metrics, type LearningEvent, type Attempt } from '../lib/model';

describe('a contrast that requires listening to the sentence', () => {
  it.each(['find', 'mission'] as const)('%s defeats first/last noun and fixed-picture shortcuts', stage => {
    const plan = makeCafeTrials(stage, () => .42);
    expect(plan.filter(t => t.cafe.requestFirst)).toHaveLength(plan.length / 2);
    for (const food of new Set(plan.map(t => t.food))) {
      expect(plan.filter(t => t.food === food)).toHaveLength(plan.filter(t => t.cafe.held === food).length);
    }
    for (const t of plan) {
      expect(t.food).not.toBe(t.cafe.held);
      expect(t.cafe.choices).toContain(t.food);
      expect(t.cafe.choices).toContain(t.cafe.held);
      expect(cafeText(t)).toContain(have(t.cafe.held));
      expect(cafeText(t)).toContain(t.cafe.form === 'want' ? request(t.food) : phrase(t.action, t.food));
    }
    expect(new Set(plan.map(t => t.cafe.choices.indexOf(t.food))).size).toBeGreaterThan(1);
    for (const t of plan) expect(plan.some(other => other.food === t.cafe.held && other.cafe.held === t.food && other.cafe.form === t.cafe.form)).toBe(true);
  });
  it('starts with hidden possessions and familiar foods, then introduces a small mixed menu', () => {
    const first = makeCafeTrials('find');
    expect(first).toHaveLength(8);
    expect(first.every(t => t.cafe.kind === 'contrast' && t.cafe.form === 'want' && t.action === 'give' && t.cafe.choices.length === 2)).toBe(true);
    expect(first.filter(t => t.guided)).toHaveLength(1);
    expect(first.every(t => !['milk', 'cheese'].includes(t.food))).toBe(true);
    const second = makeCafeTrials('give');
    expect(second).toHaveLength(12);
    expect(second.slice(0, 2).map(t => t.food)).toEqual(['milk', 'cheese']);
    expect(second.slice(0, 2).every(t => t.guided)).toBe(true);
    for (const food of smallCafeFoods) {
      const turns = second.filter(t => t.food === food);
      expect(new Set(turns.map(t => t.cafe.form))).toEqual(new Set(['want', 'show', 'give']));
      for (const turn of turns) expect(new Set(turn.cafe.choices)).toEqual(new Set(smallCafeFoods));
    }
  });
  it('draws two other foods alongside the named foods in every stage-three turn', () => {
    const plan = makeCafeTrials('mission');
    expect(plan).toHaveLength(12);
    for (const trial of plan) {
      expect(trial).toMatchObject({ action: 'give', guided: false, cafe: { kind: 'contrast' } });
      expect(new Set(trial.cafe.choices).size).toBe(4);
      expect(trial.cafe.choices).toHaveLength(4);
      expect(trial.cafe.choices).toEqual(expect.arrayContaining([trial.food, trial.cafe.held]));
      expect(trial.cafe.choices.every(food => cafeFoods.includes(food))).toBe(true);
    }
    const distractors = (random: () => number) => makeCafeTrials('mission', random)
      .find(t => t.food === 'apple' && t.cafe.form === 'want')!.cafe.choices
      .filter(food => food !== 'apple' && food !== 'banana').sort();
    expect(distractors(() => 0)).not.toEqual(distractors(() => .99));
    for (const food of cafeFoods) expect(new Set(plan.filter(t => t.food === food).map(t => t.cafe.form))).toEqual(new Set(['want', 'give']));
  });
  it.each(['find', 'mission'] as const)('grades both choices together in %s', activity => {
    const trial = makeCafeTrials(activity)[0];
    const held = trial.cafe.held;
    const given = trial.food;
    expect(assessCafeChoices(trial, { held, given: null })).toBeUndefined();
    expect(assessCafeChoices(trial, { held: null, given })).toBeUndefined();
    expect(assessCafeChoices(trial, { held: given, given })).toMatchObject({
      heldObjectCorrect: false, objectCorrect: true, outcome: 'retry',
    });
    expect(assessCafeChoices(trial, { held, given: held })).toMatchObject({
      heldObjectCorrect: true, objectCorrect: false, outcome: 'retry',
    });
    expect(assessCafeChoices(trial, { held, given })).toMatchObject({
      heldObjectCorrect: true, objectCorrect: true, outcome: 'correct',
    });
  });
  it('requires a tap for montre and a delivery for voudrais/donne without penalising stray drops', () => {
    for (const t of [...makeCafeTrials('give'), ...makeCafeTrials('mission')]) {
      expect(assessCafe(t, t.food, 'incomplete').outcome).toBe('motor');
      expect(assessCafe(t, t.food, t.cafe.form === 'show' ? 'tap' : 'give').combinedCorrect).toBe(true);
      if (t.cafe.form === 'show') expect(assessCafe(t, t.food, 'give').combinedCorrect).toBe(false);
      else expect(assessCafe(t, t.food, 'tap').outcome).toBe('motor');
      const other = t.cafe.choices.find(f => f !== t.food)!;
      expect(assessCafe(t, other, t.action).combinedCorrect).toBe(false);
    }
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
  it('keeps the snack story coherent and in sequence', () => {
    expect(snackStory).toHaveLength(8);
    expect(snackStory[1]).toMatchObject({ food: null, thought: 'apple' });
    expect(snackStory[2]).toMatchObject({ food: 'apple', thought: null });
    expect(snackStory[2].text).toContain('j’ai une pomme');
    expect(snackStory[3]).toMatchObject({ food: null, thought: 'water' });
    expect(snackStory[4]).toMatchObject({ food: 'water', thought: null });
    expect(snackStory[5]).toMatchObject({ hat: true, thought: 'cheese', text: 'Je voudrais du fromage.' });
    expect(snackStory[6].hat).toBe(true);
  });
});
describe('honest learning observations', () => {
  it('remembers a visual hint across leaving and resuming the same turn', () => {
    const trial = makeCafeTrials('give')[2];
    const hint: LearningEvent = { id: 'hint', profileId: 'test', ownerId: null, synced: false, createdAt: new Date().toISOString(), payload: { kind: 'engagement', contentId: 'test', sessionId: 'test', event: 'activity_hint', trialId: trial.id } };
    expect(cafeHasSupport([], trial)).toBe(false);
    expect(cafeHasSupport([hint], trial)).toBe(true);
    expect(cafeHasSupport([hint], makeCafeTrials('give')[2])).toBe(false);
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

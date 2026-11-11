import type { LearningEvent } from '../lib/model';
import { shuffled, type ActivityId, type Food, type Trial } from './week1';
import { request, have } from './session2';
export const cafeFoods: Food[] = ['apple', 'banana', 'bread', 'water', 'milk', 'cheese'];
export const contrastPairs: [Food, Food][] = [['apple', 'banana'], ['bread', 'water'], ['milk', 'cheese']];
export type CafeTrial = Trial & { cafe: NonNullable<Trial['cafe']> };
export function contrastText(held: Food, wanted: Food, requestFirst: boolean) {
  return requestFirst ? `${request(wanted)} ${have(held)}` : `${have(held)} ${request(wanted)}`;
}
export function cafeClip(trial: CafeTrial) {
  return trial.cafe.kind === 'word' ? `cafe-word-${trial.food}` : `cafe-${trial.cafe.held}-${trial.food}-${trial.cafe.requestFirst ? 'want-first' : 'have-first'}`;
}
export function cafeText(trial: CafeTrial) {
  return trial.cafe.kind === 'word' ? `Voici ${trial.food === 'milk' ? 'du lait' : 'du fromage'}. Donne-moi ${trial.food === 'milk' ? 'le lait' : 'le fromage'} !` : contrastText(trial.cafe.held, trial.food, trial.cafe.requestFirst);
}
// Every pair appears in both roles and both sentence orders. Neither the noun,
// the first/last mention nor the picture's position can solve the whole round.
export function makeCafeTrials(activity: ActivityId, random = Math.random): CafeTrial[] {
  const pairs = activity === 'find' ? contrastPairs.slice(0, 1) : activity === 'give' ? contrastPairs.slice(0, 2) : contrastPairs;
  const contrasts = pairs.flatMap(([a, b]) => [false, true].flatMap(requestFirst => [[a, b], [b, a]].map(([held, food]) => ({
    id: crypto.randomUUID(), food, action: 'give' as const, guided: activity === 'find',
    cafe: { kind: 'contrast' as const, held, requestFirst, choices: shuffled(activity === 'mission' ? cafeFoods : [a, b], random) },
  }))));
  const intro: CafeTrial[] = activity === 'find' ? [true, false].flatMap(guided => shuffled(['milk', 'cheese'] as Food[], random).map(food => ({
    id: crypto.randomUUID(), food, action: 'give', guided,
    cafe: { kind: 'word', held: food === 'milk' ? 'cheese' : 'milk', requestFirst: false, choices: shuffled(['milk', 'cheese'] as Food[], random) },
  }))) : [];
  return [...intro, ...shuffled(contrasts, random)];
}
export function makeSpeakingTrials(): Trial[] {
  return Array.from({ length: 6 }, (_, i) => ({ id: crypto.randomUUID(), food: 'apple', action: 'give', guided: false, frame: i % 2 === 0 ? 'have' : 'want' }));
}

export function cafeHasSupport(events: LearningEvent[], trial: CafeTrial) {
  return trial.guided || events.some(({ payload: p }) =>
    (p.kind === 'attempt' && p.trialId === trial.id && (p.assisted || p.outcome === 'retry')) ||
    (p.kind === 'engagement' && p.event === 'activity_hint' && p.trialId === trial.id));
}

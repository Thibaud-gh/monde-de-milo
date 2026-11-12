import { assess, type LearningEvent, type PerformedAction } from '../lib/model';
import { phrase, shuffled, type ActivityId, type Food, type Trial } from './week1';
import { request, have } from './session2';
export const cafeFoods: Food[] = ['apple', 'banana', 'bread', 'water', 'milk', 'cheese'];
export const smallCafeFoods: Food[] = ['apple', 'banana', 'milk', 'cheese'];
export const contrastPairs: [Food, Food][] = [['apple', 'banana'], ['bread', 'water'], ['milk', 'cheese']];
export type CafeTrial = Trial & { cafe: NonNullable<Trial['cafe']> };
export type CafeForm = 'want' | 'give' | 'show';
export function contrastText(held: Food, wanted: Food, requestFirst: boolean, form: CafeForm = 'want') {
  const instruction = form === 'want' ? request(wanted) : phrase(form, wanted);
  return requestFirst ? `${instruction} ${have(held)}` : `${have(held)} ${instruction}`;
}
export function cafeClip(trial: CafeTrial) {
  const form = trial.cafe.form ?? 'want';
  if (trial.cafe.kind === 'word') return `cafe-word-${trial.food}`;
  if (trial.cafe.kind === 'instruction') return form === 'want' ? `s2-request-${trial.food}` : `${form}-${trial.food}`;
  return `cafe-${trial.cafe.held}-${trial.food}-${form === 'want' ? '' : `${form}-`}${trial.cafe.requestFirst ? 'want-first' : 'have-first'}`;
}
export function cafeText(trial: CafeTrial) {
  const form = trial.cafe.form ?? 'want';
  if (trial.cafe.kind === 'word') return `Voici ${trial.food === 'milk' ? 'du lait' : 'du fromage'}. Donne-moi ${trial.food === 'milk' ? 'le lait' : 'le fromage'} !`;
  if (trial.cafe.kind === 'instruction') return form === 'want' ? request(trial.food) : phrase(form, trial.food);
  return contrastText(trial.cafe.held, trial.food, trial.cafe.requestFirst, form);
}
export function makeCafeTrials(activity: ActivityId, random = Math.random): CafeTrial[] {
  if (activity === 'give') {
    const turns = smallCafeFoods.flatMap(food => (['want', 'give', 'show'] as const).map(form => ({
      id: crypto.randomUUID(), food, action: form === 'show' ? 'show' as const : 'give' as const, guided: false,
      cafe: { kind: 'instruction' as const, form, held: food, requestFirst: false, choices: shuffled(smallCafeFoods, random) },
    })));
    // Two supported introductions to the new nouns; then all three request forms.
    const intro = [turns.find(t => t.food === 'milk' && t.cafe.form === 'show')!, turns.find(t => t.food === 'cheese' && t.cafe.form === 'give')!];
    intro.forEach(t => { t.guided = true; });
    return [...intro, ...shuffled(turns.filter(t => !intro.includes(t)), random)];
  }
  const pairs = activity === 'find' ? contrastPairs.slice(0, 2) : contrastPairs;
  const forms: CafeForm[] = activity === 'find' ? ['want'] : ['want', 'give'];
  const turns: CafeTrial[] = pairs.flatMap(([a, b]) => forms.flatMap(form => {
    // Keep both clause orders for every form; swap the roles of the same nouns.
    // The paired foods share a shuffled layout so position cannot solve the pair.
    const first = random() < .5;
    const roles: [Food, Food, boolean][] = activity === 'find'
      ? [[a, b, false], [b, a, false], [a, b, true], [b, a, true]]
      : [[a, b, first], [b, a, !first]];
    const choices = shuffled(activity === 'mission' ? cafeFoods : [a, b], random);
    return roles.map(([held, food, requestFirst]) => ({
      id: crypto.randomUUID(), food, action: 'give', guided: false,
      cafe: { kind: 'contrast', form, held, requestFirst, choices: [...choices] },
    }));
  }));
  const plan = shuffled(turns, random);
  if (activity === 'find') plan[0].guided = true;
  return plan;
}
export function assessCafe(trial: CafeTrial, selected: Food, performed: PerformedAction) {
  return assess(trial, selected, performed);
}
export type CafeChoices = { held: Food | null; given: Food | null };

export function assessCafeChoices(trial: CafeTrial, { held, given }: CafeChoices) {
  if (!held || !given) return undefined;
  const result = assessCafe(trial, given, 'give');
  const heldObjectCorrect = held === trial.cafe.held;
  const combinedCorrect = result.combinedCorrect && heldObjectCorrect;
  return {
    ...result,
    selectedHeldObject: held,
    heldObjectCorrect,
    combinedCorrect,
    outcome: combinedCorrect ? 'correct' as const : 'retry' as const,
  };
}
export function makeSpeakingTrials(): Trial[] {
  return Array.from({ length: 6 }, (_, i) => ({ id: crypto.randomUUID(), food: 'apple', action: 'give', guided: false, frame: i % 2 === 0 ? 'have' : 'want' }));
}
export function cafeHasSupport(events: LearningEvent[], trial: CafeTrial) {
  return trial.guided || events.some(({ payload: p }) =>
    (p.kind === 'attempt' && p.trialId === trial.id && (p.assisted || p.outcome === 'retry')) ||
    (p.kind === 'engagement' && p.event === 'activity_hint' && p.trialId === trial.id));
}

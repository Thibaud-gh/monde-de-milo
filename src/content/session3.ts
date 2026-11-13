import { cafeFoods } from './cafe';
import { request, requestFood } from './session2';
import { phrase, shuffled, type Action, type ActivityId, type Food } from './week1';
import type { PerformedAction } from '../lib/model';

export const serviceScenes = {
  hungry: { text: 'J’ai faim.', label: 'Milo se frotte le ventre devant une assiette vide' },
  thirsty: { text: 'J’ai soif.', label: 'Milo penche son verre vide' },
  eating: { text: 'Je mange.', label: 'Milo prend une bouchée' },
  drinking: { text: 'Je bois.', label: 'Milo prend une gorgée' },
} as const;
export type ServiceScene = keyof typeof serviceScenes;
export type Need = 'hungry' | 'thirsty';
export type ServiceRequest = { food: Food; form: Action | 'want' };
export type ServiceTurn =
  | { id: string; kind: 'need'; scene: Need; foods: Food[] }
  | { id: string; kind: 'scene'; scene: ServiceScene; scenes: ServiceScene[]; bite: Food; sip: Food }
  | { id: string; kind: 'combined'; scene: ServiceScene; scenes: ServiceScene[]; bite: Food; sip: Food; foods: Food[]; request: ServiceRequest };

export const serviceTitles: Record<ActivityId, string> = {
  find: 'Faim ou soif ?',
  give: 'Que fait Milo ?',
  mission: 'Le dernier service',
};

const scenes: ServiceScene[] = ['hungry', 'eating', 'thirsty', 'drinking'];
const contrasts: Record<ServiceScene, ServiceScene> = {
  hungry: 'eating', eating: 'hungry', thirsty: 'drinking', drinking: 'thirsty',
};
const solids: Food[] = ['apple', 'banana', 'bread', 'cheese'];
const liquids: Food[] = ['water', 'milk'];
export function isDrink(food: Food) { return liquids.includes(food); }
export function matchesNeed(need: Need, food: Food) { return (need === 'thirsty') === isDrink(food); }
export function serviceOffer(food: Food) { return `Tu veux ${requestFood[food]} ?`; }
export function serviceRequestText({ food, form }: ServiceRequest) {
  return form === 'want' ? request(food) : phrase(form, food);
}
export function serviceRequestClip({ food, form }: ServiceRequest) {
  return form === 'want' ? `s2-request-${food}` : `${form}-${food}`;
}
function sceneOptions(scene: ServiceScene, random: () => number) {
  return shuffled([scene, contrasts[scene]], random);
}
function sceneProps(random: () => number) {
  return { bite: shuffled(solids, random)[0], sip: shuffled(liquids, random)[0] };
}
export function makeServiceTurns(activity: ActivityId, random = Math.random): ServiceTurn[] {
  const id = () => crypto.randomUUID();
  if (activity === 'find') {
    return shuffled<Need>(['hungry', 'thirsty', 'hungry', 'thirsty', 'hungry', 'thirsty'], random)
      .map(scene => ({ id: id(), kind: 'need', scene, foods: shuffled(cafeFoods, random) }));
  }
  if (activity === 'give') {
    const [firstDrink, secondDrink] = shuffled(liquids, random);
    const paired = shuffled(scenes, random).map(scene => ({
      id: id(), kind: 'scene' as const, scene, scenes: sceneOptions(scene, random),
      ...sceneProps(random), sip: firstDrink,
    }));
    const mixed = shuffled(scenes, random).map(scene => ({
      id: id(), kind: 'scene' as const, scene, scenes: shuffled(scenes, random),
      ...sceneProps(random), sip: secondDrink,
    }));
    return [...paired, ...mixed];
  }
  // Each request is paired with a need and an action in the same contrast.
  // Across the round, neither the food nor the gesture identifies the scene.
  const requests = (['show', 'give', 'want'] as const).flatMap(form =>
    shuffled(cafeFoods, random).slice(0, 2).map(food => ({ food, form })));
  const turns = requests.flatMap((request, index) => {
    const pair: ServiceScene[] = index % 2 === 0 ? ['hungry', 'eating'] : ['thirsty', 'drinking'];
    const choices = shuffled([request.food, ...shuffled(cafeFoods.filter(food => food !== request.food), random).slice(0, 2)], random);
    return pair.map(scene => ({
      id: id(), kind: 'combined' as const, scene, scenes: sceneOptions(scene, random),
      ...sceneProps(random), foods: choices, request,
    }));
  });
  return shuffled(turns, random);
}

export type ServiceAnswer = { scene?: ServiceScene; food?: Food; action?: PerformedAction };
export function assessService(turn: ServiceTurn, answer: ServiceAnswer) {
  const sceneCorrect = turn.kind === 'need' ? undefined : answer.scene === turn.scene;
  if (turn.kind !== 'need' && !answer.scene) return;
  if (turn.kind === 'scene') return { correct: sceneCorrect === true, sceneCorrect };
  if (!answer.food || !answer.action || answer.action === 'incomplete') return;
  if (turn.kind === 'need') {
    if (answer.action !== 'give') return;
    const foodCorrect = matchesNeed(turn.scene, answer.food);
    return { correct: foodCorrect, foodCorrect };
  }
  const foodCorrect = answer.food === turn.request.food;
  const actionCorrect = (answer.action === 'tap' ? 'show' : answer.action) === (turn.request.form === 'show' ? 'show' : 'give');
  return { correct: sceneCorrect === true && foodCorrect && actionCorrect, sceneCorrect, foodCorrect, actionCorrect };
}

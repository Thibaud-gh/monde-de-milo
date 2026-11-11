import { learner } from './learner';
import { narrationFor } from './narration';
export const foods = {
  apple: { name: 'la pomme', label: 'Une pomme', english: 'Apple' },
  banana: { name: 'la banane', label: 'Une banane', english: 'Banana' },
  water: { name: 'l’eau', label: 'De l’eau', english: 'Water' },
  bread: { name: 'le pain', label: 'Du pain', english: 'Bread' },
  milk: { name: 'le lait', label: 'Du lait', english: 'Milk' },
  cheese: { name: 'le fromage', label: 'Du fromage', english: 'Cheese' },
} as const;
export type Food = keyof typeof foods;
export const weekOneFoods: Food[] = ['apple', 'banana', 'water', 'bread'];
export type Action = 'show' | 'give';
export type ActivityId = 'find' | 'give' | 'mission';
export type Trial = { id: string; food: Food; action: Action; guided: boolean; cafe?: { kind: 'word' | 'contrast' | 'instruction'; form?: 'want' | 'give' | 'show'; held: Food; requestFirst: boolean; choices: Food[] }; frame?: 'have' | 'want' };
export const activities: {
  id: ActivityId; title: string; description: string; lesson: number;
  icon: 'hand' | 'basket' | 'flag'; food: Food; instruction: string;
}[] = [
  { id: 'find', title: 'Trouve !', description: 'Montre les aliments à Milo.', lesson: 1, icon: 'hand', food: 'apple', instruction: 'Touche l’image.' },
  { id: 'give', title: 'Donne à Milo !', description: 'Remplis le panier avec Milo.', lesson: 2, icon: 'basket', food: 'banana', instruction: 'Glisse l’aliment vers Milo.' },
  { id: 'mission', title: 'La mission de Milo', description: 'Écoute : montre ou donne !', lesson: 3, icon: 'flag', food: 'bread', instruction: 'Touche ou glisse : écoute Milo.' },
];
export type StorySceneId = 'search' | 'table' | 'shelf' | 'basket' | 'found' | 'goodbye';
const storyScenes: StorySceneId[] = ['search', 'table', 'shelf', 'basket', 'found', 'goodbye'];
export function storyForLearner(name: string) {
  return {
    id: 'milo-apple', title: 'Milo cherche sa pomme',
    pages: storyScenes.map((scene, index) => ({ ...narrationFor(`story-${index + 1}`, name), scene })),
  };
}
export const story = storyForLearner(learner.firstName);
export function phrase(action: Action, food: Food) {
  return `${action === 'show' ? 'Montre-moi' : 'Donne-moi'} ${foods[food].name} !`;
}
export function shuffled<T>(items: T[], random = Math.random): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}
export function makeTrials(id: ActivityId, random = Math.random): Trial[] {
  const foodIds = weekOneFoods;
  let pairs: { food: Food; action: Action }[];
  if (id === 'mission') {
    const mixed = foodIds.flatMap(food => [
      { food, action: 'show' as const }, { food, action: 'give' as const },
    ]);
    pairs = [{ food: 'apple', action: 'show' }, ...shuffled(mixed.filter(p => !(p.action === 'show' && p.food === 'apple')), random)];
  } else {
    const action: Action = id === 'find' ? 'show' : 'give';
    const remaining: Food[] = ['banana', 'water', 'bread', 'apple', 'banana', 'water', 'bread'];
    pairs = [{ food: 'apple', action }, ...shuffled(remaining, random).map(food => ({ food, action }))];
  }
  return pairs.map((p, i) => ({ ...p, id: crypto.randomUUID(), guided: i === 0 }));
}
export function foodLayout(): Food[] {
  return shuffled(weekOneFoods);
}

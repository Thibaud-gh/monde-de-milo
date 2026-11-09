import { learner } from './learner';
import { narrationFor } from './narration';
export const foods = {
  apple: { name: 'la pomme', label: 'Une pomme', english: 'Apple' },
  banana: { name: 'la banane', label: 'Une banane', english: 'Banana' },
  water: { name: 'l’eau', label: 'De l’eau', english: 'Water' },
  bread: { name: 'le pain', label: 'Du pain', english: 'Bread' },
} as const;
export type Food = keyof typeof foods;
export type Action = 'show' | 'give';
export type ActivityId = 'find' | 'give' | 'mission';
export type Trial = { id: string; food: Food; action: Action; guided: boolean };
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
function shuffled<T>(items: T[], random = Math.random): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}
export function makeTrials(id: ActivityId, random = Math.random): Trial[] {
  let pairs: { food: Food; action: Action }[];
  if (id === 'find') {
    pairs = [{ food: 'apple', action: 'show' }, ...shuffled<Food>(['banana', 'water', 'apple', 'banana', 'water'], random).map(food => ({ food, action: 'show' as const }))];
  } else {
    const mixed = (Object.keys(foods) as Food[]).flatMap(food => [
      { food, action: 'show' as const }, { food, action: 'give' as const },
    ]);
    pairs = id === 'give'
      ? [{ food: 'apple', action: 'give' }, { food: 'banana', action: 'give' }, ...shuffled(mixed.filter(p => !(p.action === 'give' && ['apple', 'banana'].includes(p.food))), random)]
      : [{ food: 'apple', action: 'show' }, ...shuffled(mixed.filter(p => !(p.action === 'show' && p.food === 'apple')), random)];
  }
  return pairs.map((p, i) => ({ ...p, id: crypto.randomUUID(), guided: i < (id === 'mission' ? 1 : 2) }));
}
export function foodLayout(id: ActivityId): Food[] {
  return shuffled(id === 'find' ? ['apple', 'banana', 'water'] : Object.keys(foods)) as Food[];
}

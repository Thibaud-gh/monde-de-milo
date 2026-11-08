import { learner } from './learner';
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
export const story: {
  id: string; title: string; pages: { text: string; audio: string; scene: StorySceneId }[];
} = {
  id: 'milo-apple', title: 'Milo cherche sa pomme', pages: [
    { text: `Bonjour, ${learner.firstName} ! Je cherche ma pomme.`, audio: 'story-1', scene: 'search' },
    { text: 'Sur la table ? Non, c’est de l’eau !', audio: 'story-2', scene: 'table' },
    { text: 'Sur l’étagère ? Non, c’est une banane !', audio: 'story-3', scene: 'shelf' },
    { text: 'Et dans le panier ? Voyons…', audio: 'story-4', scene: 'basket' },
    { text: `Ah ! Ma pomme ! Merci, ${learner.firstName} !`, audio: 'story-5', scene: 'found' },
    { text: `Au revoir, ${learner.firstName} ! À bientôt !`, audio: 'story-6', scene: 'goodbye' },
  ],
};
// Keep prepared narration and captions aligned for other learner names.
// Éva has named recordings; other profiles use the same story with unnamed clips.
export function storyForLearner(name: string) {
  if (name.normalize('NFC') === learner.firstName) return story;
  const replacements: Record<string, string> = {
    'story-1': 'Bonjour ! Je cherche ma pomme.',
    'story-5': 'Ah ! Ma pomme ! Merci !',
    'story-6': 'Au revoir ! À bientôt !',
  };
  return { ...story, pages: story.pages.map(page => replacements[page.audio] ? { ...page, text: replacements[page.audio], audio: `${page.audio}-generic` } : page) };
}
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

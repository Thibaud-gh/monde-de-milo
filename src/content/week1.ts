export const foods = {
  apple: { name: 'la pomme', label: 'Une pomme', english: 'Apple' },
  banana: { name: 'la banane', label: 'Une banane', english: 'Banana' },
  water: { name: "l’eau", label: 'De l’eau', english: 'Water' },
  bread: { name: 'le pain', label: 'Du pain', english: 'Bread' },
} as const;
export type Food = keyof typeof foods;
export type Action = 'show' | 'give';
export type ActivityId = 'find' | 'give' | 'mission';
export type Trial = { id: string; food: Food; action: Action; guided: boolean };
export const activities: { id: ActivityId; title: string; description: string; lesson: number; icon: 'hand' | 'basket' | 'flag' }[] = [
  { id: 'find', title: 'Trouve !', description: 'Les découvertes', lesson: 1, icon: 'hand' },
  { id: 'give', title: 'Donne à Milo !', description: 'Le panier de Milo', lesson: 2, icon: 'basket' },
  { id: 'mission', title: 'La mission de Milo', description: 'Un petit coup de main au café', lesson: 3, icon: 'flag' },
];
export const story = {
  id: 'milo-apple', title: 'Milo cherche sa pomme', pages: [
    { text: 'Bonjour ! Je m’appelle Milo.', audio: 'story-1', scene: 0 },
    { text: 'Oh ! Une pomme !', audio: 'story-2', scene: 1 },
    { text: 'Et une banane !', audio: 'story-3', scene: 2 },
    { text: 'Où est la pomme ?', audio: 'story-4', scene: 3 },
    { text: 'Ah ! La pomme ! Bravo !', audio: 'story-5', scene: 4 },
    { text: 'Au revoir, Milo !', audio: 'story-6', scene: 5 },
  ],
};
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
    // A familiar guided opening, then balanced, shuffled requests. No action-specific layout.
    pairs = id === 'give'
      ? [{ food: 'apple', action: 'give' }, { food: 'banana', action: 'give' }, ...shuffled(mixed.filter(p => !(p.action === 'give' && ['apple', 'banana'].includes(p.food))), random)]
      : [{ food: 'apple', action: 'show' }, ...shuffled(mixed.filter(p => !(p.action === 'show' && p.food === 'apple')), random)];
  }
  return pairs.map((p, i) => ({ ...p, id: crypto.randomUUID(), guided: i < (id === 'mission' ? 1 : 2) }));
}
export function foodLayout(id: ActivityId): Food[] {
  // Shuffle independently from prompts, once per activity session, never per action.
  return shuffled(id === 'find' ? ['apple', 'banana', 'water'] : Object.keys(foods)) as Food[];
}

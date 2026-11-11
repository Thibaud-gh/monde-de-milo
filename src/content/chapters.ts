export const chapters = [
  { id: 'bonjour-milo', title: 'Bonjour, Milo !', subtitle: 'Les découvertes', game: 'Le panier de Milo', story: 'Milo cherche sa pomme', available: true, food: 'apple' },
  { id: 'jai-faim', title: 'Le goûter de Milo', subtitle: 'J’ai… Je voudrais…', game: 'Le goûter de Milo', story: 'Le goûter de Milo', available: true, food: 'bread' },
  { id: 'je-voudrais', title: 'Je voudrais…', subtitle: 'À table avec Milo', game: 'Le service du café', story: 'Milo prépare le goûter', available: false, food: 'banana' },
  { id: 'restaurant', title: 'Mon petit restaurant', subtitle: 'Bienvenue au restaurant !', game: 'Le grand restaurant', story: 'Le restaurant de Milo', available: false, food: 'water' },
] as const;

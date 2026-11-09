import { hasEvaRecordings, narrationFor } from './narration';
import { describe, expect, it } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { foods, phrase, story, storyForLearner } from './week1';
import type { Food } from './week1';
const audio = new URL('../../public/audio/', import.meta.url);
const phrases = JSON.parse(readFileSync(new URL('phrases.json', audio), 'utf8'));
describe('prepared French voice content', () => {
  it('covers both instructions for every food, with the same transcript as the game', () => {
    for (const food of Object.keys(foods) as Food[]) for (const action of ['show', 'give'] as const) {
      expect(phrases[`${action}-${food}`]).toBe(phrase(action, food));
    }
  });
  it('covers all six story captions without imposing a quiz', () => {
    expect(story.pages).toHaveLength(6);
    for (const page of story.pages) expect(phrases[page.audio]).toBe(page.text);
  });
  it('keeps narration accurate when a different child creates an account', () => {
    const alternate = storyForLearner('Alex');
    expect(alternate.pages.at(-1)?.text).not.toContain('Éva');
    for (const page of alternate.pages) expect(phrases[page.audio]).toBe(page.text);
    expect(story.pages.map(page => page.scene)).toEqual(['search', 'table', 'shelf', 'basket', 'found', 'goodbye']);
  });
  it('selects one whole-sentence recording for every Éva prompt and its unnamed alternative', () => {
    const ids = ['bonjour', 'merci', 'bravo', 'encore', 'showHint', 'giveHint', 'fini',
      ...Array.from({ length: 6 }, (_, index) => `story-${index + 1}`),
      ...Object.keys(foods).flatMap(food => [`show-${food}`, `give-${food}`])];
    for (const id of ids) {
      const named = narrationFor(id, 'Éva');
      const generic = narrationFor(id, 'Alex');
      expect(named.audio).toBe(`eva-${id}`);
      expect(phrases[named.audio]).toBe(named.text);
      expect(generic.text).not.toMatch(/Éva|Eva/);
      expect(phrases[generic.audio]).toBe(generic.text);
    }
    expect(narrationFor('show-apple', 'Éva').text).toBe('Montre-moi la pomme, Éva !');
    expect(hasEvaRecordings('Eva')).toBe(true);
    expect(hasEvaRecordings('Éva'.normalize('NFD'))).toBe(true);
    expect(hasEvaRecordings('Évan')).toBe(false);
  });
  it('bundles every declared clip as a nonempty MP3', () => {
    for (const id of Object.keys(phrases)) {
      const file = new URL(`${id}.mp3`, audio);
      expect(existsSync(fileURLToPath(file)), id).toBe(true);
      expect(readFileSync(file).length, id).toBeGreaterThan(1000);
    }
  });
});

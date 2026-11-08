import { describe, expect, it } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { foods, phrase, story } from './week1';
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
  it('bundles every declared clip as a nonempty MP3', () => {
    for (const id of Object.keys(phrases)) {
      const file = new URL(`${id}.mp3`, audio);
      expect(existsSync(fileURLToPath(file)), id).toBe(true);
      expect(readFileSync(file).length, id).toBeGreaterThan(1000);
    }
  });
});

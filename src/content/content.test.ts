import { createHash } from 'node:crypto';
import { request, understandingPrompt, snackStory } from './session2';
import { hasEvaRecordings, narrationFor } from './narration';
import { describe, expect, it } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { weekOneFoods, phrase, story, storyForLearner } from './week1';
const audio = new URL('../../public/audio/', import.meta.url);
const phrases = JSON.parse(readFileSync(new URL('phrases.json', audio), 'utf8'));
describe('prepared French voice content', () => {
  it('covers both instructions for every food, with the same transcript as the game', () => {
    for (const food of weekOneFoods) for (const action of ['show', 'give'] as const) {
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
  it('uses personal greetings and goodbyes without repeating Éva on every turn', () => {
    const ids = ['bonjour', 'merci', 'bravo', 'encore', 'showHint', 'giveHint', 'fini',
      ...Array.from({ length: 6 }, (_, index) => `story-${index + 1}`),
      ...weekOneFoods.flatMap(food => [`show-${food}`, `give-${food}`])];
    for (const id of ids) {
      const named = narrationFor(id, 'Éva');
      const generic = narrationFor(id, 'Alex');
      expect(named.audio).toBe(['bonjour', 'fini', 'story-1', 'story-6'].includes(id) ? `eva-${id}` : generic.audio);
      expect(phrases[named.audio]).toBe(named.text);
      expect(generic.text).not.toMatch(/Éva|Eva/);
      expect(phrases[generic.audio]).toBe(generic.text);
    }
    expect(narrationFor('show-apple', 'Éva').text).toBe('Montre-moi la pomme !');
    expect(narrationFor('merci', 'Éva').text).toBe('Merci !');
    expect(narrationFor('story-5', 'Éva').text).not.toContain('Éva');
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

// Understanding uses a request plus an action; the response remains a gesture.
describe('Session 2 understanding requests', () => {
  it('names every food and differentiates show from give without asking for speech', () => {
    for (const food of weekOneFoods) {
      expect(understandingPrompt({ food, action: 'show' })).toBe(`${request(food)} Montre-moi !`);
      expect(understandingPrompt({ food, action: 'give' })).toBe(`${request(food)} Donne-moi !`);
    }
  });
});

describe('approved Milo recordings for both sessions', () => {
  it('covers every Session 2 request, story caption and speaking scaffold', () => {
    for (const food of weekOneFoods) {
      for (const action of ['show', 'give'] as const) {
        expect(narrationFor(`s2-${action}-${food}`).text).toBe(understandingPrompt({ food, action }));
      }
      expect(narrationFor(`s2-request-${food}`).text).toBe(request(food));
    }
    snackStory.forEach((page, index) => expect(narrationFor(`cafe-story-${index + 1}`).text).toBe(page.text));
    expect(narrationFor('s2-question').text).toBe('Tu voudrais quoi ?');
    expect(narrationFor('s2-starter').text).toBe('Je voudrais…');
    expect(narrationFor('s2-fini').text).toBe('Quel bon goûter ! À bientôt !');
  });
  it('versions all clips with their actual bytes and keeps one pinned voice and transcript', () => {
    const catalog = JSON.parse(readFileSync(new URL('catalog.json', audio), 'utf8'));
    expect(catalog.provider).toBe('voxcpm2');
    expect(catalog.voice.referenceSha256).toBe('4a32b269d96766276246d3240917f59f916602ceaa9f4146da7ba5cd552e6e3e');
    for (const [id, text] of Object.entries(phrases)) {
      const clip = catalog.clips[id];
      expect(clip.text, id).toBe(text);
      expect(clip.voice, id).toBe(catalog.voice.name);
      expect(clip.generation, id).toBe('whole-utterance');
      expect(clip.contentHash, id).toBe(createHash('sha256').update(readFileSync(new URL(clip.file, audio))).digest('hex'));
    }
  });
});

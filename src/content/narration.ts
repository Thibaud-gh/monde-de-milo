import phrases from '../../public/audio/phrases.json';
import { learner } from './learner';

const transcripts: Record<string, string> = phrases;
const genericAlternatives: Record<string, string> = {
  bonjour: 'bonjour-generic',
  'story-1': 'story-1-generic',
  'story-5': 'story-5-generic',
  'story-6': 'story-6-generic',
};

export function hasEvaRecordings(name: string) {
  return name.trim().normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('fr') === 'eva';
}

// Select exactly one prepared, complete utterance. Never splice a name clip
// onto another recording. Unknown names always get the unnamed version.
export function narrationFor(id: string, name: string = learner.firstName) {
  // Personal greetings are warm; repeating the name on every turn is tiring.
  const personal = ['bonjour', 'fini', 'story-1', 'story-6'].includes(id);
  const audio = personal && hasEvaRecordings(name) ? `eva-${id}` : genericAlternatives[id] ?? id;
  const text = transcripts[audio];
  if (!text) throw new Error(`Missing narration: ${audio}`);
  return { audio, text };
}

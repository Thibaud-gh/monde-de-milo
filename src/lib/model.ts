import type { Action, ActivityId, Food, Trial } from '../content/week1';
import { phrase } from '../content/week1';
export type PerformedAction = Action | 'tap' | 'incomplete';
export type Attempt = {
  kind: 'attempt'; activity: ActivityId; chapter: 'week-1' | 'session-2'; sessionId: string; trialId: string;
  phrase: string; targetObject: Food; targetAction: Action; selectedObject: Food;
  performedAction: PerformedAction; assisted: boolean; attemptNumber: number;
  objectCorrect: boolean; actionCorrect: boolean | null; combinedCorrect: boolean;
  outcome: 'correct' | 'retry' | 'motor';
  interactionVersion?: 'tap-show-v2' | 'cafe-contrast-v1' | 'cafe-actions-v2';
  learningTarget?: 'vocabulary' | 'instructions' | 'have-want'; heldObject?: Food;
  selectedHeldObject?: Food; heldObjectCorrect?: boolean;
};
export type Engagement = {
  kind: 'engagement'; contentId: string; sessionId: string;
  event: 'activity_hint' | 'activity_checkpoint' | 'activity_open' | 'activity_complete' | 'activity_close' | 'story_open' | 'story_page' | 'story_complete' | 'story_replay' | 'story_audio_replay' | 'story_close';
  trialId?: string; page?: number; durationSeconds?: number; familiar?: boolean;
  trials?: Trial[]; completedTurns?: number;
};
export type Assessment = {
  kind: 'assessment'; term: string; level: 'independent' | 'prompted' | 'not-yet';
  note: string; lesson: number;
};
export type Payload = Attempt | Engagement | Assessment;
export type LearningEvent = { id: string; profileId: string; ownerId: string | null; createdAt: string; payload: Payload; synced: boolean };
export type Store = { profileId: string; profileOwner: string | null; learnerName?: string; events: LearningEvent[]; lesson: number; lessonUpdatedAt: string };
export function assess(trial: Trial, selected: Food, performed: PerformedAction) {
  const motor = performed === 'incomplete' || (performed === 'tap' && trial.action === 'give');
  const action = performed === 'tap' ? 'show' : performed;
  const objectCorrect = selected === trial.food;
  const actionCorrect = motor ? null : action === trial.action;
  const combinedCorrect = objectCorrect && actionCorrect === true;
  return { objectCorrect, actionCorrect, combinedCorrect, outcome: (motor ? 'motor' : combinedCorrect ? 'correct' : 'retry') as Attempt['outcome'] };
}
export function attemptPayload(activity: ActivityId, sessionId: string, trial: Trial, selected: Food, performed: PerformedAction, assisted: boolean, attemptNumber: number): Attempt {
  return { kind: 'attempt', interactionVersion: 'tap-show-v2', chapter: 'week-1', activity, sessionId, trialId: trial.id, phrase: phrase(trial.action, trial.food), targetObject: trial.food, targetAction: trial.action, selectedObject: selected, performedAction: performed, assisted, attemptNumber, ...assess(trial, selected, performed) };
}
export function metrics(events: LearningEvent[]) {
  const attempts = events.map(e => e.payload).filter((p): p is Attempt => p.kind === 'attempt');
  // Motor slips are visible separately, not counted as failed language trials.
  const independent = attempts.filter(p => !p.assisted && p.outcome !== 'motor');
  const guided = attempts.filter(p => p.assisted && p.outcome !== 'motor');
  const ratio = (list: Attempt[], key: 'objectCorrect' | 'actionCorrect' | 'combinedCorrect') => ({ correct: list.filter(p => p[key] === true).length, total: list.length });
  const words = independent.filter(p => p.learningTarget !== 'have-want');
  const gestures = independent.filter(p => p.actionCorrect !== null);
  const contrasts = independent.filter(p => p.learningTarget === 'have-want');
  return { attempts, independent, guided, words, gestures, contrasts,
    objects: ratio(words, 'objectCorrect'), actions: ratio(gestures, 'actionCorrect'),
    combined: ratio(gestures, 'combinedCorrect'), wants: ratio(contrasts, 'objectCorrect'),
    motor: attempts.filter(p => p.outcome === 'motor').length };
}
export function mergeEvents(local: LearningEvent[], remote: LearningEvent[]): LearningEvent[] {
  const all = new Map(local.map(e => [e.id, e]));
  for (const e of remote) {
    const previous = all.get(e.id);
    all.set(e.id, { ...e, synced: e.synced || previous?.synced || false });
  }
  return [...all.values()].sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}

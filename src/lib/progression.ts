import type { ActivityId, Trial } from '../content/week1';
import type { LearningEvent } from './model';
export type ActivityState = 'locked' | 'ready' | 'resume' | 'done';
export function activityKey(chapter: number, activity: ActivityId) {
  // Preserve the identifiers already stored by Chapter 1 on existing devices.
  return chapter === 0 ? activity : `chapter-${chapter + 1}:${activity}`;
}
export function completedActivity(events: LearningEvent[], chapter: number, activity: ActivityId) {
  return events.some(e => e.payload.kind === 'engagement' && e.payload.contentId === activityKey(chapter, activity) && e.payload.event === 'activity_complete');
}
export function checkpoint(events: LearningEvent[], chapter: number, activity: ActivityId): { trials: Trial[]; completedTurns: number } | undefined {
  if (activity === 'mission') return undefined; // Practice always starts a fresh round.
  const candidates = events.flatMap(e => {
    const p = e.payload;
    if (p.kind !== 'engagement' || p.contentId !== activityKey(chapter, activity) || p.event !== 'activity_checkpoint' || !p.trials?.length || !Number.isInteger(p.completedTurns)) return [];
    if (p.completedTurns! < 0 || p.completedTurns! >= p.trials.length) return [];
    return [{ trials: p.trials, completedTurns: p.completedTurns! }];
  });
  // A delayed sync from a second device must not rewind an introduction.
  return candidates.sort((a, b) => b.completedTurns - a.completedTurns)[0];
}
export function activityState(events: LearningEvent[], chapter: number, activity: ActivityId): ActivityState {
  if (activity !== 'mission' && completedActivity(events, chapter, activity)) return 'done';
  if (activity !== 'find' && !completedActivity(events, chapter, 'find')) return 'locked';
  if (activity === 'mission' && !completedActivity(events, chapter, 'give')) return 'locked';
  return checkpoint(events, chapter, activity) ? 'resume' : 'ready';
}
export function canStartActivity(events: LearningEvent[], chapter: number, activity: ActivityId) {
  return ['ready', 'resume'].includes(activityState(events, chapter, activity));
}

import type { ActivityId, Trial } from '../content/week1';
import type { LearningEvent } from './model';
export type GameKind = 'understanding' | 'speaking';
export const stageActivities: ActivityId[] = ['find', 'give', 'mission'];
export function stageCompletions(events: LearningEvent[], chapter: number, kind: GameKind) {
  return stageActivities.map(activity => completedActivity(events, chapter, activity, kind));
}
export function gameStage(events: LearningEvent[], chapter: number, kind: GameKind): 1 | 2 | 3 {
  if (!completedActivity(events, chapter, 'find', kind)) return 1;
  return completedActivity(events, chapter, 'give', kind) ? 3 : 2;
}
export type ActivityState = 'locked' | 'ready' | 'resume' | 'done';
export function activityKey(chapter: number, activity: ActivityId, kind?: GameKind) {
  // Preserve the identifiers already stored by Chapter 1 on existing devices.
  if (chapter === 0) return activity;
  // The original Session 2 activities were speaking: retain that progress.
  return kind === 'understanding' ? `chapter-${chapter + 1}:understanding:${activity}` : `chapter-${chapter + 1}:${activity}`;
}
export function completedActivity(events: LearningEvent[], chapter: number, activity: ActivityId, kind?: GameKind) {
  return events.some(e => e.payload.kind === 'engagement' && e.payload.contentId === activityKey(chapter, activity, kind) && e.payload.event === 'activity_complete');
}
export function checkpoint(events: LearningEvent[], chapter: number, activity: ActivityId, kind?: GameKind): { trials: Trial[]; completedTurns: number } | undefined {
  if (activity === 'mission') return undefined; // Practice always starts a fresh round.
  const candidates = events.flatMap(e => {
    const p = e.payload;
    if (p.kind !== 'engagement' || p.contentId !== activityKey(chapter, activity, kind) || p.event !== 'activity_checkpoint' || !p.trials?.length || !Number.isInteger(p.completedTurns)) return [];
    if (p.completedTurns! < 0 || p.completedTurns! >= p.trials.length) return [];
    return [{ trials: p.trials, completedTurns: p.completedTurns! }];
  });
  // A delayed sync from a second device must not rewind an introduction.
  return candidates.sort((a, b) => b.completedTurns - a.completedTurns)[0];
}
export function activityState(events: LearningEvent[], chapter: number, activity: ActivityId, kind?: GameKind): ActivityState {
  if (activity !== 'mission' && completedActivity(events, chapter, activity, kind)) return 'done';
  if (activity !== 'find' && !completedActivity(events, chapter, 'find', kind)) return 'locked';
  if (activity === 'mission' && !completedActivity(events, chapter, 'give', kind)) return 'locked';
  return checkpoint(events, chapter, activity, kind) ? 'resume' : 'ready';
}
export function canStartActivity(events: LearningEvent[], chapter: number, activity: ActivityId, kind?: GameKind) {
  return ['ready', 'resume'].includes(activityState(events, chapter, activity, kind));
}

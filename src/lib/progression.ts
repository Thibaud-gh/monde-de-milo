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
  // Revised curriculum has different objectives. Retain old events as history,
  // but do not count the previous food-matching game as have/want learning.
  return kind === 'understanding' ? `chapter-${chapter + 1}:v3:understanding:${activity}` : `chapter-${chapter + 1}:v2:${activity}`;
}
export function cafeResetId(events: LearningEvent[]) {
  const contentId = activityKey(1, 'find', 'understanding');
  let latest: LearningEvent | undefined;
  let latestTime = -Infinity;
  for (const event of events) {
    const { payload } = event;
    if (payload.kind !== 'engagement' || payload.event !== 'activity_reset' || payload.contentId !== contentId) continue;
    const time = Date.parse(event.createdAt);
    if (time > latestTime || (time === latestTime && latest && event.id > latest.id)) {
      latest = event;
      latestTime = time;
    }
  }
  return latest?.id;
}
export function completedActivity(events: LearningEvent[], chapter: number, activity: ActivityId, kind?: GameKind) {
  const contentId = activityKey(chapter, activity, kind);
  const resetId = chapter === 1 && kind === 'understanding' ? cafeResetId(events) : undefined;
  return events.some(({ payload }) => payload.kind === 'engagement' && payload.contentId === contentId &&
    payload.event === 'activity_complete' && payload.resetId === resetId);
}
export function checkpoint(events: LearningEvent[], chapter: number, activity: ActivityId, kind?: GameKind): { trials: Trial[]; completedTurns: number } | undefined {
  if (activity === 'mission') return undefined; // Practice always starts a fresh round.
  const contentId = activityKey(chapter, activity, kind);
  const resetId = chapter === 1 && kind === 'understanding' ? cafeResetId(events) : undefined;
  const candidates = events.flatMap(e => {
    const p = e.payload;
    if (p.kind !== 'engagement' || p.contentId !== contentId || p.event !== 'activity_checkpoint' ||
      p.resetId !== resetId || !p.trials?.length || !Number.isInteger(p.completedTurns)) return [];
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

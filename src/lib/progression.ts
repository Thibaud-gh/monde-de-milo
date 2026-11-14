import type { ActivityId } from '../content/week1';
import type { Engagement, LearningEvent } from './model';
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
  if (chapter === 2) return `chapter-3:${kind ?? 'understanding'}:${activity}`;
  // Revised curriculum has different objectives. Retain old events as history,
  // but do not count the previous food-matching game as have/want learning.
  return kind === 'understanding' ? `chapter-${chapter + 1}:v3:understanding:${activity}` : `chapter-${chapter + 1}:v2:${activity}`;
}
export function listeningResetId(events: LearningEvent[], chapter: number) {
  const contentId = activityKey(chapter, 'find', 'understanding');
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
  const resetId = kind === 'understanding' ? listeningResetId(events, chapter) : undefined;
  return events.some(({ payload }) => payload.kind === 'engagement' && payload.contentId === contentId &&
    payload.event === 'activity_complete' && payload.resetId === resetId);
}
export function checkpoint(events: LearningEvent[], chapter: number, activity: ActivityId, kind?: GameKind) {
  return savedTurns(events, chapter, activity, kind, payload => payload.trials);
}
export function serviceCheckpoint(events: LearningEvent[], activity: ActivityId) {
  return savedTurns(events, 2, activity, 'understanding', payload => payload.serviceTurns);
}
function savedTurns<T>(
  events: LearningEvent[], chapter: number, activity: ActivityId, kind: GameKind | undefined,
  readTurns: (payload: Engagement) => T[] | undefined,
): { trials: T[]; completedTurns: number } | undefined {
  if (activity === 'mission') return undefined;
  const contentId = activityKey(chapter, activity, kind);
  const resetId = kind === 'understanding' ? listeningResetId(events, chapter) : undefined;
  const candidates = events.flatMap(({ payload }) => {
    if (payload.kind !== 'engagement' || payload.contentId !== contentId || payload.event !== 'activity_checkpoint' ||
      payload.resetId !== resetId || !Number.isInteger(payload.completedTurns)) return [];
    const trials = readTurns(payload);
    const completedTurns = payload.completedTurns!;
    if (!trials?.length || completedTurns < 0 || completedTurns >= trials.length) return [];
    return [{ trials, completedTurns }];
  });
  // A delayed sync from a second device must not rewind an introduction.
  return candidates.sort((a, b) => b.completedTurns - a.completedTurns)[0];
}
export function activityState(events: LearningEvent[], chapter: number, activity: ActivityId, kind?: GameKind): ActivityState {
  if ((chapter === 1 || chapter === 2) && kind === 'speaking') return activity === 'mission' ? 'ready' : 'locked';
  if (activity !== 'mission' && completedActivity(events, chapter, activity, kind)) return 'done';
  if (activity !== 'find' && !completedActivity(events, chapter, 'find', kind)) return 'locked';
  if (activity === 'mission' && !completedActivity(events, chapter, 'give', kind)) return 'locked';
  const saved = chapter === 2 && kind === 'understanding' ? serviceCheckpoint(events, activity) : checkpoint(events, chapter, activity, kind);
  return saved ? 'resume' : 'ready';
}
export function canStartActivity(events: LearningEvent[], chapter: number, activity: ActivityId, kind?: GameKind) {
  return ['ready', 'resume'].includes(activityState(events, chapter, activity, kind));
}

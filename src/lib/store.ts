import { useSyncExternalStore } from 'react';
import { Capacitor } from '@capacitor/core';
import { Preferences } from '@capacitor/preferences';
import type { LearningEvent, Payload, Store } from './model';
import { mergeEvents } from './model';
const KEY = 'milo-progress-v1';
let data: Store = { profileId: crypto.randomUUID(), profileOwner: null, events: [], lesson: 1, lessonUpdatedAt: '1970-01-01T00:00:00Z' };
const listeners = new Set<() => void>();
let persistenceError = '';
let persistence: Promise<void> = Promise.resolve();
export async function initializeStore() {
  try {
    const raw = Capacitor.isNativePlatform() ? (await Preferences.get({ key: KEY })).value : localStorage.getItem(KEY);
    if (raw) {
      const candidate = JSON.parse(raw);
      if (typeof candidate.profileId !== 'string' || !Array.isArray(candidate.events) || ![1, 2, 3].includes(candidate.lesson)) throw new Error('Invalid progress file');
      data = { ...candidate, profileOwner: candidate.profileOwner ?? null, lessonUpdatedAt: candidate.lessonUpdatedAt ?? '1970-01-01T00:00:00Z' };
    }
  } catch { persistenceError = 'Saved progress could not be loaded. Export any visible records before reinstalling.'; }
  if (!Capacitor.isNativePlatform()) window.addEventListener('storage', event => {
    if (event.key !== KEY || !event.newValue) return;
    try {
      const incoming: Store = JSON.parse(event.newValue);
      if (!Array.isArray(incoming.events) || (data.profileOwner && incoming.profileOwner && data.profileOwner !== incoming.profileOwner)) return;
      const incomingSettings = new Date(incoming.lessonUpdatedAt).getTime() > new Date(data.lessonUpdatedAt).getTime();
      const next: Store = {
        ...data,
        profileId: data.profileOwner ? data.profileId : incoming.profileId,
        profileOwner: data.profileOwner ?? incoming.profileOwner,
        learnerName: incoming.learnerName ?? data.learnerName,
        events: mergeEvents(data.events, incoming.events),
        lesson: incomingSettings ? incoming.lesson : data.lesson,
        lessonUpdatedAt: incomingSettings ? incoming.lessonUpdatedAt : data.lessonUpdatedAt,
      };
      if (JSON.stringify(next) === JSON.stringify(data)) return;
      // If a second tab had newer unsaved records, preserve the union on disk.
      if (next.events.some(e => !incoming.events.some(other => other.id === e.id))) updateStore(() => next);
      else { data = next; listeners.forEach(fn => fn()); }
    } catch { /* Ignore malformed changes from another tab, retaining this tab's records. */ }
  });
}
export function getStore() { return data; }
export function getPersistenceError() { return persistenceError; }
export function updateStore(change: (current: Store) => Store) {
  data = change(data);
  const json = JSON.stringify(data);
  persistence = persistence.then(async () => {
    try {
      if (Capacitor.isNativePlatform()) await Preferences.set({ key: KEY, value: json });
      else localStorage.setItem(KEY, json);
      persistenceError = '';
    } catch { persistenceError = 'Progress could not be saved on this device. Keep the app open and export your records.'; }
    listeners.forEach(fn => fn());
  });
  listeners.forEach(fn => fn());
}
export function record(payload: Payload) {
  const event: LearningEvent = { id: crypto.randomUUID(), profileId: data.profileId, ownerId: data.profileOwner, createdAt: new Date().toISOString(), payload, synced: false };
  updateStore(current => ({ ...current, events: [...current.events, event] }));
  window.dispatchEvent(new Event('milo-event'));
  return event;
}
export function useProgress() {
  return useSyncExternalStore(fn => { listeners.add(fn); return () => listeners.delete(fn); }, getStore);
}
export function setLesson(lesson: number) {
  updateStore(s => ({ ...s, lesson, lessonUpdatedAt: new Date().toISOString() }));
  window.dispatchEvent(new Event('milo-event'));
}
export function exportProgress() {
  const blob = new Blob([JSON.stringify({ version: 1, ...data }, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a'); link.href = url; link.download = `milo-progress-${new Date().toISOString().slice(0, 10)}.json`; link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

import { createClient } from '@supabase/supabase-js';
import type { Session } from '@supabase/supabase-js';
import { getStore, updateStore } from './store';
import { mergeEvents } from './model';
import type { LearningEvent } from './model';
const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
export const supabase = url && key ? createClient(url, key, { auth: { flowType: 'pkce' } }) : null;
let currentSession: Session | null = null;
let busy: Promise<void> | null = null;
let status = supabase ? 'Sign in to connect this device.' : 'Local progress · cloud not configured';
export function cloudStatus() { return status; }
export function session() { return currentSession; }
export function isConfigured() { return !!supabase; }
function notify() { window.dispatchEvent(new Event('milo-cloud')); }
export async function initializeCloud() {
  if (!supabase) return;
  currentSession = (await supabase.auth.getSession()).data.session;
  supabase.auth.onAuthStateChange((_event, next) => {
    currentSession = next;
    status = next ? 'Ready to sync' : 'Signed out · progress saved on this device';
    notify();
    // Avoid running database operations inside the auth callback.
    if (next) setTimeout(() => void sync(), 0);
  });
  window.addEventListener('online', () => void sync());
  window.addEventListener('milo-event', () => void sync());
  if (currentSession) await sync();
}
export function sync(): Promise<void> {
  if (busy) return busy;
  busy = performSync().finally(() => { busy = null; });
  return busy;
}
async function performSync() {
  if (!supabase || !currentSession) return;
  const owner = currentSession.user.id;
  const local = getStore();
  if (local.profileOwner && local.profileOwner !== owner) {
    status = 'This device belongs to another parent account. Sign in with the original account.'; notify(); return;
  }
  if (!navigator.onLine) { status = 'Offline · changes are saved on this device'; notify(); return; }
  status = 'Syncing…'; notify();
  try {
    // One pseudonymous learner per parent in this first milestone. The stable owner ID
    // also acts as its profile ID, so two devices cannot create competing profiles.
    const { error: profileError } = await supabase.from('learner_profiles').upsert({ id: owner, owner_id: owner, nickname: typeof currentSession.user.user_metadata.child_name === 'string' ? currentSession.user.user_metadata.child_name.trim().normalize('NFC').slice(0, 80) || 'Éva' : 'Éva' }, { onConflict: 'id', ignoreDuplicates: true });
    if (profileError) throw profileError;
    if (currentSession?.user.id !== owner) return;
    const { data: profile, error: settingsError } = await supabase.from('learner_profiles').select('lesson,lesson_updated_at,nickname').eq('id', owner).single();
    if (settingsError) throw settingsError;
    const settings = getStore();
    if (new Date(settings.lessonUpdatedAt).getTime() > new Date(profile.lesson_updated_at).getTime()) {
      const { error } = await supabase.from('learner_profiles').update({ lesson: settings.lesson, lesson_updated_at: settings.lessonUpdatedAt }).eq('id', owner);
      if (error) throw error;
    } else if (new Date(settings.lessonUpdatedAt).getTime() < new Date(profile.lesson_updated_at).getTime()) {
      updateStore(s => ({ ...s, lesson: profile.lesson, lessonUpdatedAt: profile.lesson_updated_at }));
    }
    updateStore(s => ({ ...s, profileId: owner, profileOwner: owner, learnerName: profile.nickname === 'Milo learner' ? 'Éva' : profile.nickname, events: s.events.map(e => ({ ...e, profileId: owner, ownerId: owner })) }));
    const pending = getStore().events.filter(e => !e.synced);
    for (let i = 0; i < pending.length; i += 100) {
      const batch = pending.slice(i, i + 100);
      const { error } = await supabase.from('learning_events').upsert(batch.map(e => ({ id: e.id, profile_id: owner, owner_id: owner, created_at: e.createdAt, payload: e.payload })), { onConflict: 'id', ignoreDuplicates: true });
      if (error) throw error;
      if (currentSession?.user.id !== owner) return;
      const ids = new Set(batch.map(e => e.id));
      updateStore(s => ({ ...s, events: s.events.map(e => ids.has(e.id) ? { ...e, synced: true } : e) }));
    }
    // Paginate; Supabase's default row limit must not silently truncate history.
    const remote: LearningEvent[] = [];
    for (let offset = 0; ; offset += 500) {
      const { data, error } = await supabase.from('learning_events').select('*').eq('profile_id', owner).order('created_at').order('id').range(offset, offset + 499);
      if (error) throw error;
      remote.push(...data.map(e => ({ id: e.id, profileId: e.profile_id, ownerId: e.owner_id, createdAt: e.created_at, payload: e.payload, synced: true } as LearningEvent)));
      if (data.length < 500) break;
    }
    if (currentSession?.user.id !== owner) return;
    updateStore(s => ({ ...s, events: mergeEvents(s.events, remote) }));
    status = `Synced at ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  } catch (error) {
    status = `Not synced · ${error instanceof Error ? error.message : (error as { message?: string })?.message || 'Check your connection and database setup.'}`;
  }
  notify();
  // An event can arrive during a sync; do not leave it waiting until the next visit.
  if (currentSession?.user.id === owner && getStore().events.some(e => !e.synced) && status.startsWith('Synced')) setTimeout(() => void sync(), 500);
}

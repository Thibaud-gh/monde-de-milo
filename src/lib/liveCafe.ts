import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { foods, type Food } from '../content/week1';
import { session, supabase } from './cloud';

export const cafeRounds = 3;
export type CafeAction = 'hint' | 'approve' | 'helped' | 'continue';
export type CafeState = {
  id: string;
  version: number;
  round: number;
  phase: 'order' | 'have' | 'finished';
  food: Food | null;
  hints: number;
  hintFood: Food | null;
  serving?: boolean;
};
export type CafeCommand = {
  id: string;
  version: number;
  action: CafeAction;
  commandId: string;
  food?: Food;
};

export function advanceCafe(state: CafeState, command: CafeCommand): CafeState | undefined {
  if (state.id !== command.id || state.version !== command.version || state.serving || state.phase === 'finished') return;
  const food = state.phase === 'order' ? command.food : state.food;
  const version = state.version + 1;
  if (command.action === 'hint') {
    if (state.hints >= 2 || (state.hints === 1 && !food)) return;
    return { ...state, version, hints: state.hints + 1, hintFood: state.hints === 1 ? food ?? null : null };
  }
  if (!food) return;
  if (state.phase === 'order') return { ...state, version, phase: 'have', food, hints: 0, hintFood: null, serving: true };
  if (state.round === cafeRounds) return { ...state, version, phase: 'finished', hints: 0, hintFood: null };
  return { ...state, version, phase: 'order', round: state.round + 1, food: null, hints: 0, hintFood: null };
}

function isFood(value: unknown): value is Food {
  return typeof value === 'string' && Object.hasOwn(foods, value);
}

export function isCafeState(value: unknown): value is CafeState {
  if (!value || typeof value !== 'object') return false;
  const state = value as CafeState;
  return typeof state.id === 'string' && Number.isInteger(state.version) &&
    Number.isInteger(state.round) && state.round >= 1 && state.round <= cafeRounds &&
    ['order', 'have', 'finished'].includes(state.phase) &&
    (state.food === null || isFood(state.food)) &&
    (state.hintFood === null || isFood(state.hintFood)) &&
    Number.isInteger(state.hints) && state.hints >= 0 && state.hints <= 2 &&
    (state.serving === undefined || typeof state.serving === 'boolean');
}

export function isCafeCommand(value: unknown): value is CafeCommand {
  if (!value || typeof value !== 'object') return false;
  const command = value as CafeCommand;
  return typeof command.id === 'string' && typeof command.commandId === 'string' &&
    Number.isInteger(command.version) && ['hint', 'approve', 'helped', 'continue'].includes(command.action) &&
    (command.food === undefined || isFood(command.food));
}

function subscribeToCloud(update: () => void) {
  window.addEventListener('milo-cloud', update);
  return () => window.removeEventListener('milo-cloud', update);
}
export function useCafeAccount() {
  return useSyncExternalStore(subscribeToCloud, () => session()?.user.id ?? null);
}

export function useCafeChannel(owner: string | null, receive: (event: string, payload: unknown) => void) {
  const listener = useRef(receive);
  listener.current = receive;
  const channel = useRef<ReturnType<NonNullable<typeof supabase>['channel']> | null>(null);
  const [status, setStatus] = useState<'connecting' | 'connected' | 'unavailable'>('connecting');

  useEffect(() => {
    if (!owner || !supabase) return;
    const client = supabase;
    let closed = false;
    let room: ReturnType<typeof client.channel> | undefined;
    let reconnect: ReturnType<typeof setTimeout> | undefined;
    function connect() {
      if (closed) return;
      // Retry with a fresh channel after authorization or network failures.
      const next = client.channel('milo-cafe:' + owner, { config: { private: true, broadcast: { ack: true } } });
      room = next;
      channel.current = next;
      next.on('broadcast', { event: '*' }, ({ event, payload }) => {
        if (channel.current === next) listener.current(event, payload);
      })
        .subscribe(status => {
          if (closed || channel.current !== next) return;
          if (status === 'SUBSCRIBED') setStatus('connected');
          if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT' || status === 'CLOSED') {
            setStatus('unavailable');
            channel.current = null;
            void client.removeChannel(next).finally(() => {
              if (!closed) reconnect = setTimeout(connect, 4000);
            });
          }
        });
    }
    connect();
    return () => {
      closed = true;
      clearTimeout(reconnect);
      if (room && channel.current === room) {
        channel.current = null;
        void client.removeChannel(room);
      }
    };
  }, [owner]);

  function send(event: string, payload: object) {
    const room = channel.current;
    if (room?.state === 'joined') return room.send({ type: 'broadcast', event, payload });
  }

  return { status: owner ? status : 'unavailable', send } as const;
}

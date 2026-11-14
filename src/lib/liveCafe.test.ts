import { describe, expect, it } from 'vitest';
import { advanceCafe, type CafeAction, type CafeState } from './liveCafe';

const order: CafeState = { id: 'cafe', version: 1, round: 1, phase: 'order', food: 'banana', hints: 0 };
const command = (state: CafeState, action: CafeAction) =>
  ({ id: state.id, version: state.version, action, commandId: 'tap' });

describe('live café turn changes', () => {
  it('keeps the requested food on the plate and waits for the serving cue', () => {
    const served = advanceCafe(order, command(order, 'approve'))!;
    expect(served).toMatchObject({ food: 'banana', phase: 'have', serving: true });
    expect(advanceCafe(served, command(served, 'approve'))).toBeUndefined();
    const ready = { ...served, serving: false, version: served.version + 1 };
    expect(advanceCafe(ready, command(ready, 'approve'))).toMatchObject({ round: 2, phase: 'order', food: null });
  });

  it('rejects a double tap, a stale order and a command for a different visit', () => {
    const firstHint = command(order, 'hint');
    const hinted = advanceCafe(order, firstHint)!;
    expect(advanceCafe(hinted, firstHint)).toBeUndefined();
    expect(advanceCafe({ ...order, version: 2, food: 'cheese' }, command(order, 'approve'))).toBeUndefined();
    expect(advanceCafe({ ...order, id: 'new' }, command(order, 'approve'))).toBeUndefined();
    const modelled = advanceCafe(hinted, command(hinted, 'hint'))!;
    expect(modelled.hints).toBe(2);
    expect(advanceCafe(modelled, command(modelled, 'hint'))).toBeUndefined();
  });

  it('lets the parent move on after the last phrase with or without help', () => {
    const last = { ...order, round: 3, phase: 'have' as const, hints: 2 };
    expect(advanceCafe(last, command(last, 'continue'))?.phase).toBe('finished');
    expect(advanceCafe(last, command(last, 'helped'))?.phase).toBe('finished');
  });
});

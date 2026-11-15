import { describe, expect, it } from 'vitest';
import { existsSync } from 'node:fs';
import { cafeFoods } from '../content/cafe';
import { narrationFor } from '../content/narration';
import { foods, type Food } from '../content/week1';
import { advanceCafe, isCafeCommand, type CafeAction, type CafeState } from './liveCafe';

const order: CafeState = { id: 'cafe', version: 1, round: 1, phase: 'order', food: null, hints: 0, hintFood: null };
const command = (state: CafeState, action: CafeAction, food?: Food) =>
  ({ id: state.id, version: state.version, action, commandId: 'tap', food });

describe('live café turn changes', () => {
  it('serves the parent’s choice even when an earlier hint named another food', () => {
    expect(advanceCafe(order, command(order, 'approve'))).toBeUndefined();
    const modelled = { ...order, hints: 2, hintFood: 'banana' as const };
    const served = advanceCafe(modelled, command(modelled, 'approve', 'apple'))!;
    expect(served).toMatchObject({ food: 'apple', phase: 'have', serving: true, hintFood: null });
    expect(advanceCafe(served, command(served, 'approve'))).toBeUndefined();
    const ready = { ...served, serving: false, version: served.version + 1 };
    expect(advanceCafe(ready, command(ready, 'approve'))).toMatchObject({ round: 2, phase: 'order', food: null });
  });

  it('rejects a double tap, a stale order and a command for a different visit', () => {
    const firstHint = command(order, 'hint');
    const hinted = advanceCafe(order, firstHint)!;
    expect(advanceCafe(hinted, firstHint)).toBeUndefined();
    expect(advanceCafe({ ...order, version: 2 }, command(order, 'approve', 'apple'))).toBeUndefined();
    expect(advanceCafe({ ...order, id: 'new' }, command(order, 'approve', 'apple'))).toBeUndefined();
    expect(advanceCafe(hinted, command(hinted, 'hint'))).toBeUndefined();
    const modelled = advanceCafe(hinted, command(hinted, 'hint', 'bread'))!;
    expect(modelled).toMatchObject({ hints: 2, hintFood: 'bread', phase: 'order', food: null });
    expect(advanceCafe(modelled, command(modelled, 'hint'))).toBeUndefined();
  });

  it('lets the parent move on after the last phrase with or without help', () => {
    const last = { ...order, round: 3, phase: 'have' as const, hints: 2, food: 'banana' as const };
    expect(advanceCafe(last, command(last, 'continue'))?.phase).toBe('finished');
    expect(advanceCafe(last, command(last, 'helped'))?.phase).toBe('finished');
  });

  it('rejects invalid foods sent by the parent controller', () => {
    expect(isCafeCommand({ ...command(order, 'approve'), food: 'pizza' })).toBe(false);
    expect(isCafeCommand(command(order, 'approve', 'cheese'))).toBe(true);
  });
});

it('has a standalone pronunciation clip for every item on the child’s menu', () => {
  for (const food of cafeFoods) {
    const clip = narrationFor(`cafe-menu-${food}`);
    expect(clip.text).toBe(`${foods[food].label}.`);
    expect(existsSync(`public/audio/${clip.audio}.mp3`)).toBe(true);
  }
});

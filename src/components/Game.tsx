import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { CSSProperties, PointerEvent } from 'react';
import { activities, foodLayout, foods, makeTrials, phrase } from '../content/week1';
import type { ActivityId, Food } from '../content/week1';
import { attemptPayload, assess } from '../lib/model';
import type { PerformedAction } from '../lib/model';
import { record } from '../lib/store';
import { playAudio, stopAudio } from '../lib/audio';
import { FoodArt, Milo } from './Art';
import { Icon } from './Icon';
type Gesture = { food: Food; pointerId: number; x: number; y: number; moved: boolean; completed: boolean; element: HTMLElement; timer: ReturnType<typeof setTimeout> };
export function Game({ activity, onHome }: { activity: ActivityId; onHome: () => void }) {
  const [trials] = useState(() => makeTrials(activity));
  const [layout] = useState(() => foodLayout(activity));
  const [sessionId] = useState(() => crypto.randomUUID());
  const [index, setIndex] = useState(0);
  const [hint, setHint] = useState(trials[0].guided);
  const [feedback, setFeedback] = useState('');
  const [busy, setBusy] = useState(false);
  const [holding, setHolding] = useState<Food | null>(null);
  const [received, setReceived] = useState<Food | null>(null);
  const [drag, setDrag] = useState<{ food: Food; x: number; y: number } | null>(null);
  const [overMilo, setOverMilo] = useState(false);
  const [audioError, setAudioError] = useState(false);
  const [audioReady, setAudioReady] = useState(false);
  const gesture = useRef<Gesture | null>(null);
  const dropTarget = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<HTMLDivElement>(null);
  const foodRefs = useRef<Partial<Record<Food, HTMLButtonElement | null>>>({});
  const [demo, setDemo] = useState({ x: 0, y: 0, dx: 0, dy: 0 });
  const attempt = useRef(0);
  const assisted = useRef(trials[0].guided);
  const blocked = useRef(false);
  const trialRef = useRef(trials[0]);
  const indexRef = useRef(0);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const isComplete = index >= trials.length;
  const trial = trials[Math.min(index, trials.length - 1)];
  useLayoutEffect(() => {
    if (isComplete) return;
    const measure = () => {
      const food = foodRefs.current[trial.food]?.getBoundingClientRect();
      const milo = dropTarget.current?.getBoundingClientRect();
      const scene = sceneRef.current?.getBoundingClientRect();
      if (!food || !milo || !scene) return;
      const x = food.left + food.width / 2;
      const y = food.top + food.height / 2;
      setDemo({ x: x - scene.left, y: y - scene.top, dx: milo.left + milo.width / 2 - x, dy: milo.top + milo.height * .65 - y });
    };
    measure();
    const observer = new ResizeObserver(measure);
    if (sceneRef.current) observer.observe(sceneRef.current);
    return () => observer.disconnect();
  }, [index, trial.food, isComplete]);
  function speak() {
    setAudioError(false); setAudioReady(false);
    playAudio(`${trial.action}-${trial.food}`, phrase(trial.action, trial.food), () => setAudioReady(true), () => { setAudioError(true); setAudioReady(false); });
  }
  useEffect(() => {
    const startedAt = Date.now();
    record({ kind: 'engagement', contentId: activity, sessionId, event: 'activity_open' });
    return () => {
      stopAudio();
      timers.current.forEach(clearTimeout);
      if (gesture.current) clearTimeout(gesture.current.timer);
      record({ kind: 'engagement', contentId: activity, sessionId, event: 'activity_close', durationSeconds: Math.round((Date.now() - startedAt) / 1000) });
    };
  }, [activity, sessionId]);
  useEffect(() => {
    if (isComplete) {
      playAudio('fini', 'Merci pour ton aide ! À bientôt !');
      return stopAudio;
    }
    trialRef.current = trial; indexRef.current = index; attempt.current = 0;
    assisted.current = trial.guided; setHint(trial.guided); setFeedback(''); setAudioReady(false);
    blocked.current = false; setBusy(false);
    speak();
    // Each new prompt owns audio and gesture state.
    return () => { stopAudio(); if (gesture.current) { clearTimeout(gesture.current.timer); gesture.current = null; } };
    // trial is stable within this activity; speak is intentionally scoped to it.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index]);
  function showHint() {
    assisted.current = true; setHint(true); setAudioError(false); setAudioReady(false);
    playAudio(trial.action === 'show' ? 'showHint' : 'giveHint', trial.action === 'show' ? 'Pose ton doigt, et attends un petit peu.' : 'Fais glisser jusqu’à Milo.', speak, () => { setAudioError(true); });
  }
  function handleAttempt(food: Food, performed: PerformedAction) {
    if (blocked.current || !audioReady) return;
    const current = trialRef.current;
    attempt.current++;
    record(attemptPayload(activity, sessionId, current, food, performed, assisted.current, attempt.current));
    const result = assess(current, food, performed);
    if (result.combinedCorrect) {
      blocked.current = true; setBusy(true); setFeedback(current.action === 'give' ? 'Merci !' : 'Oui, bravo !');
      playAudio(current.action === 'give' ? 'merci' : 'bravo', current.action === 'give' ? 'Merci !' : 'Bravo !');
      setHolding(current.action === 'show' ? food : null);
      if (current.action === 'give') setReceived(food);
      timers.current.push(setTimeout(() => {
        setHolding(null); setReceived(null);
        if (indexRef.current + 1 === trials.length) {
          record({ kind: 'engagement', contentId: activity, sessionId, event: 'activity_complete' });
        }
        setIndex(i => i + 1);
      }, 1300));
    } else {
      // Freeze input during feedback, so repeated pointer events cannot race the prompt.
      blocked.current = true; setBusy(true);
      setFeedback(result.outcome === 'motor' ? 'Encore un petit essai !' : 'On essaie encore !');
      playAudio('encore', 'On essaie encore !');
      timers.current.push(setTimeout(() => {
        assisted.current = true; setHint(true); blocked.current = false; setBusy(false); setFeedback(''); speak();
      }, 1100));
    }
  }
  function begin(event: PointerEvent<HTMLButtonElement>, food: Food) {
    if (blocked.current || !audioReady || gesture.current || (event.pointerType === 'mouse' && event.button !== 0)) return;
    event.preventDefault();
    const element = event.currentTarget;
    element.setPointerCapture(event.pointerId);
    const g: Gesture = { food, pointerId: event.pointerId, x: event.clientX, y: event.clientY, moved: false, completed: false, element, timer: setTimeout(() => {
      if (gesture.current === g && !g.moved) { g.completed = true; setHolding(null); handleAttempt(food, 'show'); }
    }, 650) };
    gesture.current = g; setHolding(food);
  }
  function inDrop(x: number, y: number) {
    const rect = dropTarget.current?.getBoundingClientRect();
    return !!rect && x >= rect.left - 24 && x <= rect.right + 24 && y >= rect.top - 24 && y <= rect.bottom + 24;
  }
  function move(event: PointerEvent<HTMLButtonElement>) {
    const g = gesture.current;
    if (!g || event.pointerId !== g.pointerId || g.completed) return;
    if (Math.hypot(event.clientX - g.x, event.clientY - g.y) > 14) {
      g.moved = true; clearTimeout(g.timer); setHolding(null);
    }
    if (g.moved) { setDrag({ food: g.food, x: event.clientX, y: event.clientY }); setOverMilo(inDrop(event.clientX, event.clientY)); }
  }
  function end(event: PointerEvent<HTMLButtonElement>, cancelled = false) {
    const g = gesture.current;
    if (!g || event.pointerId !== g.pointerId) return;
    clearTimeout(g.timer); gesture.current = null; setDrag(null); setOverMilo(false);
    if (!g.completed) {
      setHolding(null);
      if (cancelled) return;
      // Some touch environments coalesce move events. The release position still
      // distinguishes a quick drag from a tap when no move callback arrived.
      const moved = g.moved || Math.hypot(event.clientX - g.x, event.clientY - g.y) > 14;
      handleAttempt(g.food, moved ? inDrop(event.clientX, event.clientY) ? 'give' : 'incomplete' : 'tap');
    }
  }
  if (isComplete) return <main className="completion child-screen"><button className="round home-corner" aria-label="Retour au chapitre" onClick={onHome}><Icon name="left"/></button><Milo happy waving/><h1>Merci pour ton aide !</h1><p>À bientôt au café.</p><button className="primary" onClick={onHome}><Icon name="book"/> Au chapitre</button></main>;
  return <main className="game child-screen">
    <header className="game-header"><button className="round" aria-label="Retour au chapitre" onClick={onHome}><Icon name="left"/></button><div className="prompt"><span className="game-name">{activities.find(a => a.id === activity)?.title}</span><h1>{feedback || phrase(trial.action, trial.food)}</h1></div><button className="round yellow" aria-label="Réécouter" onClick={() => { if (!busy) speak(); }} disabled={busy}><Icon name="sound"/></button><button className="round" aria-label="Un petit coup de main" onClick={showHint} disabled={busy}><Icon name="help"/></button></header>
    {audioError && <button className="audio-notice" onClick={speak}><Icon name="sound"/> Touche ici pour écouter.</button>}
    <div className="game-scene" ref={sceneRef}>
      <div className="game-window"><span/><span/></div><div className="game-shelf"><span>bonjour</span><i/></div>
      <div ref={dropTarget} className={`milo-target ${overMilo ? 'receiving' : ''} ${feedback.startsWith('Merci') ? 'received' : ''}`} data-testid="milo-target"><Milo happy={feedback === 'Merci !' || feedback === 'Oui, bravo !'}/>{received && <div className="milo-received"><FoodArt food={received}/></div>}<span className="target-shadow"/></div>
      {hint && <div className={`gesture-demo ${trial.action}`} style={{ left: demo.x, top: demo.y, '--give-x': `${demo.dx}px`, '--give-y': `${demo.dy}px` } as CSSProperties} aria-hidden="true"><Icon name="hand" size={43}/></div>}
      <div className="food-table"><div className="foods">{layout.map(food => <button key={food} ref={element => { foodRefs.current[food] = element; }} data-testid={`food-${food}`} className={`food ${holding === food ? 'holding' : ''} ${drag?.food === food ? 'drag-source' : ''} ${received === food ? 'given' : ''} ${hint && trial.food === food ? 'hinted' : ''}`} aria-label={foods[food].label} disabled={busy || !audioReady} onPointerDown={e => begin(e, food)} onPointerMove={move} onPointerUp={e => end(e)} onPointerCancel={e => end(e, true)} onLostPointerCapture={e => end(e, true)} onContextMenu={e => e.preventDefault()} onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleAttempt(food, 'show'); } else if (e.key.toLowerCase() === 'g') { e.preventDefault(); handleAttempt(food, 'give'); } }}><FoodArt food={food}/><span className="food-shadow"/></button>)}</div></div>
    </div>
    <div className="game-footer"><span className="small-flower" aria-hidden="true"><Icon name="flower" size={26}/></span><p>{hint ? (trial.action === 'show' ? 'Pose ton doigt et attends un peu.' : 'Fais glisser jusqu’à Milo.') : 'Écoute Milo.'}</p><button className="text-button" onClick={onHome}>À bientôt !</button></div>
    {drag && <div className="drag-ghost" style={{ left: drag.x, top: drag.y }}><FoodArt food={drag.food}/></div>}
  </main>;
}

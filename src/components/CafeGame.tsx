import { useEffect, useRef, useState } from 'react';
import type { PointerEvent } from 'react';
import { foods, type ActivityId, type Food } from '../content/week1';
import { cafeClip, cafeText, cafeHasSupport, makeCafeTrials, type CafeTrial } from '../content/cafe';
import { activityKey, checkpoint } from '../lib/progression';
import { getStore, record } from '../lib/store';
import { playAudio, stopAudio } from '../lib/audio';
import { narrationFor } from '../content/narration';
import { FoodArt, Milo } from './Art';
import { Icon } from './Icon';

export function CafeGame({ activity, onHome }: { activity: ActivityId; onHome: () => void }) {
  const [saved] = useState(() => checkpoint(getStore().events, 1, activity, 'understanding'));
  const [trials] = useState<CafeTrial[]>(() => saved?.trials.every(t => t.cafe) ? saved.trials as CafeTrial[] : makeCafeTrials(activity));
  const [index, setIndex] = useState(saved?.completedTurns ?? 0);
  const [sessionId] = useState(() => crypto.randomUUID());
  const contentId = activityKey(1, activity, 'understanding');
  const complete = index >= trials.length;
  const trial = trials[Math.min(index, trials.length - 1)];
  const [help, setHelp] = useState(trial.guided);
  const assisted = useRef(trial.guided);
  const [ready, setReady] = useState(false);
  const [audioError, setAudioError] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [received, setReceived] = useState<Food | null>(null);
  const [drag, setDrag] = useState<{ food: Food; x: number; y: number } | null>(null);
  const [over, setOver] = useState(false);
  const target = useRef<HTMLDivElement>(null);
  const gesture = useRef<{ id: number; food: Food; x: number; y: number } | null>(null);
  const blocked = useRef(false);
  const attempts = useRef(0);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  function speak() {
    setAudioError(false); setReady(false);
    playAudio(cafeClip(trial), cafeText(trial), undefined, () => setAudioError(true), () => setReady(true));
  }
  useEffect(() => {
    const start = Date.now();
    record({ kind: 'engagement', contentId, sessionId, event: 'activity_open' });
    if (activity !== 'mission') record({ kind: 'engagement', contentId, sessionId, event: 'activity_checkpoint', trials, completedTurns: index });
    return () => {
      stopAudio(); clearTimeout(timer.current);
      record({ kind: 'engagement', contentId, sessionId, event: 'activity_close', durationSeconds: Math.round((Date.now() - start) / 1000) });
    };
    // This is the mount snapshot, not a sync-triggered new round.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contentId, sessionId]);
  useEffect(() => {
    blocked.current = false; attempts.current = 0; assisted.current = cafeHasSupport(getStore().events, trial);
    setHelp(assisted.current); setReceived(null); setFeedback(''); setDrag(null); setOver(false);
    if (complete) { const clip = narrationFor('s2-fini'); playAudio(clip.audio, clip.text); }
    else speak();
    return () => { stopAudio(); clearTimeout(timer.current); gesture.current = null; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index]);
  function give(food: Food) {
    if (blocked.current || !ready || complete) return;
    const correct = food === trial.food;
    blocked.current = true; setReady(false); attempts.current++;
    record({ kind: 'attempt', interactionVersion: 'cafe-contrast-v1', chapter: 'session-2', activity, sessionId, trialId: trial.id,
      phrase: cafeText(trial), targetObject: trial.food, targetAction: 'give', selectedObject: food, performedAction: 'give',
      assisted: assisted.current, attemptNumber: attempts.current, objectCorrect: correct, actionCorrect: null, combinedCorrect: correct,
      learningTarget: trial.cafe.kind === 'word' ? 'vocabulary' : 'have-want', heldObject: trial.cafe.held, outcome: correct ? 'correct' : 'retry' });
    setFeedback(correct ? 'Merci !' : 'Écoutons encore.');
    if (correct) {
      setReceived(food);
      record({ kind: 'engagement', contentId, sessionId, event: index + 1 === trials.length ? 'activity_complete' : 'activity_checkpoint', trials, completedTurns: index + 1 });
    }
    const clip = narrationFor(correct ? 'merci' : 'encore');
    let finished = false;
    const finish = () => {
      if (finished) return;
      finished = true;
      timer.current = setTimeout(() => {
        if (correct) setIndex(i => i + 1);
        else { assisted.current = true; setHelp(true); blocked.current = false; setFeedback(''); speak(); }
      }, 300);
    };
    playAudio(clip.audio, clip.text, finish, finish);
  }
  function inside(x: number, y: number) {
    const r = target.current?.getBoundingClientRect();
    return !!r && x >= r.left - 20 && x <= r.right + 20 && y >= r.top - 20 && y <= r.bottom + 20;
  }
  function begin(e: PointerEvent<HTMLButtonElement>, food: Food) {
    if (!ready || blocked.current || gesture.current || (e.pointerType === 'mouse' && e.button !== 0)) return;
    e.preventDefault(); e.currentTarget.setPointerCapture(e.pointerId);
    gesture.current = { id: e.pointerId, food, x: e.clientX, y: e.clientY };
  }
  function move(e: PointerEvent<HTMLButtonElement>) {
    const g = gesture.current;
    if (!g || g.id !== e.pointerId || Math.hypot(e.clientX - g.x, e.clientY - g.y) < 14) return;
    setDrag({ food: g.food, x: e.clientX, y: e.clientY }); setOver(inside(e.clientX, e.clientY));
  }
  function end(e: PointerEvent<HTMLButtonElement>, cancelled = false) {
    const g = gesture.current;
    if (!g || g.id !== e.pointerId) return;
    gesture.current = null; setDrag(null); setOver(false);
    // Moving elsewhere, holding or tapping is not a language error.
    if (!cancelled && Math.hypot(e.clientX - g.x, e.clientY - g.y) >= 14 && inside(e.clientX, e.clientY)) give(g.food);
  }
  function hint() {
    assisted.current = true; setHelp(true);
    record({ kind: 'engagement', contentId, sessionId, event: 'activity_hint', trialId: trial.id });
    speak();
  }
  if (complete) return <main className="completion child-screen"><Milo happy waving/><h1>Merci pour le goûter !</h1><p>{activity === 'mission' ? 'Le café reste ouvert. Reviens quand tu veux !' : 'Une étoile de plus ! La suite t’attend sur le même carré.'}</p><button className="primary" onClick={onHome}><Icon name="book"/> Au chapitre</button></main>;
  return <main className="cafe-game child-screen">
    <header className="game-header"><button className="round" aria-label="Retour au chapitre" onClick={onHome}><Icon name="left"/></button><div className="prompt"><span className="game-name">Le goûter de Milo · Étape {activity === 'find' ? 1 : activity === 'give' ? 2 : 3} · {index + 1} / {trials.length}</span><h1>{feedback || 'Qu’est-ce que Milo voudrait ?'}</h1></div><button className="round yellow" aria-label="Réécouter" disabled={!!feedback} onClick={speak}><Icon name="sound"/></button><button className="round" aria-label="Un petit coup de main" disabled={!!feedback} onClick={hint}><Icon name="help"/></button></header>
    {audioError && <button className="audio-notice" onClick={speak}>Touche ici pour écouter Milo.</button>}
    <div className="cafe-room">
      <div className="cafe-awning" aria-hidden="true"/>
      <p className="cafe-caption" aria-live="polite">{cafeText(trial)}</p>
      <div className={`cafe-customer ${over ? 'receiving' : ''}`} ref={target} data-testid="milo-target"><Milo happy={!!received}/>{received && <div className="cafe-delivered"><FoodArt food={received}/></div>}</div>
      {help && !received && <div className="cafe-model" aria-label="Un modèle pour apprendre">
        {trial.cafe.kind === 'contrast' && <div><span>J’ai…</span><FoodArt food={trial.cafe.held}/></div>}
        <div><span>{trial.cafe.kind === 'word' ? 'Voici…' : 'Je voudrais…'}</span><FoodArt food={trial.food}/><Icon name="hand" size={26}/></div>
      </div>}
      <div className="cafe-counter"><div className="cafe-foods" aria-label="Les aliments à servir">{trial.cafe.choices.map(food => <button key={food} data-testid={`food-${food}`} aria-label={foods[food].label} className={drag?.food === food ? 'drag-source' : ''} disabled={!ready || !!feedback} onPointerDown={e => begin(e, food)} onPointerMove={move} onPointerUp={e => end(e)} onPointerCancel={e => end(e, true)} onLostPointerCapture={e => end(e, true)} onContextMenu={e => e.preventDefault()} onKeyDown={e => { if (['Enter', ' '].includes(e.key)) { e.preventDefault(); give(food); } }}><FoodArt food={food}/></button>)}</div></div>
    </div>
    <footer className="game-footer"><Icon name="hand"/><p>Glisse vers Milo ce qu’il demande.</p><button className="text-button" onClick={onHome}>À bientôt !</button></footer>
    {drag && <div className="drag-ghost" style={{ left: drag.x, top: drag.y }}><FoodArt food={drag.food}/></div>}
  </main>;
}

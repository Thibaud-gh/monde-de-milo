import { useEffect, useRef, useState } from 'react';
import type { PointerEvent } from 'react';
import { foods, type ActivityId, type Food } from '../content/week1';
import { assessCafe, assessCafeChoices, cafeClip, cafeText, cafeHasSupport, cafeHavePairClip, cafeHavePairText, makeCafeTrials, type CafeChoices, type CafeTrial } from '../content/cafe';
import { have } from '../content/session2';
import { activityKey, checkpoint, listeningResetId } from '../lib/progression';
import { getStore, record } from '../lib/store';
import { playAudio, stopAudio } from '../lib/audio';
import type { PerformedAction } from '../lib/model';
import { narrationFor } from '../content/narration';
import { FoodArt, Milo } from './Art';
import { Icon } from './Icon';

const emptyChoices: CafeChoices = { held: null, given: null };

export function CafeGame({ activity, onHome }: { activity: ActivityId; onHome: () => void }) {
  const [{ saved, resetId }] = useState(() => {
    const { events } = getStore();
    // A reset that syncs while this round is open must not inherit its progress.
    return { saved: checkpoint(events, 1, activity, 'understanding'), resetId: listeningResetId(events, 1) };
  });
  const [trials] = useState<CafeTrial[]>(() => saved?.trials.every(t => t.cafe) ? saved.trials as CafeTrial[] : makeCafeTrials(activity));
  const [index, setIndex] = useState(saved?.completedTurns ?? 0);
  const [sessionId] = useState(() => crypto.randomUUID());
  const [player] = useState(() => new Audio());
  const contentId = activityKey(1, activity, 'understanding');
  const complete = index >= trials.length;
  const trial = trials[Math.min(index, trials.length - 1)];
  const guessAndGive = trial.cafe.kind === 'contrast';
  const choicesRef = useRef<CafeChoices>(emptyChoices);
  const [choices, setChoices] = useState<CafeChoices>(emptyChoices);
  const [help, setHelp] = useState(trial.guided);
  const assisted = useRef(trial.guided);
  const [ready, setReady] = useState(false);
  const [audioError, setAudioError] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [revealed, setRevealed] = useState(false);
  const [received, setReceived] = useState<Food | null>(null);
  const [drag, setDrag] = useState<{ food: Food; x: number; y: number } | null>(null);
  const [over, setOver] = useState(false);
  const target = useRef<HTMLDivElement>(null);
  const gesture = useRef<{ id: number; food: Food; x: number; y: number } | null>(null);
  const blocked = useRef(false);
  const attempts = useRef(0);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  function clearChoices() {
    choicesRef.current = emptyChoices;
    setChoices(emptyChoices);
  }
  function speak() {
    setAudioError(false); setReady(false);
    playAudio(cafeClip(trial), cafeText(trial), undefined, () => setAudioError(true), () => setReady(true), player);
  }
  useEffect(() => {
    const start = Date.now();
    record({ kind: 'engagement', contentId, sessionId, event: 'activity_open' });
    if (activity !== 'mission') record({ kind: 'engagement', contentId, sessionId, event: 'activity_checkpoint', trials, completedTurns: index, resetId });
    return () => {
      stopAudio(); clearTimeout(timer.current);
      record({ kind: 'engagement', contentId, sessionId, event: 'activity_close', durationSeconds: Math.round((Date.now() - start) / 1000) });
    };
    // This is the mount snapshot, not a sync-triggered new round.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contentId, sessionId]);
  useEffect(() => {
    blocked.current = false; attempts.current = 0; assisted.current = cafeHasSupport(getStore().events, trial);
    clearChoices();
    setHelp(assisted.current); setRevealed(false); setReceived(null); setFeedback(''); setDrag(null); setOver(false);
    if (complete) { const clip = narrationFor('s2-fini'); playAudio(clip.audio, clip.text, undefined, undefined, undefined, player); }
    else speak();
    return () => { stopAudio(); clearTimeout(timer.current); gesture.current = null; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index]);
  function respond(food: Food, performed: PerformedAction) {
    if (blocked.current || !ready || complete) return;
    if (guessAndGive) {
      if (performed === 'give') choose('given', food);
      return;
    }
    const result = assessCafe(trial, food, performed);
    if (result.outcome === 'motor') return;
    finishResponse(food, performed, result);
  }
  function choose(slot: keyof CafeChoices, food: Food) {
    if (blocked.current || !ready || complete) return;
    const next = { ...choicesRef.current, [slot]: food };
    choicesRef.current = next;
    setChoices(next);
    const result = assessCafeChoices(trial, next);
    if (result && next.given) finishResponse(next.given, 'give', result);
  }
  function finishResponse(
    food: Food,
    performed: PerformedAction,
    result: ReturnType<typeof assessCafe> & { selectedHeldObject?: Food; heldObjectCorrect?: boolean },
  ) {
    const correct = result.combinedCorrect;
    blocked.current = true; setReady(false); attempts.current++;
    record({ kind: 'attempt', interactionVersion: 'cafe-actions-v2', chapter: 'session-2', activity, sessionId, trialId: trial.id,
      phrase: cafeText(trial), targetObject: trial.food, targetAction: trial.action, selectedObject: food, performedAction: performed,
      assisted: assisted.current, attemptNumber: attempts.current, ...result,
      learningTarget: guessAndGive ? 'have-want' : 'instructions', heldObject: trial.cafe.held });
    if (guessAndGive) setRevealed(true);
    setFeedback(correct ? trial.action === 'give' ? 'Merci !' : 'Bravo !' : 'Écoutons encore.');
    if (correct) {
      setReceived(food);
      record({ kind: 'engagement', contentId, sessionId, event: index + 1 === trials.length ? 'activity_complete' : 'activity_checkpoint', trials, completedTurns: index + 1, resetId });
    }
    const successClip = guessAndGive ? cafeHavePairClip(trial.cafe.held, food) :
      trial.action === 'give' ? 'merci' : 'bravo';
    const clip = narrationFor(correct ? successClip : 'encore');
    let finished = false;
    const finish = () => {
      if (finished) return;
      finished = true;
      clearTimeout(timer.current);
      timer.current = setTimeout(() => {
        if (correct) {
          setIndex(turn => turn + 1);
          return;
        }
        assisted.current = true;
        setHelp(true);
        if (guessAndGive) {
          clearChoices();
          setRevealed(false);
        }
        blocked.current = false;
        setFeedback('');
        speak();
      }, 300);
    };
    // A stalled clip must not leave the game waiting indefinitely.
    timer.current = setTimeout(finish, 5000);
    playAudio(clip.audio, clip.text, finish, finish, undefined, player);
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
    if (cancelled) return;
    const moved = Math.hypot(e.clientX - g.x, e.clientY - g.y) >= 14;
    respond(g.food, moved ? inside(e.clientX, e.clientY) ? 'give' : 'incomplete' : 'tap');
  }
  function hint() {
    assisted.current = true; setHelp(true);
    record({ kind: 'engagement', contentId, sessionId, event: 'activity_hint', trialId: trial.id });
    speak();
  }
  if (complete) return <main className="completion child-screen"><Milo happy waving/><h1>Merci pour le goûter !</h1><p>{activity === 'mission' ? 'Le café reste ouvert. Reviens quand tu veux !' : 'Une étoile de plus ! La suite t’attend sur le même carré.'}</p><button className="primary" onClick={onHome}><Icon name="book"/> Au chapitre</button></main>;
  return <main className="cafe-game child-screen">
    <header className="game-header"><button className="round" aria-label="Retour au chapitre" onClick={onHome}><Icon name="left"/></button><div className="prompt"><span className="game-name">Le goûter de Milo · Étape {activity === 'find' ? 1 : activity === 'give' ? 2 : 3} · {index + 1} / {trials.length}</span><h1 aria-live="polite">{feedback || 'Écoute bien Milo.'}</h1></div><button className="round yellow" aria-label="Réécouter" disabled={!!feedback} onClick={speak}><Icon name="sound"/></button><button className="round" aria-label="Un petit coup de main" disabled={!!feedback} onClick={hint}><Icon name="help"/></button></header>
    {audioError && <button className="audio-notice" onClick={speak}>Touche ici pour écouter Milo.</button>}
    <div className={guessAndGive ? "cafe-room cafe-room-pair" : "cafe-room"}>
      <div className="cafe-awning" aria-hidden="true"/>
      <p className="cafe-caption" aria-live="polite">{cafeText(trial)}</p>
      {guessAndGive && (
        <div className="cafe-held-choices" role="group" aria-label="Qu’est-ce que Milo a ?">
          <p>Qu’est-ce que Milo a ?</p>
          <div className="cafe-held-icons">
            {trial.cafe.choices.map(food => (
              <button
                key={food}
                aria-label={foods[food].label}
                aria-pressed={choices.held === food}
                data-result={revealed && choices.held === food ? (food === trial.cafe.held ? 'correct' : 'wrong') : undefined}
                disabled={!ready || !!feedback}
                onClick={() => choose('held', food)}
              >
                <FoodArt food={food}/>
              </button>
            ))}
          </div>
        </div>
      )}
      <div className={`cafe-customer ${over ? 'receiving' : ''}`} ref={target} data-testid="milo-target"><Milo serving happy={!!received}/>
        {trial.cafe.kind === 'contrast' && <div className={`cafe-possession ${revealed ? 'revealed' : 'concealed'}`} aria-label={revealed ? `Milo a ${foods[trial.cafe.held].name}` : 'Un objet caché dans la main de Milo'}>
          {revealed ? <FoodArt food={trial.cafe.held}/> : <svg viewBox="0 0 100 100" aria-hidden="true"><path d="M16 28Q50 0 84 28L96 83 75 75 60 92 43 77 24 89 5 78Z" fill="#E4F0ED" stroke="#6D929D" strokeWidth="3"/><path d="m24 30-8 45m34-54-5 55m27-44 12 43" stroke="#A9C8D0" strokeWidth="3"/></svg>}
        </div>}
        {choices.given && (
          <div className="cafe-delivered cafe-given-choice" aria-label={`Objet donné : ${foods[choices.given].label}`}
            data-result={revealed ? (choices.given === trial.food ? 'correct' : 'wrong') : undefined}>
            <FoodArt food={choices.given}/>
          </div>
        )}
        {!guessAndGive && received && trial.action === 'give' && <div className="cafe-delivered"><FoodArt food={received}/></div>}
      </div>
      {revealed && trial.cafe.kind === 'contrast' && <div className={`cafe-reveal-caption${received ? ' cafe-reveal-pair' : ''}`} role="status">
        {received ? cafeHavePairText(trial.cafe.held, received) : have(trial.cafe.held)}
      </div>}
      {!guessAndGive && help && !received && <div className="cafe-model" aria-label="Un modèle pour apprendre"><div><span>{trial.action === 'show' ? 'Montre…' : 'Donne…'}</span><FoodArt food={trial.food}/><Icon name="hand" size={26}/></div></div>}
      <div className="cafe-counter"><div className="cafe-foods" aria-label="Les aliments à servir">{trial.cafe.choices.map(food => <button key={food} data-testid={`food-${food}`} aria-label={foods[food].label} className={`${drag?.food === food ? 'drag-source' : ''} ${received === food && trial.action === 'show' ? 'shown' : ''} ${guessAndGive && help && !feedback && food === trial.food ? 'cafe-hinted' : ''}`} disabled={!ready || !!feedback} onPointerDown={e => begin(e, food)} onPointerMove={move} onPointerUp={e => end(e)} onPointerCancel={e => end(e, true)} onLostPointerCapture={e => end(e, true)} onContextMenu={e => e.preventDefault()} onKeyDown={e => { if (['Enter', ' '].includes(e.key)) { e.preventDefault(); respond(food, 'tap'); } else if (e.key.toLowerCase() === 'g') { e.preventDefault(); respond(food, 'give'); } }}><FoodArt food={food}/></button>)}</div></div>
    </div>
    <footer className="game-footer"><Icon name="hand"/><p>{guessAndGive ? 'Choisis ce que Milo a. Glisse vers lui ce qu’il demande.' : 'Touche pour montrer. Glisse pour donner.'}</p><button className="text-button" onClick={onHome}>À bientôt !</button></footer>
    {drag && <div className="drag-ghost" style={{ left: drag.x, top: drag.y }}><FoodArt food={drag.food}/></div>}
  </main>;
}

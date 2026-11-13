import { useEffect, useRef, useState } from 'react';
import type { PointerEvent } from 'react';
import {
  assessService, isDrink, makeServiceTurns, serviceRequestClip, serviceRequestText, serviceScenes, serviceTitles,
  type ServiceAnswer,
} from '../content/session3';
import { foods, type ActivityId, type Food } from '../content/week1';
import { narrationFor } from '../content/narration';
import { playAudio, stopAudio } from '../lib/audio';
import type { PerformedAction } from '../lib/model';
import { activityKey, serviceCheckpoint } from '../lib/progression';
import { getStore, record } from '../lib/store';
import { FoodArt, Milo } from './Art';
import { Icon } from './Icon';
import { ServiceArt } from './ServiceArt';

export function ServiceListening({ activity, onHome }: { activity: ActivityId; onHome: () => void }) {
  const [saved] = useState(() => serviceCheckpoint(getStore().events, activity));
  const [turns] = useState(() => saved?.trials ?? makeServiceTurns(activity));
  const [index, setIndex] = useState(saved?.completedTurns ?? 0);
  const [sessionId] = useState(() => crypto.randomUUID());
  const [player] = useState(() => new Audio());
  const [ready, setReady] = useState(false);
  const [audioError, setAudioError] = useState(false);
  const [answer, setAnswer] = useState<ServiceAnswer>({});
  const [feedback, setFeedback] = useState<ReturnType<typeof assessService>>();
  const [drag, setDrag] = useState<{ food: Food; x: number; y: number }>();
  const [overMilo, setOverMilo] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const response = useRef<ServiceAnswer>({});
  const blocked = useRef(false);
  const assisted = useRef(false);
  const gesture = useRef<{ food: Food; id: number; x: number; y: number } | null>(null);
  const miloTarget = useRef<HTMLDivElement>(null);
  const contentId = activityKey(2, activity, 'understanding');
  const complete = index >= turns.length;
  const turn = turns[Math.min(index, turns.length - 1)];
  const caption = serviceScenes[turn.scene].text + (turn.kind === 'combined' ? ' ' + serviceRequestText(turn.request) : '');

  function playPrompt() {
    setAudioError(false);
    setReady(false);
    const failed = () => { assisted.current = true; setAudioError(true); setReady(true); };
    const first = narrationFor(`s3-${turn.scene}`);
    const request = turn.kind === 'combined' ? narrationFor(serviceRequestClip(turn.request)) : null;
    playAudio(first.audio, first.text, () => {
      if (request) playAudio(request.audio, request.text, undefined, failed, () => setReady(true), player);
    }, failed, request ? undefined : () => setReady(true), player);
  }

  useEffect(() => {
    const started = Date.now();
    record({ kind: 'engagement', contentId, sessionId, event: 'activity_open' });
    return () => {
      stopAudio();
      clearTimeout(timer.current);
      record({ kind: 'engagement', contentId, sessionId, event: 'activity_close', durationSeconds: Math.round((Date.now() - started) / 1000) });
    };
  }, [contentId, sessionId]);

  useEffect(() => {
    response.current = {};
    blocked.current = false;
    assisted.current = getStore().events.some(({ payload }) =>
      payload.kind === 'engagement' && payload.contentId === contentId && payload.trialId === turn.id &&
      payload.event === 'listening_response');
    setAnswer({});
    setFeedback(undefined);
    if (!complete) playPrompt();
    return () => {
      stopAudio();
      clearTimeout(timer.current);
      gesture.current = null;
    };
    // The round owns its prompt and cancels audio and feedback timers on exit.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index]);

  function choose(choice: ServiceAnswer) {
    if (blocked.current || !ready || complete) return;
    const next = { ...response.current, ...choice };
    response.current = next;
    setAnswer(next);
    const result = assessService(turn, next);
    if (!result) return;
    gesture.current = null;
    setDrag(undefined);
    setOverMilo(false);
    blocked.current = true;
    setReady(false);
    setFeedback(result);
    record({
      kind: 'engagement', contentId, sessionId, event: 'listening_response', trialId: turn.id,
      listening: { phrase: caption, targetScene: turn.scene, answer: next, assisted: assisted.current, ...result },
    });
    if (result.correct) {
      const completedTurns = index + 1;
      const event = completedTurns === turns.length ? 'activity_complete' : 'activity_checkpoint';
      if (event === 'activity_complete' || activity !== 'mission') {
        record({ kind: 'engagement', contentId, sessionId, event, serviceTurns: turns, completedTurns });
      }
    }
    let clip = 'encore';
    if (result.correct) {
      clip = 'bravo';
      if (turn.kind === 'need' && next.food) clip = isDrink(next.food) ? 's3-drinking' : 's3-eating';
    }
    const voice = narrationFor(clip);
    let finished = false;
    const finish = () => {
      if (finished) return;
      finished = true;
      clearTimeout(timer.current);
      timer.current = setTimeout(() => {
        if (result.correct) { setIndex(i => i + 1); return; }
        assisted.current = true;
        response.current = {};
        setAnswer({});
        setFeedback(undefined);
        blocked.current = false;
        playPrompt();
      }, 650);
    };
    timer.current = setTimeout(finish, 4800);
    playAudio(voice.audio, voice.text, finish, finish, undefined, player);
  }

  function foodAction(food: Food, action: PerformedAction) {
    if (action === 'incomplete' || (turn.kind === 'need' && action !== 'give')) return;
    choose({ food, action });
  }

  function inMilo(x: number, y: number) {
    const rect = miloTarget.current?.getBoundingClientRect();
    return !!rect && x >= rect.left - 16 && x <= rect.right + 16 && y >= rect.top - 16 && y <= rect.bottom + 16;
  }
  function startDrag(e: PointerEvent<HTMLButtonElement>, food: Food) {
    if (!ready || blocked.current || gesture.current || e.button !== 0) return;
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    gesture.current = { food, id: e.pointerId, x: e.clientX, y: e.clientY };
  }
  function moveDrag(e: PointerEvent<HTMLButtonElement>) {
    const g = gesture.current;
    if (!g || g.id !== e.pointerId || Math.hypot(e.clientX - g.x, e.clientY - g.y) < 14) return;
    setDrag({ food: g.food, x: e.clientX, y: e.clientY });
    setOverMilo(inMilo(e.clientX, e.clientY));
  }
  function stopDrag(e: PointerEvent<HTMLButtonElement>, cancelled = false) {
    const g = gesture.current;
    if (!g || g.id !== e.pointerId) return;
    gesture.current = null;
    setDrag(undefined);
    setOverMilo(false);
    if (cancelled) return;
    const moved = Math.hypot(e.clientX - g.x, e.clientY - g.y) >= 14;
    foodAction(g.food, moved ? inMilo(e.clientX, e.clientY) ? 'give' : 'incomplete' : 'tap');
  }

  if (complete) return <main className="completion child-screen">
    <Milo happy waving/><h1>Bravo, le service est fini !</h1>
    <p>{activity === 'mission' ? 'Tu peux refaire le dernier service quand tu veux.' : 'Une étoile de plus ! Retrouve la suite au chapitre.'}</p>
    <button className="primary" onClick={onHome}><Icon name="book"/> Au chapitre</button>
  </main>;
  const actionScene = feedback?.correct && turn.kind === 'need' && answer.food
    ? isDrink(answer.food) ? 'drinking' : 'eating'
    : undefined;
  let status = 'Écoute Milo.';
  if (actionScene) status = serviceScenes[actionScene].text;
  else if (feedback) status = feedback.correct ? 'Bravo !' : 'On essaie encore !';
  const instructions = turn.kind === 'need' ? 'Glisse vers Milo de quoi manger ou boire.' :
    turn.kind === 'scene' ? 'Touche l’image qui va avec ce que dit Milo.' :
    'Choisis l’image. Touche un aliment pour le montrer, ou glisse-le vers Milo pour le donner.';

  return <main className="service-game child-screen">
    <header className="game-header">
      <button className="round" aria-label="Retour au chapitre" onClick={onHome}><Icon name="left"/></button>
      <div className="prompt"><span className="game-name">{serviceTitles[activity]} · {index + 1} / {turns.length}</span><h1 aria-live="polite">{status}</h1></div>
      <button className="round yellow" aria-label="Réécouter Milo" disabled={!!feedback} onClick={playPrompt}><Icon name="sound"/></button>
    </header>
    <p className="service-instructions">{instructions}</p>
    {audioError && <p className="service-audio-caption" role="status">{caption}</p>}
    <div className={`service-room service-room-${turn.kind}`}>
      {turn.kind !== 'scene' && <div className={`service-customer${overMilo ? ' service-receiving' : ''}`} ref={miloTarget} aria-label="Donner à Milo">
        <ServiceArt scene={actionScene} food={answer.food}/>
        {turn.kind === 'combined' && answer.action === 'give' && answer.food && <FoodArt food={answer.food} className="service-served"/>}
      </div>}
      {turn.kind !== 'need' && <div className="service-scenes" role="group" aria-label="Les images de Milo">
        {turn.scenes.map(scene => <button key={scene} disabled={!ready || !!feedback} aria-label={serviceScenes[scene].label} aria-pressed={answer.scene === scene}
          data-result={feedback && answer.scene === scene ? feedback.sceneCorrect ? 'correct' : 'wrong' : undefined}
          onClick={() => choose({ scene })}><ServiceArt scene={scene} food={scene === 'drinking' ? turn.sip : turn.bite}/></button>)}
      </div>}
    </div>
    {turn.kind !== 'scene' && <div className="service-counter" role="group" aria-label="Les aliments">
      {turn.foods.map(food => <button key={food} className={drag?.food === food ? 'service-dragging' : undefined}
        disabled={!ready || !!feedback} aria-label={foods[food].label} aria-pressed={answer.food === food}
        data-result={feedback && answer.food === food ? feedback.foodCorrect && feedback.actionCorrect !== false ? 'correct' : 'wrong' : undefined}
        onPointerDown={e => startDrag(e, food)} onPointerMove={moveDrag} onPointerUp={stopDrag}
        onPointerCancel={e => stopDrag(e, true)} onLostPointerCapture={e => stopDrag(e, true)}
        onKeyDown={e => {
          if (e.key === 'Enter' || e.key === ' ' || e.key.toLowerCase() === 'g') {
            e.preventDefault();
            foodAction(food, turn.kind === 'need' || e.key.toLowerCase() === 'g' ? 'give' : 'tap');
          }
        }}
        aria-keyshortcuts={turn.kind === 'need' ? 'Enter Space' : 'Enter Space G'}>
        <FoodArt food={food}/>
      </button>)}
    </div>}
    {drag && <div className="drag-ghost" style={{ left: drag.x, top: drag.y }}><FoodArt food={drag.food}/></div>}
  </main>;
}

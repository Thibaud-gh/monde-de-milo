import { useEffect, useRef, useState } from 'react';
import { cafeFoods } from '../content/cafe';
import { isDrink, matchesNeed, serviceOffer, serviceScenes, type Need } from '../content/session3';
import { foods, type Food } from '../content/week1';
import { narrationFor } from '../content/narration';
import { playAudio, stopAudio } from '../lib/audio';
import type { Assessment } from '../lib/model';
import { activityKey } from '../lib/progression';
import { record } from '../lib/store';
import { FoodArt, Milo } from './Art';
import { Icon } from './Icon';
import { ServiceArt } from './ServiceArt';

const needs: Need[] = ['hungry', 'thirsty', 'hungry', 'thirsty'];
const contentId = activityKey(2, 'mission', 'speaking');

export function ServiceSpeaking({ onHome }: { onHome: () => void }) {
  const [round, setRound] = useState(0);
  const [food, setFood] = useState<Food>();
  const [declined, setDeclined] = useState<Food[]>([]);
  const [phase, setPhase] = useState<'offer' | 'answer' | 'served'>('offer');
  const [modelled, setModelled] = useState(false);
  const [audioError, setAudioError] = useState(false);
  const [ready, setReady] = useState(true);
  const [sessionId] = useState(() => crypto.randomUUID());
  const [player] = useState(() => new Audio());
  const waiting = useRef(false);
  const complete = round >= needs.length;
  const need = needs[Math.min(round, needs.length - 1)];
  const selectedFood = food ?? 'apple';
  const action = isDrink(selectedFood) ? 'drinking' : 'eating';

  function say(id: string, letMiloFinish = false) {
    const clip = narrationFor(id);
    setAudioError(false);
    setReady(!letMiloFinish);
    playAudio(clip.audio, clip.text, () => setReady(true), () => {
      setAudioError(true);
      setReady(true);
    }, undefined, player);
  }
  useEffect(() => {
    const started = Date.now();
    record({ kind: 'engagement', contentId, sessionId, event: 'activity_open' });
    return () => {
      stopAudio();
      record({ kind: 'engagement', contentId, sessionId, event: 'activity_close', durationSeconds: Math.round((Date.now() - started) / 1000) });
    };
  }, [sessionId]);
  useEffect(() => {
    waiting.current = false;
    if (!complete) say(`s3-${need}`);
    return stopAudio;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [round]);

  function pick(item: Food) {
    if (!ready || phase !== 'offer' || declined.includes(item)) return;
    stopAudio();
    setAudioError(false);
    setFood(item);
    setModelled(false);
  }
  function modelOffer() {
    if (!food || phase !== 'offer') return;
    setModelled(true);
    say(`s3-offer-${food}`);
  }
  function respond(level?: Assessment['level']) {
    if (!food || phase !== 'offer' || waiting.current) return;
    waiting.current = true;
    if (level) record({
      kind: 'assessment', lesson: 3, term: serviceOffer(food), level: modelled && level === 'independent' ? 'prompted' : level,
      note: 'Parent-observed offer at Milo’s café.',
    });
    // Two rounds give Éva a reason to make a second offer.
    const refusedSuitable = declined.some(item => matchesNeed(need, item));
    if (!matchesNeed(need, food) || (round % 2 === 1 && !refusedSuitable)) {
      setDeclined(items => [...items, food]);
      setFood(undefined);
      setModelled(false);
      waiting.current = false;
      say('s3-no', true);
      return;
    }
    setPhase('answer');
    waiting.current = false;
    say('s3-yes', true);
  }
  function serve() {
    if (!ready || phase !== 'answer') return;
    setPhase('served');
    say(`s3-${action}`);
  }
  function next() {
    if (phase !== 'served' || waiting.current) return;
    waiting.current = true;
    if (round + 1 === needs.length) record({ kind: 'engagement', contentId, sessionId, event: 'activity_complete' });
    setPhase('offer');
    setFood(undefined);
    setDeclined([]);
    setModelled(false);
    setRound(value => value + 1);
  }

  if (complete) return <main className="completion child-screen">
    <Milo happy waving/><h1>Merci pour le service !</h1>
    <p>Échangez les rôles. L’enfant dit « J’ai faim » ou « J’ai soif », puis l’adulte lui demande « Tu veux… ? ».</p>
    <button className="primary" onClick={onHome}><Icon name="book"/> Au chapitre</button>
  </main>;

  const refused = phase === 'offer' && !food && declined.length > 0;
  const speech = phase === 'served' ? serviceScenes[action].text : phase === 'answer' ? 'Oui, s’il te plaît.' :
    refused ? 'Non, merci.' : food ? serviceOffer(food) : serviceScenes[need].text;
  function replay() {
    if (phase === 'served') say(`s3-${action}`);
    else if (phase === 'answer') say('s3-yes', true);
    else if (refused) say('s3-no', true);
    else if (food) modelOffer();
    else say(`s3-${need}`);
  }

  return <main className="speaking-game service-speaking child-screen">
    <header className="game-header">
      <button className="round" aria-label="Retour au chapitre" onClick={onHome}><Icon name="left"/></button>
      <div className="prompt"><span className="game-name">Au café avec Milo · {round + 1} / {needs.length}</span><h1>À toi de servir !</h1></div>
      <button className="round yellow" aria-label="Réécouter" onClick={replay}><Icon name="sound"/></button>
    </header>
    <p className="parent-read-notice">À jouer à deux · Tu proposes, Milo répond.</p>
    <div className="speaking-scene">
      <ServiceArt scene={phase === 'served' ? action : need} food={food}/>
      <div className="speech-paper" aria-live="polite">
        <small>{food && phase === 'offer' ? 'À toi de demander' : 'Milo dit'}</small>
        <p>{food && phase === 'offer' && !modelled ? 'À toi de parler !' : speech}</p>
        {food && phase === 'offer' && <FoodArt food={food}/>}
        {food && phase === 'offer' && <button className="secondary" onClick={modelOffer}><Icon name="sound" size={17}/> Écouter le modèle</button>}
      </div>
    </div>
    {audioError && <button className="audio-notice" onClick={replay}>Touche ici pour réécouter.</button>}
    {phase === 'offer' && <div className="speaking-foods six-foods" aria-label="Choisis une chose à proposer">
      {cafeFoods.map(item => <button key={item} className={food === item ? 'selected' : ''} aria-pressed={food === item}
        disabled={!ready || declined.includes(item)} aria-label={foods[item].label} onClick={() => pick(item)}><FoodArt food={item}/></button>)}
    </div>}
    {phase === 'offer' && !food && <p className="speaking-invitation">{refused ? 'Propose autre chose à Milo.' : 'Choisis ce que tu veux proposer à Milo.'}</p>}
    {phase === 'offer' && food && <section className="adult-response" aria-label="Observation de l’adulte">
      <p>Laissez l’enfant poser sa question, puis touchez « Milo répond ».</p>
      <button className="primary" onClick={() => respond()}>Milo répond</button>
      <details>
        <summary>Pour l’adulte · noter la phrase</summary>
        <div>
          <button className="secondary" disabled={modelled} onClick={() => respond('independent')}>Phrase sans aide</button>
          <button className="secondary" onClick={() => respond('prompted')}>Phrase avec aide</button>
          <button className="text-button" onClick={() => respond('not-yet')}>Un mot / pas encore</button>
        </div>
      </details>
    </section>}
    {phase === 'answer' && <div className="service-speaking-action">
      <button className="primary" disabled={!ready} onClick={serve}><FoodArt food={selectedFood}/> Servir Milo</button>
    </div>}
    {phase === 'served' && <div className="service-speaking-action">
      <button className="primary" onClick={next}>{round + 1 === needs.length ? 'Terminer' : 'Encore un service'} <Icon name="right"/></button>
    </div>}
  </main>;
}

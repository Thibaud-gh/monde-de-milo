import { useEffect, useRef, useState } from 'react';
import { cafeFoods } from '../content/cafe';
import { narrationFor } from '../content/narration';
import { have, request } from '../content/session2';
import { foods, type Food } from '../content/week1';
import { playAudio, stopAudio } from '../lib/audio';
import { advanceCafe, cafeRounds, isCafeCommand, useCafeAccount, useCafeChannel, type CafeAction, type CafeCommand, type CafeState } from '../lib/liveCafe';
import { activityKey } from '../lib/progression';
import { record } from '../lib/store';
import { FoodArt, Milo } from './Art';
import { CafeControls } from './CafeControls';
import { Icon } from './Icon';

const contentId = activityKey(1, 'mission', 'speaking');

export function SpeakingCafe({ onHome }: { onHome: () => void }) {
  const owner = useCafeAccount();
  const [mode, setMode] = useState<'local' | 'live' | null>(null);
  const [cafe, setCafe] = useState<CafeState>(() => ({
    id: crypto.randomUUID(), version: 0, round: 1, phase: 'order', food: null, hints: 0,
  }));
  const latest = useRef(cafe);
  const [player] = useState(() => new Audio());
  const [audioError, setAudioError] = useState(false);
  const [parentPresent, setParentPresent] = useState(false);
  const parentTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const startedAt = useRef<number | undefined>(undefined);
  const playbackTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const orderQuestion = 'Tu voudrais quoi ?';
  const haveQuestion = 'Qu’est-ce que tu as ?';

  const { status, send } = useCafeChannel(mode === 'live' ? owner : null, (event, payload) => {
    if (mode !== 'live') return;
    if (event === 'request-state') {
      clearTimeout(parentTimer.current);
      setParentPresent(true);
      parentTimer.current = setTimeout(() => setParentPresent(false), 8500);
      publish();
    }
    if (event === 'command' && isCafeCommand(payload)) respond(payload);
  });

  function publish() {
    void send('state', latest.current);
  }
  useEffect(() => {
    if (status === 'connected') publish();
    // Re-announce the current turn whenever the channel reconnects.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  function show(next: CafeState) {
    latest.current = next;
    setCafe(next);
    if (mode === 'live') publish();
  }

  function say(id: string, onEnd?: () => void, onStart?: () => void) {
    setAudioError(false);
    const clip = narrationFor(id);
    playAudio(clip.audio, clip.text, onEnd, () => {
      setAudioError(true);
      onEnd?.();
    }, onStart, player);
  }

  function prompt() {
    const turn = latest.current;
    if (turn.phase === 'finished') return say('s2-fini');
    const having = turn.phase === 'have';
    const id = turn.hints === 2 && turn.food ? (having ? 'cafe-have-' : 's2-request-') + turn.food :
      turn.hints === 1 ? (having ? 'cafe-have-starter' : 's2-starter') :
      having ? 'cafe-have-question' : 's2-question';
    say(id);
  }

  function start(nextMode: 'local' | 'live') {
    setMode(nextMode);
    startedAt.current = Date.now();
    record({ kind: 'engagement', contentId, sessionId: latest.current.id, event: 'activity_open' });
    prompt();
  }

  useEffect(() => {
    const id = latest.current.id;
    return () => {
      stopAudio();
      clearTimeout(parentTimer.current);
      clearTimeout(playbackTimer.current);
      if (startedAt.current !== undefined) {
        record({ kind: 'engagement', contentId, sessionId: id, event: 'activity_close', durationSeconds: Math.round((Date.now() - startedAt.current) / 1000) });
      }
    };
  }, []);

  function select(food: Food) {
    const current = latest.current;
    if (current.phase !== 'order' || current.food === food) return;
    show({ ...current, food, version: current.version + 1, hints: 0 });
  }

  function respond(command: CafeCommand) {
    const current = latest.current;
    const next = advanceCafe(current, command);
    if (!next || !current.food) {
      if (mode === 'live') publish();
      return;
    }

    const acknowledge = (effect: 'screen' | 'sound') => {
      if (mode === 'live') void send('response', { commandId: command.commandId, effect });
    };
    if (command.action === 'hint') {
      show(next);
      const id = next.hints === 1 ? (next.phase === 'have' ? 'cafe-have-starter' : 's2-starter') :
        (next.phase === 'have' ? 'cafe-have-' : 's2-request-') + current.food;
      say(id, undefined, () => acknowledge('sound'));
    } else {
      clearTimeout(playbackTimer.current);
      if (next.phase === 'have') {
        show(next);
        let finished = false;
        const askWhatSheHas = () => {
          if (finished || latest.current.version !== next.version) return;
          finished = true;
          clearTimeout(playbackTimer.current);
          show({ ...next, version: next.version + 1, serving: false });
          say('cafe-have-question');
        };
        playbackTimer.current = setTimeout(askWhatSheHas, 1600);
        say('s2-voila', askWhatSheHas, () => acknowledge('sound'));
      } else {
        show(next);
        prompt();
      }

      record({
        kind: 'assessment', lesson: 2,
        term: current.phase === 'order' ? request(current.food) : have(current.food),
        level: command.action === 'continue' ? 'not-yet' : command.action === 'helped' || current.hints > 0 ? 'prompted' : 'independent',
        note: 'Parent-observed · Le petit café',
      });
      if (next.phase === 'finished') record({ kind: 'engagement', contentId, sessionId: next.id, event: 'activity_complete', completedTurns: cafeRounds * 2 });
    }
    requestAnimationFrame(() => requestAnimationFrame(() => acknowledge('screen')));
  }

  function respondHere(action: CafeAction) {
    const { id, version } = latest.current;
    respond({ id, version, action, commandId: crypto.randomUUID() });
  }

  function leave() {
    if (mode === 'live') void send('closed', { id: latest.current.id });
    onHome();
  }

  const having = cafe.phase === 'have';
  const hint = cafe.hints === 1 ? (having ? 'J’ai…' : 'Je voudrais…') :
    cafe.hints === 2 && cafe.food ? (having ? have(cafe.food) : request(cafe.food)) : null;

  if (cafe.phase === 'finished') return <main className="completion child-screen">
    <Milo happy waving/><h1>Quel bon goûter !</h1>
    <button className="primary" onClick={leave}><Icon name="book"/> Au chapitre</button>
  </main>;

  return <main className="speaking-game live-cafe child-screen">
    <header className="game-header">
      <button className="round" aria-label="Retour au chapitre" onClick={leave}><Icon name="left"/></button>
      <div className="prompt"><h1>Le petit café</h1></div>
      {mode && <button className="round yellow" aria-label="Réécouter Milo" onClick={prompt} disabled={cafe.serving}><Icon name="sound"/></button>}
    </header>
    {!mode ? <div className="cafe-play-together">
      <Milo waving/>
      <h2>À jouer avec un adulte</h2>
      {owner && <button className="primary" onClick={() => start('live')}>Avec le site des parents</button>}
      <button className={owner ? 'secondary' : 'primary'} onClick={() => start('local')}>Sur cet écran</button>
      {!owner && <p>Pour jouer sur deux écrans, connectez le même compte dans le coin des parents.</p>}
    </div> : <>
      {mode === 'live' && (status !== 'connected' || !parentPresent) && <div className="parent-read-notice">
        <p role="status">{status === 'unavailable' ? 'Connexion au site interrompue.' : 'Sur le site des parents, ouvrez « Live café ».'}</p>
        <button className="text-button" onClick={() => { setMode('local'); clearTimeout(parentTimer.current); }}>Continuer sur cet écran</button>
      </div>}
      {audioError && <button className="audio-notice" onClick={prompt}>Touche ici pour réécouter Milo.</button>}
      <div className="cafe-speaking-table">
        <Milo happy={having} serving={having}/>
        <div className="speech-paper" aria-live="polite">
          <p>{cafe.serving ? 'Voilà !' : hint ?? (having ? haveQuestion : orderQuestion)}</p>
          {!having && cafe.food && <FoodArt food={cafe.food}/>}
        </div>
        <div className="cafe-speaking-place">
          <div className="cafe-speaking-plate" aria-hidden="true">{having && cafe.food && <FoodArt food={cafe.food}/>}</div>
          <span>{having && cafe.food ? foods[cafe.food].label : 'Mon assiette'}</span>
        </div>
      </div>
      {!having && <div className="speaking-foods six-foods" role="group" aria-label="Le menu">
        {cafeFoods.map(food => <button key={food} className={cafe.food === food ? 'selected' : ''}
          aria-pressed={cafe.food === food} aria-label={foods[food].label} onClick={() => select(food)}><FoodArt food={food}/></button>)}
      </div>}
      {mode === 'local' && cafe.food && !cafe.serving && <section className="adult-response" lang="en" aria-label="Parent controls">
        <CafeControls cafe={cafe} onAction={respondHere}/>
      </section>}
    </>}
  </main>;
}

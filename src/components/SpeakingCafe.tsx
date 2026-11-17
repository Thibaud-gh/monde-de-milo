import { useEffect, useRef, useState, type ReactNode } from 'react';
import { cafeFoods } from '../content/cafe';
import { narrationFor } from '../content/narration';
import { have, request } from '../content/session2';
import { foods, type Food } from '../content/week1';
import { playAudio, stopAudio } from '../lib/audio';
import { isConfigured } from '../lib/cloud';
import { advanceCafe, cafeRounds, isCafeCommand, useCafeAccount, useCafeChannel, type CafeCommand, type CafeState } from '../lib/liveCafe';
import { activityKey } from '../lib/progression';
import { record } from '../lib/store';
import { FoodArt, Milo } from './Art';
import { CafeSnackPlate } from './CafeSnackPlate';
import { ParentAuth } from './ParentAuth';
import { Icon } from './Icon';

const contentId = activityKey(1, 'mission', 'speaking');
const cheers = ['bravo', 'cafe-cheer-two', 'cafe-cheer-three'] as const;
const snackSounds: Record<Food, string> = {
  apple: 'cafe-snack-crunch', banana: 'cafe-snack-peel', bread: 'cafe-snack-crunch',
  water: 'cafe-snack-sip', milk: 'cafe-snack-sip', cheese: 'cafe-snack-peel',
};

function newVisit(): CafeState {
  return { id: crypto.randomUUID(), version: 0, round: 1, phase: 'order', food: null, hints: 0, hintFood: null };
}

export function SpeakingCafe({ onHome }: { onHome: () => void }) {
  const owner = useCafeAccount();
  if (owner) return <ConnectedCafe key={owner} owner={owner} onHome={onHome}/>;
  return <main className="speaking-game live-cafe child-screen">
    <CafeHeader onBack={onHome}/>
    {isConfigured() ? <div className="cafe-sign-in"><ParentAuth forCafe/></div> :
      <p className="speaking-invitation">La connexion au site des parents est indisponible.</p>}
  </main>;
}

function CafeHeader({ onBack, children }: { onBack: () => void; children?: ReactNode }) {
  return <header className="game-header">
    <button className="round" aria-label="Retour au chapitre" onClick={onBack}><Icon name="left"/></button>
    <div className="prompt"><h1>Le petit café</h1></div>
    {children}
  </header>;
}

function ConnectedCafe({ owner, onHome }: { owner: string; onHome: () => void }) {
  const [cafe, setCafe] = useState(newVisit);
  const [leftovers, setLeftovers] = useState<Food[]>([]);
  const latest = useRef(cafe);
  const [player] = useState(() => new Audio());
  const [audioError, setAudioError] = useState(false);
  const [parentPresent, setParentPresent] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const parentTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const startedAt = useRef<number | undefined>(undefined);
  const playbackTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const orderQuestion = 'Tu voudrais quoi ?';
  const haveQuestion = 'Qu’est-ce que tu as ?';

  const { status, send } = useCafeChannel(owner, (event, payload) => {
    if (event === 'request-state') {
      clearTimeout(parentTimer.current);
      startVisit();
      setHelpOpen(false);
      setParentPresent(true);
      parentTimer.current = setTimeout(() => setParentPresent(false), 8500);
      publish();
    }
    if (event === 'command' && startedAt.current !== undefined && isCafeCommand(payload)) respond(payload);
  });

  function publish() {
    void send('state', latest.current);
  }
  useEffect(() => {
    if (status === 'connected') void send('cafe-open', {});
    else setParentPresent(false);
    // Ask an open dashboard to connect as soon as the channel joins.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  function show(next: CafeState) {
    latest.current = next;
    setCafe(next);
    publish();
  }

  function say(id: string, onEnd?: () => void, onStart?: () => void) {
    setAudioError(false);
    const clip = narrationFor(id);
    playAudio(clip.audio, clip.text, onEnd, () => {
      setAudioError(true);
      onEnd?.();
    }, onStart, player);
  }

  function prompt(onStart?: () => void) {
    const turn = latest.current;
    if (turn.phase === 'finished') return;
    const having = turn.phase === 'have';
    const id = turn.hintFood ? (having ? 'cafe-have-' : 's2-request-') + turn.hintFood :
      turn.hints === 1 ? (having ? 'cafe-have-starter' : 's2-starter') :
      having ? 'cafe-have-question' : 's2-question';
    say(id, undefined, onStart);
  }

  function playCue(state: CafeState, clip: string, after: () => void, onStart: () => void, effect?: string) {
    show(state);
    const animationEnd = performance.now() + (effect ? 1200 : 0);
    let soundStarted = false;
    const reportSound = () => {
      if (soundStarted) return;
      soundStarted = true;
      onStart();
    };
    let finished = false;
    const finish = () => {
      if (finished || latest.current.id !== state.id || latest.current.version !== state.version) return;
      clearTimeout(playbackTimer.current);
      const remaining = animationEnd - performance.now();
      if (remaining > 0) {
        playbackTimer.current = setTimeout(finish, remaining);
        return;
      }
      finished = true;
      after();
    };
    const startVoice = () => {
      playbackTimer.current = setTimeout(finish, effect ? 4800 : 2000);
      say(clip, finish, reportSound);
    };
    if (effect) {
      playAudio(effect, '', undefined, undefined, reportSound, player);
      // Leave the first bite or sip clear before Milo speaks.
      playbackTimer.current = setTimeout(startVoice, 750);
    } else startVoice();
  }

  function startVisit() {
    if (startedAt.current !== undefined) return;
    startedAt.current = Date.now();
    record({ kind: 'engagement', contentId, sessionId: latest.current.id, event: 'activity_open' });
    prompt();
  }

  function closeVisit() {
    const start = startedAt.current;
    if (start === undefined) return;
    startedAt.current = undefined;
    record({ kind: 'engagement', contentId, sessionId: latest.current.id, event: 'activity_close', durationSeconds: Math.round((Date.now() - start) / 1000) });
  }

  useEffect(() => {
    return () => {
      stopAudio();
      clearTimeout(parentTimer.current);
      clearTimeout(playbackTimer.current);
      closeVisit();
    };
  }, []);

  function respond(command: CafeCommand) {
    const current = latest.current;
    const next = advanceCafe(current, command);
    if (!next) {
      publish();
      return;
    }

    const acknowledge = (effect: 'screen' | 'sound') => {
      void send('response', { commandId: command.commandId, effect });
    };
    if (command.action === 'hint') {
      show(next);
      prompt(() => acknowledge('sound'));
    } else {
      const food = current.phase === 'order' ? next.food : current.food;
      if (!food) return;
      const soundStarted = () => acknowledge('sound');
      if (next.phase === 'have') {
        playCue(next, 's2-voila', () => {
          show({ ...next, version: next.version + 1, serving: false });
          say('cafe-have-question');
        }, soundStarted);
      } else {
        playCue({ ...current, version: next.version, praising: true }, cheers[current.round - 1], () => {
          setLeftovers(items => [...items, food]);
          show({ ...next, version: next.version + 1 });
          if (next.phase === 'finished') {
            record({ kind: 'engagement', contentId, sessionId: next.id, event: 'activity_complete', completedTurns: cafeRounds * 2 });
          } else prompt();
        }, soundStarted, snackSounds[food]);
      }

      record({
        kind: 'assessment', lesson: 2,
        term: current.phase === 'order' ? request(food) : have(food),
        level: command.action === 'continue' ? 'not-yet' : command.action === 'helped' || current.hints > 0 ? 'prompted' : 'independent',
        note: 'Parent-observed · Le petit café',
      });
    }
    requestAnimationFrame(() => requestAnimationFrame(() => acknowledge('screen')));
  }

  function leave() {
    void send('closed', { id: latest.current.id });
    onHome();
  }

  function replayVisit() {
    closeVisit();
    setLeftovers([]);
    show(newVisit());
    if (status === 'connected' && parentPresent) startVisit();
  }

  const having = cafe.phase === 'have';
  const hint = cafe.hintFood ? (having ? have(cafe.hintFood) : request(cafe.hintFood)) :
    cafe.hints === 1 ? (having ? 'J’ai…' : 'Je voudrais…') : null;

  if (cafe.phase === 'finished') return <main className="speaking-game live-cafe child-screen">
    <CafeHeader onBack={leave}/>
    <div className="cafe-snack-finale">
      <Milo happy waving/>
      <div>
        <h2>Quel bon goûter !</h2>
        <button className="primary" onClick={replayVisit}><Icon name="refresh"/> Encore !</button>
      </div>
    </div>
    <div className="cafe-speaking-place"><CafeSnackPlate food={null} served={leftovers} collecting={false}/></div>
  </main>;

  if (status !== 'connected' || !parentPresent) return <main className="speaking-game live-cafe child-screen">
    <CafeHeader onBack={leave}/>
    <div className="cafe-waiting">
      <Milo waving/>
      <div className="cafe-waiting-message">
        <h2 role="status">En attendant que ton parent se connecte…</h2>
        <button className="round" aria-label="Aide pour les parents" aria-expanded={helpOpen} aria-controls="cafe-parent-help"
          onClick={() => setHelpOpen(!helpOpen)}><Icon name="help"/></button>
      </div>
      {status === 'unavailable' && <p>La connexion a été interrompue. Nouvel essai en cours…</p>}
      {helpOpen && <div id="cafe-parent-help" lang="en" className="speech-paper cafe-parent-help">
        <p>On your computer, open the parent dashboard, sign in with the same account as this iPad, then select <strong>Live café</strong>. The game will start here when you connect.</p>
        <a href="https://thibaud-gh.github.io/monde-de-milo/#/parent" target="_blank" rel="noopener noreferrer"
          aria-label="Open the parent dashboard">thibaud-gh.github.io/monde-de-milo/#/parent</a>
      </div>}
    </div>
  </main>;

  return <main className="speaking-game live-cafe child-screen">
    <CafeHeader onBack={leave}>
      <button className="round yellow" aria-label="Réécouter Milo" onClick={() => prompt()} disabled={cafe.serving || cafe.praising}><Icon name="sound"/></button>
    </CafeHeader>
    {audioError && <button className="audio-notice" onClick={() => prompt()}>Touche ici pour réécouter Milo.</button>}
    <div className="cafe-speaking-table">
      <Milo happy={having} serving={having && !cafe.praising} waving={cafe.praising}
        className={cafe.praising && cafe.round === cafeRounds ? 'cafe-finale-cheer' : undefined}/>
      <div className="cafe-speaking-menu">
        <div className="speech-paper" aria-live="polite">
          <p>{cafe.praising ? narrationFor(cheers[cafe.round - 1]).text : cafe.serving ? 'Voilà !' : hint ?? (having ? haveQuestion : orderQuestion)}</p>
        </div>
        {!having && <>
          <p className="speaking-invitation">Touche un aliment pour entendre son nom.</p>
          <div className="speaking-foods six-foods cafe-vocabulary" role="group" aria-label="Écouter les mots du menu">
            {cafeFoods.map(food => <button key={food} aria-label={`Écouter : ${foods[food].label}`} onClick={() => say(`cafe-menu-${food}`)}>
              <FoodArt food={food}/><Icon name="sound" size={18}/>
            </button>)}
          </div>
        </>}
      </div>
    </div>
    <div className="cafe-speaking-place">
      <CafeSnackPlate food={having ? cafe.food : null} served={leftovers} collecting={!!cafe.praising}/>
      <div className="cafe-speaking-caption">
        {!cafe.serving && !cafe.praising && <p className="cafe-speaking-turn">
          <Icon name="speak" size={52}/> À toi de parler !
        </p>}
        <span aria-live="polite">{having && cafe.food ? foods[cafe.food].label : 'Mon assiette'}</span>
      </div>
    </div>
  </main>;
}

import { useEffect, useRef, useState } from 'react';
import { foods } from '../content/week1';
import type { ActivityId, Food } from '../content/week1';
import { narrationFor } from '../content/narration';
import { playAudio, stopAudio } from '../lib/audio';
import { have, request, speakingStages, snackStory } from '../content/session2';
import { cafeFoods, makeSpeakingTrials } from '../content/cafe';
import { activityKey, checkpoint } from '../lib/progression';
import { getStore, record } from '../lib/store';
import { FoodArt, Milo } from './Art';
import { Icon } from './Icon';
export function SessionTwoGame({ activity, onHome }: { activity: ActivityId; onHome: () => void }) {
  const [sessionId] = useState(() => crypto.randomUUID());
  const [resume] = useState(() => checkpoint(getStore().events, 1, activity, 'speaking'));
  const [trials, setTrials] = useState(() => resume?.trials ?? makeSpeakingTrials());
  const [turn, setTurn] = useState(resume?.completedTurns ?? 0);
  const [food, setFood] = useState<Food | null>(null);
  const [help, setHelp] = useState(false);
  const [audioError, setAudioError] = useState(false);
  const busy = useRef(false);
  const key = activityKey(1, activity, 'speaking');
  const title = speakingStages.find(a => a.id === activity)!.title;
  const complete = turn >= trials.length;
  const frame = trials[Math.min(turn, trials.length - 1)].frame ?? 'have';
  const having = frame === 'have';
  const held = !having && turn > 0 ? trials[turn - 1].food : null;
  const phrase = food ? having ? have(food) : request(food) : '';
  const question = having ? 'Qu’est-ce que tu as ?' : 'Tu voudrais quoi ?';
  const starter = having ? 'J’ai…' : 'Je voudrais…';
  function narrateRound() {
    setAudioError(false);
    // Stage 3 gives the child space to produce a phrase before any model.
    if (food && activity === 'mission' && !help) { stopAudio(); return; }
    const id = complete ? 's2-fini' : !food ? having ? 'cafe-have-question' : 's2-question' : help || activity === 'find' ? `${having ? 'cafe-have' : 's2-request'}-${food}` : having ? 'cafe-have-starter' : 's2-starter';
    const clip = narrationFor(id);
    playAudio(clip.audio, clip.text, undefined, () => setAudioError(true));
  }
  useEffect(() => {
    narrateRound();
    return stopAudio;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [food, turn, help]);
  useEffect(() => {
    const start = Date.now();
    record({ kind: 'engagement', contentId: key, sessionId, event: 'activity_open' });
    if (activity !== 'mission') record({ kind: 'engagement', contentId: key, sessionId, event: 'activity_checkpoint', trials, completedTurns: turn });
    return () => { stopAudio(); record({ kind: 'engagement', contentId: key, sessionId, event: 'activity_close', durationSeconds: Math.round((Date.now() - start) / 1000) }); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, sessionId]);
  function next(level: 'independent' | 'prompted' | 'not-yet') {
    if (!food || busy.current || complete) return;
    busy.current = true;
    const supported = help || activity !== 'mission';
    record({ kind: 'assessment', term: phrase, lesson: 2, level: level === 'independent' && supported ? 'prompted' : level,
      note: `Parent-observed · Chapter 2 / ${title}, turn ${turn + 1}. ${help || activity === 'find' ? 'Whole model offered.' : activity === 'give' ? 'Sentence starter offered.' : 'No sentence model offered.'} ${level === 'not-yet' ? 'A word, gesture or no phrase yet; served anyway.' : 'Parent confirmed the sentence.'} Not an automatic speech assessment.` });
    const updated = trials.map((trial, i) => i === turn ? { ...trial, food } : trial);
    const completedTurns = turn + 1;
    record({ kind: 'engagement', contentId: key, sessionId, event: completedTurns === trials.length ? 'activity_complete' : 'activity_checkpoint', trials: updated, completedTurns });
    setTrials(updated); setTurn(completedTurns); setFood(null); setHelp(false);
    requestAnimationFrame(() => { busy.current = false; });
  }
  function replay() {
    if (food && activity === 'mission' && !help) {
      const clip = narrationFor(having ? 'cafe-have-question' : 's2-question');
      playAudio(clip.audio, clip.text, undefined, () => setAudioError(true));
    } else narrateRound();
  }
  if (complete) return <main className="completion child-screen"><Milo happy waving/><h1>Quel bon goûter !</h1><p>{activity === 'mission' ? 'Le café t’attend pour une autre visite.' : 'La prochaine étape t’attend sur le carré du café.'}</p><button className="primary" onClick={onHome}><Icon name="book"/> Au chapitre</button></main>;
  return <main className="speaking-game child-screen"><header className="game-header"><button className="round" aria-label="Retour au chapitre" onClick={onHome}><Icon name="left"/></button><div className="prompt"><span className="game-name">Le petit café · Étape {activity === 'find' ? 1 : activity === 'give' ? 2 : 3} · {turn + 1} / {trials.length}</span><h1>{having ? 'Dans mon assiette' : 'À moi de commander'}</h1></div><button className="round yellow" aria-label="Réécouter Milo" onClick={replay}><Icon name="sound"/></button></header>
    <p className="parent-read-notice">À jouer à deux · Un adulte écoute et accompagne.</p>
    {audioError && <button className="audio-notice" onClick={replay}>Touche ici pour réécouter Milo.</button>}
    <div className="speaking-scene"><Milo happy/><div className="speech-paper" aria-live="polite"><small>{food ? 'À toi de parler à Milo' : 'Milo te demande'}</small><p>{!food ? question : help || activity === 'find' ? phrase : activity === 'give' ? starter : question}</p>{food && <FoodArt food={food}/>}</div>{held && <div className="my-plate"><span>Mon assiette</span><FoodArt food={held}/></div>}</div>
    <div className="speaking-foods six-foods" aria-label={having ? 'Choisis ce que tu as' : 'Choisis ce que tu voudrais'}>{cafeFoods.filter(id => id !== held).map(id => <button key={id} className={food === id ? 'selected' : ''} aria-pressed={food === id} aria-label={foods[id].label} onClick={() => setFood(id)}><FoodArt food={id}/></button>)}</div>
    <p className="speaking-invitation">{having ? food ? 'Dis à Milo ce que tu as.' : 'Choisis quelque chose pour ton assiette.' : food ? 'Demande à Milo ce que tu voudrais.' : 'Tu as déjà quelque chose. Choisis ce qui te ferait envie en plus.'}</p>
    {food && <section className="adult-response" aria-label="Observation de l’adulte"><p><strong>Adulte</strong> · {having ? 'Donnez-lui cet objet, réel ou imaginaire. Laissez-la dire ce qu’elle a.' : 'Laissez-la demander, puis servez-la, même si elle dit seulement un mot.'} {activity === 'find' ? 'Proposez la phrase ensemble.' : activity === 'give' ? 'Milo donne le début de la phrase.' : 'Attendez quelques secondes avant d’aider.'}</p><button className="text-button" onClick={() => { if (help) narrateRound(); else setHelp(true); }}>Un modèle</button><div><button className="secondary" disabled={activity !== 'mission' || help} onClick={() => next('independent')}>Phrase sans aide</button><button className="primary" onClick={() => next('prompted')}>Phrase avec aide</button><button className="text-button" onClick={() => next('not-yet')}>Un mot / pas encore · continuer</button></div><small>Votre observation seulement, sans micro. Un mot ou un geste permet de continuer ; cela ne compte pas comme une phrase complète. Après votre propre modèle ou début de phrase, choisissez « Phrase avec aide ».</small></section>}
  </main>;
}
export function SessionTwoStory({ onHome }: { onHome: () => void }) {
  const [page, setPage] = useState(0);
  const [audioError, setAudioError] = useState(false);
  const [sessionId] = useState(() => crypto.randomUUID());
  const visited = useRef(new Set<number>());
  const complete = useRef(false);
  const current = snackStory[page];
  function narratePage() {
    setAudioError(false);
    playAudio(`cafe-story-${page + 1}`, current.text, undefined, () => setAudioError(true));
  }
  function replayPage() {
    record({ kind: 'engagement', contentId: 'milo-cheese-hat', sessionId, event: 'story_audio_replay', page });
    narratePage();
  }
  useEffect(() => {
    const start = Date.now();
    const familiar = getStore().events.some(e => e.payload.kind === 'engagement' && e.payload.contentId === 'milo-cheese-hat' && e.payload.event === 'story_open');
    record({ kind: 'engagement', contentId: 'milo-cheese-hat', sessionId, event: 'story_open', familiar });
    return () => { stopAudio(); record({ kind: 'engagement', contentId: 'milo-cheese-hat', sessionId, event: 'story_close', durationSeconds: Math.round((Date.now() - start) / 1000), familiar }); };
  }, [sessionId]);
  useEffect(() => {
    narratePage();
    visited.current.add(page);
    record({ kind: 'engagement', contentId: 'milo-cheese-hat', sessionId, event: 'story_page', page });
    if (visited.current.size === snackStory.length && !complete.current) {
      complete.current = true;
      record({ kind: 'engagement', contentId: 'milo-cheese-hat', sessionId, event: 'story_complete' });
    }
    return stopAudio;
    // Page narration owns its audio; callbacks from older pages are cancelled.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, sessionId]);
  return <main className="read-together child-screen"><header className="story-header"><button className="round" onClick={onHome} aria-label="Retour au chapitre"><Icon name="left"/></button><h1>Le drôle de chapeau</h1><span>{page + 1} / {snackStory.length}</span></header><p className="parent-read-notice">Installe-toi et écoute Milo.</p><div className={`snack-illustration snack-${current.scene}`} role="img" aria-label={current.scene === 'search' ? 'Milo cherche son fromage, posé sur sa tête, avec du pain devant lui.' : current.scene === 'napkin' ? 'Milo trouve une banane sous la serviette ; le fromage est toujours sur sa tête.' : current.scene === 'hat' ? 'Milo découvre son drôle de chapeau de fromage.' : current.scene === 'sandwich' ? 'Milo prépare un sandwich avec le pain et le fromage.' : current.scene === 'request' ? 'Le sandwich est prêt ; Milo demande du lait.' : 'Milo a son sandwich et du lait. Sa tête est libre !'}><div className="snack-window"/><Milo happy={page > 1} waving={page === 5}/>{page < 3 && <div className="cheese-hat"><FoodArt food="cheese"/></div>}{page === 2 && <span className="hat-surprise" aria-hidden="true">!</span>}{page < 3 ? <div className="snack-food"><FoodArt food={page === 1 ? 'banana' : 'bread'}/></div> : <div className="snack-sandwich"><FoodArt food="bread"/><FoodArt food="cheese"/></div>}{page === 1 && <div className="snack-napkin" aria-hidden="true"/>}{page === 5 && <div className="snack-drink"><FoodArt food="milk"/></div>}<div className="snack-table"/></div><div className="story-caption"><p>{current.text.replace(/ ([!?])/g, '\u202f$1')}</p><button className="round yellow" aria-label="Réécouter la page" onClick={replayPage}><Icon name="sound"/></button></div>{audioError && <button className="audio-notice" onClick={replayPage}>Touche ici pour écouter.</button>}<nav className="story-controls" aria-label="Les pages"><button className="round" disabled={page === 0} aria-label="Page précédente" onClick={() => setPage(p => p - 1)}><Icon name="left"/></button>{page === snackStory.length - 1 ? <button className="primary" onClick={() => { visited.current.clear(); complete.current = false; record({ kind: 'engagement', contentId: 'milo-cheese-hat', sessionId, event: 'story_replay' }); setPage(0); }}><Icon name="refresh"/> Encore !</button> : <button className="round" aria-label="Page suivante" onClick={() => setPage(p => p + 1)}><Icon name="right"/></button>}</nav></main>;
}

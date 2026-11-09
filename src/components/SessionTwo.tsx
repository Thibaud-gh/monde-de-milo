import { useEffect, useRef, useState } from 'react';
import { foods } from '../content/week1';
import type { ActivityId, Food, Trial } from '../content/week1';
import { request, session2Activities, snackStory } from '../content/session2';
import { activityKey, checkpoint } from '../lib/progression';
import { getStore, record } from '../lib/store';
import { FoodArt, Milo } from './Art';
import { Icon } from './Icon';
const foodIds: Food[] = ['apple', 'banana', 'bread', 'water'];
export function SessionTwoGame({ activity, onHome }: { activity: ActivityId; onHome: () => void }) {
  const [sessionId] = useState(() => crypto.randomUUID());
  const [resume] = useState(() => checkpoint(getStore().events, 1, activity));
  const [trials] = useState<Trial[]>(() => resume?.trials ?? foodIds.map(food => ({ id: crypto.randomUUID(), food, action: 'give', guided: true })));
  const [turn, setTurn] = useState(resume?.completedTurns ?? 0);
  const [food, setFood] = useState<Food | null>(null);
  const [help, setHelp] = useState(false);
  const busy = useRef(false);
  const key = activityKey(1, activity);
  const title = session2Activities.find(a => a.id === activity)!.title;
  useEffect(() => {
    const start = Date.now();
    record({ kind: 'engagement', contentId: key, sessionId, event: 'activity_open' });
    if (activity !== 'mission') record({ kind: 'engagement', contentId: key, sessionId, event: 'activity_checkpoint', trials, completedTurns: turn });
    return () => { record({ kind: 'engagement', contentId: key, sessionId, event: 'activity_close', durationSeconds: Math.round((Date.now() - start) / 1000) }); };
    // The mount snapshot belongs to this round, including its saved starting turn.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, sessionId]);
  function next(level: 'independent' | 'prompted' | 'not-yet') {
    if (!food || busy.current || turn >= trials.length) return;
    busy.current = true;
    record({ kind: 'assessment', term: request(food), lesson: 2, level,
      note: `Parent-observed · Chapter 2 / ${title}, turn ${turn + 1}. ${help || activity === 'find' ? 'Whole model offered.' : activity === 'give' ? 'Sentence starter offered.' : 'No written model offered.'} Not an automatic speech assessment.` });
    const completedTurns = turn + 1;
    record({ kind: 'engagement', contentId: key, sessionId, event: completedTurns === trials.length ? 'activity_complete' : 'activity_checkpoint', trials, completedTurns });
    setTurn(completedTurns); setFood(null); setHelp(false);
    // Prevent a double tap from advancing two turns.
    requestAnimationFrame(() => { busy.current = false; });
  }
  if (turn === trials.length) return <main className="completion child-screen"><Milo happy waving/><h1>Quel bon goûter !</h1><p>{activity === 'mission' ? 'Le café t’attend pour une autre visite.' : 'La suite t’attend dans le chapitre.'}</p><button className="primary" onClick={onHome}><Icon name="book"/> Au chapitre</button></main>;
  return <main className="speaking-game child-screen"><header className="game-header"><button className="round" aria-label="Retour au chapitre" onClick={onHome}><Icon name="left"/></button><div className="prompt"><span className="game-name">{title} · {turn + 1} / {trials.length}</span><h1>{activity === 'find' ? 'Avec Milo, on essaie !' : activity === 'give' ? 'À toi de finir la phrase !' : 'Bienvenue au petit café !'}</h1></div></header>
    <p className="parent-read-notice">À jouer ensemble · L’adulte prête sa voix à Milo.</p>
    <div className="speaking-scene"><Milo happy/><div className="speech-paper" aria-live="polite"><small>{food ? 'À toi de parler à Milo' : 'Milo te demande'}</small><p>{!food ? 'Tu voudrais quoi ?' : help || activity === 'find' ? request(food) : activity === 'give' ? 'Je voudrais…' : 'À toi de commander !'}</p>{food && <FoodArt food={food}/>}</div></div>
    <div className="speaking-foods" aria-label="Choisis ton goûter">{foodIds.map(id => <button key={id} className={food === id ? 'selected' : ''} aria-pressed={food === id} aria-label={foods[id].label} onClick={() => setFood(id)}><FoodArt food={id}/></button>)}</div>
    <p className="speaking-invitation">{food ? 'Dis ta commande à Milo. Il t’écoute !' : 'Choisis ce qui te fait envie.'}</p>
    {food && <section className="adult-response" aria-label="Observation de l’adulte"><p><strong>Adulte</strong> · {activity === 'find' ? 'Lisez la phrase et proposez de la dire ensemble.' : activity === 'give' ? 'Proposez le début, puis laissez-la terminer.' : 'Attendez quelques secondes. Proposez de l’aide si besoin.'} Servez sa commande et dites « Voilà ! ».</p><button className="text-button" onClick={() => setHelp(true)}>Un modèle</button><div><button className="secondary" disabled={activity !== 'mission' || help} onClick={() => next('independent')}>Dit sans aide</button><button className="primary" onClick={() => next('prompted')}>Dit avec aide</button><button className="text-button" onClick={() => next('not-yet')}>Pas cette fois · continuer</button></div><small>Votre observation seulement. Le micro n’est pas utilisé. Une réponse courte suffit pour continuer. Après un modèle ou un début de phrase, choisissez « Dit avec aide ».</small></section>}
  </main>;
}
export function SessionTwoStory({ onHome }: { onHome: () => void }) {
  const [page, setPage] = useState(0);
  const [sessionId] = useState(() => crypto.randomUUID());
  const visited = useRef(new Set<number>());
  const complete = useRef(false);
  const current = snackStory[page];
  useEffect(() => {
    const start = Date.now();
    const familiar = getStore().events.some(e => e.payload.kind === 'engagement' && e.payload.contentId === 'milo-snack' && e.payload.event === 'story_open');
    record({ kind: 'engagement', contentId: 'milo-snack', sessionId, event: 'story_open', familiar });
    return () => { record({ kind: 'engagement', contentId: 'milo-snack', sessionId, event: 'story_close', durationSeconds: Math.round((Date.now() - start) / 1000), familiar }); };
  }, [sessionId]);
  useEffect(() => {
    visited.current.add(page);
    record({ kind: 'engagement', contentId: 'milo-snack', sessionId, event: 'story_page', page });
    if (visited.current.size === snackStory.length && !complete.current) {
      complete.current = true;
      record({ kind: 'engagement', contentId: 'milo-snack', sessionId, event: 'story_complete' });
    }
  }, [page, sessionId]);
  return <main className="read-together child-screen"><header className="story-header"><button className="round" onClick={onHome} aria-label="Retour au chapitre"><Icon name="left"/></button><h1>Le goûter de Milo</h1><span>{page + 1} / {snackStory.length}</span></header><p className="parent-read-notice">Une histoire à lire ensemble · L’adulte fait la voix de Milo.</p><div className="snack-illustration"><div className="snack-window"/><Milo happy={page > 1} waving={page === 5}/>{current.food && <div className="snack-food"><FoodArt food={current.food}/></div>}<div className="snack-table"/></div><div className="story-caption"><p>{current.text}</p></div><p className="reading-direction">{current.direction}</p><nav className="story-controls" aria-label="Les pages"><button className="round" disabled={page === 0} aria-label="Page précédente" onClick={() => setPage(p => p - 1)}><Icon name="left"/></button>{page === snackStory.length - 1 ? <button className="primary" onClick={() => { visited.current.clear(); complete.current = false; record({ kind: 'engagement', contentId: 'milo-snack', sessionId, event: 'story_replay' }); setPage(0); }}><Icon name="refresh"/> Encore !</button> : <button className="round" aria-label="Page suivante" onClick={() => setPage(p => p + 1)}><Icon name="right"/></button>}</nav></main>;
}

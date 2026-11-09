import { MusicButton } from './MusicButton';
import { chapters } from '../content/chapters';
import { session2Activities } from '../content/session2';
import { activityState, completedActivity } from '../lib/progression';
import { activities } from '../content/week1';
import type { ActivityId } from '../content/week1';
import { useProgress } from '../lib/store';
import { BookArt, FoodArt, Milo } from './Art';
import { Icon } from './Icon';
export function Chapter({ index, onHome, onActivity, onStory }: { index: number; onHome: () => void; onActivity: (id: ActivityId) => void; onStory: () => void }) {
  const chapter = chapters[index];
  const progress = useProgress();
  const chapterActivities = index === 1 ? session2Activities : activities;
  return <main className="chapter child-screen"><header className="chapter-header"><button className="round" onClick={onHome} aria-label="Tous les chapitres"><Icon name="left"/></button><span>Chapitre {index + 1}</span><MusicButton/></header>
    <div className="chapter-welcome"><div><h1>{chapter.title}</h1><p>{index === 1 ? 'Un goûter à partager avec un adulte' : '3 jeux et 1 histoire à découvrir'}</p></div><Milo waving/></div>
    {chapter.available ? <div className="chapter-choices"><section aria-labelledby="games-title"><h2 id="games-title">Les jeux <span>Un petit pas après l’autre</span></h2><div className="game-choices">{chapterActivities.map((a, i) => {
      const state = activityState(progress.events, index, a.id);
      const disabled = state === 'locked' || state === 'done';
      const label = state === 'done' ? 'Découverte terminée' : state === 'locked' ? `Après le jeu ${i}` : state === 'resume' ? 'Continuer' : a.id === 'mission' && completedActivity(progress.events, index, a.id) ? 'Rejouer' : 'Jouer';
      return <button disabled={disabled} className={`game-choice game-choice-${a.id} ${state}`} key={a.id} onClick={() => onActivity(a.id)} aria-label={`Jeu ${i + 1} : ${a.title} · ${label}`}><span className="choice-label">Jeu {i + 1}{completedActivity(progress.events, index, a.id) && <Icon name="check" size={17}/>}</span><div className="choice-picture"><FoodArt food={a.food}/><span><Icon name={a.icon} size={30}/></span></div><strong>{a.title}</strong><small>{a.instruction}</small><span className="choice-start"><Icon name={state === 'done' ? 'check' : 'play'} size={19}/> {label}</span></button>;
    })}</div></section>
    <section className="story-choice-section" aria-labelledby="story-title"><h2 id="story-title">L’histoire <span>{index === 1 ? 'À lire ensemble' : 'Installe-toi et écoute'}</span></h2><button className="story-choice" onClick={onStory} aria-label={`Histoire : ${chapter.story}`}><BookArt/><span><small>Histoire</small><strong>{chapter.story}</strong><span>{index === 1 ? 'Milo a faim, puis soif. À vous de raconter…' : 'Une pomme à retrouver au café…'}</span></span><span className="choice-start"><Icon name={index === 1 ? "book" : "sound"} size={21}/> {index === 1 ? "Lire ensemble" : "Écouter"}</span></button></section></div> : <p className="coming-soon">Milo prépare de nouvelles aventures. À bientôt !</p>}
    <footer className="home-footer"><span className="little-dash"/> Jeux 1 et 2 : une découverte. Jeu 3 : à rejouer. L’histoire : quand tu veux. <span className="little-dash"/></footer>
  </main>;
}

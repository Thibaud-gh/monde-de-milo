import { MusicButton } from './MusicButton';
import { chapters } from '../content/chapters';
import { activities } from '../content/week1';
import type { ActivityId } from '../content/week1';
import { useProgress } from '../lib/store';
import { BookArt, FoodArt, Milo } from './Art';
import { Icon } from './Icon';
export function Chapter({ index, onHome, onActivity, onStory }: { index: number; onHome: () => void; onActivity: (id: ActivityId) => void; onStory: () => void }) {
  const chapter = chapters[index];
  const progress = useProgress();
  const finished = new Set(progress.events.flatMap(e => e.payload.kind === 'engagement' && e.payload.event === 'activity_complete' ? [e.payload.contentId] : []));
  return <main className="chapter child-screen"><header className="chapter-header"><button className="round" onClick={onHome} aria-label="Tous les chapitres"><Icon name="left"/></button><span>Chapitre {index + 1}</span><MusicButton/></header>
    <div className="chapter-welcome"><div><h1>{chapter.title}</h1><p>3 jeux et 1 histoire à découvrir</p></div><Milo waving/></div>
    {chapter.available ? <div className="chapter-choices"><section aria-labelledby="games-title"><h2 id="games-title">Les jeux <span>Choisis ton jeu</span></h2><div className="game-choices">{activities.map((a, i) => <button className={`game-choice game-choice-${a.id}`} key={a.id} onClick={() => onActivity(a.id)} aria-label={`Jeu ${i + 1} : ${a.title}`}><span className="choice-label">Jeu {i + 1}{finished.has(a.id) && <Icon name="check" size={17}/>}</span><div className="choice-picture"><FoodArt food={a.food}/><span><Icon name={a.icon} size={30}/></span></div><strong>{a.title}</strong><small>{a.instruction}</small><span className="choice-start"><Icon name="play" size={19}/> Jouer</span></button>)}</div></section>
    <section className="story-choice-section" aria-labelledby="story-title"><h2 id="story-title">L’histoire <span>Installe-toi et écoute</span></h2><button className="story-choice" onClick={onStory} aria-label={`Histoire : ${chapter.story}`}><BookArt/><span><small>Histoire</small><strong>{chapter.story}</strong><span>Une pomme à retrouver au café…</span></span><span className="choice-start"><Icon name="sound" size={21}/> Écouter</span></button></section></div> : <p className="coming-soon">Milo prépare de nouvelles aventures. À bientôt !</p>}
    <footer className="home-footer"><span className="little-dash"/> Tout se rejoue, à ton rythme. <span className="little-dash"/></footer>
  </main>;
}

import { chapters } from '../content/chapters';
import { activities } from '../content/week1';
import type { ActivityId } from '../content/week1';
import { useProgress } from '../lib/store';
import { BasketArt, BookArt, CafeScene } from './Art';
import { Icon } from './Icon';
export function Chapter({ index, onHome, onActivity, onStory }: { index: number; onHome: () => void; onActivity: (id: ActivityId) => void; onStory: () => void }) {
  const chapter = chapters[index];
  const progress = useProgress();
  const finished = new Set(progress.events.flatMap(e => e.payload.kind === 'engagement' && e.payload.event === 'activity_complete' ? [e.payload.contentId] : []));
  const next = activities.slice(0, progress.lesson).find(a => !finished.has(a.id)) ?? activities[progress.lesson - 1];
  const storyOpened = progress.events.some(e => e.payload.kind === 'engagement' && e.payload.event === 'story_open');
  const inviteStory = progress.lesson >= 2 && finished.has(next.id) && !storyOpened;
  return <main className="chapter child-screen"><header className="chapter-header"><button className="round" onClick={onHome} aria-label="Tous les chapitres"><Icon name="left"/></button><span>Chapitre {index + 1}</span><span className="brand-flower" aria-hidden="true"><Icon name="flower" size={32}/></span></header>
    <div className="chapter-title"><h1>{chapter.title}</h1><p>{chapter.subtitle}</p></div>
    <div className="chapter-scene"><CafeScene/></div>
    {!chapter.available && <p className="coming-soon">Milo prépare de nouvelles aventures. À bientôt !</p>}
    <div className="chapter-activities"><section className="chapter-game"><div className="chapter-section-title"><BasketArt/><h2>On joue ?</h2></div>{chapter.available ? <><button className="primary next-game" onClick={inviteStory ? onStory : () => onActivity(next.id)}><Icon name={inviteStory ? 'book' : 'play'}/>{inviteStory ? 'Une petite histoire ?' : next.title}</button><div className="chapter-game-list">{activities.map(a => <button className="chapter-game-row" key={a.id} onClick={() => onActivity(a.id)}><Icon name={a.icon} size={22}/><span>{a.title}</span><Icon name="play" size={18}/></button>)}</div></> : <><p>{chapter.game}</p><span className="soon-label">Bientôt</span></>}</section>
    <section className="chapter-story"><div className="chapter-section-title"><BookArt/><h2>On écoute ?</h2></div><h3>{chapter.story}</h3>{chapter.available ? <><p>Une petite histoire avec Milo.</p><button className="primary story-play" onClick={onStory}><Icon name="sound"/> Écouter l’histoire</button></> : <span className="soon-label">Bientôt</span>}</section></div>
    <footer className="home-footer"><span className="little-dash"/> Tout se rejoue, à ton rythme. <span className="little-dash"/></footer>
  </main>;
}

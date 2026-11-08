import { chapters } from '../content/chapters';
import { playAudio } from '../lib/audio';
import { CafeScene, FoodArt } from './Art';
import { Icon } from './Icon';
export function Home({ onChapter, onParent }: { onChapter: (index: number) => void; onParent: () => void }) {
  return <main className="home child-screen">
    <header className="home-header"><button className="wordmark" aria-label="Bonjour Milo" onClick={() => playAudio('bonjour', 'Bonjour ! Viens jouer avec Milo !')}><span className="brand-flower"><Icon name="flower" size={32}/></span><span>Milo</span></button><button className="parent-link" onClick={onParent}><Icon name="parent" size={19}/> Parents</button></header>
    <div className="home-title"><span>Bonjour, toi !</span><h1>Le monde de Milo</h1><p>Un petit café, de grandes découvertes.</p></div>
    <div className="cafe-frame"><CafeScene/><div className="cafe-invitation"><span>Bonjour, Milo !</span><button className="primary" onClick={() => onChapter(0)}><Icon name="book"/> On y va !</button></div></div>
    <section className="chapter-journey" aria-label="Les chapitres"><h2>Les aventures de Milo</h2><div className="chapter-list">{chapters.map((chapter, i) => <button key={chapter.id} className={`chapter-tile ${chapter.available ? 'available' : 'upcoming'}`} onClick={() => onChapter(i)} aria-label={`Chapitre ${i + 1} : ${chapter.title}${chapter.available ? '' : ', bientôt'}`}><span className="chapter-number">{i + 1}</span><FoodArt food={chapter.food}/><span className="chapter-tile-text"><strong>{chapter.title}</strong><small>{chapter.available ? 'On joue et on écoute' : 'Bientôt'}</small></span><Icon name="right" size={18}/></button>)}</div></section>
    <footer className="home-footer"><span className="little-dash"/> À ton rythme, avec Milo. <span className="little-dash"/></footer>
  </main>;
}

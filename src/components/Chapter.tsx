import { MusicButton } from './MusicButton';
import { chapters } from '../content/chapters';
import { activityState, gameStage, stageActivities } from '../lib/progression';
import type { GameKind } from '../lib/progression';
import type { ActivityId } from '../content/week1';
import { useProgress } from '../lib/store';
import { BookArt, FoodArt, Milo } from './Art';
import { Icon } from './Icon';
export function Chapter({ index, onHome, onActivity, onStory }: { index: number; onHome: () => void; onActivity: (kind: GameKind, id: ActivityId) => void; onStory: () => void }) {
  const chapter = chapters[index];
  const { events } = useProgress();
  const games: { kind: GameKind; title: string; description: string; food: 'apple' | 'banana' }[] = [
    { kind: 'understanding', title: index === 0 ? 'Le panier de Milo' : 'Milo commande', description: 'Écoute Milo. Montre ou donne.', food: 'apple' },
    ...(index === 1 ? [{ kind: 'speaking' as const, title: 'Le petit café', description: 'Parle avec Milo, accompagné d’un adulte.', food: 'banana' as const }] : []),
  ];
  return <main className="chapter child-screen"><header className="chapter-header"><button className="round" onClick={onHome} aria-label="Tous les chapitres"><Icon name="left"/></button><span>Chapitre {index + 1}</span><MusicButton/></header>
    <div className="chapter-welcome"><div><h1>{chapter.title}</h1><p>{index === 0 ? 'Un jeu et une histoire' : 'Deux jeux et une histoire'}</p></div><Milo waving/></div>
    {chapter.available ? <div className={`activity-squares ${index === 0 ? 'two-squares' : ''}`}>
      {games.map((game, i) => {
        const stage = gameStage(events, index, game.kind);
        const activity = stageActivities[stage - 1];
        const state = activityState(events, index, activity, game.kind);
        const action = state === 'resume' ? 'Continuer' : stage === 3 ? 'Jouer et rejouer' : 'Jouer';
        return <button key={game.kind} className={`activity-square ${game.kind}`} onClick={() => onActivity(game.kind, activity)} aria-label={`Jeu ${i + 1} : ${game.title} · Étape ${stage} · ${action}`}>
          <span className="square-type">{game.kind === 'speaking' ? 'Avec un adulte' : 'Comprendre'}</span>
          <div className="square-art"><Milo happy={game.kind === 'speaking'}/><FoodArt food={game.food}/></div>
          <strong>{game.title}</strong><span className="square-description">{game.description}</span>
          <div className="stage-path" aria-label={`Étape ${stage} sur 3`}>{[1, 2, 3].map(n => <span key={n} className={n === stage ? 'current' : n < stage ? 'completed' : ''} aria-current={n === stage ? 'step' : undefined}>{n < stage ? <Icon name="check" size={15}/> : n}</span>)}</div>
          <span className="choice-start"><Icon name="play" size={18}/>{action}</span>
        </button>;
      })}
      <button className="activity-square story-square" onClick={onStory} aria-label={`Histoire : ${chapter.story}`}><span className="square-type">L’histoire</span><div className="square-art"><BookArt/></div><strong>{chapter.story}</strong><span className="square-description">{index === 1 ? 'Une histoire à lire ensemble.' : 'Une pomme à retrouver au café…'}</span><span className="choice-start"><Icon name={index === 1 ? 'book' : 'sound'} size={18}/>{index === 1 ? 'Lire ensemble' : 'Écouter'}</span></button>
    </div> : <p className="coming-soon">Milo prépare de nouvelles aventures. À bientôt !</p>}
    <footer className="home-footer"><span className="little-dash"/> Chaque jeu avance à ton rythme. À l’étape 3, on rejoue ! <span className="little-dash"/></footer>
  </main>;
}

import { MusicButton } from './MusicButton';
import { chapters } from '../content/chapters';
import { activityState, gameStage, stageActivities, stageCompletions } from '../lib/progression';
import type { GameKind } from '../lib/progression';
import type { ActivityId } from '../content/week1';
import { useProgress } from '../lib/store';
import { BookArt, FoodArt, Milo } from './Art';
import { serviceTitles } from '../content/session3';
import { Icon } from './Icon';
export function Chapter({ index, onHome, onActivity, onStory }: { index: number; onHome: () => void; onActivity: (kind: GameKind, id: ActivityId) => void; onStory: () => void }) {
  const chapter = chapters[index];
  const { events } = useProgress();
  const games: { kind: GameKind; title: string; description: string; food: 'apple' | 'banana' }[] = [
    {
      kind: 'understanding',
      title: chapter.game,
      description: [
        'Écoute Milo. Montre ou donne.',
        'Il a déjà quelque chose… Que voudrait-il ?',
        'Écoute Milo, choisis une image et aide-le au café.',
      ][index],
      food: 'apple',
    },
  ];
  if (index === 1) games.push({ kind: 'speaking', title: 'Le petit café', description: 'J’ai… Je voudrais… À toi de parler avec Milo.', food: 'banana' });
  if (index === 2) games.push({ kind: 'speaking', title: 'À toi de servir !', description: 'Propose quelque chose à Milo : « Tu veux… ? »', food: 'banana' });
  return <main className="chapter child-screen"><header className="chapter-header"><button className="round" onClick={onHome} aria-label="Tous les chapitres"><Icon name="left"/></button><span>Chapitre {index + 1}</span><MusicButton/></header>
    <div className="chapter-welcome"><div><h1>{chapter.title}</h1><p>{index === 2 ? 'Trois étapes d’écoute et un jeu pour parler' : index === 0 ? 'Un jeu et une histoire' : 'Deux jeux et une histoire'}</p></div><Milo waving/></div>
    {chapter.available ? <div className={`game-choices chapter-card-grid ${index !== 1 ? 'two-cards' : ''}`}>
      {games.map((game, i) => {
        const singleGame = index === 2 && game.kind === 'speaking';
        const stage = singleGame ? 3 : gameStage(events, index, game.kind);
        const activity = stageActivities[stage - 1];
        const state = activityState(events, index, activity, game.kind);
        const finished = stageCompletions(events, index, game.kind);
        const action = state === 'resume' ? 'Continuer' : stage === 3 && finished[2] ? 'Rejouer' : 'Jouer';
        return <button key={game.kind} className={`game-choice game-choice-${game.kind === 'speaking' ? 'give' : 'find'}`} onClick={() => onActivity(game.kind, activity)} aria-label={`Jeu ${i + 1} : ${game.title} · ${singleGame ? action : `Étape ${stage} · ${action}`}`}>
          <span className="choice-label">{game.kind === 'speaking' ? 'Avec un adulte' : 'Comprendre'}</span>
          <div className="choice-picture"><FoodArt food={game.food}/><span><Icon name={game.kind === 'speaking' ? 'parent' : 'hand'} size={30}/></span></div>
          <strong>{game.title}</strong><small>{index === 2 && !singleGame ? serviceTitles[activity] : game.description}</small>
          {!singleGame && <div className="stage-stars" aria-label={`${finished.filter(Boolean).length} étapes terminées sur 3`}>{finished.map((done, n) => <span key={n} className={done ? 'earned' : ''} aria-label={`Étape ${n + 1}${done ? ' terminée' : ' à découvrir'}`}><Icon name="star" size={25}/></span>)}</div>}
          <span className="choice-start"><Icon name="play" size={18}/>{singleGame ? action : `Étape ${stage} · ${action}`}</span>
        </button>;
      })}
      {chapter.story && <button className="game-choice game-choice-mission story-card" onClick={onStory} aria-label={`Histoire : ${chapter.story}`}><span className="choice-label">L’histoire</span><div className="choice-picture"><BookArt/><span><Icon name="book" size={30}/></span></div><strong>{chapter.story}</strong><small>{index === 1 ? 'Un petit goûter à partager avec Milo.' : 'Une pomme à retrouver au café…'}</small><span className="choice-start"><Icon name="sound" size={18}/>Écouter</span></button>}
    </div> : <p className="coming-soon">Milo prépare de nouvelles aventures. À bientôt !</p>}
    <footer className="home-footer"><span className="little-dash"/> Chaque jeu avance à ton rythme. À l’étape 3, on rejoue ! <span className="little-dash"/></footer>
  </main>;
}

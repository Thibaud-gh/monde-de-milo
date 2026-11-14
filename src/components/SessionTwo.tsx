import { useEffect, useRef, useState } from 'react';
import { foods } from '../content/week1';
import { playAudio, stopAudio } from '../lib/audio';
import { snackStory } from '../content/session2';
import { getStore, record } from '../lib/store';
import { FoodArt, Milo } from './Art';
import { Icon } from './Icon';
export function SessionTwoStory({ onHome }: { onHome: () => void }) {
  const [page, setPage] = useState(0);
  const [autoPlay, setAutoPlay] = useState(true);
  const [audioError, setAudioError] = useState(false);
  const [player] = useState(() => new Audio());
  const [sessionId] = useState(() => crypto.randomUUID());
  const autoPlayRef = useRef(true);
  const nextPageTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const visited = useRef(new Set<number>());
  const complete = useRef(false);
  const current = snackStory[page];
  const isLastPage = page === snackStory.length - 1;
  function changePage(nextPage: number) {
    clearTimeout(nextPageTimer.current);
    stopAudio();
    setPage(nextPage);
  }
  function narratePage() {
    clearTimeout(nextPageTimer.current);
    setAudioError(false);
    playAudio(current.audio, current.text, () => {
      if (autoPlayRef.current && !isLastPage) {
        // Leave time to spot the cheese before Milo does.
        nextPageTimer.current = setTimeout(() => changePage(page + 1), current.hat && current.thought ? 2200 : 900);
      }
    }, () => setAudioError(true), undefined, player);
  }
  function toggleAutoPlay() {
    const enabled = !autoPlayRef.current;
    autoPlayRef.current = enabled;
    setAutoPlay(enabled);
    clearTimeout(nextPageTimer.current);
    if (enabled && !isLastPage) narratePage();
  }
  function replayPage() {
    record({ kind: 'engagement', contentId: 'milo-snack', sessionId, event: 'story_audio_replay', page });
    narratePage();
  }
  useEffect(() => {
    const start = Date.now();
    const familiar = getStore().events.some(e => e.payload.kind === 'engagement' && e.payload.contentId === 'milo-snack' && e.payload.event === 'story_open');
    record({ kind: 'engagement', contentId: 'milo-snack', sessionId, event: 'story_open', familiar });
    return () => { stopAudio(); record({ kind: 'engagement', contentId: 'milo-snack', sessionId, event: 'story_close', durationSeconds: Math.round((Date.now() - start) / 1000), familiar }); };
  }, [sessionId]);
  useEffect(() => {
    narratePage();
    visited.current.add(page);
    record({ kind: 'engagement', contentId: 'milo-snack', sessionId, event: 'story_page', page });
    if (visited.current.size === snackStory.length && !complete.current) {
      complete.current = true;
      record({ kind: 'engagement', contentId: 'milo-snack', sessionId, event: 'story_complete' });
    }
    return () => {
      clearTimeout(nextPageTimer.current);
      stopAudio();
    };
    // Page narration owns its audio; callbacks from older pages are cancelled.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, sessionId]);
  function restart() {
    visited.current.clear();
    complete.current = false;
    record({ kind: 'engagement', contentId: 'milo-snack', sessionId, event: 'story_replay' });
    changePage(0);
  }
  return <main className="read-together child-screen">
    <header className="story-header">
      <button className="round" onClick={onHome} aria-label="Retour au chapitre"><Icon name="left"/></button>
      <h1>Le goûter de Milo</h1>
      <span>{page + 1} / {snackStory.length}</span>
    </header>
    <div className="snack-illustration">
      <div className="snack-window"/>
      <div className="snack-milo">
        <Milo happy={page > 1 && !current.thought} waving={isLastPage}/>
        {current.hat && <div className="snack-cheese-hat" role="img" aria-label="Un morceau de fromage sur la tête de Milo"><FoodArt food="cheese"/></div>}
      </div>
      {current.thought && <div className="snack-thought" role="img" aria-label={`Milo pense à ${foods[current.thought].name}`}>
        <FoodArt food={current.thought}/>
      </div>}
      {current.food && <div className="snack-food"><FoodArt food={current.food}/></div>}
      <div className="snack-table"/>
    </div>
    <div className="story-caption">
      <p>{current.text}</p>
      <button className="round yellow" aria-label="Réécouter la page" onClick={replayPage}><Icon name="sound"/></button>
    </div>
    {audioError && <button className="audio-notice" onClick={replayPage}>Touche ici pour écouter.</button>}
    <nav className="story-controls snack-story-controls" aria-label="Les pages">
      <button className="round" disabled={page === 0} aria-label="Page précédente" onClick={() => changePage(page - 1)}><Icon name="left"/></button>
      <button className="story-autoplay" type="button" aria-pressed={autoPlay} onClick={toggleAutoPlay}>
        <Icon name={autoPlay ? 'pause' : 'play'} size={18}/> Lecture automatique
      </button>
      {isLastPage
        ? <button className="primary" onClick={restart}><Icon name="refresh"/> Encore !</button>
        : <button className="round" aria-label="Page suivante" onClick={() => changePage(page + 1)}><Icon name="right"/></button>}
    </nav>
  </main>;
}

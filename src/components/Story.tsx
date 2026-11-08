import { useEffect, useRef, useState } from 'react';
import { storyForLearner } from '../content/week1';
import { record, getStore, useProgress } from '../lib/store';
import { playAudio, stopAudio } from '../lib/audio';
import { StoryScene } from './Art';
import { Icon } from './Icon';
export function Story({ onHome }: { onHome: () => void }) {
  const name = useProgress().learnerName || 'Éva';
  const [story] = useState(() => storyForLearner(name));
  const [page, setPage] = useState(0);
  const [autoplay, setAutoplay] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [error, setError] = useState(false);
  const [sessionId] = useState(() => crypto.randomUUID());
  const completed = useRef(false);
  const visited = useRef(new Set<number>());
  const turnTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const autoplayRef = useRef(false);
  const currentPage = story.pages[page];
  function narrate() {
    setPlaying(true); setError(false);
    playAudio(currentPage.audio, currentPage.text, () => {
      setPlaying(false);
      if (autoplayRef.current && page < story.pages.length - 1) turnTimer.current = setTimeout(() => setPage(p => p + 1), 1800);
      if (page === story.pages.length - 1) { autoplayRef.current = false; setAutoplay(false); }
    }, () => { setPlaying(false); setError(true); autoplayRef.current = false; setAutoplay(false); });
  }
  useEffect(() => {
    const startedAt = Date.now();
    const familiar = getStore().events.some(e => e.payload.kind === 'engagement' && e.payload.contentId === story.id && e.payload.event === 'story_open');
    record({ kind: 'engagement', contentId: story.id, sessionId, event: 'story_open', familiar });
    return () => {
      stopAudio(); if (turnTimer.current) clearTimeout(turnTimer.current);
      record({ kind: 'engagement', contentId: story.id, sessionId, event: 'story_close', durationSeconds: Math.round((Date.now() - startedAt) / 1000), familiar });
    };
  }, [sessionId]);
  useEffect(() => {
    visited.current.add(page);
    record({ kind: 'engagement', contentId: story.id, sessionId, event: 'story_page', page });
    // Completion means every page was visited; it is never evidence of comprehension.
    if (visited.current.size === story.pages.length && !completed.current) {
      completed.current = true; record({ kind: 'engagement', contentId: story.id, sessionId, event: 'story_complete' });
    }
    narrate();
    return () => { stopAudio(); if (turnTimer.current) clearTimeout(turnTimer.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);
  function toggleAuto() {
    autoplayRef.current = !autoplayRef.current; setAutoplay(autoplayRef.current);
    if (turnTimer.current) clearTimeout(turnTimer.current);
    if (!autoplayRef.current) { stopAudio(); setPlaying(false); }
    if (autoplayRef.current && !playing) narrate();
  }
  function replayPage() {
    record({ kind: 'engagement', contentId: story.id, sessionId, event: 'story_audio_replay', page }); narrate();
  }
  function restart() {
    record({ kind: 'engagement', contentId: story.id, sessionId, event: 'story_replay' });
    completed.current = false; visited.current.clear();
    autoplayRef.current = false; setAutoplay(false); setPage(0);
  }
  return <main className="story child-screen"><header className="story-header"><button className="round" aria-label="Retour au chapitre" onClick={onHome}><Icon name="left"/></button><h1>{story.title}</h1><button className={`round ${autoplay ? 'yellow' : ''}`} aria-label={autoplay ? 'Arrêter la lecture automatique' : 'Lecture automatique'} aria-pressed={autoplay} onClick={toggleAuto}><Icon name={autoplay ? 'pause' : 'play'}/></button></header>
    <div className="storybook"><div className="story-art"><StoryScene scene={currentPage.scene}/></div><div className="story-caption"><p>{currentPage.text}</p><button className="round yellow" aria-label="Réécouter la page" onClick={replayPage}><Icon name="sound"/></button></div></div>
    {error && <button className="audio-notice" onClick={replayPage}>Touche ici pour écouter.</button>}
    <nav className="story-controls" aria-label="Les pages"><button className="round" aria-label="Page précédente" disabled={page === 0} onClick={() => setPage(p => p - 1)}><Icon name="left"/></button><div className="page-leaves" aria-hidden="true">{story.pages.map((_, i) => <span className={i === page ? 'current' : ''} key={i}/>)}</div>{page === story.pages.length - 1 ? <button className="primary" onClick={restart}><Icon name="refresh"/> Encore !</button> : <button className="round" aria-label="Page suivante" onClick={() => setPage(p => p + 1)}><Icon name="right"/></button>}</nav>
  </main>;
}

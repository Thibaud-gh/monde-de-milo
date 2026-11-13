import { initializeMenuMusic, setMenuMusicActive } from './lib/menuMusic';
import { useEffect, useState } from 'react';
import type { ActivityId } from './content/week1';
import { Home } from './components/Home';
import { Chapter } from './components/Chapter';
import type { GameKind } from './lib/progression';
import { canStartActivity } from './lib/progression';
import type { LearningEvent, Payload } from './lib/model';
import { createLearningEvent, getStore } from './lib/store';
import { SessionTwoGame, SessionTwoStory } from './components/SessionTwo';
import { CafeGame } from './components/CafeGame';
import { Game } from './components/Game';
import { Story } from './components/Story';
import { Dashboard } from './components/Dashboard';
import { ParentGate } from './components/ParentGate';
import { stopAudio } from './lib/audio';
type Screen = 'home' | 'chapter' | 'story' | 'parent' | ActivityId;
export default function App() {
  const [screen, setScreen] = useState<Screen>(() => location.hash.startsWith('#/parent') ? 'parent' : 'home');
  const [chapterIndex, setChapterIndex] = useState(0);
  const [gameKind, setGameKind] = useState<GameKind>('understanding');
  const [gate, setGate] = useState(screen === 'parent');
  const [parentPassed, setParentPassed] = useState(false);
  const [cafeReplay, setCafeReplay] = useState<LearningEvent[]>();
  useEffect(initializeMenuMusic, []);
  useEffect(() => { setMenuMusicActive(!gate && (screen === 'home' || screen === 'chapter')); }, [screen, gate]);
  useEffect(() => {
    const changed = () => { if (location.hash.startsWith('#/parent')) { setScreen('parent'); if (!parentPassed) setGate(true); } else setScreen('home'); };
    window.addEventListener('hashchange', changed); return () => window.removeEventListener('hashchange', changed);
  }, [parentPassed]);
  function go(next: Screen) { setMenuMusicActive(next === 'home' || next === 'chapter'); stopAudio(); setScreen(next); window.scrollTo(0, 0); }
  function goHome() { go('home'); setGate(false); history.replaceState(null, '', location.pathname + location.search); }
  function openChapter(index: number) { setChapterIndex(index); go('chapter'); }
  function openParent() { setMenuMusicActive(false); if (parentPassed) { go('parent'); history.replaceState(null, '', '#/parent'); } else setGate(true); }
  function recordCafeReplay(payload: Payload) {
    const event = createLearningEvent(payload);
    setCafeReplay(events => events && [...events, event]);
  }
  if (gate) return <><Home onChapter={openChapter} onParent={openParent}/><ParentGate onPass={() => { setParentPassed(true); setGate(false); go('parent'); history.replaceState(null, '', '#/parent'); }} onClose={goHome}/></>;
  if (screen === 'parent') return <Dashboard onHome={goHome} onRestartCafe={() => {
    setCafeReplay([]);
    history.replaceState(null, '', location.pathname + location.search);
    openChapter(1);
  }}/>;
  if (screen === 'story') return chapterIndex === 1 ? <SessionTwoStory onHome={() => go('chapter')}/> : <Story onHome={() => go('chapter')}/>;
  if (screen === 'chapter') return <Chapter index={chapterIndex} cafeReplay={cafeReplay} onHome={goHome} onActivity={(kind, id) => {
    const savedEvents = getStore().events;
    const events = chapterIndex === 1 && kind === 'understanding' ? cafeReplay ?? savedEvents : savedEvents;
    if (canStartActivity(events, chapterIndex, id, kind)) { setGameKind(kind); go(id); }
  }} onStory={() => go('story')}/>;
  if (screen !== 'home') return gameKind === 'speaking' ? <SessionTwoGame key={screen} activity={screen} onHome={() => go('chapter')}/> : chapterIndex === 1 ? <CafeGame key={screen} activity={screen} replay={cafeReplay ? { events: cafeReplay, record: recordCafeReplay } : undefined} onHome={() => go('chapter')}/> : <Game key={`${chapterIndex}-${screen}`} chapter={chapterIndex} activity={screen} onHome={() => go('chapter')}/>;
  return <Home onChapter={openChapter} onParent={openParent}/>;
}

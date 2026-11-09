import { initializeMenuMusic, setMenuMusicActive } from './lib/menuMusic';
import { useEffect, useState } from 'react';
import type { ActivityId } from './content/week1';
import { Home } from './components/Home';
import { Chapter } from './components/Chapter';
import { canStartActivity } from './lib/progression';
import { getStore } from './lib/store';
import { SessionTwoGame, SessionTwoStory } from './components/SessionTwo';
import { Game } from './components/Game';
import { Story } from './components/Story';
import { Dashboard } from './components/Dashboard';
import { ParentGate } from './components/ParentGate';
import { stopAudio } from './lib/audio';
type Screen = 'home' | 'chapter' | 'story' | 'parent' | ActivityId;
export default function App() {
  const [screen, setScreen] = useState<Screen>(() => location.hash.startsWith('#/parent') ? 'parent' : 'home');
  const [chapterIndex, setChapterIndex] = useState(0);
  const [gate, setGate] = useState(screen === 'parent');
  const [parentPassed, setParentPassed] = useState(false);
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
  if (gate) return <><Home onChapter={openChapter} onParent={openParent}/><ParentGate onPass={() => { setParentPassed(true); setGate(false); go('parent'); history.replaceState(null, '', '#/parent'); }} onClose={goHome}/></>;
  if (screen === 'parent') return <Dashboard onHome={goHome}/>;
  if (screen === 'story') return chapterIndex === 1 ? <SessionTwoStory onHome={() => go('chapter')}/> : <Story onHome={() => go('chapter')}/>;
  if (screen === 'chapter') return <Chapter index={chapterIndex} onHome={goHome} onActivity={id => { if (canStartActivity(getStore().events, chapterIndex, id)) go(id); }} onStory={() => go('story')}/>;
  if (screen !== 'home') return chapterIndex === 1 ? <SessionTwoGame key={screen} activity={screen} onHome={() => go('chapter')}/> : <Game key={screen} activity={screen} onHome={() => go('chapter')}/>;
  return <Home onChapter={openChapter} onParent={openParent}/>;
}

import { initializeMenuMusic, setMenuMusicActive } from './lib/menuMusic';
import { useEffect, useState } from 'react';
import type { ActivityId } from './content/week1';
import { Home } from './components/Home';
import { Chapter } from './components/Chapter';
import type { GameKind } from './lib/progression';
import { activityKey, canStartActivity } from './lib/progression';
import { getStore, record } from './lib/store';
import { SessionTwoGame, SessionTwoStory } from './components/SessionTwo';
import { CafeGame } from './components/CafeGame';
import { Game } from './components/Game';
import { ServiceListening } from './components/ServiceListening';
import { ServiceSpeaking } from './components/ServiceSpeaking';
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
  if (screen === 'chapter') return <Chapter index={chapterIndex} onHome={goHome} onActivity={(kind, id) => {
    if (canStartActivity(getStore().events, chapterIndex, id, kind)) { setGameKind(kind); go(id); }
  }} onStory={() => go('story')} onRestartListening={() => record({
    kind: 'engagement',
    contentId: activityKey(chapterIndex, 'find', 'understanding'),
    sessionId: crypto.randomUUID(),
    event: 'activity_reset',
  })}/>;
  if (screen !== 'home') {
    const back = () => go('chapter');
    if (chapterIndex === 2) {
      return gameKind === 'speaking' ? <ServiceSpeaking onHome={back}/> : <ServiceListening key={screen} activity={screen} onHome={back}/>;
    }
    if (gameKind === 'speaking') return <SessionTwoGame onHome={back}/>;
    if (chapterIndex === 1) return <CafeGame key={screen} activity={screen} onHome={back}/>;
    return <Game key={screen} chapter={chapterIndex} activity={screen} onHome={back}/>;
  }
  return <Home onChapter={openChapter} onParent={openParent}/>;
}

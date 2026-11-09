import type { CSSProperties } from 'react';
export type IconName = 'star' | 'home' | 'music' | 'music-off' | 'sound' | 'play' | 'pause' | 'left' | 'right' | 'book' | 'basket' | 'hand' | 'flag' | 'help' | 'parent' | 'close' | 'check' | 'download' | 'refresh' | 'flower';
const paths: Record<IconName, React.ReactNode> = {
  star: <path d="m12 2 3.1 6.3 6.9 1-5 4.9 1.2 6.8-6.2-3.2L5.8 21 7 14.2l-5-4.9 6.9-1Z"/>,
  flower: <path d="M12 1v22M1 12h22M4 4l16 16M20 4 4 20"/>,
  music: <><path d="M9 17V5l11-2v12M9 8l11-2"/><ellipse cx="6" cy="18" rx="3" ry="2"/><ellipse cx="17" cy="16" rx="3" ry="2"/></>,
  'music-off': <><path d="M9 13V5l11-2v12M9 8l11-2M3 3l18 18"/><ellipse cx="6" cy="18" rx="3" ry="2"/><ellipse cx="17" cy="16" rx="3" ry="2"/></>,
  home: <><path d="m3 11 9-8 9 8M5 10v11h5v-7h4v7h5V10"/></>,
  sound: <><path d="M11 4 6 8H3v8h3l5 4ZM15 8c3 2 3 6 0 8M18 4c6 4 6 12 0 16"/></>,
  play: <path d="m8 4 13 8-13 8Z"/>, pause: <><path d="M8 4v16M16 4v16"/></>,
  left: <path d="m15 5-7 7 7 7"/>, right: <path d="m9 5 7 7-7 7"/>,
  book: <><path d="M12 6C8 3 4 3 2 4v15c3-1 6-1 10 2 4-3 7-3 10-2V4c-3-1-6-1-10 2ZM12 6v15"/></>,
  basket: <><path d="m3 10 3 11h12l3-11ZM7 10l5-8 5 8M9 14v3M15 14v3"/></>,
  hand: <><path d="M8 12V5a2 2 0 0 1 4 0v6-2a2 2 0 0 1 4 0v2a2 2 0 0 1 4 0v5c0 4-3 6-7 6-2 0-4-1-5-3l-4-5c-2-3 0-5 2-3l2 2"/></>,
  flag: <><path d="M5 22V3c5-4 9 4 15 0v12c-6 4-10-4-15 0"/></>,
  help: <><path d="M8 8a4 4 0 1 1 6 3c-2 1-2 2-2 4M12 19h.01"/><circle cx="12" cy="12" r="10"/></>,
  parent: <><circle cx="12" cy="7" r="3"/><path d="M5 21v-3a7 7 0 0 1 14 0v3M9 21v-4M15 21v-4"/></>,
  close: <path d="m5 5 14 14M19 5 5 19"/>, check: <path d="m4 12 5 5L20 6"/>,
  download: <path d="M12 3v13m-5-5 5 5 5-5M4 17v4h16v-4"/>,
  refresh: <><path d="M20 8a9 9 0 1 0 1 7M20 3v6h-6"/></>,
};
export function Icon({ name, size = 24, style }: { name: IconName; size?: number; style?: CSSProperties }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={style}>{paths[name]}</svg>;
}

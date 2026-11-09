import { toggleMenuMusic, useMenuMusicEnabled } from '../lib/menuMusic';
import { Icon } from './Icon';
export function MusicButton() {
  const enabled = useMenuMusicEnabled();
  return <button className="music-button" aria-pressed={enabled} aria-label={enabled ? 'Couper la musique' : 'Activer la musique'} onClick={toggleMenuMusic}><Icon name={enabled ? 'music' : 'music-off'} size={21}/><span>Musique</span></button>;
}

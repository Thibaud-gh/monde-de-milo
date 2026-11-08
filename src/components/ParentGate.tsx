import { useState } from 'react';
import { Icon } from './Icon';
export function ParentGate({ onPass, onClose }: { onPass: () => void; onClose: () => void }) {
  const [a] = useState(() => 12 + Math.floor(Math.random() * 8));
  const [b] = useState(() => 6 + Math.floor(Math.random() * 5));
  const [answer, setAnswer] = useState('');
  const [error, setError] = useState(false);
  return <div className="gate-backdrop"><section className="parent-gate" role="dialog" aria-modal="true" aria-labelledby="gate-title"><button className="round gate-close" aria-label="Retour au café" onClick={onClose}><Icon name="close"/></button><Icon name="parent" size={36}/><h1 id="gate-title">Le coin des parents</h1><p>Pour les grands : combien font {a} + {b} ?</p><form onSubmit={e => { e.preventDefault(); if (Number(answer) === a + b && answer.trim()) onPass(); else setError(true); }}><label htmlFor="gate-answer">Votre réponse</label><input id="gate-answer" inputMode="numeric" autoComplete="off" value={answer} onChange={e => { setAnswer(e.target.value); setError(false); }}/><button className="primary" type="submit">Entrer</button></form>{error && <p role="alert">Encore un petit essai.</p>}</section></div>;
}

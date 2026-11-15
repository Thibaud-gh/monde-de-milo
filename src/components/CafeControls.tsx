import { useEffect, useRef, useState } from 'react';
import { cafeFoods } from '../content/cafe';
import { have, request } from '../content/session2';
import { foods, type Food } from '../content/week1';
import { isCafeState, useCafeChannel, type CafeAction, type CafeState } from '../lib/liveCafe';
import { FoodArt } from './Art';
import { Icon } from './Icon';

function CafeControls({ cafe, onAction, disabled = false }: {
  cafe: CafeState; onAction: (action: CafeAction, food?: Food) => void; disabled?: boolean;
}) {
  const [selected, setSelected] = useState<Food | null>(cafe.hintFood);
  const ordering = cafe.phase === 'order';
  const food = ordering ? selected : cafe.food;
  const act = (action: CafeAction) => onAction(action, ordering ? food ?? undefined : undefined);
  return <>
    {ordering && <>
      <p>Listen to her order, then choose what to serve.</p>
      <div className="cafe-parent-menu" role="group" aria-label="Choose what to serve">
        {cafeFoods.map(item => <button key={item} disabled={disabled} lang="fr" aria-pressed={selected === item} onClick={() => setSelected(item)}>
          <FoodArt food={item}/><span>{foods[item].label}</span>
        </button>)}
      </div>
    </>}
    {food && <div className="cafe-order-ticket">
      <FoodArt food={food}/>
      <div><span>{ordering ? 'Ready to serve' : 'On her plate'}</span>
        <strong lang="fr">{ordering ? request(food) : have(food)}</strong></div>
    </div>}
    <div className="cafe-parent-actions">
      <button className="primary" disabled={disabled || !food} onClick={() => act('approve')}>
        <Icon name="check" size={20}/>{ordering ? 'Serve' : 'Next order'}
      </button>
      <button className="secondary" disabled={disabled || cafe.hints === 2 || (cafe.hints === 1 && !food)} onClick={() => act('hint')}>
        <Icon name="sound" size={20}/>{cafe.hints === 0 ? 'Give a starter' : 'Play the whole phrase'}
      </button>
      <button className="secondary" disabled={disabled || !food} onClick={() => act('helped')}>{ordering ? 'Serve with help' : 'Next with help'}</button>
      <button className="text-button" disabled={disabled || !food} onClick={() => act('continue')}>{ordering ? 'Serve anyway' : 'Move on'}</button>
    </div>
  </>;
}

type ResponseTimes = { screen?: number; sound?: number };

export function LiveCafeControls({ owner }: { owner: string }) {
  const [cafe, setCafe] = useState<CafeState>();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  const [times, setTimes] = useState<ResponseTimes>({});
  const lastSeen = useRef(0);
  const activeCafe = useRef<CafeState | undefined>(undefined);
  const lastCommand = useRef<{ id: string; started: number } | undefined>(undefined);
  const timeout = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const { status, send } = useCafeChannel(owner, (event, payload) => {
    if (event === 'cafe-open') void send('request-state', {});
    if (event === 'state' && isCafeState(payload)) {
      const previous = activeCafe.current;
      if (previous?.id === payload.id && payload.version < previous.version) return;
      activeCafe.current = payload;
      lastSeen.current = Date.now();
      setCafe(payload);
      if (previous && (previous.id !== payload.id || payload.version > previous.version)) {
        clearTimeout(timeout.current);
        setPending(false);
        setError('');
      }
    }
    if (event === 'closed' && payload && typeof payload === 'object' && 'id' in payload && payload.id === activeCafe.current?.id) {
      activeCafe.current = undefined;
      setCafe(undefined);
      clearTimeout(timeout.current);
      setPending(false);
    }
    if (event !== 'response' || !payload || typeof payload !== 'object' || !('commandId' in payload) || !('effect' in payload)) return;
    const command = lastCommand.current;
    const { effect } = payload;
    if (!command || command.id !== payload.commandId || (effect !== 'screen' && effect !== 'sound')) return;
    const elapsed = Math.round(performance.now() - command.started);
    setTimes(previous => ({ ...previous, [effect]: elapsed }));
  });

  useEffect(() => {
    if (status !== 'connected') return;
    const requestState = () => {
      if (Date.now() - lastSeen.current > 8500) {
        activeCafe.current = undefined;
        setCafe(undefined);
      }
      void send('request-state', {});
    };
    requestState();
    const timer = setInterval(requestState, 3000);
    return () => clearInterval(timer);
    // The channel lives in a ref and is replaced when the status changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);
  useEffect(() => () => clearTimeout(timeout.current), []);

  function act(action: CafeAction, food?: Food) {
    if (status !== 'connected' || pending || !cafe || cafe.serving || cafe.praising) return;
    const commandId = crypto.randomUUID();
    lastCommand.current = { id: commandId, started: performance.now() };
    setTimes({});
    setError('');
    setPending(true);
    const fail = () => {
      if (lastCommand.current?.id !== commandId || activeCafe.current?.id !== cafe.id || activeCafe.current.version !== cafe.version) return;
      clearTimeout(timeout.current);
      setPending(false);
      setError('Waiting for the iPad. Check that the café game is open.');
      void send('request-state', {});
    };
    timeout.current = setTimeout(fail, 2500);
    const sent = send('command', { id: cafe.id, version: cafe.version, action, commandId, food });
    if (!sent) return fail();
    void sent.then(result => {
      if (result !== 'ok') fail();
    }).catch(fail);
  }

  return <section className="dashboard-section live-cafe-controls">
    <h2>Live café</h2>
    <p>Open <strong lang="fr">Le petit café</strong> on the iPad and sign in with the same parent account. Keep this page open while you play.</p>
    <div className="cafe-connection" role="status">
      <span className={status === 'connected' && cafe ? 'status-dot' : 'status-dot waiting'}/>
      {status === 'unavailable' ? 'Live connection unavailable. Retrying…' :
        status === 'connecting' ? 'Connecting…' : cafe ? 'iPad connected' : 'Waiting for the iPad…'}
    </div>
    {status === 'connected' && cafe && (
      cafe.phase === 'finished' ? <p>The café visit is complete.</p> :
      <CafeControls key={`${cafe.id}:${cafe.round}`} cafe={cafe} onAction={act} disabled={pending || cafe.serving || cafe.praising}/>
    )}
    {error && <p role="alert">{error}</p>}
    {(times.screen !== undefined || times.sound !== undefined) && <details className="cafe-response-times">
      <summary>Response timing</summary>
      <p>{times.screen !== undefined && <span>Tap to screen confirmation {times.screen} ms. </span>}
        {times.sound !== undefined && <span>Tap to sound confirmation {times.sound} ms.</span>}</p>
      <p>Includes the confirmation’s trip back from the iPad.</p>
    </details>}
  </section>;
}

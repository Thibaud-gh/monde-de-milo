import { useId } from 'react';
import type { Food, StorySceneId } from '../content/week1';
export function FoodArt({ food, className = '' }: { food: Food; className?: string }) {
  return <svg className={className} viewBox="0 0 180 180" fill="none" aria-hidden="true">
    {food === 'apple' && <>
      <path d="M90 60q-4-26 13-40" stroke="#724B39" strokeWidth="8" strokeLinecap="round"/>
      <path d="M98 43q3-29 40-24-6 29-40 24Z" fill="#638557"/>
      <path d="M100 41q13-11 28-16" stroke="#9BB375" strokeWidth="2.5" strokeLinecap="round"/>
      <path d="M88 57C62 39 32 46 25 78c-8 33 9 74 38 83 12 4 17-1 26-1 10 0 16 5 27 1 29-10 48-53 39-84-8-29-35-38-60-23Z" fill="#BB4044"/>
      <path d="M88 57C58 39 29 50 25 83c-4 29 10 58 31 66 13 6 21 0 32 2 28 6 51-27 54-55 3-23-5-39-20-46-14-3-23 2-34 7Z" fill="#DF5851"/>
      <path d="M38 92q0-20 14-27" stroke="#F8A17E" strokeWidth="7" strokeLinecap="round"/>
      <path d="M77 59q12 8 25 0" stroke="#A64440" strokeWidth="3.5" strokeLinecap="round"/>
      <path d="m115 125 1-1m9-12 1-1m-14 22 1-1" stroke="#F18B69" strokeWidth="3" strokeLinecap="round"/>
    </>}
    {food === 'banana' && <>
      <path d="m128 27 16 4-4 17c6 37-3 66-33 88-26 20-62 19-79-1l-5-9 5-6c23 10 48 0 68-18 17-15 28-40 28-56Z" fill="#C48D35"/>
      <path d="m127 32 12 3-4 14c5 29-5 55-29 77-22 19-51 23-73 7l-6-9c26 6 50-5 70-23 18-18 27-42 27-55Z" fill="#F4C544"/>
      <path d="m127 34 7 1-5 18c-1 29-17 53-40 69-19 13-38 16-53 10 21 1 43-11 61-30 18-18 25-41 27-55Z" fill="#FFE995"/>
      <path d="m126 23 17 4-2 8-15-4Zm-102 96 6 2 3 12-7-4-5-6Z" fill="#76513A"/>
      <path d="M70 139q20-3 36-16" stroke="#DCAB38" strokeWidth="2.5" strokeLinecap="round"/>
      <path d="m123 92 1-1m-5 9 1-1" stroke="#AD7738" strokeWidth="3" strokeLinecap="round"/>
    </>}
    {food === 'bread' && <g transform="rotate(-24 90 90)">
      <path d="M12 102c-2-19 16-38 42-43 19-5 62-7 83-1 19 6 31 18 32 34 1 20-20 34-49 36l-61 3c-25 0-45-9-47-29Z" fill="#AB6739"/>
      <path d="M13 98c0-18 17-33 42-39 22-5 60-7 82-1 12 4 23 12 27 21-3 17-23 30-48 33l-55 4c-20 1-39-4-48-18Z" fill="#E4A654"/>
      <path d="M40 67q15-5 24 27-15 3-24-27Zm33-8q16-4 24 29-15 2-24-29Zm34-2q17-1 22 27-14 2-22-27Z" fill="#C98542"/>
      <path d="M39 66q11-4 20 22-13-7-20-22Zm34-8q12-3 20 24-13-8-20-24Zm34-2q12 0 18 22-13-6-18-22Z" fill="#FFDF9F"/>
      <path d="m31 97 4-1m34 11 5-1m65-13 4-2m-89 11 2-1" stroke="#F9CE85" strokeWidth="2.8" strokeLinecap="round"/>
    </g>}
    {food === 'water' && <>
      <path d="m45 39 12 111q32 17 65 0l13-111Z" fill="#F2F9F5" stroke="#557D91" strokeWidth="3.8" strokeLinejoin="round"/>
      <g className="cafe-water-fill">
        <path d="m51 76 9 71q29 13 59 0l9-71Z" fill="#79B8CB"/>
        <path d="m111 79-7 71q8-1 15-4l9-70Z" fill="#64A4B9"/>
        <path d="M51 76q13-8 37-3 21 4 40 0-2 12-37 12-27 0-40-9Z" fill="#B8E1E3"/>
        <path d="m72 126 6 1m22-31 3-1" stroke="#D4EFF0" strokeWidth="2.7" strokeLinecap="round"/>
      </g>
      <ellipse cx="90" cy="38" rx="45" ry="10" fill="#F1F9F8" stroke="#557D91" strokeWidth="4"/>
      <path d="M56 38q16-6 35-5m-32 24 5 40m1 9 1 7" stroke="white" strokeWidth="5" strokeLinecap="round"/>
      <path d="M63 150q27 10 53 0" stroke="#B9D4D7" strokeWidth="3" strokeLinecap="round"/>
    </>}
    {food === 'milk' && <g strokeLinejoin="round">
      <path d="m43 58 12-28 59-5 19 16 8 106-32 14-57-7Z" fill="#FDF4D9" stroke="#517A83" strokeWidth="3.5"/>
      <path d="m100 54 33-13 8 106-32 14Z" fill="#C1D9CF"/>
      <path d="m43 58 57-4 14-29-59 5Z" fill="#73A7AA"/>
      <path d="m100 54 14-29 19 16Z" fill="#4D7E88"/>
      <path d="m55 30-1-10 59-5 1 10Z" fill="#F4F0D4" stroke="#517A83" strokeWidth="3.5"/>
      <path d="m50 125 57 6 1 12-57-6Zm57 6 31-13 1 12-31 13Z" fill="#78AAAD"/>
      <g transform="translate(75 89) rotate(-4)">
        <path d="M-12-8q-9-13-16-8-1 11 12 14M12-9q8-12 15-8 1 12-12 15" fill="#507680"/>
        <path d="M-16-8q2-13 16-13t16 13l-3 18h-26Z" fill="#FFFCED" stroke="#507680" strokeWidth="2.5"/>
        <path d="M-14-11q2-9 12-9-1 11-7 12Z" fill="#507680"/>
        <ellipse cy="8" rx="14" ry="8" fill="#E8B994"/>
        <path d="M-7-4h.3M7-4h.3m-13 12h.3m11 0h.3" stroke="#4A5F62" strokeWidth="3.4" strokeLinecap="round"/>
      </g>
    </g>}
    {food === 'cheese' && <>
      <path d="M21 95 110 42q29 1 47 30l-2 56q-14 11-37 15l-96-6Z" fill="#D39A37" stroke="#B58136" strokeWidth="3.5" strokeLinejoin="round"/>
      <path d="m21 95 89-53q29 1 47 30-12 10-37 16Z" fill="#FFE291"/>
      <path d="m21 95 99-7-2 55-96-6Z" fill="#F5C44F"/>
      <path d="M120 88q24-4 37-16l-2 56q-14 11-37 15Z" fill="#E4AB3D"/>
      <path d="m22 131 96 6q23-4 37-15v6q-14 11-37 15l-96-6Z" fill="#D39336"/>
      <g fill="#D39A37">
        <ellipse cx="88" cy="75" rx="9" ry="3.5" transform="rotate(-15 88 75)"/>
        <ellipse cx="118" cy="60" rx="6" ry="3"/>
        <circle cx="45" cy="109" r="5"/>
        <ellipse cx="89" cy="119" rx="8" ry="7"/>
      </g>
      <path d="M132 102q5-9 10-8 4 8-6 14-6 3-4-6Z" fill="#BA8431"/>
      <path d="m28 95 85-6" stroke="#FFE49A" strokeWidth="2.5" strokeLinecap="round"/>
    </>}
  </svg>;
}
export function Milo({ waving = false, happy = false, serving = false, expression, className = '' }: {
  waving?: boolean; happy?: boolean; serving?: boolean;
  expression?: 'hungry' | 'thirsty' | 'eating' | 'drinking'; className?: string;
}) {
  const needsSomething = expression === 'hungry' || expression === 'thirsty';
  const content = happy || expression === 'eating' || expression === 'drinking';
  return <svg className={className} viewBox="0 0 320 350" aria-hidden="true">
    <g fill="#B47D4F"><ellipse cx="105" cy="321" rx="43" ry="24"/><ellipse cx="218" cy="321" rx="43" ry="24"/></g>
    <path d={serving ? 'M93 184C65 180 54 205 33 201C10 196 10 220 32 225C69 239 96 227 114 229' : 'M93 184c-38 24-44 76-27 83 24 10 42-23 48-38'} fill="#C18B58"/>
    <path className={waving && !serving ? 'milo-raised-paw' : undefined} d={serving ? 'M225 184C255 180 266 205 287 201C310 196 310 220 288 225C251 239 224 227 206 229' : waving ? 'M225 190c26-6 39-45 61-30 23 17-12 65-46 67' : 'M225 184c38 24 44 76 27 83-24 10-42-23-48-38'} fill="#C18B58"/>
    <path d="M88 199c5-23 29-43 72-43s68 20 73 43l16 99c-36 32-140 32-177 0Z" fill="#C18B58"/>
    <path d="m110 183 12 46h77l13-46 12 9-12 46 14 73c-35 13-97 14-132 0l14-73-12-46Z" fill="#365878"/>
    <path d="M136 266h50v30c-15 8-35 8-50 0Z" fill="#F8D767"/>
    <path d="m142 272 11 9 11-9 11 9 6-9" fill="none" stroke="#E8BB43" strokeWidth="2"/>
    <path d="M100 300q27 10 60 10t61-9m-83-28 1 21q21 7 44 0v-22" fill="none" stroke="#9DB6B9" strokeWidth="2.2" strokeDasharray="4 5" strokeLinecap="round"/>
    <circle cx="75" cy="60" r="35" fill="#B47D4F"/><circle cx="246" cy="60" r="35" fill="#B47D4F"/>
    <circle cx="76" cy="61" r="20" fill="#DEB78B"/><circle cx="246" cy="61" r="20" fill="#DEB78B"/>
    <path d="M56 113c0-58 47-89 104-89s105 32 105 89c0 62-43 97-105 97S56 175 56 113" fill="#C18B58"/>
    <path d="M100 146c0-26 29-43 61-43s60 17 60 43-27 47-60 47-61-21-61-47" fill="#E8C7A0"/>
    {content ? <g stroke="#47362F" strokeWidth="6" fill="none" strokeLinecap="round"><path d="M97 108q10-12 20 0M205 108q10-12 20 0"/></g> : <g fill="#47362F"><ellipse cx="108" cy="106" rx="6" ry="8"/><ellipse cx="213" cy="106" rx="6" ry="8"/></g>}
    {needsSomething && <path d="m98 93 17-8m91 0 17 8" fill="none" stroke="#775134" strokeWidth="5" strokeLinecap="round"/>}
    <ellipse cx="161" cy="136" rx="16" ry="11" fill="#47362F"/>
    {expression === 'eating' ? <ellipse cx="161" cy="162" rx="20" ry="13" fill="#47362F"/> :
      <path d={needsSomething ? 'M161 145v11m-14 9q14-16 28 0' : 'M161 145v12m-18 0q9 15 18 0 9 15 18 0'}
        fill="none" stroke="#47362F" strokeWidth="4" strokeLinecap="round"/>}
    <ellipse cx="88" cy="139" rx="14" ry="8" fill="#D59A79"/><ellipse cx="234" cy="139" rx="14" ry="8" fill="#D59A79"/>
    <path d="m135 43 5-7m13 5 3-8" stroke="#A87349" strokeWidth="3" strokeLinecap="round"/>
  </svg>;
}
export function BasketArt() {
  const id = useId();
  return <svg viewBox="0 0 220 180" aria-hidden="true"><defs><pattern id={id} width="16" height="16" patternUnits="userSpaceOnUse"><path d="M0 0h16v16H0Z" fill="#D6A668"/><path d="M0 8h16M8 0v16" stroke="#B9874E" strokeWidth="2"/></pattern></defs><path d="M59 79c0-80 102-80 102 0" fill="none" stroke="#9A6B40" strokeWidth="12"/><path d="m24 79 20 84c41 9 89 9 132 0l20-84Z" fill={`url(#${id})`}/><path d="M23 79q87 19 174 0" stroke="#9A6B40" strokeWidth="10" fill="none" strokeLinecap="round"/><path d="m24 78 19 42 37-35" fill="#FFF9ED"/><path d="m33 83 7 13m7-11 6 12m6-9 5 8" stroke="#D9534F" strokeWidth="3"/></svg>;
}
export function BookArt() {
  return <svg viewBox="0 0 220 180" aria-hidden="true"><path d="m34 32 151-14 11 130-152 15Z" fill="#365878"/><path d="m44 34 131-11 10 119-132 13Z" fill="#FFF9ED"/><path d="m53 25 131-9 9 121-130 11Z" fill="#D9534F"/><path d="m69 42 98-7 5 75-98 7Z" fill="#F8D767"/><circle cx="123" cy="72" r="23" fill="#C18B58"/><circle cx="104" cy="55" r="8" fill="#C18B58"/><circle cx="140" cy="53" r="8" fill="#C18B58"/><ellipse cx="123" cy="81" rx="13" ry="10" fill="#E8C7A0"/><path d="m116 68 1 0m14-1h1" stroke="#47362F" strokeWidth="4" strokeLinecap="round"/><ellipse cx="123" cy="78" rx="4" ry="3" fill="#47362F"/><path d="m83 128 74-5" stroke="#FFF9ED" strokeWidth="5" strokeLinecap="round"/></svg>;
}
export function CafeScene({ className = '' }: { className?: string }) {
  const id = useId();
  return <svg className={className} viewBox="0 0 1100 530" aria-hidden="true">
    <defs><pattern id={`${id}-wall`} width="38" height="38" patternUnits="userSpaceOnUse"><path d="M19 0v38" stroke="#E6E3CA" strokeWidth="1"/></pattern><pattern id={`${id}-cloth`} width="52" height="52" patternUnits="userSpaceOnUse"><rect width="52" height="52" fill="#F9F3D8"/><path d="M0 13h52M13 0v52" stroke="#A9C8D0" strokeWidth="13" opacity=".5"/></pattern><clipPath id={`${id}-window`}><path d="M150 180a100 100 0 0 1 200 0v160H150Z"/></clipPath></defs>
    <rect width="1100" height="530" fill="#FFF9ED"/><rect width="1100" height="530" fill={`url(#${id}-wall)`}/>
    <g clipPath={`url(#${id}-window)`}><rect x="140" y="65" width="220" height="280" fill="#CCE5EA"/><path d="M120 230c55-20 75-8 94 4 35-30 70-25 104-8 20-16 43-10 65 2v130H120Z" fill="#97B6A3"/><path d="M172 152q25-33 51-6 24-19 43 7Z" fill="#FFF9ED"/></g>
    <path d="M150 340V180a100 100 0 0 1 200 0v160ZM250 81v259M150 227h200" stroke="#6D929D" strokeWidth="9" fill="none"/>
    <path d="M126 345h247" stroke="#6D929D" strokeWidth="15" strokeLinecap="round"/>
    <path d="M888 264c-9-55 14-77 31-103m-30 66c-36-10-42-37-36-56m42 29c32-4 43-29 40-47" stroke="#65885C" strokeWidth="9" fill="none"/>
    <path d="m852 260 13 66h52l14-66Z" fill="#D6A668"/>
    <path d="M815 335h153" stroke="#A97D59" strokeWidth="12" strokeLinecap="round"/>
    <rect x="832" y="95" width="110" height="90" rx="3" fill="#365878" transform="rotate(4 887 140)"/>
    <path d="M857 119h58m-59 15h45m-45 15h54m-55 15h31" stroke="#EAF1E9" strokeWidth="4" strokeLinecap="round"/>
    <svg x="397" y="125" width="320" height="350"><Milo waving/></svg>
    <path d="M0 397h1100v133H0Z" fill="#BF9064"/><path d="M0 400h1100v14H0Z" fill="#A97D59"/>
    <path d="m87 387 934 0 49 83H35Z" fill={`url(#${id}-cloth)`}/>
    <path d="M35 470h1035v32c-30 18-50-13-80 0-30 18-50-13-80 0-30 18-50-13-80 0-30 18-50-13-80 0-30 18-50-13-80 0-30 18-50-13-80 0-30 18-50-13-80 0-30 18-50-13-80 0-30 18-50-13-80 0-30 18-50-13-80 0-30 18-50-13-80 0-30 18-50-13-80 0-30 18-50-13-80 0Z" fill={`url(#${id}-cloth)`}/>
    <svg x="242" y="326" width="135" height="135"><FoodArt food="apple"/></svg>
    <svg x="350" y="339" width="135" height="135"><FoodArt food="banana"/></svg>
    <svg x="705" y="315" width="180" height="150"><BasketArt/></svg>
    <path d="M0 0h1100v38H0Z" fill="#F8D767"/>
    {Array.from({ length: 11 }, (_, i) => <path key={i} d={`M${i * 100} 0h50v59q-25 30-50 0Z`} fill="#365878"/>)}
    {Array.from({ length: 11 }, (_, i) => <path key={i} d={`M${i * 100 + 50} 0h50v59q-25 30-50 0Z`} fill="#F8D767"/>)}
    {<g transform="rotate(-5 540 104)"><rect x="430" y="68" width="220" height="59" rx="5" fill="#FFF9ED"/><text x="540" y="108" textAnchor="middle" fontFamily="Delius, cursive" fontSize="30" fill="#263B59">Le café de Milo</text></g>}
  </svg>;
}

// Each page shares the same room and object locations, so the search has continuity.
export function StoryScene({ scene }: { scene: StorySceneId }) {
  const id = useId();
  const found = scene === 'found' || scene === 'goodbye';
  const bearX = scene === 'table' ? 265 : scene === 'shelf' ? 555 : scene === 'basket' || scene === 'found' ? 485 : 400;
  return <svg viewBox="0 0 1100 530" role="img" aria-label={scene === 'table' ? 'Milo regarde le verre d’eau sur la table.' : scene === 'shelf' ? 'Milo regarde la banane sur l’étagère.' : scene === 'basket' ? 'Milo soulève le tissu du panier.' : scene === 'found' ? 'Milo retrouve sa pomme dans le panier.' : scene === 'goodbye' ? 'Milo dit au revoir avec sa pomme.' : 'Milo cherche sa pomme dans le café.'}>
    <defs><pattern id={`${id}-wall`} width="42" height="42" patternUnits="userSpaceOnUse"><path d="M21 0v42" stroke="#E6E3CA"/></pattern><pattern id={`${id}-cloth`} width="50" height="50" patternUnits="userSpaceOnUse"><rect width="50" height="50" fill="#F9F3D8"/><path d="M0 12h50M12 0v50" stroke="#A9C8D0" strokeWidth="12" opacity=".45"/></pattern></defs>
    <rect width="1100" height="530" fill="#FFF9ED"/><rect width="1100" height="530" fill={`url(#${id}-wall)`}/>
    <path d="M100 285V145a85 85 0 0 1 170 0v140Z" fill="#CCE5EA" stroke="#6D929D" strokeWidth="8"/><path d="M105 249q35-35 80-9 43-38 80-5v45H105Z" fill="#97B6A3"/><path d="M185 65v220M102 170h165M85 290h200" stroke="#6D929D" strokeWidth="8" strokeLinecap="round"/>
    <path d="M785 194h205" stroke="#A97D59" strokeWidth="14" strokeLinecap="round"/><path d="m811 201 12 24m143-24-12 24" stroke="#A97D59" strokeWidth="7" strokeLinecap="round"/>
    <svg x="804" y="70" width="140" height="140"><FoodArt food="banana"/></svg>
    <svg x={bearX} y={scene === 'table' || scene === 'basket' ? 151 : 128} width="320" height="350" transform={scene === 'table' ? `rotate(-8 ${bearX + 160} 440)` : scene === 'shelf' ? `rotate(6 ${bearX + 160} 440)` : undefined}><Milo waving={scene === 'goodbye'} happy={found}/></svg>
    {scene === 'search' && <g><path d="M670 115q-15-80 73-85h65q80 5 65 90-6 38-70 40h-51l-36 32 6-37q-45-7-52-40" fill="#FFF9ED" stroke="#A9C8D0" strokeWidth="3"/><svg x="720" y="38" width="100" height="100"><FoodArt food="apple"/></svg><text x="824" y="116" fontSize="48" fill="#365878" fontFamily="Delius">?</text></g>}
    <path d="M0 408h1100v122H0Z" fill="#BF9064"/><path d="M0 408h1100v13H0Z" fill="#A97D59"/><path d="m70 394 960 0 45 105H25Z" fill={`url(#${id}-cloth)`}/><path d="M25 499h1050v31H25Z" fill={`url(#${id}-cloth)`}/>
    <svg x="190" y="298" width="160" height="160"><FoodArt food="water"/></svg>
    <path d="M808 377c0-90 124-90 124 0" fill="none" stroke="#9A6B40" strokeWidth="12"/>
    <ellipse cx="870" cy="382" rx="103" ry="27" fill="#8D623F"/>
    {scene === 'found' && <svg x="807" y="288" width="130" height="130"><FoodArt food="apple"/></svg>}
    <path d="m765 381 23 87q80 21 163 0l23-87q-104 35-209 0Z" fill="#D6A668"/>
    <path d="M780 407q90 29 181 0M786 430q84 28 170 0M801 397l12 78m19-72 7 75m25-72v76m29-77-5 74m29-79-9 76m29-84-12 76" fill="none" stroke="#B9874E" strokeWidth="3"/>
    <path d="M765 381q105 35 209 0" stroke="#9A6B40" strokeWidth="9" fill="none" strokeLinecap="round"/>
    {!found && <path d={scene === 'basket' ? 'M765 375q35-67 91-92l81 26q-54 30-84 95l-31 30Z' : 'M760 376q106-38 218 0l-38 53-37-22-40 25-47-28-34 18Z'} fill="#E8F1F0" stroke="#8BAEB7" strokeWidth="3"/>}
    {found && <path d="m963 389 45 18 19 79-46-6Z" fill="#E8F1F0" stroke="#8BAEB7" strokeWidth="3"/>}
    {scene === 'goodbye' && <svg x="465" y="309" width="123" height="123"><FoodArt food="apple"/></svg>}
    {scene === 'table' && <path d="m358 342 30-12m-26 40h31" stroke="#D8B443" strokeWidth="6" strokeLinecap="round"/>}
    {scene === 'shelf' && <path d="m955 100 22-17m-14 46 29-1" stroke="#D8B443" strokeWidth="6" strokeLinecap="round"/>}
    {scene === 'found' && <path d="m789 313-23-19m37-8-5-24m126 34 23-22" stroke="#D8B443" strokeWidth="6" strokeLinecap="round"/>}
    <path d="M0 0h1100v22H0Z" fill="#F8D767"/>
  </svg>;
}

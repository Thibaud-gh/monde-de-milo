import { useId } from 'react';
import type { Food } from '../content/week1';
export function FoodArt({ food, className = '' }: { food: Food; className?: string }) {
  return <svg className={className} viewBox="0 0 180 180" fill="none" aria-hidden="true">
    {food === 'apple' && <>
      <path d="M92 53c-1-17 7-27 13-32" stroke="#775134" strokeWidth="9" strokeLinecap="round"/>
      <path d="M96 43c6-24 29-27 41-21-2 19-20 29-41 21" fill="#65885C"/>
      <path d="M90 56C43 31 23 66 28 103c5 37 28 60 49 53 9-3 15-3 24 0 25 8 47-21 52-53 6-40-24-68-63-47Z" fill="#D9534F"/>
      <path d="M42 92c-1-12 3-21 11-24" stroke="#F29B81" strokeWidth="8" strokeLinecap="round"/>
      <path d="M81 61q10 5 20 0" stroke="#AC383B" strokeWidth="4" strokeLinecap="round"/>
    </>}
    {food === 'banana' && <>
      <path d="m134 31 13 7-5 18c2 56-47 99-99 88l-11-7 2-14C80 126 118 91 126 49Z" fill="#E6B631"/>
      <path d="m126 36 10 3-4 19c-3 46-49 84-94 75l-5-9C82 121 112 91 118 51Z" fill="#F8D767"/>
      <path d="m126 36 2-11 13 5-5 9M33 124l-6 3 3 10 8-4" fill="#775134"/>
      <path d="M55 135c27-1 54-18 69-43" stroke="#C69926" strokeWidth="3" strokeLinecap="round"/>
    </>}
    {food === 'water' && <>
      <path d="m47 36 12 116q30 13 61 0l13-116" fill="#F5FBFC" stroke="#6694AB" strokeWidth="5"/>
      <path d="m54 74 8 73q28 11 54 0l8-73Z" fill="#88BDCF"/>
      <ellipse cx="89" cy="75" rx="35" ry="8" fill="#B6DFE8"/>
      <ellipse cx="90" cy="36" rx="43" ry="11" fill="#EAF6F7" stroke="#6694AB" strokeWidth="5"/>
      <path d="m62 54 7 71" stroke="white" strokeWidth="6" strokeLinecap="round"/>
      <path d="M110 94v19" stroke="#D9EFF3" strokeWidth="4" strokeLinecap="round"/>
    </>}
    {food === 'bread' && <g transform="rotate(-28 90 90)">
      <path d="M13 104C9 74 39 59 79 59h43c25 0 45 15 46 34 2 22-18 38-42 38H59c-24 0-43-10-46-27Z" fill="#C28743"/>
      <path d="M14 94c5-21 30-31 65-31h45c19 0 34 7 39 21-2 23-23 33-49 33H58c-21 0-38-7-44-23Z" fill="#EDBD6E"/>
      <path d="m48 73 8 22m24-25 8 22m23-21 8 20" stroke="#FFF0CA" strokeWidth="9" strokeLinecap="round"/>
      <path d="M35 108h2m31 4h2m64-8h2" stroke="#C28743" strokeWidth="3" strokeLinecap="round"/>
    </g>}
  </svg>;
}
export function Milo({ waving = false, happy = false, className = '' }: { waving?: boolean; happy?: boolean; className?: string }) {
  return <svg className={className} viewBox="0 0 320 350" aria-hidden="true">
    <g fill="#B47D4F"><ellipse cx="105" cy="321" rx="43" ry="24"/><ellipse cx="218" cy="321" rx="43" ry="24"/></g>
    <path d="M93 184c-38 24-44 76-27 83 24 10 42-23 48-38" fill="#C18B58"/>
    <path d={waving ? 'M225 190c26-6 39-45 61-30 23 17-12 65-46 67' : 'M225 184c38 24 44 76 27 83-24 10-42-23-48-38'} fill="#C18B58"/>
    <path d="M88 199c5-23 29-43 72-43s68 20 73 43l16 99c-36 32-140 32-177 0Z" fill="#C18B58"/>
    <path d="m110 183 12 46h77l13-46 12 9-12 46 14 73c-35 13-97 14-132 0l14-73-12-46Z" fill="#365878"/>
    <path d="M136 266h50v30c-15 8-35 8-50 0Z" fill="#F8D767"/>
    <path d="m142 272 11 9 11-9 11 9 6-9" fill="none" stroke="#E8BB43" strokeWidth="2"/>
    <circle cx="75" cy="60" r="35" fill="#B47D4F"/><circle cx="246" cy="60" r="35" fill="#B47D4F"/>
    <circle cx="76" cy="61" r="20" fill="#DEB78B"/><circle cx="246" cy="61" r="20" fill="#DEB78B"/>
    <path d="M56 113c0-58 47-89 104-89s105 32 105 89c0 62-43 97-105 97S56 175 56 113" fill="#C18B58"/>
    <path d="M100 146c0-26 29-43 61-43s60 17 60 43-27 47-60 47-61-21-61-47" fill="#E8C7A0"/>
    {happy ? <g stroke="#47362F" strokeWidth="6" fill="none" strokeLinecap="round"><path d="M97 108q10-12 20 0M205 108q10-12 20 0"/></g> : <g fill="#47362F"><ellipse cx="108" cy="106" rx="6" ry="8"/><ellipse cx="213" cy="106" rx="6" ry="8"/></g>}
    <ellipse cx="161" cy="136" rx="16" ry="11" fill="#47362F"/>
    <path d="M161 145v12m-18 0q9 15 18 0 9 15 18 0" fill="none" stroke="#47362F" strokeWidth="4" strokeLinecap="round"/>
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
export function CafeScene({ page, className = '' }: { page?: number; className?: string }) {
  const id = useId();
  const storyMode = page !== undefined;
  const appleVisible = !storyMode || page === 1 || page === 2 || page === 4;
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
    <svg x={page === 3 ? 365 : 397} y="125" width="320" height="350"><Milo waving={!storyMode || page === 0 || page === 5} happy={page === 4}/></svg>
    <path d="M0 397h1100v133H0Z" fill="#BF9064"/><path d="M0 400h1100v14H0Z" fill="#A97D59"/>
    <path d="m87 387 934 0 49 83H35Z" fill={`url(#${id}-cloth)`}/>
    <path d="M35 470h1035v32c-30 18-50-13-80 0-30 18-50-13-80 0-30 18-50-13-80 0-30 18-50-13-80 0-30 18-50-13-80 0-30 18-50-13-80 0-30 18-50-13-80 0-30 18-50-13-80 0-30 18-50-13-80 0-30 18-50-13-80 0-30 18-50-13-80 0-30 18-50-13-80 0-30 18-50-13-80 0Z" fill={`url(#${id}-cloth)`}/>
    {appleVisible && <svg x={storyMode ? 650 : 242} y="326" width="135" height="135"><FoodArt food="apple"/></svg>}
    {(!storyMode || page === 2 || page === 3 || page === 4) && <svg x="350" y="339" width="135" height="135"><FoodArt food="banana"/></svg>}
    <svg x={storyMode ? 810 : 705} y="315" width="180" height="150"><BasketArt/></svg>
    {(page === 3 || page === 4) && <path d={page === 3 ? 'm640 327 109-4 62 135-181-1Z' : 'm789 313 39-27 54 112-60 4Z'} fill="#CCE5EA" stroke="#6D929D" strokeWidth="3"/>}
    {page === 3 && <text x="710" y="258" fontSize="70" fill="#365878" fontFamily="Delius, cursive">?</text>}
    <path d="M0 0h1100v38H0Z" fill="#F8D767"/>
    {Array.from({ length: 11 }, (_, i) => <path key={i} d={`M${i * 100} 0h50v59q-25 30-50 0Z`} fill="#365878"/>)}
    {Array.from({ length: 11 }, (_, i) => <path key={i} d={`M${i * 100 + 50} 0h50v59q-25 30-50 0Z`} fill="#F8D767"/>)}
    {!storyMode && <g transform="rotate(-5 540 104)"><rect x="430" y="68" width="220" height="59" rx="5" fill="#FFF9ED"/><text x="540" y="108" textAnchor="middle" fontFamily="Delius, cursive" fontSize="30" fill="#263B59">Le café de Milo</text></g>}
  </svg>;
}

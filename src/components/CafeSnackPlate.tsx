import { useId, type CSSProperties } from 'react';
import type { Food } from '../content/week1';
import { FoodArt } from './Art';

const leftoverNames: Record<Food, string> = {
  apple: 'Un trognon de pomme',
  banana: 'Une peau de banane',
  bread: 'Des miettes de pain',
  water: 'Un verre vide',
  milk: 'Une brique de lait vide',
  cheese: 'Des miettes de fromage',
};
const slots = [62, 143, 224];

function Leftover({ food }: { food: Food }) {
  if (food === 'apple') return <>
    <path d="M1-36q-5-13 6-21" fill="none" stroke="#775134" strokeWidth="5" strokeLinecap="round"/>
    <path d="M-25-33q9-10 25-6 15-4 25 6-19 15-18 32 0 13 23 29-12 12-30 6-18 6-30-6C-9 13-7 7-7-1q1-15-18-32Z" fill="#FFF1CA" stroke="#BF8D60" strokeWidth="2"/>
    <path d="M-25-33q9-10 25-6 15-4 25 6-25 8-50 0Zm-5 61q30 7 60 0-12 12-30 6-18 6-30-6Z" fill="#D9534F"/>
    <path d="m-1-8 2 6m-4 7 2 4" stroke="#775134" strokeWidth="3" strokeLinecap="round"/>
  </>;
  if (food === 'banana') return <>
    <path d="M1-42q-10 24-12 43C-26 19-47 19-48 34q28 7 51-22 12 26 39 27 4-10-9-17Q19 14 15-1q-4-22-5-41Z" fill="#F8D767" stroke="#C69926" strokeWidth="3" strokeLinejoin="round"/>
    <path d="M3-20q1 40 26 47M2-5Q-10 21-37 31m36-74 14 2" fill="none" stroke="#A47A29" strokeWidth="3" strokeLinecap="round"/>
  </>;
  if (food === 'water') return <>
    <path d="m-29-29 8 65q22 9 42 0l8-65" fill="#F5FBFC" stroke="#6694AB" strokeWidth="4"/>
    <ellipse cy="-29" rx="29" ry="7" fill="#EAF6F7" stroke="#6694AB" strokeWidth="4"/>
    <path d="m-16-13 5 34M8 33h8" stroke="#A9C8D0" strokeWidth="3" strokeLinecap="round"/>
  </>;
  if (food === 'milk') return <>
    <path d="m-25-23 11-12h34l10 12-7 58h-43Z" fill="#FFF9ED" stroke="#6D929D" strokeWidth="3" strokeLinejoin="round"/>
    <path d="m-14-35 19 16 25-4M5-19 1 34m-21-1 12-13m28-55 4-15-16 4-6 10" fill="none" stroke="#6D929D" strokeWidth="3" strokeLinejoin="round"/>
    <path d="M-17-12h16l-3 30h-9Z" fill="#A9C8D0"/>
    <path d="M-9-7c-9 11-7 15 0 15S0 4-9-7Z" fill="#FFF9ED"/>
  </>;
  if (food === 'cheese') return <g fill="#F8D767" stroke="#C39035" strokeWidth="2" strokeLinejoin="round">
    <path d="m-30 16 15-18 13 22-26 7Z"/><path d="m5 10 15-16 15 20-23 11Z"/><path d="m-5-13 9-15 11 13-9 7Z"/>
    <ellipse cx="-15" cy="14" rx="3" ry="2" fill="#D5A239" stroke="none"/>
    <ellipse cx="19" cy="13" rx="3" ry="2" fill="#D5A239" stroke="none"/>
  </g>;
  return <g fill="#D6A668" stroke="#A97D59" strokeWidth="2" strokeLinejoin="round">
    <path d="m-37 12 9-12 12 8-2 15-14 2Zm30-20 7-11 13 5-1 12-10 3ZM13 14l10-6 13 12-10 9-13-5Z"/>
    <circle cx="-20" cy="-18" r="3"/><circle cx="34" cy="-10" r="4"/><circle cx="2" cy="28" r="3"/>
  </g>;
}

export function CafeSnackPlate({ food, served, collecting }: {
  food: Food | null; served: Food[]; collecting: boolean;
}) {
  const biteMask = useId();
  const moving = collecting && food && slots[served.length] !== undefined;
  const drink = food === 'water' || food === 'milk';

  return <svg className="cafe-snack-plate" viewBox="0 0 620 286" role="img"
    aria-label={served.length ? `Sur le côté : ${served.map(item => leftoverNames[item]).join(', ')}` : 'Une grande assiette et un plateau'}>
    <ellipse cx="242" cy="148" rx="229" ry="129" fill="#365878" opacity=".14"/>
    <ellipse cx="242" cy="141" rx="229" ry="129" fill="#fffefa" stroke="#7598a4" strokeWidth="4"/>
    <ellipse cx="242" cy="141" rx="212" ry="113" fill="none" stroke="#a9c8d0" strokeWidth="2.5"/>
    <ellipse cx="242" cy="144" rx="173" ry="86" fill="#F9F5E9" stroke="#e4eee8" strokeWidth="2"/>
    <rect x="503" y="13" width="107" height="254" rx="24" fill="#DDBD91" stroke="#A97D59" strokeWidth="3"/>
    {slots.map((y, index) => <ellipse key={y} cx="556" cy={y} rx="38" ry="32" fill="#F4E3C8" stroke="#B98F63" strokeWidth="2" strokeDasharray={served[index] ? undefined : '3 4'}/>)}
    {served.map((item, index) => <g key={index} transform={`translate(556 ${slots[index]}) scale(.58)`}><Leftover food={item}/></g>)}
    {food && <g key={food} transform="translate(242 141)">
      {moving && !drink && <defs><mask id={biteMask}>
        <rect x="-95" y="-95" width="190" height="190" fill="white"/>
        <path className="cafe-snack-bite first" d="M92-64c-39 1-63 15-62 31-9 8-10 20 3 25-4 13 12 22 25 16l34 21Z" fill="black"/>
        <path className="cafe-snack-bite second" d="M-94-28c28-18 59-5 56 9 16 5 18 23 3 30 3 12-18 23-34 10l-25 5Z" fill="black"/>
      </mask></defs>}
      <g className={moving ? `cafe-snack-eating ${food}` : 'cafe-snack-served'}
        mask={moving && !drink ? `url(#${biteMask})` : undefined}>
        <svg x="-95" y="-95" width="190" height="190"><FoodArt food={food}/></svg>
      </g>
      {moving && <g className="cafe-snack-to-tray"
        style={{ '--snack-slot-y': `${slots[served.length] - 141}px` } as CSSProperties}><Leftover food={food}/></g>}
    </g>}
  </svg>;
}

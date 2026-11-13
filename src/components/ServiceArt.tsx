import { useId } from 'react';
import type { Food } from '../content/week1';
import type { ServiceScene } from '../content/session3';
import { FoodArt, Milo } from './Art';

export function ServiceArt({ scene, food, className }: { scene?: ServiceScene; food?: Food; className?: string }) {
  const biteMask = useId();
  const eating = scene === 'eating';
  const drinking = scene === 'drinking';
  const thirsty = scene === 'thirsty';
  const hungry = scene === 'hungry';
  const milk = food === 'milk';

  return <svg className={className} viewBox="0 0 300 252" aria-hidden="true">
    <rect x="12" y="10" width="276" height="225" rx="24" fill={drinking || thirsty ? '#dbeaf1' : scene ? '#f5e9c7' : '#dce9e3'}/>
    <svg x="48" y="0" width="184" height="201"><Milo expression={scene} serving={!scene}/></svg>
    <path d="M28 190h244v30H28Z" fill="#d4ac7e"/>
    <path d="M28 190h244" stroke="#a97d59" strokeWidth="5" strokeLinecap="round"/>

    {hungry && <>
      <path d="M91 140q5 25 34 21m73-18q-5 18-32 21" fill="none" stroke="#c18b58" strokeWidth="19" strokeLinecap="round"/>
      <path d="M136 156q5-8 10 0t10 0m-20 12q5-8 10 0t10 0" fill="none" stroke="#f8d767" strokeWidth="4" strokeLinecap="round"/>
      <ellipse cx="212" cy="196" rx="49" ry="14" fill="#fff9ed" stroke="#6d929d" strokeWidth="3"/>
      <ellipse cx="212" cy="196" rx="29" ry="7" fill="none" stroke="#9db2c1" strokeWidth="2"/>
    </>}

    {thirsty && <>
      <path d="M192 144q16 4 27-16" fill="none" stroke="#c18b58" strokeWidth="21" strokeLinecap="round"/>
      <g transform="rotate(30 227 117)" stroke="#527c92" strokeWidth="3" strokeLinejoin="round">
        <path d="m200 88 7 63q20 8 40 0l7-63Z" fill="#f5fbfc"/>
        <ellipse cx="227" cy="88" rx="27" ry="7" fill="#c7dce6"/>
        <path d="m211 107 4 32" stroke="#a9c8d0" strokeLinecap="round"/>
      </g>
      <path d="M259 49c-4 9-13 15-13 23a13 13 0 0 0 26 0c0-8-9-14-13-23Z" fill="#88bdcf" stroke="#527c92" strokeWidth="2"/>
    </>}

    {eating && <>
      <path d="M195 144q-2-16-26-24" fill="none" stroke="#c18b58" strokeWidth="20" strokeLinecap="round"/>
      <defs>
        <mask id={biteMask}>
          <rect width="300" height="252" fill="white"/>
          <path d="M148 77c15-2 19 7 15 14 8 3 8 13 0 17-5 4-11 2-15-1Z" fill="black"/>
        </mask>
      </defs>
      <g mask={`url(#${biteMask})`} transform="translate(-9 -4)">
        <svg x="132" y="58" width="96" height="96"><FoodArt food={food ?? 'apple'}/></svg>
      </g>
      <g fill="#b47d4f"><circle cx="153" cy="109" r="3"/><circle cx="148" cy="117" r="2.5"/><circle cx="159" cy="121" r="2"/></g>
      <path d="m229 89 12-6m-10 16 14 1" stroke="#a97d59" strokeWidth="3" strokeLinecap="round"/>
    </>}

    {drinking && <>
      <path d="M192 144q16-9 15-25" fill="none" stroke="#c18b58" strokeWidth="22" strokeLinecap="round"/>
      <g transform="rotate(-48 159 94)">
        <path d="m136 94 6 62q17 7 34 0l6-62Z" fill="#f5fbfc" stroke="#527c92" strokeWidth="3"/>
        <path d="m140 113 5 41q14 5 28 0l4-41Z" fill={milk ? '#fff3d2' : '#88bdcf'}/>
        <ellipse cx="159" cy="94" rx="23" ry="6" fill="#f5fbfc" stroke="#527c92" strokeWidth="3"/>
        <path d="m147 115 3 27" stroke="white" strokeWidth="3" strokeLinecap="round"/>
      </g>
      <path d="m209 73 9-8m-4 19 13-3" stroke="#527c92" strokeWidth="3" strokeLinecap="round"/>
      {milk && <svg x="217" y="142" width="65" height="65"><FoodArt food="milk"/></svg>}
    </>}
  </svg>;
}

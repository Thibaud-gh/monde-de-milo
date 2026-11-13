import type { Food } from '../content/week1';
import type { ServiceScene } from '../content/session3';
import { FoodArt, Milo } from './Art';

export function ServiceArt({ scene, food, className }: { scene?: ServiceScene; food?: Food; className?: string }) {
  const eating = scene === 'eating';
  const drinking = scene === 'drinking';
  return <svg className={className} viewBox="0 0 300 252" aria-hidden="true">
    <rect x="12" y="10" width="276" height="225" rx="24" fill="#dce9e3"/>
    <path d="M28 190h244v30H28Z" fill="#d4ac7e"/>
    <path d="M28 190h244" stroke="#a97d59" strokeWidth="5" strokeLinecap="round"/>
    <svg x="59" y="3" width="182" height="199"><Milo happy={eating || drinking} serving={!scene}/></svg>
    {(scene === 'hungry' || eating) && <>
      <ellipse cx="202" cy="199" rx="40" ry="10" fill="#fff9ed" stroke="#9db2c1" strokeWidth="2"/>
      <ellipse cx="202" cy="199" rx="25" ry="5" fill="none" stroke="#9db2c1"/>
    </>}
    {scene === 'hungry' && <>
      <path d="M119 148q12 13 25 6" fill="none" stroke="#c18b58" strokeWidth="16" strokeLinecap="round"/>
      <path d="M117 163q10 7 21 5m-22 1q10 7 18 5" fill="none" stroke="#f8d767" strokeWidth="2.5" strokeLinecap="round"/>
    </>}
    {scene === 'thirsty' && <>
      <path d="m199 145 7 46q15 6 30 0l7-46" fill="#fffefa" stroke="#6d929d" strokeWidth="3"/>
      <ellipse cx="221" cy="145" rx="22" ry="5" fill="#fffefa" stroke="#6d929d" strokeWidth="3"/>
      <path d="M188 130q18-13 31-11" fill="none" stroke="#6d929d" strokeWidth="3" strokeDasharray="1 7" strokeLinecap="round"/>
    </>}
    {(eating || drinking) && <>
      <path d="M192 140q-7-5-19-27" fill="none" stroke="#c18b58" strokeWidth="18" strokeLinecap="round"/>
      {eating
        ? <svg x="127" y="68" width="67" height="67"><FoodArt food={food ?? 'apple'}/></svg>
        : <g transform="rotate(22 170 101)">
          <path d="m151 78 5 46q14 6 28 0l5-46" fill="#f5fbfc" stroke="#6d929d" strokeWidth="3"/>
          <path d="m155 96 4 26q12 4 22 0l4-26Z" fill={food === 'milk' ? '#fff8e7' : '#88bdcf'}/>
          <ellipse cx="170" cy="78" rx="19" ry="5" fill="#f5fbfc" stroke="#6d929d" strokeWidth="3"/>
        </g>}
      {drinking && food === 'milk' && <svg x="209" y="133" width="66" height="66"><FoodArt food="milk"/></svg>}
    </>}
  </svg>;
}

'use client';
import {translator,type Messages} from '../packages/i18n/public';
import {useRef,useState} from 'react';
import {countries,type CountryCode} from '../packages/domain/countries';
import {mapShapes} from './generated/map-shapes';
const labels:Record<string,string>={AT:'AUSTRIA',HU:'UNGARIA',RO:'ROMÂNIA',BG:'BULGARIA',CZ:'CEHIA',SK:'SLOVACIA',SI:'SLOVENIA',CH:'ELVEȚIA',MD:'MOLDOVA',DE:'GERMANIA',IT:'ITALIA',HR:'CROAȚIA',RS:'SERBIA',BA:'BOSNIA',UA:'UCRAINA',PL:'POLONIA',FR:'FRANȚA',ME:'MUNTENEGRU',AL:'ALBANIA',MK:'MACEDONIA',GR:'GRECIA',TR:'TURCIA'};
export default function EuropeMap({selected,onToggle,messages={}}:{selected:CountryCode[];onToggle:(code:CountryCode)=>void;messages?:Messages}){
 const t=translator(messages);
 const [zoom,setZoom]=useState(1);
 const [pan,setPan]=useState({x:0,y:0});
 const drag=useRef<{x:number;y:number;px:number;py:number;moved:boolean}|null>(null);
 const moved=useRef(false);
 function changeZoom(next:number){setZoom(next);if(next===1)setPan({x:0,y:0});}
 return <div className="map-stage vector-map" data-map-state="ready" data-rendered-countries={mapShapes.length} role="region" aria-label={t("Hartă interactivă a Europei. Alege țările și din lista de sub hartă.")}>
 <svg className="map-svg" viewBox="0 0 900 540" preserveAspectRatio="xMidYMid slice" aria-hidden="true"
 style={{touchAction:zoom>1?"none":"pan-y"}} onPointerDown={e=>{moved.current=false;if(zoom===1)return;drag.current={x:e.clientX,y:e.clientY,px:pan.x,py:pan.y,moved:false};}}
 onPointerMove={e=>{const d=drag.current;if(!d)return;const dx=e.clientX-d.x,dy=e.clientY-d.y;if(Math.abs(dx)+Math.abs(dy)<5)return;d.moved=true;const rect=e.currentTarget.getBoundingClientRect();const factor=Math.min(900/rect.width,540/rect.height)/zoom;setPan({x:Math.max(-300,Math.min(300,d.px+dx*factor)),y:Math.max(-220,Math.min(220,d.py+dy*factor))});}}
 onPointerUp={()=>{moved.current=drag.current?.moved??false;drag.current=null;}}
 onPointerLeave={()=>{drag.current=null;}}
 onPointerCancel={()=>{drag.current=null;}}>
 <g transform={'translate(450 270) scale('+zoom+') translate('+(-450+pan.x)+' '+(-270+pan.y)+')'}>
 {mapShapes.map(s=>{const supported=countries.some(c=>c.code===s.code);const active=selected.includes(s.code as CountryCode);const fill=active?(s.code==='AT'?'#1674ad':s.code==='HU'?'#188e82':s.code==='RO'?'#ef8937':'#21799b'):'#102e49';
 return <path key={s.code} data-country={s.code} d={s.path} fill={fill} fillRule="evenodd" stroke="#527f9e" strokeWidth=".8" vectorEffect="non-scaling-stroke" className={supported?'map-selectable':''} onClick={()=>{if(moved.current){moved.current=false;return;}if(supported)onToggle(s.code as CountryCode);}}/>;})}
 {mapShapes.filter(s=>labels[s.code]).map(s=><text key={s.code} x={s.label[0]} y={s.label[1]} className="vector-country-label" textAnchor="middle">{t(labels[s.code])}</text>)}
 </g></svg>
 <div className="map-controls"><button type="button" aria-label={t("Mărește harta")} disabled={zoom>=3} onClick={()=>changeZoom(Math.min(3,zoom+.5))}>+</button><button type="button" aria-label={t("Micșorează harta")} disabled={zoom<=1} onClick={()=>changeZoom(Math.max(1,zoom-.5))}>−</button><button type="button" aria-label={t("Resetează harta")} onClick={()=>{changeZoom(1);setPan({x:0,y:0});}}>⌂</button></div>
 <div className="map-caption"><span>{t("Europa e mai aproape")}</span><small>{t("când drumul e bine planificat.")}</small></div>
 <div className="map-legend"><i/>{t(" Selectează țările pe hartă")}</div>
 <a className="map-attribution" href="https://www.naturalearthdata.com/" target="_blank" rel="noopener">{t("Natural Earth · Frontiere orientative")}</a>
 </div>;
}

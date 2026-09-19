'use client';
import { useEffect, useRef, useState } from 'react';
import * as maplibregl from 'maplibre-gl';
import type { ExpressionSpecification, Map as MapInstance } from 'maplibre-gl';
import type { FeatureCollection, Geometry } from 'geojson';
import { countries, type CountryCode } from '../packages/domain/countries';
maplibregl.setWorkerUrl('/vendor/maplibre/maplibre-gl-worker.mjs');
type Properties = { code: string; name: string; labelLng: number; labelLat: number };
const labels: Record<string,string> = {AT:'AUSTRIA',HU:'UNGARIA',RO:'ROMÂNIA',BG:'BULGARIA',CZ:'CEHIA',SK:'SLOVACIA',SI:'SLOVENIA',CH:'ELVEȚIA',MD:'MOLDOVA',DE:'GERMANIA',IT:'ITALIA',HR:'CROAȚIA',RS:'SERBIA',BA:'BOSNIA',UA:'UCRAINA',PL:'POLONIA',FR:'FRANȚA',ME:'MUNTENEGRU',AL:'ALBANIA',MK:'MACEDONIA',GR:'GRECIA',TR:'TURCIA'};
function fillExpression(selected: CountryCode[]): ExpressionSpecification {
  return ['case',['in',['get','code'],['literal',selected]],['match',['get','code'],'AT','#1674ad','HU','#188e82','RO','#ef8937','#21799b'],'#102e49'];
}
export default function EuropeMap({selected,onToggle}:{selected:CountryCode[];onToggle:(code:CountryCode)=>void}) {
  const container=useRef<HTMLDivElement>(null);
  const mapRef=useRef<MapInstance|null>(null);
  const selectedRef=useRef(selected);
  const [status,setStatus]=useState<'loading'|'ready'|'failed'>('loading');
  useEffect(()=>{selectedRef.current=selected;const map=mapRef.current;if(map?.getLayer('countries-fill'))map.setPaintProperty('countries-fill','fill-color',fillExpression(selected));},[selected]);
  useEffect(()=>{
    if(!container.current)return;
    let disposed=false;
    let map:MapInstance|undefined;
    const controller=new AbortController();
    const timeout=setTimeout(()=>{if(!disposed)setStatus('failed');},15000);
    async function initialize(){
      try {
        const response=await fetch('/data/europe.geojson',{signal:controller.signal});
        if(!response.ok)throw new Error('Map data unavailable');
        const data:FeatureCollection<Geometry,Properties>=await response.json();
        if(disposed||!container.current)return;
        map=new maplibregl.Map({container:container.current,style:{version:8,sources:{},layers:[{id:'background',type:'background',paint:{'background-color':'#071e34'}}]},center:[19.5,46.7],zoom:4.2,minZoom:2.8,maxZoom:7,attributionControl:false,dragRotate:false,pitchWithRotate:false,scrollZoom:false,renderWorldCopies:false});
        mapRef.current=map;
        if(container.current.clientWidth<500)map.fitBounds([[8,41.8],[30,50.8]],{padding:15,duration:0});
        map.addControl(new maplibregl.NavigationControl({showCompass:false}),'bottom-left');
        map.addControl(new maplibregl.AttributionControl({compact:true,customAttribution:'<a href="https://www.naturalearthdata.com/" target="_blank" rel="noopener">Natural Earth</a> · Frontiere orientative'}),'bottom-right');
        const activeMap=map;
        map.on('load',()=>{
          if(disposed)return;
          activeMap.addSource('countries',{type:'geojson',data});
          activeMap.addLayer({id:'countries-fill',type:'fill',source:'countries',paint:{'fill-color':fillExpression(selectedRef.current),'fill-opacity':.94}});
          activeMap.addLayer({id:'country-borders',type:'line',source:'countries',paint:{'line-color':'#527f9e','line-width':.8,'line-opacity':.65}});
          for(const feature of data.features){
            const {code,labelLng,labelLat}=feature.properties;
            if(!labels[code])continue;
            const el=document.createElement('span');
            el.className='map-country-label';
            el.textContent=labels[code];
            el.setAttribute('aria-hidden','true');
            new maplibregl.Marker({element:el}).setLngLat([labelLng,labelLat]).addTo(activeMap);
          }
          for(const [name,lng,lat] of [['Viena',16.3738,48.2082],['Budapesta',19.0402,47.4979],['București',26.1025,44.4268]] as const){
            const el=document.createElement('span');el.className='map-city';el.textContent=name;el.setAttribute('aria-hidden','true');
            new maplibregl.Marker({element:el,anchor:'bottom-left'}).setLngLat([lng,lat]).addTo(activeMap);
          }
          activeMap.on('click','countries-fill',event=>{
            const code=event.features?.[0]?.properties?.code;
            if(countries.some(c=>c.code===code))onToggle(code as CountryCode);
          });
          activeMap.on('mousemove','countries-fill',event=>{const code=event.features?.[0]?.properties?.code;activeMap.getCanvas().style.cursor=countries.some(c=>c.code===code)?'pointer':'';});
          activeMap.on('mouseleave','countries-fill',()=>{activeMap.getCanvas().style.cursor='';});
          activeMap.once('idle',()=>{if(disposed)return;const rendered=activeMap.queryRenderedFeatures({layers:['countries-fill']}).length;if(container.current)container.current.dataset.renderedCountries=String(rendered);clearTimeout(timeout);setStatus(rendered>0?'ready':'failed');});
        });
        map.on('error',()=>{if(!disposed)setStatus('failed');});
      }catch{if(!disposed)setStatus('failed');}
    }
    void initialize();
    return ()=>{disposed=true;clearTimeout(timeout);controller.abort();map?.remove();mapRef.current=null;};
  },[onToggle]);
  return <div className="map-stage" data-map-state={status}><div ref={container} className="map-canvas" aria-label="Hartă interactivă a Europei. Alege țările și din lista de sub hartă." role="region"/>
    {status!=='ready'?<div className="map-status" role="status">{status==='failed'?'Harta nu este disponibilă. Poți selecta țările din lista de mai jos.':'Se încarcă harta Europei…'}</div>:null}
    <div className="map-caption"><span>Europa e mai aproape</span><small>când drumul e bine planificat.</small></div>
    <div className="map-legend"><i/> Selectează țările pe hartă</div>
  </div>;
}

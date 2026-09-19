import fs from 'node:fs';
import sharp from 'sharp';
const source='public/images/alpine-road.png';
await Promise.all([[1600,'public/images/alpine-road-v2.webp'],[960,'public/images/alpine-road-mobile-v2.webp']].map(async([width,path])=>{
 if(!fs.existsSync(path)||fs.statSync(path).mtimeMs<fs.statSync(source).mtimeMs)await sharp(source).resize({width,withoutEnlargement:true}).webp({quality:76,effort:6}).toFile(path);
}));
const geo=JSON.parse(fs.readFileSync('public/data/europe.geojson','utf8'));
const merc=lat=>Math.log(Math.tan(Math.PI/4+Math.max(-80,Math.min(80,lat))*Math.PI/360));
const scale=900/33,top=merc(53);
const project=([lng,lat])=>[+( (lng-3)*scale).toFixed(1),+((top-merc(lat))*scale*180/Math.PI).toFixed(1)];
// Keep every border vertex, round projected positions only; no topology simplification.
const shapes=geo.features.map(f=>{
 const polygons=f.geometry.type==='Polygon'?[f.geometry.coordinates]:f.geometry.coordinates;
 const path=polygons.map(p=>p.map(r=>r.map(project).map(([x,y],i)=>(i?'L':'M')+x+','+y).join('')+'Z').join('')).join('');
 return {code:f.properties.code,path,label:project([f.properties.labelLng,f.properties.labelLat])};
});
const content='// Generated from the existing Natural Earth data by prepare-assets.mjs.\nexport const mapShapes='+JSON.stringify(shapes)+';\n';
fs.mkdirSync('components/generated',{recursive:true});
if(!fs.existsSync('components/generated/map-shapes.ts')||fs.readFileSync('components/generated/map-shapes.ts','utf8')!==content)fs.writeFileSync('components/generated/map-shapes.ts',content);
console.log(JSON.stringify({desktop:fs.statSync('public/images/alpine-road-v2.webp').size,mobile:fs.statSync('public/images/alpine-road-mobile-v2.webp').size,map:Buffer.byteLength(content)}));

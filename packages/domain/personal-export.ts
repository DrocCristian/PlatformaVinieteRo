export const personalExportLimits={pageSize:25,maxRows:10000,maxBytes:4*1024*1024,timeoutMs:15000} as const;
type ExportLimits={pageSize:number;maxRows:number;maxBytes:number;timeoutMs:number};
type PageReader=(table:string,start:number,size:number,signal:AbortSignal)=>Promise<{data:unknown[]|null;error:unknown}>;
export class ExportLimitError extends Error {}

// One budget for every table, including nested items and UTF-8 JSON syntax.
// Return only a complete document; never expose a partial download on failure.
export async function personalExport(tables:readonly string[],metadata:Record<string,unknown>,readPage:PageReader,requestSignal:AbortSignal,limits:ExportLimits=personalExportLimits){
 const controller=new AbortController();
 const signal=AbortSignal.any([requestSignal,controller.signal]);
 const deadline=Date.now()+limits.timeoutMs;
 const timer=setTimeout(()=>controller.abort(),limits.timeoutMs);
 const parts:string[]=[];
 const encoder=new TextEncoder();
 let bytes=0,rows=0;
 const checkTime=()=>{if(signal.aborted||Date.now()>=deadline)throw new Error('Export interrupted');};
 const append=(part:string)=>{
  checkTime();
  bytes+=encoder.encode(part).byteLength;
  if(bytes>limits.maxBytes)throw new ExportLimitError('Export exceeds download limit');
  parts.push(part);
 };
 try{
  append(JSON.stringify(metadata).slice(0,-1));
  for(const table of tables){
   append(','+JSON.stringify(table)+':[');
   let first=true;
   for(let start=0;;){
    checkTime();
    // At the row boundary, probe one row rather than silently truncating.
    const size=Math.min(limits.pageSize,limits.maxRows-rows+1);
    const result=await readPage(table,start,size,signal);
    checkTime();
    if(result.error||!Array.isArray(result.data))throw new Error('Export read failed');
    for(const row of result.data){
     if(++rows>limits.maxRows)throw new ExportLimitError('Export exceeds download limit');
     append((first?'':',')+JSON.stringify(row));
     first=false;
    }
    if(result.data.length<size)break;
    start+=size;
   }
   append(']');
  }
  append('}');
  return parts.join('');
 }finally{
  clearTimeout(timer);
  controller.abort();
 }
}

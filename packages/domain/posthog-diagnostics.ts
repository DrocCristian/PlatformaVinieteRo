import {operations,outcomes,codes,type DiagnosticRecord} from './telemetry.ts';

export type PreviewDiagnosticsConfig={previewBuild?:string;enabled?:string;projectId?:string;token?:string;host?:string};
export function diagnosticsEnabled(config:PreviewDiagnosticsConfig){
 return config.previewBuild==='true'&&config.enabled==='true'&&config.projectId==='279270'&&/^phc_[A-Za-z0-9]+$/.test(config.token??'')&&['https://eu.i.posthog.com','https://us.i.posthog.com'].includes(config.host??'');
}

// Rebuild the outbound payload: never spread records or request/error objects.
export function diagnosticEvent(record:DiagnosticRecord,synthetic=false){
 if(!operations.includes(record.operation)||!outcomes.includes(record.outcome)||!codes.includes(record.code))return null;
 const duration=record.duration_ms;
 return {
  event:'vignexo_preview_operation',
  distinct_id:'vignexo-preview-server',
  properties:{
   $process_person_profile:false,$geoip_disable:true,
   application:'vignexo',environment:'preview',schema_version:1,synthetic,
   operation:record.operation,outcome:record.outcome,code:record.code,
   duration_ms:Number.isFinite(duration)?Math.max(0,Math.min(86400000,Math.round(duration))):0,
  },
 };
}

export async function sendDiagnostic(record:DiagnosticRecord,config:PreviewDiagnosticsConfig,transport:typeof fetch=fetch,synthetic=false):Promise<'disabled'|'sent'|'failed'>{
 if(!diagnosticsEnabled(config))return 'disabled';
 const event=diagnosticEvent(record,synthetic);if(!event)return 'disabled';
 try{
  const response=await transport(config.host+'/i/v0/e/',{
   method:'POST',headers:{'Content-Type':'application/json'},
   body:JSON.stringify({api_key:config.token,...event}),
   signal:AbortSignal.timeout(2000),redirect:'error',cache:'no-store',credentials:'omit',
  });
  await response.body?.cancel();
  return response.ok?'sent':'failed';
 }catch{return 'failed';}
}

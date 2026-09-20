import 'server-only';
import {after} from 'next/server';
import {diagnosticsEnabled,sendDiagnostic} from '../packages/domain/posthog-diagnostics';
import type {DiagnosticRecord} from '../packages/domain/telemetry';

export function scheduleDiagnostic(record:DiagnosticRecord){
 const config={previewBuild:process.env.VIGNEXO_DIAGNOSTICS_PREVIEW,enabled:process.env.POSTHOG_DIAGNOSTICS_ENABLED,projectId:process.env.POSTHOG_PROJECT_ID,token:process.env.POSTHOG_PROJECT_TOKEN,host:process.env.POSTHOG_HOST};
 if(!diagnosticsEnabled(config))return;
 try{
  after(async()=>{
   if(await sendDiagnostic(record,config)==='failed')console.warn('[diagnostics] PostHog delivery failed');
  });
 }catch{/* Outside a request lifecycle, skip collection rather than delaying business operations. */}
}

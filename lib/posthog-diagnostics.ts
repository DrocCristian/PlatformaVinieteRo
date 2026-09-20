import 'server-only';
import {after} from 'next/server';
import {diagnosticsEnabled,sendDiagnostic} from '../packages/domain/posthog-diagnostics';
import type {DiagnosticRecord} from '../packages/domain/telemetry';

export function scheduleDiagnostic(record:DiagnosticRecord){
 // Public destination is fixed to the verified EU preview project; only token and toggle are runtime settings.
 const config={previewBuild:process.env.VIGNEXO_DIAGNOSTICS_PREVIEW,enabled:process.env.POSTHOG_DIAGNOSTICS_ENABLED,projectId:'279270',token:process.env.POSTHOG_PROJECT_TOKEN,host:'https://eu.i.posthog.com'};
 if(!diagnosticsEnabled(config))return;
 try{
  after(async()=>{
   if(await sendDiagnostic(record,config)==='failed')console.warn('[diagnostics] PostHog delivery failed');
  });
 }catch{/* Outside a request lifecycle, skip collection rather than delaying business operations. */}
}

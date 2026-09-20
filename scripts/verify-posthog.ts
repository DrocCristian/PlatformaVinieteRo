// Explicit operator-run smoke test, never invoked by build or application startup.
import {createOperation,type DiagnosticRecord} from '../packages/domain/telemetry.ts';
import {sendDiagnostic} from '../packages/domain/posthog-diagnostics.ts';
let record!:DiagnosticRecord;
createOperation('server.request',value=>record=value).finish('success','completed');
const status=await sendDiagnostic(record,{
 previewBuild:process.env.CONTEXT==='deploy-preview'?'true':'false',
 enabled:process.env.POSTHOG_DIAGNOSTICS_ENABLED,
 projectId:'279270',
 token:process.env.POSTHOG_PROJECT_TOKEN,
 host:'https://eu.i.posthog.com',
},fetch,true);
console.log(JSON.stringify({status,event:'vignexo_preview_operation',synthetic:true,project:279270}));
if(status!=='sent')process.exitCode=1;

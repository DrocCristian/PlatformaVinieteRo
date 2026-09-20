import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';
import ts from 'typescript';
import {createOperation,type DiagnosticRecord} from '../../packages/domain/telemetry.ts';
import {diagnosticEvent,sendDiagnostic,type PreviewDiagnosticsConfig} from '../../packages/domain/posthog-diagnostics.ts';

const config:PreviewDiagnosticsConfig={previewBuild:'true',enabled:'true',projectId:'279270',token:'phc_fixture',host:'https://us.i.posthog.com'};
function record(){let value!:DiagnosticRecord;createOperation('auth.callback',r=>value=r).finish('error','callback_failed',{error:{message:'private@example.test password B123ABC',status:500},digest:'123'});return value;}

test('PostHog is fail-closed for production, local, disabled, wrong project and arbitrary hosts',async()=>{
 const never:typeof fetch=async()=>{assert.fail('Network must not be called');};
 for(const change of [{previewBuild:undefined},{previewBuild:'false'},{enabled:undefined},{enabled:'false'},{projectId:'123'},{token:''},{host:'https://evil.test'},{host:'https://us.i.posthog.com/?secret=x'}]){
  assert.equal(await sendDiagnostic(record(),{...config,...change},never),'disabled');
 }
});

test('outbound diagnostic has no request/user identity, arbitrary fields, error text or URL',()=>{
 const event=diagnosticEvent({...record(),email:'private@example.test',url:'https://site.test/?password=secret',vin:'VIN_PRIVATE',request_id:'private@example.test'} as DiagnosticRecord);
 assert.ok(event);
 assert.deepEqual(Object.keys(event.properties).sort(),['$process_person_profile','$geoip_disable','application','environment','schema_version','synthetic','operation','outcome','code','duration_ms'].sort());
 assert.equal(event.distinct_id,'vignexo-preview-server');
 assert.equal(event.properties.synthetic,false);assert.equal(diagnosticEvent(record(),true)?.properties.synthetic,true);
 assert.equal(event.properties.$process_person_profile,false);assert.equal(event.properties.$geoip_disable,true);
 assert.doesNotMatch(JSON.stringify(event),/private|password|secret|B123ABC|VIN_|request_id|digest|upstream_status|https/);
});

test('transport sends only sanitized JSON without cookies, redirects or retries',async()=>{
 let calls=0;
 const transport:typeof fetch=async(url,options)=>{
  calls++;assert.equal(url,'https://us.i.posthog.com/i/v0/e/');
  assert.equal(options?.redirect,'error');assert.equal(options?.credentials,'omit');assert.equal(options?.cache,'no-store');
  assert.ok(options?.signal);assert.equal(JSON.parse(String(options?.body)).event,'vignexo_preview_operation');
  assert.doesNotMatch(String(options?.body),/private@example|password|B123ABC/);
  return new Response('{}',{status:200});
 };
 assert.equal(await sendDiagnostic(record(),config,transport),'sent');assert.equal(calls,1);
 assert.equal(await sendDiagnostic(record(),config,async()=>new Response('',{status:503})),'failed');
 assert.equal(await sendDiagnostic(record(),config,async()=>{throw Error('secret network error');}),'failed');
});

test('Next scheduler sends after the response and isolates scheduling/delivery failures',async()=>{
 const callbacks:Array<()=>Promise<void>>=[];let sent=0;
 const source=readFileSync(new URL('../../lib/posthog-diagnostics.ts',import.meta.url),'utf8');
 const js=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText;
 const exported={} as {scheduleDiagnostic:(record:DiagnosticRecord)=>void};
 const env={VIGNEXO_DIAGNOSTICS_PREVIEW:'true',POSTHOG_DIAGNOSTICS_ENABLED:'true',POSTHOG_PROJECT_ID:'279270',POSTHOG_PROJECT_TOKEN:'phc_fixture',POSTHOG_HOST:'https://eu.i.posthog.com'};
 const imports:Record<string,unknown>={'server-only':{},'next/server':{after:(callback:()=>Promise<void>)=>callbacks.push(callback)},'../packages/domain/posthog-diagnostics':{diagnosticsEnabled:(c:PreviewDiagnosticsConfig)=>c.previewBuild==='true',sendDiagnostic:async()=>{sent++;return 'failed';}}};
 runInNewContext(js,{exports:exported,process:{env},require:(name:string)=>{assert.ok(name in imports);return imports[name];},console:{warn:()=>{}}});
 exported.scheduleDiagnostic(record());assert.equal(sent,0);assert.equal(callbacks.length,1);
 await callbacks[0]();assert.equal(sent,1);
 env.VIGNEXO_DIAGNOSTICS_PREVIEW='false';exported.scheduleDiagnostic(record());assert.equal(callbacks.length,1);
 env.VIGNEXO_DIAGNOSTICS_PREVIEW='true';imports['next/server']={after:()=>{throw Error('outside request');}};
 // Re-evaluate to load the throwing scheduler.
 runInNewContext(js,{exports:exported,process:{env},require:(name:string)=>imports[name],console:{warn:()=>{}}});
 assert.doesNotThrow(()=>exported.scheduleDiagnostic(record()));
});

test('build gate cannot be enabled by runtime toggle in production or branch deploys',()=>{
 const source=readFileSync(new URL('../../next.config.ts',import.meta.url),'utf8');
 const js=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText;
 for(const context of ['production','branch-deploy','dev',undefined,'deploy-preview']){
  const exported={} as {default:{env:Record<string,string>}};
  runInNewContext(js,{exports:exported,process:{env:{CONTEXT:context,VIGNEXO_DIAGNOSTICS_PREVIEW:'true',POSTHOG_DIAGNOSTICS_ENABLED:'true'}}});
  assert.equal(exported.default.env.VIGNEXO_DIAGNOSTICS_PREVIEW,context==='deploy-preview'?'true':'false');
  assert.equal(exported.default.env.POSTHOG_PROJECT_TOKEN,undefined);
 }
});

import 'server-only';
import {scheduleDiagnostic} from './posthog-diagnostics';
import {createOperation,type Operation} from '../packages/domain/telemetry';
export function startOperation(operation:Operation){
 return createOperation(operation,record=>{
  const environment=['production','development','test'].includes(process.env.NODE_ENV??'')?process.env.NODE_ENV:'unknown';
  const deployment=['production','deploy-preview','branch-deploy','dev'].includes(process.env.CONTEXT??'')?process.env.CONTEXT:'local';
  const line=JSON.stringify({...record,environment,deployment,commerce_mode:process.env.COMMERCE_MODE==='test'?'test':'disabled'});
  if(record.outcome==='error')console.error(line);else if(record.outcome==='denied')console.warn(line);else console.info(line);
  scheduleDiagnostic(record);
 });
}

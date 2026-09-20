import type {Instrumentation} from 'next';
import {startOperation} from './lib/observability';
export const onRequestError:Instrumentation.onRequestError=(error,_request,context)=>{
 // Never forward request headers, URLs, bodies, messages or stacks.
 const trace=startOperation('server.request');
 const digest=error&&typeof error==='object'&&'digest' in error?error.digest:undefined;
 trace.finish('error','unexpected_error',{error,digest,routeType:context.routeType});
};

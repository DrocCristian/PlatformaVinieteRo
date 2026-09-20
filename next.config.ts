import type {NextConfig} from 'next';
const previewWorkspace=process.env.CONTEXT==='deploy-preview';
const config:NextConfig={
 env:{VIGNEXO_DIAGNOSTICS_PREVIEW:previewWorkspace?'true':'false',FLEET_WORKSPACE_ENABLED:previewWorkspace?'true':process.env.FLEET_WORKSPACE_ENABLED??'false',PURCHASE_WORKSPACE_ENABLED:previewWorkspace?'true':process.env.PURCHASE_WORKSPACE_ENABLED??'false'},
 allowedDevOrigins:['127.0.0.1'],poweredByHeader:false,output:'standalone',
 async headers(){return [...['/images/alpine-road-v2.webp','/images/alpine-road-mobile-v2.webp'].map(source=>({source,headers:[{key:'Cache-Control',value:'public, max-age=31536000, immutable'}]})),{source:'/:path*',headers:[
 {key:'X-Content-Type-Options',value:'nosniff'},
 {key:'Referrer-Policy',value:'strict-origin-when-cross-origin'},
 {key:'X-Frame-Options',value:'DENY'},
 {key:'Permissions-Policy',value:'camera=(), microphone=(), geolocation=()'},
 {key:'Content-Security-Policy',value:"frame-ancestors 'none'; object-src 'none'; base-uri 'self';"}
  ]},{source:'/auth/callback',headers:[{key:'Referrer-Policy',value:'no-referrer'}]}];}
};
export default config;

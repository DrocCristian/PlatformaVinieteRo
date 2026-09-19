import 'server-only';
import {createClient} from '@supabase/supabase-js';
export function commerceConfigured(){return process.env.COMMERCE_MODE==='test'&&!!process.env.SUPABASE_SERVICE_ROLE_KEY&&!!process.env.STRIPE_SECRET_KEY?.startsWith('sk_test_')&&!!process.env.STRIPE_WEBHOOK_SECRET&&!!process.env.ISSUANCE_WORKER_SECRET;}
export function supabaseAdmin(){
 if(process.env.COMMERCE_MODE!=='test'||!process.env.SUPABASE_SERVICE_ROLE_KEY)throw new Error('Test commerce is not configured');
 return createClient(process.env.SUPABASE_URL!,process.env.SUPABASE_SERVICE_ROLE_KEY,{auth:{persistSession:false,autoRefreshToken:false}});
}

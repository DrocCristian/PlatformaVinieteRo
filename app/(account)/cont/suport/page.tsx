import {currentUser} from '../../../../lib/current-user';
import {SupportForm} from '../../../../components/workspace-forms';
export default async function Support(){
 const {db,user}=await currentUser();const {data,error}=await db.from('support_cases').select('id,subject,message,status,deadline,created_at,response').eq('user_id',user.id).order('created_at',{ascending:false}).limit(100);
 const labels:Record<string,string>={open:'Înregistrată',reviewing:'În analiză',resolved:'Rezolvată'};
 return <><h1>Suport</h1><p>Solicitările sunt păstrate în cont. Nu este un serviciu de urgență.</p><div className="account-grid"><section className="account-card"><h2>Cu ce te putem ajuta?</h2><SupportForm/></section><section className="account-card"><h2>Solicitările tale</h2>{error?<p role="alert">Lista nu a putut fi încărcată.</p>:!data?.length?<p>Nu ai solicitări înregistrate.</p>:data.map(c=><article className="workspace-item" key={c.id}><span className="tag">{labels[c.status]??'Înregistrată'}</span><h3>{c.subject}</h3><p className="preserve-lines">{c.message}</p>{c.response&&<p className="preserve-lines"><strong>Răspuns Vignexo:</strong><br/>{c.response}</p>}<small>Referință: {c.id}{c.deadline?' · Termen indicat: '+c.deadline:''}</small></article>)}</section></div></>;
}

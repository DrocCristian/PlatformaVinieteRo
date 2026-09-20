import Link from 'next/link';
import type { ReactNode } from 'react';
export const dynamic = 'force-dynamic';
export default function AccountLayout({children}:{children:ReactNode}) {
 return <div className="account-scene"><header className="account-header"><Link href="/" className="brand">Vignexo</Link><Link href="/#planifica">← Înapoi la călătorie</Link></header><nav className="workspace-nav" aria-label="Navigația contului"><Link href="/cont">Profil și vehicule</Link><Link href="/cont/firma">Firma și flota</Link><Link href="/cont/calatorii">Călătorii</Link><Link href="/cont/comenzi">Comenzi</Link><Link href="/cont/abonamente">Abonamente</Link><Link href="/cont/notificari">Notificări</Link><Link href="/cont/suport">Suport</Link><Link href="/cont/securitate">Securitate</Link><Link href="/cont/date">Datele mele</Link></nav><main className="account-main">{children}</main><footer className="account-footer">Vignexo · Călătoriile tale, într-un singur loc.</footer></div>;
}

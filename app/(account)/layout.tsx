import Link from 'next/link';
import type { ReactNode } from 'react';
export const dynamic = 'force-dynamic';
export default function AccountLayout({children}:{children:ReactNode}) {
 return <div className="account-scene"><header className="account-header"><Link href="/" className="brand">Viniete<small>RO</small></Link><Link href="/#planifica">← Înapoi la călătorie</Link></header><main className="account-main">{children}</main><footer className="account-footer">PlatformaVinieteRO · Călătoriile tale, într-un singur loc.</footer></div>;
}

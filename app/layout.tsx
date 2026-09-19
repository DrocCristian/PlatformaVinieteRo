import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = {
  title: 'PlatformaVinieteRO · Călătoria începe aici',
  description: 'Planifică vinietele pentru călătoria ta europeană. Versiune de previzualizare.',
  robots: { index: false, follow: false },
};
export default function Layout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="ro"><body>{children}</body></html>;
}

import "./account.css";

import "./catalog.css";

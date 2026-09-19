import type { Metadata } from 'next';
import './globals.css';
import {OfflineRegistration} from '../components/offline-registration';
export const metadata: Metadata = {
  title: 'Vignexo · Călătoria începe aici',
  description: 'Planifică vinietele pentru călătoria ta europeană. Versiune de previzualizare.',
  robots: { index: false, follow: false },
};
export default function Layout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="ro"><body>{children}<OfflineRegistration/></body></html>;
}

import "./account.css";

import "./catalog.css";

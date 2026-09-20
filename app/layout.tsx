import type { Metadata } from 'next';
import './globals.css';
import {OfflineRegistration} from '../components/offline-registration';
export const metadata: Metadata = {
  title: 'Vignexo · Călătoria începe aici',
  description: 'Planifică vinietele pentru călătoria ta europeană. Versiune de previzualizare.',
  robots: { index: false, follow: false },
};
export default function Layout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="ro"><head><link rel="preload" as="image" href="/images/alpine-road-v2.webp" media="(min-width: 701px)" fetchPriority="high"/><link rel="preload" as="image" href="/images/alpine-road-mobile-v2.webp" media="(max-width: 700px)" fetchPriority="high"/></head><body>{children}<OfflineRegistration/></body></html>;
}

import "./account.css";

import "./catalog.css";

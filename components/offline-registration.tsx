'use client';
import {useEffect} from 'react';
export function OfflineRegistration(){useEffect(()=>{if('serviceWorker' in navigator&&window.isSecureContext){navigator.serviceWorker.register('/sw.js',{scope:'/'}).catch(()=>{/* Browsing remains available without offline support. */});}},[]);return null;}

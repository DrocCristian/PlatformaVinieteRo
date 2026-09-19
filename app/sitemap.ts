import type {MetadataRoute} from 'next';
import {publicUrls} from '../packages/i18n/seo';
// Prepared for launch. Public pages remain noindex until explicitly enabled.
export default function sitemap():MetadataRoute.Sitemap{return publicUrls();}

import type {MetadataRoute} from 'next';
import {indexingEnabled,siteUrl} from '../packages/i18n/seo';
export default function robots():MetadataRoute.Robots{
 // Crawling must remain possible so search engines can read the noindex metadata.
 return {rules:{userAgent:'*',allow:'/',disallow:['/api/','/auth/','/cont/']},...(indexingEnabled?{sitemap:siteUrl+'/sitemap.xml'}:{})};
}

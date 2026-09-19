import Catalog from '../../components/public-catalog';
import {publicMetadata} from '../../packages/i18n/seo';
export const metadata=publicMetadata('ro',{},'/catalog');
export default function Page(){return <Catalog/>;}

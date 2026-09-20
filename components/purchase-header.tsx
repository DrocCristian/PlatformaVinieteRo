import Image from 'next/image';
import Link from 'next/link';
import LanguageLinks from './language-links';
import {localizedPath, translator, type Locale, type Messages} from '../packages/i18n/public';

export default function PurchaseHeader({locale, messages, demo = false}: {locale: Locale; messages: Messages; demo?: boolean}) {
  const t = translator(messages);
  return <header className="purchase-header">
    <div className="purchase-header-inner">
      <Link href={localizedPath(locale)} className="purchase-logo" aria-label={t('Vignexo — acasă')}>
        <Image src="/brand/vignexo-mark.svg" width={34} height={36} alt="" unoptimized />
        <span>Vignexo</span>
      </Link>
      <nav aria-label={t('Navigație principală')}>
        <Link className="purchase-help-link" href={localizedPath(locale)+'#intrebari'}>{locale==='ro'?'Ajutor':t('Întrebări frecvente')}</Link>
        <Link href="/cont">{t('Contul meu')}</Link>
        <LanguageLinks locale={locale} messages={messages} queryPath={demo?'/cumpara/demo':undefined}/>
      </nav>
    </div>
  </header>;
}

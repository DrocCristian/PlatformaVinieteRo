import {translator, localizedPath, type Locale, type Messages} from '../packages/i18n/public';
import Link from 'next/link';
import PurchaseDemo from './purchase-demo';
import PurchaseHeader from './purchase-header';
import {purchaseMessages} from '../packages/i18n/purchase';
import '../app/cumpara/demo/style.css';

export default function Home({locale='ro', messages={}}: {locale?: Locale; messages?: Messages}) {
  const t=translator(messages);
  return <div lang={locale} className="purchase-site">
    <a href="#planifica" className="skip">{t('Mergi la planificare')}</a>
    <PurchaseHeader locale={locale} messages={messages}/>
    <main id="planifica">
      <PurchaseDemo embedded locale={locale} messages={{...messages,...purchaseMessages(locale)}}/>
      <section id="intrebari" className="purchase-faq">
        <h2>{t('Înainte de plecare')}</h2>
        <details><summary>{t('Pot cumpăra deja o vinietă?')}</summary><p>{t('Momentan poți explora planificarea călătoriei. Vânzarea se activează separat pentru fiecare țară, după validarea integrării și a condițiilor furnizorului.')}</p></details>
        <Link href={localizedPath(locale,'/catalog')}>{t('Viniete')} <span aria-hidden="true">→</span></Link><Link href="/cont">{t('Contul meu')}</Link>
      </section>
    </main>
  </div>;
}

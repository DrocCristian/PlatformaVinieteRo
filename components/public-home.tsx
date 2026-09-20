import {translator,localizedPath,type Locale,type Messages} from '../packages/i18n/public';
import LanguageLinks from './language-links';
import Link from 'next/link';
import { CheckCircle2, Route, ShoppingCart, CreditCard, Mail, ThumbsUp } from 'lucide-react';
import PurchaseDemo from './purchase-demo';
import {purchaseMessages} from '../packages/i18n/purchase';
import '../app/cumpara/demo/style.css';
export default function Home({locale='ro',messages={}}:{locale?:Locale;messages?:Messages}) {
 const t=translator(messages);
  return <div lang={locale}>
    <a href="#planifica" className="skip">{t("Mergi la planificare")}</a>
    <div className="preview-bar">{t("PREVIZUALIZARE ")}<span>{t("Explorează interfața. Achizițiile nu sunt încă disponibile.")}</span></div>
    <div className="scene">
      <div className="scene-caption"><span>{t("DRUMURI MAI SIMPLE")}<br/>{t("ÎNTR-O EUROPĂ MAI APROPIATĂ")}</span><span>{t("NOUĂ ȚĂRI")}<br/>{t("O SINGURĂ CĂLĂTORIE")}<br/>{t("MAI MULTE EXPERIENȚE")}</span></div>
      <main>
        <div className="showcase">
          <div className="browser-frame">
            <header className="header">
              <Link className="brand" href={localizedPath(locale)} aria-label={t("Vignexo — acasă")}><span className="brand-mark">V<span>↗</span></span><span>Vignexo</span></Link>
              <nav aria-label={t("Navigație principală")}><Link href={localizedPath(locale,'/catalog')}>{t("Viniete")}</Link><a className="active" href="#planifica">{t("Planifică traseul")}</a><a href="#cum-functioneaza">{t("Ghid de călătorie")}</a><a href="#intrebari">{t("Întrebări frecvente")}</a></nav>
              <Link href="/cont" className="language">{t("Contul meu")}</Link>
            </header><LanguageLinks locale={locale} messages={messages}/>
            <section className="hero">
              <div className="hero-content"><h1>{t("Viniete digitale pentru Europa")}</h1><p className="hero-route">{t("Alege țările. Pregătește călătoria.")}</p><h2>{t("Mai multe țări. O singură călătorie.")}</h2>
              <div className="hero-features"><span><CheckCircle2/>{t("Planificare simplă")}</span><span><CheckCircle2/>{t("Toate detaliile, într-un loc")}</span><span><CheckCircle2/>{t("Pregătit pentru drum")}</span></div></div>
              <span className="hero-signature">{t("MAI MULT")}<br/>{t("DRUM")}<br/>{t("MAI MULTĂ")}<br/>{t("LIBERTATE")}<i/></span>
            </section>
            <section id="planifica" aria-label={t("Planificarea călătoriei")}><PurchaseDemo embedded locale={locale} messages={{...messages,...purchaseMessages(locale)}}/></section>
          </div>
          <div className="signpost" aria-hidden="true"><span>{t("AUSTRIA ↗")}</span><span>{t("UNGARIA ↗")}</span><span>{t("ROMÂNIA ↗")}</span></div>
        </div>
        <section className="journey-steps" id="cum-functioneaza" aria-label={t("Cum va funcționa")}>{[
          {Icon:Route,title:t("Planifici traseul"),text:t("Alegi țările pentru călătoria ta")},
          {Icon:ShoppingCart,title:t("Pregătești vinietele"),text:t("Verifici produsele și perioadele")},
          {Icon:CreditCard,title:t("Plătești în siguranță"),text:t("După activarea serviciului")},
          {Icon:Mail,title:t("Primești confirmarea"),text:t("După confirmarea emiterii")},
          {Icon:ThumbsUp,title:t("Te bucuri de călătorie"),text:t("Toate documentele, într-un loc")},
        ].map(({Icon,title,text})=><article key={title}><Icon strokeWidth={1.25}/><h3>{title}</h3><p>{text}</p></article>)}<div className="handwritten">{t("Călătoria")}<br/>{t("care unește.")}</div></section>
        <section id="intrebari" className="faq"><h2>{t("Înainte de plecare")}</h2><details><summary>{t("Pot cumpăra deja o vinietă?")}</summary><p>{t("Momentan poți explora planificarea călătoriei. Vânzarea se activează separat pentru fiecare țară, după validarea integrării și a condițiilor furnizorului.")}</p></details><details><summary>{t("Harta calculează traseul și taxele?")}</summary><p>{t("Harta permite selecția țărilor. Calculul traseului și verificarea drumurilor taxabile nu sunt încă active. Podurile, tunelurile și alte taxe speciale se tratează separat.")}</p></details></section>
      </main>
      <footer><Link href="/conditii-cumparare">{locale==='ro'?'Condiții de cumpărare':'Purchase conditions (RO)'}</Link><span>Vignexo <span className="muted">{t("/ Previzualizare")}</span></span><a href="#planifica">{t("Înapoi la călătorie ↑")}</a></footer>
    </div>
  </div>;
}

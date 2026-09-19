import Link from 'next/link';
import { CheckCircle2, Globe2, Route, ShoppingCart, CreditCard, Mail, ThumbsUp } from 'lucide-react';
import Planner from '../components/planner';
export default function Home() {
  return <>
    <a href="#planifica" className="skip">Mergi la planificare</a>
    <div className="preview-bar">PREVIZUALIZARE <span>Explorează interfața. Achizițiile nu sunt încă disponibile.</span></div>
    <div className="scene">
      <div className="scene-caption"><span>DRUMURI MAI SIMPLE<br/>ÎNTR-O EUROPĂ MAI APROPIATĂ</span><span>NOUĂ ȚĂRI<br/>O SINGURĂ CĂLĂTORIE<br/>MAI MULTE EXPERIENȚE</span></div>
      <main>
        <div className="showcase">
          <div className="browser-frame">
            <header className="header">
              <Link className="brand" href="/" aria-label="PlatformaVinieteRO — acasă"><span className="brand-mark">V<span>↗</span></span><span>Viniete<small>RO</small></span></Link>
              <nav aria-label="Navigație principală"><a href="#destinatii">Viniete</a><a className="active" href="#planifica">Planifică traseul</a><a href="#cum-functioneaza">Ghid de călătorie</a><a href="#intrebari">Întrebări frecvente</a></nav>
              <Link href="/cont" className="language">Contul meu</Link><span className="language"><Globe2 size={17}/> RO</span>
            </header>
            <section className="hero">
              <div className="hero-content"><h1>Viniete pentru traseul tău</h1><p className="hero-route">Austria <span>→</span> Ungaria <span>→</span> România</p><h2>Mai multe țări. O singură călătorie.</h2>
              <div className="hero-features"><span><CheckCircle2/>Planificare simplă</span><span><CheckCircle2/>Toate detaliile, într-un loc</span><span><CheckCircle2/>Pregătit pentru drum</span></div></div>
              <span className="hero-signature">MAI MULT<br/>DRUM<br/>MAI MULTĂ<br/>LIBERTATE<i/></span>
            </section>
            <Planner />
          </div>
          <div className="signpost" aria-hidden="true"><span>AUSTRIA ↗</span><span>UNGARIA ↗</span><span>ROMÂNIA ↗</span></div>
        </div>
        <section className="journey-steps" id="cum-functioneaza" aria-label="Cum va funcționa">{[
          {Icon:Route,title:'Planifici traseul',text:'Alegi țările pentru călătoria ta'},
          {Icon:ShoppingCart,title:'Pregătești vinietele',text:'Verifici produsele și perioadele'},
          {Icon:CreditCard,title:'Plătești în siguranță',text:'După activarea serviciului'},
          {Icon:Mail,title:'Primești confirmarea',text:'După confirmarea emiterii'},
          {Icon:ThumbsUp,title:'Te bucuri de călătorie',text:'Toate documentele, într-un loc'},
        ].map(({Icon,title,text})=><article key={title}><Icon strokeWidth={1.25}/><h3>{title}</h3><p>{text}</p></article>)}<div className="handwritten">Călătoria<br/>care unește.</div></section>
        <section className="subscriptions" id="abonamente"><div><span className="eyebrow">PENTRU DRUMURILE TALE</span><h2>Călătorești des?</h2><p>Două servicii distincte, cu control asupra fiecărei reînnoiri.</p></div><article><span className="tag">ÎN PREGĂTIRE</span><h3>Reînnoirea vinietelor</h3><p>Autorizare separată pentru vehicul și produs. Disponibilitatea și condițiile vor fi stabilite pentru fiecare țară.</p></article><article><span className="tag">ÎN PREGĂTIRE</span><h3>Abonament de servicii</h3><p>Planuri lunare și anuale, cu vinietele achitate separat. Beneficiile și prețurile urmează să fie definite.</p></article></section>
        <section id="intrebari" className="faq"><h2>Înainte de plecare</h2><details><summary>Pot cumpăra deja o vinietă?</summary><p>Momentan poți explora planificarea călătoriei. Vânzarea se activează separat pentru fiecare țară, după validarea integrării și a condițiilor furnizorului.</p></details><details><summary>Harta calculează traseul și taxele?</summary><p>Harta permite selecția țărilor. Calculul traseului și verificarea drumurilor taxabile nu sunt încă active. Podurile, tunelurile și alte taxe speciale se tratează separat.</p></details></section>
      </main>
      <footer><span>PlatformaVinieteRO <span className="muted">/ Previzualizare locală</span></span><a href="#planifica">Înapoi la călătorie ↑</a></footer>
    </div>
  </>;
}

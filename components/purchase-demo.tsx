'use client';
import { useRef, useState } from 'react';
import Link from 'next/link';
import EuropeMap from './europe-map';
import PurchaseValidity from './purchase-validity';
import PassengerCarDetails from './passenger-car-details';
import {validateCarAnswers,carCategoryHints} from '../packages/domain/passenger-car';
import {validatePurchaseTechnical,requiredPurchaseFields} from '../packages/domain/purchase-validity';
import { ArrowRight, Check, CarFront, Truck, ShieldCheck, Plus, X, CalendarDays } from 'lucide-react';
import { countries, normalizePlate, type CountryCode } from '../packages/domain/countries';
import { formatTravelDate, localToday } from '../packages/domain/catalog';
import { availableDurations, purchaseGuides, trailerGuidance, validatePurchaseDraft, type PurchaseVehicle, type Selection } from '../packages/domain/purchase-preview';
import { translator, type Locale, type Messages } from '../packages/i18n/public';
import { durationLabel } from '../packages/i18n/purchase-labels';
import type { SavedPurchaseVehicle, PreparedPurchase } from '../packages/domain/purchase-workspace';
const types: {
    id: PurchaseVehicle;
    title: string;
    detail: string;
}[] = [
    { id: 'car', title: 'Autoturism', detail: 'Până la 3,5 t · categoria din talon se confirmă' },
    { id: 'van', title: 'Autoutilitară', detail: 'Până la 3,5 t · transport de marfă' },
    { id: 'heavy', title: 'Camion / cap tractor', detail: 'Peste 3,5 t · verificare pe rută' },
    { id: 'other', title: 'Autorulotă / autobuz / altul', detail: 'Încadrare separată, după talon' },
];
function Flag({ code }: {
    code: CountryCode;
}) { return <span className={'flag flag-' + code} aria-hidden="true">{code === 'CH' ? '+' : ''}</span>; }
export default function PurchaseDemo({ saved, onPrepare, embedded = false, locale = 'ro', messages = {} }: {
    embedded?: boolean;
    locale?: Locale;
    messages?: Messages;
    saved?: SavedPurchaseVehicle;
    onPrepare?: (draft: PreparedPurchase) => void;
}) {
    const t = translator(messages);
    const countryName = (code: string) => new Intl.DisplayNames([locale], { type: 'region' }).of(code) ?? code;
    const duration = (id: string, label: string) => durationLabel(id, label, locale);
    const [step, setStep] = useState(1);
    const [carAnswers, setCarAnswers] = useState<Record<string,string>>({});
    const [technicalProfile, setTechnicalProfile] = useState<Record<string, string>>({...saved?.technical,...Object.fromEntries(Object.entries(saved?.trailer?.technical??{}).map(([k,v])=>['trailer-'+k,v]))});
    const [plate, setPlate] = useState(saved?.plate ?? '');
    const [registration, setRegistration] = useState(saved?.registration ?? 'RO');
    const [vin, setVin] = useState(saved?.vin ?? '');
    const [legacyVin, setLegacyVin] = useState(saved?.legacyVin ?? false);
    const [vehicle, setVehicle] = useState<PurchaseVehicle>(saved?.vehicle ?? 'car');
    const [trailer, setTrailer] = useState(!!saved?.trailer);
    const [trailerPlate, setTrailerPlate] = useState(saved?.trailer?.plate ?? '');
    const [trailerCountry, setTrailerCountry] = useState(saved?.trailer?.country ?? 'RO');
    const [trailerVin, setTrailerVin] = useState(saved?.trailer?.vin ?? '');
    const [selections, setSelections] = useState<Selection[]>([]);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [notify, setNotify] = useState(false);
    const [confirmed, setConfirmed] = useState(false);
    const [route, setRoute] = useState({ from: '', to: '', via: '' });
    const title = useRef<HTMLHeadingElement>(null);
    const form = useRef<HTMLFormElement>(null);
    const Content = embedded ? 'div' : 'main';
    const technical = vehicle === 'heavy' || vehicle === 'other';
    const simpleCar = vehicle === 'car' && !trailer && !saved;
    function go(next: number) { setStep(next); setErrors({}); setConfirmed(false); requestAnimationFrame(() => { title.current?.focus(); title.current?.scrollIntoView({ block: 'start', behavior: 'smooth' }); }); }
    function update(code: CountryCode, patch: Partial<Selection>) { setSelections(old => old.map(s => s.country === code ? { ...s, ...patch } : s)); setErrors({}); setConfirmed(false); }
    function toggle(code: CountryCode) { setSelections(old => old.some(s => s.country === code) ? old.filter(s => s.country !== code) : [...old, { country: code, duration: '', start: '', time: '', year: String(new Date().getFullYear()) }]); setErrors({}); setConfirmed(false); if(step===3)setStep(2); }
    const attrs = (id: string) => ({ id, 'aria-invalid': !!errors[id], 'aria-describedby': errors[id] ? id + '-error' : undefined });
    const error = (id: string) => errors[id] ? <span lang={messages[errors[id]]?locale:'ro'} className="purchase-error" id={id + '-error'}>{t(errors[id])}</span> : null;
    function next() {
        const all = validatePurchaseDraft({ plate, registration, vin, legacyVin, vehicle, selections }, localToday());
        const current = step === 1 ? Object.fromEntries(Object.entries(all).filter(([key]) => (['plate', 'registration'].includes(key) || (key==='vin' && !!vin.trim())))) : all;
        if (trailer && !/^[A-Z0-9]{2,12}$/.test(normalizePlate(trailerPlate)))
            current['trailer-plate'] = t("Completeaz\u0103 num\u0103rul remorcii.");
        if (trailer && !/^[A-Z]{2}$/.test(trailerCountry))
            current['trailer-country'] = t("Introdu codul \u021B\u0103rii din talon.");
        if (step === 2 && technical && (!route.from.trim() || !route.to.trim()))
            current['route-from'] = t("Completeaz\u0103 plecarea \u0219i destina\u021Bia pentru verificarea traseului.");
        if(step===2&&!saved)Object.assign(current,simpleCar?validateCarAnswers(carAnswers,selections.map(s=>s.country)):validatePurchaseTechnical(technicalProfile,vehicle,trailer,selections.map(s=>s.country)));
        setErrors(current);
        if (Object.keys(current).length) {
            requestAnimationFrame(() => { const field=form.current?.querySelector<HTMLElement>('[aria-invalid="true"]'); const details=field?.closest('details'); if(details)details.open=true; field?.focus(); });
            return;
        }
        go(step + 1);
    }
    return <div className={'purchase-demo'+(embedded?' purchase-embedded':'')}>
  {!embedded && <header className="purchase-header"><Link href="/" className="purchase-logo">vignexo<span>↗</span></Link><span>{t("Vinietele tale. Mai simplu.")}</span><Link href="/cont">{t("Contul meu")}</Link></header>}
  <div className="purchase-notice">{t("PREVIZUALIZARE \u00B7 Nu se emit viniete \u0219i nu se \u00EEncaseaz\u0103 pl\u0103\u021Bi.")}</div>
  <Content className="purchase-main">
   {!embedded && <div className="purchase-heading"><p className="purchase-eyebrow">{t("PREG\u0102TIT PENTRU URM\u0102TORUL DRUM")}</p><h1>{t("Alege perioada.")}<br /><span>{t("Noi adun\u0103m detaliile.")}</span></h1><p>{t("Un vehicul, mai multe \u021B\u0103ri, un singur rezumat.")}</p></div>}
   <ol className="purchase-steps" aria-label={t("Pa\u0219ii comenzii")}>{[t("Vehiculul t\u0103u"), t("\u021A\u0103ri \u0219i durate"), t("Verificare \u0219i plat\u0103")].map((label, i) => <li key={label} aria-current={step === i + 1 ? 'step' : undefined}><span>{step > i + 1 ? <Check size={17}/> : i + 1}</span>{label}</li>)}</ol>
   {embedded && step===1 && <div className="purchase-map"><EuropeMap messages={messages} selected={selections.map(s=>s.country)} onToggle={toggle}/></div>}
   <div className="purchase-grid"><form ref={form} noValidate onSubmit={e => { e.preventDefault(); next(); }} className="purchase-card">
    <h2 tabIndex={-1} ref={title}>{step === 1 ? t("Cu ce vehicul c\u0103l\u0103tore\u0219ti?") : step === 2 ? t("Unde ai nevoie de viniet\u0103?") : t("Verific\u0103 \u00EEnainte de plat\u0103")}</h2>
    {Object.keys(errors).length > 0 && <div className="purchase-inset purchase-error" role="alert"><strong>{t("Mai sunt date de verificat:")}</strong><ul>{Object.entries(errors).map(([key, message]) => <li key={key}>{t(message)}</li>)}</ul>{step > 1 && <button type="button" className="purchase-back" onClick={() => go(1)}>{t("Editeaz\u0103 datele vehiculului")}</button>}</div>}
    {step === 1 && <>
     <p>{t("Completezi datele o singur\u0103 dat\u0103 pentru toate \u021B\u0103rile alese.")}</p>{saved && <p>{t("Date din cont. Pentru modific\u0103ri,")}<Link href={saved.companyId ? '/cont/firma' : '/cont'}>{t("editeaz\u0103 vehiculul")}</Link>{t(", apoi re\u00EEncarc\u0103 formularul.")}</p>}<fieldset disabled={!!saved} style={{ border: 0, padding: 0, margin: 0, minWidth: 0 }}>
     <div className="purchase-fields"><label htmlFor="registration">{t("\u021Aara de \u00EEnmatriculare")}<select {...attrs('registration')} value={registration} onChange={e => {setRegistration(e.target.value);setCarAnswers({});}}>{[...countries, { code: 'DE', name: t("Germania") }, { code: 'IT', name: t("Italia") }, { code: 'FR', name: t("Fran\u021Ba") }, { code: 'PL', name: 'Polonia' }, { code: 'GR', name: 'Grecia' }, { code: 'UA', name: 'Ucraina' }, { code: 'GB', name: 'Regatul Unit' }].map(c => <option key={c.code} value={c.code}>{countryName(c.code)}</option>)}</select>{error('registration')}</label>
     <label htmlFor="plate">{t("Num\u0103r de \u00EEnmatriculare")}<input {...attrs('plate')} value={plate} maxLength={20} autoComplete="off" placeholder={t("Ex. TM 12 ABC")} onChange={e => {setPlate(e.target.value);setCarAnswers({});}}/>{error('plate')}</label></div>
     <details className="passenger-optional"><summary>{locale==='ro'?'Adaugă seria de șasiu (opțional acum)':'VIN — optional at this step'}</summary>     <label htmlFor="vin">{t("VIN / seria de \u0219asiu")}<span className="purchase-optional">{t("\u2014 dac\u0103 este cerut\u0103 de \u021Bara aleas\u0103")}</span><input {...attrs('vin')} value={vin} maxLength={32} autoComplete="off" placeholder={t("Din c\u00E2mpul E al talonului")} onChange={e => setVin(e.target.value.toUpperCase())}/>{error('vin')}</label>
     <label className="purchase-check"><input type="checkbox" checked={legacyVin} onChange={e => setLegacyVin(e.target.checked)}/>{t("Vehicul vechi cu serie de \u0219asiu nestandard (verificare separat\u0103)")}</label>
</details>
     <fieldset className="purchase-type"><legend>{t("Tipul vehiculului")}</legend><div>{types.map(t => <label key={t.id} className={vehicle === t.id ? 'is-selected' : ''}><input type="radio" name="vehicle" value={t.id} checked={vehicle === t.id} onChange={() => { setVehicle(t.id); setCarAnswers({}); setSelections(old => old.map(s => ({ ...s, duration: '' }))); }}/>{t.id === 'heavy' ? <Truck size={23}/> : <CarFront size={23}/>}<strong>{t.title && translator(messages)(t.title)}</strong><small>{translator(messages)(t.detail)}</small></label>)}</div></fieldset>
     <label className="purchase-check"><input type="checkbox" checked={trailer} onChange={e => setTrailer(e.target.checked)}/>{t("Am remorc\u0103, rulot\u0103 sau semiremorc\u0103")}</label>
     {trailer && <div className="purchase-inset"><div className="purchase-fields"><label htmlFor="trailer-plate">{t("Num\u0103rul remorcii")}<input {...attrs('trailer-plate')} value={trailerPlate} onChange={e => setTrailerPlate(e.target.value)} maxLength={20}/>{error('trailer-plate')}</label><label htmlFor="trailer-country">{t("\u021Aara remorcii (cod)")}<input {...attrs('trailer-country')} value={trailerCountry} maxLength={2} onChange={e => setTrailerCountry(e.target.value.toUpperCase())}/>{error('trailer-country')}</label></div><label htmlFor="trailer-vin">{t("Seria remorcii (op\u021Bional \u00EEn demo)")}<input id="trailer-vin" value={trailerVin} maxLength={32} onChange={e => setTrailerVin(e.target.value.toUpperCase())}/></label><p>{t("Masele, axele \u0219i categoria ansamblului vor fi verificate \u00EEnainte de ofert\u0103. Remorca nu \u00EEnseamn\u0103 automat \u00EEnc\u0103 o viniet\u0103.")}</p></div>}
     </fieldset><p className="purchase-fine">{t("Datele r\u0103m\u00E2n \u00EEn aceast\u0103 pagin\u0103 \u0219i se \u0219terg la re\u00EEnc\u0103rcare. Selec\u021Bia tipului nu \u00EEnlocuie\u0219te \u00EEncadrarea din talon.")}</p>
    </>}
    {step === 2 && <>
     <p>{t("Alege \u021B\u0103rile, apoi durata disponibil\u0103 \u0219i data de \u00EEnceput pentru fiecare.")}</p>
     <div className="purchase-countries" id="countries" tabIndex={-1} aria-invalid={!!errors.countries}>{countries.map(c => <button type="button" aria-pressed={selections.some(s => s.country === c.code)} key={c.code} onClick={() => toggle(c.code)}><Flag code={c.code}/>{countryName(c.code)}{selections.some(s => s.country === c.code) ? <Check size={16}/> : <Plus size={16}/>}</button>)}</div>{error('countries')}
     {selections.map(s => {
                const guide = purchaseGuides[s.country], options = availableDurations(s.country, vehicle), option = options.find(o => o.id === s.duration);
                return <section key={s.country} className="purchase-country-card"><header><h3><Flag code={s.country}/>{countryName(s.country)}</h3><button type="button" aria-label={t('Elimină ')+countryName(s.country)} onClick={() => toggle(s.country)}><X size={18}/></button></header>
      {options.length > 0 ? <><label htmlFor={'duration-' + s.country}>{t("Pentru c\u00E2t timp?")}<select {...attrs('duration-' + s.country)} value={s.duration} onChange={e => update(s.country, { duration: e.target.value, time: '' })}><option value="">{t("Alege durata")}</option>{options.map(o => <option key={o.id} value={o.id}>{duration(o.id, o.label)}</option>)}</select>{error('duration-' + s.country)}</label>{option?.note && <div>{locale!=='ro'&&<small>{t('Note tehnice în română; consultă și sursa oficială.')}</small>}<p lang="ro">{option.note}</p></div>}</> : <div className="purchase-inset"><strong>{t("Verificare separat\u0103 a taxei")}</strong>{locale !== 'ro' && <p>{t('Note tehnice în română; consultă și sursa oficială.')}</p>}<p lang="ro">{guide.heavy}</p></div>}
      <div className="purchase-fields"><label htmlFor={'start-' + s.country}>{option?.annual ? t("Data la care vei circula") : t("Data de \u00EEnceput")}<input {...attrs('start-' + s.country)} type="date" value={s.start} onChange={e => update(s.country, { start: e.target.value })}/>{error('start-' + s.country)}</label>
       {option?.time && <label htmlFor={'time-' + s.country}>{t("Ora local\u0103 (Bulgaria)")}<input {...attrs('time-' + s.country)} type="time" value={s.time} onChange={e => update(s.country, { time: e.target.value })}/>{error('time-' + s.country)}</label>}
       {option?.annual && <label htmlFor={'year-' + s.country}>{t("Anul vinietei")}<input {...attrs('year-' + s.country)} type="number" value={s.year} onChange={e => update(s.country, { year: e.target.value })}/>{error('year-' + s.country)}</label>}
      </div>

      <PurchaseValidity selection={s} vehicle={vehicle} locale={locale}/>
      <details><summary>{t("Valabilitate \u0219i condi\u021Bii de verificat")}</summary>{locale !== 'ro' && <p>{t('Note tehnice în română; consultă și sursa oficială.')}</p>}<p lang="ro">{guide.note}</p><a href={guide.source} target="_blank" rel="noreferrer">{t("Sursa consultat\u0103 \u2197")}</a></details>
      {trailer && <p lang="ro" className="purchase-trailer">{trailerGuidance(s.country, vehicle)}</p>}
     </section>;
            })}
     {selections.some(s => purchaseGuides[s.country].vin) && <label htmlFor="vin">{t("VIN / seria de \u0219asiu necesar\u0103")}<input {...attrs('vin')} readOnly={!!saved} value={vin} maxLength={32} onChange={e => setVin(e.target.value.toUpperCase())}/>{error('vin')}<small>{t("Seria nestandard poate fi declarat\u0103 la pasul Vehicul.")}</small></label>}
     {simpleCar ? <>{locale!=='ro'&&<p>{t('Note tehnice în română; consultă și sursa oficială.')}</p>}<PassengerCarDetails answers={carAnswers} countries={selections.map(s=>s.country)} errors={errors} onChange={answers=>{setCarAnswers(answers);setErrors({});setConfirmed(false);}}/></> : <section className="purchase-technical">{locale!=='ro'&&<p>{t('Note tehnice în română; consultă și sursa oficială.')}</p>}<h3>{t("Date pentru \u00EEncadrare din talon")}</h3><p>{t("Necesar \u00EEnainte de oferta final\u0103: categoria, masele \u0219i, dup\u0103 \u021Bar\u0103, axele, emisiile \u0219i configura\u021Bia ansamblului. Datele de aici nu produc un tarif.")}</p><div className="purchase-fields">{[['category', t("Categoria J")], ['f1', t("Masa F.1 (kg)")], ['f2', t("Masa F.2 (kg)")], ['f3', t("Masa ansamblului F.3 (kg)")], ['axles', t("Axe vehicul")], ['seats', t("Locuri S.1")], ['euro', t("Norma EURO")], ['co2', t("Clasa CO\u2082")], ['frontHeightMm', 'Înălțime deasupra axei față (mm)'], ['fuel', 'Combustibil / propulsie'], ['wheels', 'Număr de roți'], ...(trailer ? [['trailer-category', 'Categoria J a remorcii'], ['trailer-f1', t("Remorc\u0103 F.1 (kg)")], ['trailer-f2', t("Remorc\u0103 F.2 (kg)")], ['trailer-axles', t("Axe remorc\u0103")]] : [])].filter(([id])=>requiredPurchaseFields(vehicle,trailer,selections.map(s=>s.country)).has(id)).map(([id, label]) => <label key={id} htmlFor={'technical-' + id}>{t(label)}<input readOnly={!!saved} {...attrs('technical-' + id)} value={technicalProfile[id] ?? ''} maxLength={20} onChange={e => setTechnicalProfile({ ...technicalProfile, [id]: e.target.value })}/>{error('technical-'+id)}</label>)}</div>{saved && <p><Link href={saved.companyId?'/cont/firma':'/cont'}>{t('Editează datele vehiculului')}</Link></p>}</section>}
     {technical && <section className="purchase-inset"><h3>{t("Ruta pentru vehiculul greu")}</h3><div className="purchase-fields"><label htmlFor="route-from">{t("De unde pleci?")}<input {...attrs('route-from')} value={route.from} onChange={e => setRoute({ ...route, from: e.target.value })}/>{error('route-from')}</label><label htmlFor="route-to">{t("Unde ajungi?")}<input id="route-to" value={route.to} onChange={e => setRoute({ ...route, to: e.target.value })}/></label></div><label htmlFor="route-via">{t("Puncte intermediare / autostr\u0103zi")}<input id="route-via" value={route.via} onChange={e => setRoute({ ...route, via: e.target.value })}/></label><p>{t("Ruta este o cerere de verificare. Nu calcul\u0103m kilometri taxabili din distan\u021Ba \u00EEn linie dreapt\u0103 \u0219i nu confirm\u0103m accesul pe drum.")}</p></section>}
    </>}
    {step === 3 && <>
     {saved && Object.keys(validatePurchaseTechnical(technicalProfile,vehicle,trailer,selections.map(s=>s.country))).length>0 && <div className="purchase-inset" lang="ro"><strong>Date din talon încă de verificat</strong><p>Ciorna poate fi păstrată, dar nu este o ofertă. Completează profilul vehiculului înainte de cumpărare.</p></div>}
     <div className="purchase-plate"><span>{registration}</span><strong>{normalizePlate(plate)}</strong></div><p>{t(types.find(t => t.id === vehicle)?.title ?? '')}{vin ? ' · VIN: ' + vin : ''}</p>{trailer && <p>{t("Remorc\u0103:")}{trailerCountry} · {normalizePlate(trailerPlate)}{trailerVin ? ' · ' + trailerVin : ''}{t("\u2014 \u00EEncadrare de verificat")}</p>}
     {simpleCar && <ul className="passenger-review" lang="ro">{carCategoryHints(carAnswers,selections.map(s=>s.country)).map(hint=><li key={hint}>{hint}</li>)}</ul>}
     <dl className="purchase-technical-review">{[['category',t('Categoria J')],['f1',t('Masa F.1 (kg)')],['f2',t('Masa F.2 (kg)')],['seats',t('Locuri S.1')],['axles',t('Axe vehicul')],['euro',t('Norma EURO')]].filter(([key])=>technicalProfile[key]).map(([key,label])=><div key={key}><dt>{label}</dt><dd>{technicalProfile[key]}</dd></div>)}</dl>
     {technical && <p>{t("Ruta:")}{route.from} → {route.to}{route.via ? ' · prin ' + route.via : ''}</p>}
     <div className="purchase-review">{selections.map(s => <article key={s.country}><h3><Flag code={s.country}/>{countryName(s.country)}</h3><p>{duration(s.duration, availableDurations(s.country, vehicle).find(o => o.id === s.duration)?.label ?? t('Taxă de verificat pe rută'))}{s.duration === 'annual' ? ' ' + s.year : ''} · {formatTravelDate(s.start)}{s.time ? ' ' + s.time + ' (ora locală)' : ''}</p><PurchaseValidity selection={s} vehicle={vehicle} locale={locale}/><small>{t("Valabilitatea final\u0103, categoria \u0219i eventualele taxe separate se confirm\u0103 \u00EEn oferta emitentului.")}</small>{trailer && <p>{trailerGuidance(s.country, vehicle)}</p>}</article>)}</div>
     <label className="purchase-check"><input type="checkbox" checked={notify} onChange={e => setNotify(e.target.checked)}/>{t("Vreau s\u0103 fiu notificat \u00EEnainte de expirare (op\u021Bional; serviciu \u00EEn preg\u0103tire)")}</label>
     <label className="purchase-check"><input type="checkbox" checked={confirmed} onChange={e => setConfirmed(e.target.checked)}/>{t("Am verificat num\u0103rul, seria de \u0219asiu \u0219i selec\u021Biile.")}</label>
     <div className="purchase-inset"><strong>{t("Factura \u0219i documentele")}</strong><p>{t("Comanda va putea avea o factur\u0103 comun\u0103 pentru pozi\u021Biile compatibile fiscal. Documentele \u0219i rapoartele vor fi disponibile \u00EEn cont.")}</p></div>
    </>}
    <div className="purchase-actions">{step > 1 && <button type="button" className="purchase-back" onClick={() => go(step - 1)}>{t("\u2190 \u00CEnapoi")}</button>}{step < 3 ? <button className="purchase-primary" type="submit">{step === 1 ? t("Alege \u021B\u0103rile") : t("Verific\u0103 selec\u021Bia")}<ArrowRight size={19}/></button> : onPrepare ? <button className="purchase-primary" type="button" disabled={!confirmed} onClick={() => onPrepare({ plate, registration, vin, legacyVin, vehicle, selections, route, notify })}>{t("Adaug\u0103 vehiculul \u00EEn comanda comun\u0103")}</button> : <button className="purchase-primary" type="button" disabled>{confirmed ? t("Plata se activeaz\u0103 dup\u0103 oferta furnizorului") : t("Verific\u0103 \u0219i confirm\u0103 datele")}</button>}</div>
   </form><aside className="purchase-card purchase-summary"><span className="purchase-eyebrow">{t("C\u0102L\u0102TORIA TA")}</span><h2>{t("Totul \u00EEntr-un loc")}</h2><div className="purchase-summary-vehicle"><CarFront size={25}/><span>{plate ? normalizePlate(plate) : t("Vehiculul t\u0103u")}<small>{t(types.find(t => t.id === vehicle)?.title ?? '')}</small></span></div>{selections.length === 0 ? <p className="purchase-empty">{t("\u021A\u0103rile \u0219i perioadele alese vor ap\u0103rea aici.")}</p> : selections.map(s => <div className="purchase-summary-line" key={s.country}><Flag code={s.country}/><div><strong>{countryName(s.country)}</strong><small>{duration(s.duration, availableDurations(s.country, vehicle).find(o => o.id === s.duration)?.label ?? t('De selectat / verificat'))}{s.duration === 'annual' ? ' ' + s.year : ''}</small>{s.start && <small><CalendarDays size={12}/> {formatTravelDate(s.start)}</small>}</div><span>—</span></div>)}<div className="purchase-total"><span>{t("Total de plat\u0103")}</span><strong>{t("\u00CEn a\u0219teptarea ofertei")}</strong></div><p>{t("Taxa emitentului, serviciul Vignexo \u0219i totalul vor fi afi\u0219ate separat \u00EEnainte de plat\u0103.")}</p><div className="purchase-trust"><ShieldCheck size={20}/><span>{t("O sum\u0103 final\u0103 numai dup\u0103 verificarea tuturor produselor.")}</span></div><Link href="/flote/demo">{t("Ai mai multe ma\u0219ini? Vezi Vignexo Business \u2192")}</Link></aside></div>
   <footer className="purchase-footer"><Link href="/conditii-cumparare">{locale==='ro'?'Condiții de cumpărare și rambursare (în pregătire)':'Purchase conditions — Romanian draft'}</Link><br/>{t("Vinieta acoper\u0103 re\u021Beaua \u0219i categoria produsului ales. Podurile, tunelurile, taxele kilometrice \u0219i restric\u021Biile de circula\u021Bie se verific\u0103 separat.")}</footer>
  </Content>
 </div>;
}

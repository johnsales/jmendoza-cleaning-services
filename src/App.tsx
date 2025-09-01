import { useEffect, useMemo, useRef, useState } from "react"
import {
  calculateTotal,
  buildBreakdown,
  RATES,
  type Extras,
  type PricingMode,
  type VisitType,
} from "./pricing"

type Lang = "en" | "es"
const t = {
  en: {
    brand: "Mendoza Cleaning Services",
    tagline: "Leave the cleaning to us",
    getQuote: "Instant Quote",
    homeSqFt: "Home square feet",
    bedrooms: "Bedrooms",
    bathrooms: "Bathrooms",
    yes: "Yes",
    no: "No",
    blinds: "Dusting blinds",
    oven: "Oven cleaning",
    windows: "Window cleaning",
    bedsheets: "Change bedsheets",
    laundry: "Wash & dry laundry",
    fridge: "Fridge cleaning",
    baseboards: "Baseboard cleaning",
    cabinets: "Cabinet cleaning",
    total: "Estimated total",
    breakdown: "Price breakdown",
    base: "Base",
    bedsheetsFee: "Bedsheets",
    extras: "Extras",
    book: "Book it",
    review: "Review & book",
    details: "Your details",
    name: "Full name",
    email: "Email",
    phone: "Phone",
    address: "Address",
    date: "Preferred date",
    notes: "Notes",
    confirm: "Confirm booking",
    cancel: "Cancel",
    sending: "Sending...",
    submitted: "Booked! We’ll email you a confirmation.",
    error: "Something went wrong. Please try again.",
    lang: "Español",
    callNow: "Call now",
    emailUs: "Email us",
    selected: "Selected services",
    none: "None",
    required: "Please fill name, email and phone.",

    // new
    pricingBy: "Pricing by",
    bySqft: "Square footage",
    byRooms: "Number of rooms",
    visitType: "Visit type",
    regular: "Regular",
    firstVisit: "First visit",
    moveOut: "Move-out",
    deepClean: "Deep clean",
    construction: "Construction cleanup",
    roomsLine: "Rooms (beds or baths)",
  },
  es: {
    brand: "Mendoza Cleaning Services",
    tagline: "Déjanos la limpieza a nosotros",
    getQuote: "Cotización inmediata",
    homeSqFt: "Superficie del hogar (pies²)",
    bedrooms: "Dormitorios",
    bathrooms: "Baños",
    yes: "Sí",
    no: "No",
    blinds: "Quitar polvo de persianas",
    oven: "Limpieza de horno",
    windows: "Limpieza de ventanas",
    bedsheets: "Cambiar sábanas",
    laundry: "Lavar y secar ropa",
    fridge: "Limpieza del refrigerador",
    baseboards: "Limpieza de zócalos",
    cabinets: "Limpieza de gabinetes",
    total: "Total estimado",
    breakdown: "Desglose de precio",
    base: "Base",
    bedsheetsFee: "Sábanas",
    extras: "Extras",
    book: "Reservar",
    review: "Revisar y reservar",
    details: "Tus datos",
    name: "Nombre completo",
    email: "Correo",
    phone: "Teléfono",
    address: "Dirección",
    date: "Fecha preferida",
    notes: "Notas",
    confirm: "Confirmar reserva",
    cancel: "Cancelar",
    sending: "Enviando...",
    submitted: "¡Reservado! Te enviaremos confirmación por correo.",
    error: "Ocurrió un error. Intenta nuevamente.",
    lang: "English",
    callNow: "Llámanos",
    emailUs: "Escríbenos",
    selected: "Servicios seleccionados",
    none: "Ninguno",
    required: "Completa nombre, correo y teléfono.",

    // new
    pricingBy: "Calcular por",
    bySqft: "Pies cuadrados",
    byRooms: "Número de cuartos",
    visitType: "Tipo de visita",
    regular: "Regular",
    firstVisit: "Primera visita",
    moveOut: "Mudanza",
    deepClean: "Limpieza profunda",
    construction: "Limpieza de obra",
    roomsLine: "Cuartos (dormitorios or baños)",
  },
} as const

export default function App() {
  const [lang, setLang] = useState<Lang>("en")
  const L = t[lang]

  // pricing hierarchy
  const [mode, setMode] = useState<PricingMode>("sqft")
  const [visit, setVisit] = useState<VisitType>("regular")

  // inputs
  const [sqft, setSqft] = useState(1000)
  const [bedrooms, setBedrooms] = useState(2)
  const [bathrooms, setBathrooms] = useState(2)
  const [extras, setExtras] = useState<Extras>({
    blinds: false, oven: false, windows: false, bedsheets: false,
    laundry: false, fridge: false, baseboards: false, cabinets: false,
  })

  // booking fields (collected in modal)
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [address, setAddress] = useState("")
  const [date, setDate] = useState("")
  const [notes, setNotes] = useState("")

  const [status, setStatus] = useState<"idle"|"sending"|"ok"|"err">("idle")
  const [open, setOpen] = useState(false)

  const total = useMemo(
    () => calculateTotal(mode, visit, sqft, bedrooms, bathrooms, extras),
    [mode, visit, sqft, bedrooms, bathrooms, extras]
  )

  const breakdown = useMemo(
    () => buildBreakdown(mode, visit, sqft, bedrooms, bathrooms, extras),
    [mode, visit, sqft, bedrooms, bathrooms, extras]
  )

  const toggle = (key: keyof Extras) =>
    setExtras(prev => ({ ...prev, [key]: !prev[key] }))

  // modal accessibility: close on ESC
  const overlayRef = useRef<HTMLDivElement | null>(null)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false) }
    if (open) window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [open])

  async function submit() {
    if (!name.trim() || !email.trim() || !phone.trim()) {
      alert(L.required)
      return
    }
    setStatus("sending")
    try {
      const res = await fetch("/api/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lang,
          quote: { mode, visit, sqft, bedrooms, bathrooms, extras, total },
          booking: { name, email, phone, address, date, notes },
        }),
      })
      if (!res.ok) throw new Error("Request failed")
      setStatus("ok")
      setOpen(false)
    } catch {
      setStatus("err")
    }
  }

  const Label: React.FC<{children: React.ReactNode}> = ({children}) => (
    <label className="block text-sm font-semibold text-gray-800 mb-1">{children}</label>
  )
  const Counter: React.FC<{value:number; set:(n:number)=>void; min?:number; step?:number;}> =
  ({ value, set, min = 0, step = 1 }) => (
    <div className="flex items-center gap-2">
      <button type="button" className="btn-ghost px-3" onClick={() => set(Math.max(min, value - step))}>−</button>
      <input
        type="number"
        className="w-full rounded-2xl border px-3 py-2 text-center"
        value={value} min={min} step={step}
        onChange={e => set(Number(e.target.value || 0))}
      />
      <button type="button" className="btn-ghost px-3" onClick={() => set(value + step)}>+</button>
    </div>
  )
  const YesNo: React.FC<{val:boolean; on:()=>void; off:()=>void}> = ({val,on,off}) => (
    <div className="flex gap-2">
      <button type="button" className={`pill ${val ? "pill--on" : "pill--off"}`} onClick={on}>{L.yes}</button>
      <button type="button" className={`pill ${!val ? "pill--on" : "pill--off"}`} onClick={off}>{L.no}</button>
    </div>
  )

  const selectedExtras = Object.entries(extras).filter(([,v])=>v).map(([k])=>k)

  const visitLabel = {
    regular: L.regular,
    firstVisit: L.firstVisit,
    moveOut: L.moveOut,
    deepClean: L.deepClean,
    construction: L.construction,
  }[visit]

  const modeText =
    mode === "sqft"
      ? `${sqft} sqft @ ${RATES.perSqFt[visit].toFixed(2)}/sqft`
      : `${bedrooms + bathrooms} rooms @ $${RATES.perRoom[(visit === "construction" ? "deepClean" : visit) as keyof typeof RATES.perRoom]}`

  const waNumber = "18655075786" // your number, digits only
  const waText = encodeURIComponent(
    `${lang==="es" ? "Hola" : "Hi"}, ${
      lang==="es" ? "me interesa una limpieza" : "I'm interested in a cleaning"
    }. ${L.total}: ${total.toFixed(2)} · ${L.visitType}: ${visitLabel} · ${mode === 'sqft' ? L.bySqft : L.byRooms}: ${modeText} · ${L.extras}: ${
      selectedExtras.length ? selectedExtras.join(", ") : (lang==="es" ? "Ninguno" : "None")
    }`
  )
  const waLink = `https://wa.me/${waNumber}?text=${waText}`

  return (
    <div className="min-h-screen">
      {/* HEADER */}
      <header className="border-b bg-white/80 backdrop-blur">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="size-10 place-items-center">
              <img src="/logo.png" alt="Logo" className="object-contain" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">{L.brand}</h1>
              <p className="text-sm text-gray-500">{L.tagline}</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-2 w-full sm:w-auto">
            <div className="flex justify-center w-full sm:w-auto">
              <button className="pill pill--off flex items-center gap-1 w-auto" onClick={() => setLang(lang === "en" ? "es" : "en")}>
                {lang === "en" ? (
                  <>
                    <span role="img" aria-label="Spanish flag">🇪🇸</span> Español
                  </>
                ) : (
                  <>
                    <span role="img" aria-label="US flag">🇺🇸</span> English
                  </>
                )}
              </button>
            </div>
            <a className="btn-ghost" href="tel:+18655075786">{L.callNow}</a>
            <a className="btn-ghost" href="mailto:jmendozacleaningservices@gmail.com">{L.emailUs}</a>
            <a className="btn-whatsapp" href={waLink} target="_blank" rel="noopener noreferrer">WhatsApp</a>
          </div>
        </div>
      </header>

      {/* MAIN */}
      <main className="max-w-6xl mx-auto px-4 py-8 grid md:grid-cols-3 gap-6">
        {/* FORM */}
        <section className="md:col-span-2 card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">{L.getQuote}</h2>
            <div className="text-xs text-gray-500">
              {mode === "sqft"
                ? <>${RATES.perSqFt[visit].toFixed(2)}/sqft · Min ${RATES.minJob}</>
                : <>Min ${RATES.minJob} · ${(() => {
                    const v = (visit === "construction" ? "deepClean" : visit) as keyof typeof RATES.perRoom
                    return RATES.perRoom[v]
                  })()} per room</>}
            </div>
          </div>

          {/* HIERARCHY PANEL */}
          <div className="rounded-2xl border bg-gray-50 p-4 mb-6">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label>{L.pricingBy}</Label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    className={`pill ${mode==='sqft'?'pill--on':'pill--off'}`}
                    onClick={()=>setMode("sqft")}
                  >
                    {L.bySqft}
                  </button>
                  <button
                    type="button"
                    className={`pill ${mode==='rooms'?'pill--on':'pill--off'}`}
                    onClick={()=>setMode("rooms")}
                  >
                    {L.byRooms}
                  </button>
                </div>
              </div>
              <div>
                <Label>{L.visitType}</Label>
                <select
                  className="w-full rounded-2xl border px-3 py-2"
                  value={visit}
                  onChange={(e)=>setVisit(e.target.value as VisitType)}
                >
                  <option value="regular">{L.regular}</option>
                  <option value="firstVisit">{L.firstVisit}</option>
                  <option value="moveOut">{L.moveOut}</option>
                  <option value="deepClean">{L.deepClean}</option>
                  {mode === "sqft" && <option value="construction">{L.construction}</option>}
                </select>
              </div>
            </div>
          </div>

          {/* CONDITIONAL INPUTS */}
          <div className="grid sm:grid-cols-2 gap-6">
            {mode === "sqft" ? (
              <>
                <div className="sm:col-span-2">
                  <Label>{L.homeSqFt}</Label>
                  <Counter value={sqft} set={setSqft} min={200} step={50} />
                </div>
              </>
            ) : (
              <>
                <div>
                  <Label>{L.bedrooms}</Label>
                  <Counter value={bedrooms} set={setBedrooms} min={0} />
                  <p className="text-xs text-gray-500 mt-1 text-center">
                    ${RATES.perRoom[(visit === "construction" ? "deepClean" : visit) as keyof typeof RATES.perRoom]} {lang==="es" ? "por dormitorio" : "per bedroom"}
                  </p>
                </div>
                <div>
                  <Label>{L.bathrooms}</Label>
                  <Counter value={bathrooms} set={setBathrooms} min={0} />
                  <p className="text-xs text-gray-500 mt-1 text-center">
                    ${RATES.perRoom[(visit === "construction" ? "deepClean" : visit) as keyof typeof RATES.perRoom]} {lang==="es" ? "por baño" : "per bathroom"}
                  </p>
                </div>
              </>
            )}

            {/* Extras */}
             <div className="sm:col-span-2 mt-6">
              <h4 className="text-md font-semibold text-gray-700 mb-2">Extras:</h4>
            </div>
            
            <div><Label>{L.blinds}</Label>
              <YesNo val={extras.blinds} on={()=>toggle("blinds")} off={()=>setExtras(e=>({...e,blinds:false}))}/>
              <p className="text-xs text-gray-500 mt-1">${RATES.extrasFlat.blinds} {lang==="es"?"por servicio":"per service"}</p>
            </div>
            <div><Label>{L.oven}</Label>
              <YesNo val={extras.oven} on={()=>toggle("oven")} off={()=>setExtras(e=>({...e,oven:false}))}/>
              <p className="text-xs text-gray-500 mt-1">${RATES.extrasFlat.oven} {lang==="es"?"por servicio":"per service"}</p>
            </div>
            <div>
              <Label>{L.bedsheets}</Label>
              <YesNo val={extras.bedsheets} on={()=>toggle("bedsheets")} off={()=>setExtras(e=>({...e,bedsheets:false}))}/>
              <p className="text-xs text-gray-500 mt-1">${RATES.bedsheetPerBedroom} {lang==="es"?"por dormitorio":"per bedroom"}</p>
            </div>
            <div><Label>{L.fridge}</Label>
              <YesNo val={extras.fridge} on={()=>toggle("fridge")} off={()=>setExtras(e=>({...e,fridge:false}))}/>
              <p className="text-xs text-gray-500 mt-1">${RATES.extrasFlat.fridge} {lang==="es"?"por servicio":"per service"}</p>
            </div>
            <div><Label>{L.cabinets}</Label>
              <YesNo val={extras.cabinets} on={()=>toggle("cabinets")} off={()=>setExtras(e=>({...e,cabinets:false}))}/>
              <p className="text-xs text-gray-500 mt-1">${RATES.extrasFlat.cabinets} {lang==="es"?"por servicio":"per service"}</p>
            </div>
          </div>
        </section>

        {/* SUMMARY */}
        <aside className="card p-6 h-fit md:sticky md:top-6">
          <div className="flex items-baseline justify-between">
            <h3 className="text-lg font-semibold">{L.total}</h3>
            <div className="text-3xl font-bold text-teal-600">${total.toFixed(2)}</div>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            {lang==="es" ? "Estimado. Precio final tras recorrido." : "Estimate only. Final price confirmed after walk-through."}
          </p>

          <div className="mt-4">
            <div className="text-sm font-semibold mb-2">{L.breakdown}</div>
            <ul className="text-sm divide-y divide-black/5">
              {breakdown.kind === "sqft" ? (
                <>
                  <li className="flex justify-between py-1.5"><span>{L.base}</span><span>${breakdown.base.toFixed(2)}</span></li>
                  <li className="flex justify-between py-1.5"><span>{L.homeSqFt} × ${breakdown.rate.toFixed(2)}/sqft</span><span>{breakdown.sqft}</span></li>
                </>
              ) : (
                <>
                  <li className="flex justify-between py-1.5"><span>{L.base}</span><span>${breakdown.base.toFixed(2)}</span></li>
                  <li className="flex justify-between py-1.5"><span>{L.roomsLine} × ${breakdown.rate.toFixed(0)}</span><span>{breakdown.rooms}</span></li>
                </>
              )}
              <li className="flex justify-between py-1.5"><span>{L.bedsheetsFee}</span><span>${breakdown.bedsheets.toFixed(2)}</span></li>
              <li className="flex justify-between py-1.5"><span>{L.extras}</span><span>${breakdown.extras.toFixed(2)}</span></li>
            </ul>
          </div>

          <button className="w-full mt-6 btn-primary py-3" onClick={()=>setOpen(true)}>
            {L.book}
          </button>
          {status==="ok" && <p className="text-green-700 text-sm mt-3">{L.submitted}</p>}
          {status==="err" && <p className="text-red-600 text-sm mt-3">{L.error}</p>}
        </aside>
      </main>

      {/* MODAL */}
      {open && (
        <div className="modal-overlay" ref={overlayRef} onMouseDown={(e)=>{ if(e.target===overlayRef.current) setOpen(false) }}>
          <div className="modal" role="dialog" aria-modal="true" aria-labelledby="book-title">
            <div className="modal-body">
              <h3 id="book-title" className="text-lg font-semibold mb-1">{L.review}</h3>
              <p className="text-sm text-gray-500 mb-4">{L.details}</p>

              <div className="text-sm mb-4">
                <div className="font-semibold mb-1">{L.selected}</div>
                <ul className="list-disc pl-5 space-y-0.5">
                  <li>{L.visitType}: {visitLabel}</li>
                  {mode === "sqft" ? (
                    <li>{L.bySqft}: {sqft} sqft</li>
                  ) : (
                    <>
                      <li>{L.byRooms}: {bedrooms + bathrooms} rooms</li>
                      <li>{L.bedrooms}: {bedrooms}</li>
                      <li>{L.bathrooms}: {bathrooms}</li>
                    </>
                  )}
                  <li>{L.extras}: {selectedExtras.length ? selectedExtras.join(", ") : L.none}</li>
                  <li>{L.total}: ${total.toFixed(2)}</li>
                </ul>
              </div>

              <div className="grid gap-3">
                <Field label={L.name} value={name} onChange={setName}/>
                <Field type="email" label={L.email} value={email} onChange={setEmail}/>
                <Field label={L.phone} value={phone} onChange={setPhone}/>
                <Field label={L.address} value={address} onChange={setAddress}/>
                <Field type="date" label={L.date} value={date} onChange={setDate}/>
                <FieldArea label={L.notes} value={notes} onChange={setNotes}/>
              </div>
            </div>

            <div className="modal-actions">
              <a className="btn-ghost mr-auto" href={waLink} target="_blank" rel="noopener noreferrer">WhatsApp</a>
              <button className="btn-ghost" onClick={()=>setOpen(false)}>{L.cancel}</button>
              <button className="btn-primary" onClick={submit} disabled={status==="sending"}>
                {status==="sending" ? L.sending : L.confirm}
              </button>
            </div>
          </div>
        </div>
      )}

      <footer className="text-center text-xs text-gray-500 py-8">
        © {new Date().getFullYear()} Mendoza Cleaning Services ·
        {" "}<a className="underline-offset-2 hover:underline" href="tel:+18655075786">(865) 507-5786 </a> ·
        {" "}<a className="underline-offset-2 hover:underline" href="mailto:jmendozacleaningservices@gmail.com">jmendozacleaningservices@gmail.com</a>
      </footer>
    </div>
  )
}

function Field(props: { label: string; value: string; onChange: (v:string)=>void; type?: string }) {
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-800 mb-1">{props.label}</label>
      <input
        type={props.type ?? "text"}
        className="w-full rounded-2xl border px-3 py-2"
        value={props.value}
        onChange={e=>props.onChange(e.target.value)}
      />
    </div>
  )
}

function FieldArea(props: { label: string; value: string; onChange: (v:string)=>void }) {
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-800 mb-1">{props.label}</label>
      <textarea
        rows={3}
        className="w-full rounded-2xl border px-3 py-2"
        value={props.value}
        onChange={e=>props.onChange(e.target.value)}
      />
    </div>
  )
}
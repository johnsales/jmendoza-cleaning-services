import { useMemo, useState } from "react"
import { calculateTotal, PRICING, type Extras } from "./pricing"

type Lang = "en" | "es"
const t = {
  en: {
    brand: "Mendoza Cleaning Services",
    tagline: "Leave the cleaning to us",
    getQuote: "Get a Quote",
    bookService: "Book Service (optional)",
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
    customerInfo: "Contact details",
    name: "Full name",
    email: "Email",
    phone: "Phone",
    address: "Address",
    date: "Preferred date",
    notes: "Notes",
    total: "Estimated total",
    submit: "Submit quote",
    submitted: "Quote sent! We’ll reach out shortly.",
    error: "Something went wrong. Please try again.",
    lang: "Español",
  },
  es: {
    brand: "Mendoza Cleaning Services",
    tagline: "Déjanos la limpieza a nosotros",
    getQuote: "Obtener cotización",
    bookService: "Reservar servicio (opcional)",
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
    customerInfo: "Datos de contacto",
    name: "Nombre completo",
    email: "Correo",
    phone: "Teléfono",
    address: "Dirección",
    date: "Fecha preferida",
    notes: "Notas",
    total: "Total estimado",
    submit: "Enviar cotización",
    submitted: "¡Cotización enviada! Te contactaremos pronto.",
    error: "Ocurrió un error. Intenta nuevamente.",
    lang: "English",
  },
} as const

export default function App() {
  const [lang, setLang] = useState<Lang>("en")
  const L = t[lang]

  const [sqft, setSqft] = useState(1000)
  const [bedrooms, setBedrooms] = useState(2)
  const [bathrooms, setBathrooms] = useState(2)
  const [extras, setExtras] = useState<Extras>({
    blinds: false,
    oven: false,
    windows: false,
    bedsheets: false,
    laundry: false,
    fridge: false,
    baseboards: false,
    cabinets: false,
  })
  const [book, setBook] = useState(false)

  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [address, setAddress] = useState("")
  const [date, setDate] = useState("")
  const [notes, setNotes] = useState("")

  const [status, setStatus] = useState<"idle"|"sending"|"ok"|"err">("idle")

  const total = useMemo(
    () => calculateTotal(sqft, bedrooms, bathrooms, extras),
    [sqft, bedrooms, bathrooms, extras]
  )

  const money = (n: number) =>
    n.toLocaleString("en-US", { style: "currency", currency: "USD" })

  const toggle = (key: keyof Extras) =>
    setExtras(prev => ({ ...prev, [key]: !prev[key] }))

  async function submit() {
    setStatus("sending")
    try {
      const res = await fetch("/api/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lang,
          quote: { sqft, bedrooms, bathrooms, extras, total },
          booking: book ? { name, email, phone, address, date, notes } : null,
        }),
      })
      if (!res.ok) throw new Error("Request failed")
      setStatus("ok")
    } catch {
      setStatus("err")
    }
  }

  const Label: React.FC<{children: React.ReactNode}> = ({children}) => (
    <label className="block text-sm font-medium text-gray-700 mb-1">{children}</label>
  )
  const Num: React.FC<{
    value: number; set: (n:number)=>void; min?: number; step?: number;
  }> = ({ value, set, min = 0, step = 1 }) => (
    <div className="flex items-center gap-2">
      <button type="button" className="px-3 py-1 rounded-xl border"
        onClick={() => set(Math.max(min, value - step))}>-</button>
      <input
        type="number"
        className="w-full rounded-xl border px-3 py-2"
        value={value}
        min={min}
        step={step}
        onChange={e => set(Number(e.target.value || 0))}
      />
      <button type="button" className="px-3 py-1 rounded-xl border"
        onClick={() => set(value + step)}>+</button>
    </div>
  )
  const YesNo: React.FC<{val:boolean; on:()=>void; off:()=>void}> = ({val,on,off}) => (
    <div className="flex gap-2">
      <button type="button"
        className={`px-3 py-1 rounded-xl border ${val ? "ring-1" : ""}`}
        onClick={on}>{L.yes}</button>
      <button type="button"
        className={`px-3 py-1 rounded-xl border ${!val ? "ring-1" : ""}`}
        onClick={off}>{L.no}</button>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white border-b">
        <div className="max-w-5xl mx-auto flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl border grid place-items-center">🧼</div>
            <div>
              <h1 className="text-xl font-bold">{t.en.brand}</h1>
              <p className="text-sm text-gray-500">{t.en.tagline}</p>
            </div>
          </div>
          <button
            className="text-sm px-3 py-1 rounded-xl border"
            onClick={() => setLang(lang === "en" ? "es" : "en")}
          >
            {L.lang}
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto p-4 grid gap-6">
        <section className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2 rounded-2xl bg-white p-6 shadow">
            <h2 className="text-lg font-semibold mb-4">{L.getQuote}</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label>{L.homeSqFt}</Label>
                <Num value={sqft} set={setSqft} min={200} step={50} />
                <p className="text-xs text-gray-500 mt-1">
                  Base: {money(PRICING.perSqFt)}/sqft — Minimum {money(PRICING.minJob)}
                </p>
              </div>
              <div>
                <Label>{L.bedrooms}</Label>
                <Num value={bedrooms} set={setBedrooms} min={0} />
                <p className="text-xs text-gray-500 mt-1">
                  +{money(PRICING.bedroomAfterFirst)} after first bedroom
                </p>
              </div>
              <div>
                <Label>{L.bathrooms}</Label>
                <Num value={bathrooms} set={setBathrooms} min={0} />
                <p className="text-xs text-gray-500 mt-1">
                  +{money(PRICING.bathroomEach)} per bathroom
                </p>
              </div>

              {/* Extras */}
              <div>
                <Label>{L.blinds}</Label>
                <YesNo
                  val={extras.blinds}
                  on={()=>toggle("blinds")}
                  off={()=>setExtras(e=>({...e,blinds:false}))}
                />
              </div>
              <div>
                <Label>{L.oven}</Label>
                <YesNo
                  val={extras.oven}
                  on={()=>toggle("oven")}
                  off={()=>setExtras(e=>({...e,oven:false}))}
                />
              </div>
              <div>
                <Label>{L.windows}</Label>
                <YesNo
                  val={extras.windows}
                  on={()=>toggle("windows")}
                  off={()=>setExtras(e=>({...e,windows:false}))}
                />
              </div>
              <div>
                <Label>{L.bedsheets}</Label>
                <YesNo
                  val={extras.bedsheets}
                  on={()=>toggle("bedsheets")}
                  off={()=>setExtras(e=>({...e,bedsheets:false}))}
                />
                <p className="text-xs text-gray-500 mt-1">
                  {money(PRICING.bedsheetPerBedroom)} per bedroom
                </p>
              </div>
              <div>
                <Label>{L.laundry}</Label>
                <YesNo
                  val={extras.laundry}
                  on={()=>toggle("laundry")}
                  off={()=>setExtras(e=>({...e,laundry:false}))}
                />
              </div>
              <div>
                <Label>{L.fridge}</Label>
                <YesNo
                  val={extras.fridge}
                  on={()=>toggle("fridge")}
                  off={()=>setExtras(e=>({...e,fridge:false}))}
                />
              </div>
              <div>
                <Label>{L.baseboards}</Label>
                <YesNo
                  val={extras.baseboards}
                  on={()=>toggle("baseboards")}
                  off={()=>setExtras(e=>({...e,baseboards:false}))}
                />
              </div>
              <div>
                <Label>{L.cabinets}</Label>
                <YesNo
                  val={extras.cabinets}
                  on={()=>toggle("cabinets")}
                  off={()=>setExtras(e=>({...e,cabinets:false}))}
                />
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow h-fit">
            <div className="flex items-baseline justify-between">
              <h3 className="text-lg font-semibold">{L.total}</h3>
              <div className="text-3xl font-bold">{money(total)}</div>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Estimate only. Final price confirmed after walk-through.
            </p>

            <div className="mt-6">
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  className="size-4"
                  checked={book}
                  onChange={(e)=>setBook(e.target.checked)}
                />
                <span className="text-sm font-medium">{L.bookService}</span>
              </label>
            </div>

            {book && (
              <div className="grid gap-3 mt-4">
                <div>
                  <Label>{L.name}</Label>
                  <input className="w-full rounded-xl border px-3 py-2" value={name} onChange={e=>setName(e.target.value)} />
                </div>
                <div>
                  <Label>{L.email}</Label>
                  <input type="email" className="w-full rounded-xl border px-3 py-2" value={email} onChange={e=>setEmail(e.target.value)} />
                </div>
                <div>
                  <Label>{L.phone}</Label>
                  <input className="w-full rounded-xl border px-3 py-2" value={phone} onChange={e=>setPhone(e.target.value)} />
                </div>
                <div>
                  <Label>{L.address}</Label>
                  <input className="w-full rounded-xl border px-3 py-2" value={address} onChange={e=>setAddress(e.target.value)} />
                </div>
                <div>
                  <Label>{L.date}</Label>
                  <input type="date" className="w-full rounded-xl border px-3 py-2" value={date} onChange={e=>setDate(e.target.value)} />
                </div>
                <div>
                  <Label>{L.notes}</Label>
                  <textarea className="w-full rounded-xl border px-3 py-2" rows={3} value={notes} onChange={e=>setNotes(e.target.value)} />
                </div>
              </div>
            )}

            <button
              onClick={submit}
              disabled={status==="sending"}
              className="w-full mt-6 px-4 py-3 rounded-2xl border shadow hover:shadow-md transition"
            >
              {status==="sending" ? "Sending..." : L.submit}
            </button>

            {status==="ok" && (
              <p className="text-green-600 text-sm mt-3">{L.submitted}</p>
            )}
            {status==="err" && (
              <p className="text-red-600 text-sm mt-3">{L.error}</p>
            )}
          </div>
        </section>
      </main>

      <footer className="text-center text-xs text-gray-500 p-6">
        © {new Date().getFullYear()} Mendoza Cleaning Services · (865) 507-5786 · jmendozacleaingservices@gmail.com
      </footer>
    </div>
  )
}
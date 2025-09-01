// src/pricing.ts
export type Extras = {
  blinds: boolean
  oven: boolean
  windows: boolean
  bedsheets: boolean
  laundry: boolean
  fridge: boolean
  baseboards: boolean
  cabinets: boolean
}

export type PricingMode = "sqft" | "rooms"
export type VisitType = "regular" | "firstVisit" | "moveOut" | "deepClean" | "construction"

// Centralized rates from your photo
export const RATES = {
  minJob: 200, // global minimum (applies to both modes; set to 0 if you don't want min for room pricing)

  perSqFt: {
    regular: 0.15,
    firstVisit: 0.20,
    moveOut: 0.25,
    deepClean: 0.30,
    construction: 0.40,
  } as const,

  // Per “room” (count = bedrooms + bathrooms). Construction cleanup not offered by-room.
  perRoom: {
    regular: 75,
    firstVisit: 125,
    moveOut: 150,
    deepClean: 175,
  } as const,

  bedsheetPerBedroom: 10,
  extrasFlat: {
    blinds: 25,
    oven: 40,
    windows: 35,
    laundry: 20,
    fridge: 35,
    baseboards: 30,
    cabinets: 30,
  },
} as const

export function calculateTotal(
  mode: PricingMode,
  visit: VisitType,
  sqft: number,
  bedrooms: number,
  bathrooms: number,
  extras: Extras
) {
  // ----- base -----
  let base = 0
  if (mode === "sqft") {
    const rate = RATES.perSqFt[visit]
    base = Math.max(RATES.minJob, sqft * rate)
  } else {
    // rooms mode
    const rooms = Math.max(0, bedrooms) + Math.max(0, bathrooms)
    // For safety, coerce construction -> deepClean when in rooms mode (or change to throw)
    const byRoomVisit = (visit === "construction" ? "deepClean" : visit) as keyof typeof RATES.perRoom
    const rate = RATES.perRoom[byRoomVisit]
    base = Math.max(RATES.minJob, rooms * rate)
  }

  // ----- extras -----
  const bedsheetsCharge = extras.bedsheets ? bedrooms * RATES.bedsheetPerBedroom : 0
  const flatExtras =
    (extras.blinds ? RATES.extrasFlat.blinds : 0) +
    (extras.oven ? RATES.extrasFlat.oven : 0) +
    (extras.windows ? RATES.extrasFlat.windows : 0) +
    (extras.laundry ? RATES.extrasFlat.laundry : 0) +
    (extras.fridge ? RATES.extrasFlat.fridge : 0) +
    (extras.baseboards ? RATES.extrasFlat.baseboards : 0) +
    (extras.cabinets ? RATES.extrasFlat.cabinets : 0)

  const total = base + bedsheetsCharge + flatExtras
  return Math.round(total * 100) / 100
}

export type Breakdown =
  | { kind: "sqft"; rate: number; sqft: number; base: number; bedsheets: number; extras: number }
  | { kind: "rooms"; rooms: number; rate: number; base: number; bedsheets: number; extras: number }

export function buildBreakdown(
  mode: PricingMode,
  visit: VisitType,
  sqft: number,
  bedrooms: number,
  bathrooms: number,
  extras: Extras
): Breakdown {
  const bedsheets = extras.bedsheets ? bedrooms * RATES.bedsheetPerBedroom : 0
  const extrasSum =
    (extras.blinds ? RATES.extrasFlat.blinds : 0) +
    (extras.oven ? RATES.extrasFlat.oven : 0) +
    (extras.windows ? RATES.extrasFlat.windows : 0) +
    (extras.laundry ? RATES.extrasFlat.laundry : 0) +
    (extras.fridge ? RATES.extrasFlat.fridge : 0) +
    (extras.baseboards ? RATES.extrasFlat.baseboards : 0) +
    (extras.cabinets ? RATES.extrasFlat.cabinets : 0)

  if (mode === "sqft") {
    const rate = RATES.perSqFt[visit]
    const base = Math.max(RATES.minJob, sqft * rate)
    return { kind: "sqft", rate, sqft, base, bedsheets, extras: extrasSum }
  } else {
    const rooms = Math.max(0, bedrooms) + Math.max(0, bathrooms)
    const byRoomVisit = (visit === "construction" ? "deepClean" : visit) as keyof typeof RATES.perRoom
    const rate = RATES.perRoom[byRoomVisit]
    const base = Math.max(RATES.minJob, rooms * rate)
    return { kind: "rooms", rooms, rate, base, bedsheets, extras: extrasSum }
  }
}
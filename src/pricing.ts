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

export const PRICING = {
  minJob: 120,             // minimum charge
  perSqFt: 0.15,           // base per square foot
  bedroomAfterFirst: 15,   // per bedroom after the first
  bathroomEach: 25,        // per bathroom
  bedsheetPerBedroom: 10,  // change bedsheets (per bedroom)
  extrasFlat: {
    blinds: 25,
    oven: 40,
    windows: 35,
    laundry: 20,
    fridge: 35,
    baseboards: 30,
    cabinets: 30,
  },
}

export function calculateTotal(
  sqft: number,
  bedrooms: number,
  bathrooms: number,
  extras: Extras
) {
  const base = Math.max(PRICING.minJob, sqft * PRICING.perSqFt)

  const bedroomCharge =
    Math.max(0, bedrooms - 1) * PRICING.bedroomAfterFirst

  const bathroomCharge = Math.max(0, bathrooms) * PRICING.bathroomEach

  const bedsheetsCharge = extras.bedsheets
    ? bedrooms * PRICING.bedsheetPerBedroom
    : 0

  const flatExtras =
    (extras.blinds ? PRICING.extrasFlat.blinds : 0) +
    (extras.oven ? PRICING.extrasFlat.oven : 0) +
    (extras.windows ? PRICING.extrasFlat.windows : 0) +
    (extras.laundry ? PRICING.extrasFlat.laundry : 0) +
    (extras.fridge ? PRICING.extrasFlat.fridge : 0) +
    (extras.baseboards ? PRICING.extrasFlat.baseboards : 0) +
    (extras.cabinets ? PRICING.extrasFlat.cabinets : 0)

  const total = base + bedroomCharge + bathroomCharge + bedsheetsCharge + flatExtras
  return Math.round(total * 100) / 100
}
export const MONTHS = [
  { value: "01", en: "January", hi: "जनवरी" },
  { value: "02", en: "February", hi: "फरवरी" },
  { value: "03", en: "March", hi: "मार्च" },
  { value: "04", en: "April", hi: "अप्रैल" },
  { value: "05", en: "May", hi: "मई" },
  { value: "06", en: "June", hi: "जून" },
  { value: "07", en: "July", hi: "जुलाई" },
  { value: "08", en: "August", hi: "अगस्त" },
  { value: "09", en: "September", hi: "सितंबर" },
  { value: "10", en: "October", hi: "अक्टूबर" },
  { value: "11", en: "November", hi: "नवंबर" },
  { value: "12", en: "December", hi: "दिसंबर" },
];

export const DAYS = Array.from({ length: 31 }, (_, i) => String(i + 1).padStart(2, "0"));

export const MIN_AGE = 18;
export const MAX_AGE = 40;

/** Years such that (currentYear - year) is within [MIN_AGE, MAX_AGE]. */
export function getEligibleYears(): number[] {
  const currentYear = new Date().getFullYear();
  const years: number[] = [];
  for (let age = MIN_AGE; age <= MAX_AGE; age++) {
    years.push(currentYear - age);
  }
  return years; // descending: youngest-eligible-year first isn't guaranteed; sort below
}

export function getEligibleYearsSorted(): number[] {
  return getEligibleYears().sort((a, b) => b - a);
}

export function calculateAge(dob: string): number {
  const birth = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}

export function isAgeEligible(dob: string): boolean {
  const age = calculateAge(dob);
  return age >= MIN_AGE && age <= MAX_AGE;
}

import { z } from "zod";
import { isAgeEligible, MIN_AGE, MAX_AGE } from "@/data/dob";
import { CATEGORIES } from "@/data/hierarchy";

const categoryIds = CATEGORIES.map((c) => c.id) as [string, ...string[]];

export const personalSchema = z.object({
  photoBase64: z.string().min(1, "फोटो अनिवार्य है / Photo is required"),
  fullName: z.string().trim().min(2, "पूरा नाम अनिवार्य है"),
  fatherName: z.string().trim().min(2, "पिता/पति का नाम अनिवार्य है"),
  dobDay: z.string().min(1, "दिन चुनें"),
  dobMonth: z.string().min(1, "महीना चुनें"),
  dobYear: z.string().min(1, "वर्ष चुनें"),
  gender: z.enum(["Male", "Female", "Other"], { errorMap: () => ({ message: "लिंग चुनें" }) }),
  category: z.enum(categoryIds, { errorMap: () => ({ message: "वर्ग चुनें" }) }),
  jaati: z.string().trim().min(1, "जाति अनिवार्य है"),
  mobile: z.string().regex(/^[6-9]\d{9}$/, "मान्य 10 अंकों का मोबाइल नंबर डालें"),
  whatsappSameAsMobile: z.boolean().default(true),
  whatsapp: z.string().regex(/^[6-9]\d{9}$/, "मान्य 10 अंकों का WhatsApp नंबर डालें"),
  email: z.string().email("मान्य ईमेल डालें"),
}).superRefine((data, ctx) => {
  const dob = `${data.dobYear}-${data.dobMonth}-${data.dobDay}`;
  const d = new Date(dob);
  if (Number.isNaN(d.getTime())) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "मान्य जन्मतिथि चुनें", path: ["dobDay"] });
    return;
  }
  if (!isAgeEligible(dob)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: `सदस्यता के लिए आयु ${MIN_AGE}-${MAX_AGE} वर्ष के बीच होनी चाहिए`,
      path: ["dobYear"],
    });
  }
});

export const electoralSchema = z.object({
  loksabhaId: z.string().min(1, "लोकसभा क्षेत्र चुनें"),
  districtId: z.string().min(1, "जिला चुनें"),
  assemblyId: z.string().min(1, "विधानसभा क्षेत्र चुनें"),
  mandalId: z.string().min(1, "मंडल चुनें"),
  booth: z.string().trim().optional().or(z.literal("")),
  address: z.string().trim().min(5, "पता अनिवार्य है"),
  pincode: z.string().regex(/^\d{6}$/, "मान्य 6 अंकों का पिनकोड डालें"),
});

const mpinObjectSchema = z.object({
  mpin: z.string().regex(/^\d{4}$|^\d{6}$/, "MPIN 4 या 6 अंकों का होना चाहिए"),
  confirmMpin: z.string(),
  referredByCode: z.string().trim().optional().or(z.literal("")),
  agree: z.literal(true, { errorMap: () => ({ message: "घोषणा स्वीकार करना अनिवार्य है" }) }),
});

export const securitySchema = mpinObjectSchema.refine((d) => d.mpin === d.confirmMpin, {
  message: "MPIN मेल नहीं खाता",
  path: ["confirmMpin"],
});

export const fullRegistrationSchema = personalSchema
  .and(electoralSchema)
  .and(mpinObjectSchema)
  .refine((d) => d.mpin === d.confirmMpin, { message: "MPIN मेल नहीं खाता", path: ["confirmMpin"] });

export type PersonalInput = z.infer<typeof personalSchema>;
export type ElectoralInput = z.infer<typeof electoralSchema>;
export type FullRegistrationInput = z.infer<typeof fullRegistrationSchema>;

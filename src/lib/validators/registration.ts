import { z } from "zod";

export const personalSchema = z.object({
  photoBase64: z.string().min(1, "फोटो अनिवार्य है / Photo is required"),
  fullName: z.string().trim().min(2, "पूरा नाम अनिवार्य है"),
  fatherName: z.string().trim().min(2, "पिता/पति का नाम अनिवार्य है"),
  dob: z.string().min(1, "जन्मतिथि अनिवार्य है"),
  gender: z.enum(["Male", "Female", "Other"], { errorMap: () => ({ message: "लिंग चुनें" }) }),
  phone: z.string().regex(/^[6-9]\d{9}$/, "मान्य 10 अंकों का मोबाइल नंबर डालें"),
  email: z.string().email("मान्य ईमेल डालें"),
  address: z.string().trim().min(5, "पता अनिवार्य है"),
  pincode: z.string().regex(/^\d{6}$/, "मान्य 6 अंकों का पिनकोड डालें"),
});

export const electoralSchema = z.object({
  districtId: z.string().uuid("जिला चुनें"),
  assemblyId: z.string().uuid("विधानसभा चुनें"),
  mandalId: z.string().uuid("मंडल चुनें"),
  booth: z.string().trim().min(1, "बूथ अनिवार्य है"),
});

export const socialSchema = z.object({
  whatsapp: z.string().regex(/^[6-9]\d{9}$/, "मान्य WhatsApp नंबर डालें"),
  facebook: z.string().optional().or(z.literal("")),
  instagram: z.string().optional().or(z.literal("")),
  twitter: z.string().optional().or(z.literal("")),
  referralCode: z.string().optional().or(z.literal("")),
});

const passwordObjectSchema = z.object({
  password: z.string().min(8, "पासवर्ड कम से कम 8 अक्षर का हो"),
  confirmPassword: z.string(),
  agree: z.literal(true, { errorMap: () => ({ message: "घोषणा स्वीकार करना अनिवार्य है" }) }),
});

export const passwordSchema = passwordObjectSchema.refine((data) => data.password === data.confirmPassword, {
  message: "पासवर्ड मेल नहीं खाते",
  path: ["confirmPassword"],
});

export const fullRegistrationSchema = personalSchema
  .merge(electoralSchema)
  .merge(socialSchema)
  .merge(passwordObjectSchema)
  .refine((data) => data.password === data.confirmPassword, {
    message: "पासवर्ड मेल नहीं खाते",
    path: ["confirmPassword"],
  });

export type PersonalInput = z.infer<typeof personalSchema>;
export type ElectoralInput = z.infer<typeof electoralSchema>;
export type SocialInput = z.infer<typeof socialSchema>;
export type PasswordInput = z.infer<typeof passwordSchema>;
export type FullRegistrationInput = z.infer<typeof fullRegistrationSchema>;

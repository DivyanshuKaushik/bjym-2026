import { z } from "zod";

export const memberUpdateSchema = z.object({
  fullName: z.string().trim().min(2).optional(),
  fatherName: z.string().trim().min(2).optional(),
  address: z.string().trim().min(5).optional(),
  pincode: z.string().regex(/^\d{6}$/).optional(),
  whatsapp: z.string().regex(/^[6-9]\d{9}$/).optional(),
  email: z.string().email().optional(),
  languagePreference: z.enum(["hi", "en"]).optional(),
});

export const rejectMemberSchema = z.object({
  reason: z.string().trim().min(3, "अस्वीकृति का कारण आवश्यक है"),
});

export const suspendMemberSchema = z.object({
  reason: z.string().trim().optional(),
});

import { z } from "zod";

export const memberLoginSchema = z.object({
  identifier: z.string().trim().min(3, "मोबाइल नंबर या ईमेल डालें"),
  mpin: z.string().regex(/^\d{4}$|^\d{6}$/, "MPIN 4 या 6 अंकों का होना चाहिए"),
  remember: z.boolean().default(true),
});

export const adminLoginSchema = z.object({
  username: z.string().trim().min(2, "Username आवश्यक है"),
  password: z.string().min(4, "Password आवश्यक है"),
  remember: z.boolean().default(true),
});

export const mpinResetSchema = z
  .object({
    newMpin: z.string().regex(/^\d{4}$|^\d{6}$/, "MPIN 4 या 6 अंकों का होना चाहिए"),
    confirmMpin: z.string(),
  })
  .refine((d) => d.newMpin === d.confirmMpin, { message: "MPIN मेल नहीं खाता", path: ["confirmMpin"] });

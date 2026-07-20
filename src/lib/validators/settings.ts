import { z } from "zod";

export const settingsSchema = z.object({
  signatoryName: z.string().trim().min(1),
  signatoryTitleHi: z.string().trim().min(1),
  portalNameHi: z.string().trim().min(1),
  portalWebsite: z.string().trim().min(1),
});

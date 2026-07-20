import { z } from "zod";

export const createAdminSchema = z.object({
  username: z.string().trim().min(3, "Username कम से कम 3 अक्षर का हो").regex(/^[a-zA-Z0-9_.]+$/, "केवल letters, numbers, _ और . मान्य हैं"),
  fullName: z.string().trim().min(2, "पूरा नाम आवश्यक है"),
  password: z.string().min(8, "Password कम से कम 8 अक्षर का हो"),
  roleName: z.enum(["MASTER_ADMIN", "SUPERVISOR"]),
});

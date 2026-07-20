import { auth } from "@/lib/auth";
import { Navbar } from "./Navbar";

export async function SiteHeader() {
  const session = await auth();
  return (
    <Navbar
      isAuthed={!!session?.user}
      userType={session?.user?.userType ?? null}
    />
  );
}

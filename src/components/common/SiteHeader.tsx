import { createClient } from "@/lib/supabase/server";
import { Navbar } from "./Navbar";

export async function SiteHeader() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let isAdmin = false;
  if (user) {
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
    isAdmin = profile?.role === "admin";
  }

  return <Navbar isAuthed={!!user} isAdmin={isAdmin} />;
}

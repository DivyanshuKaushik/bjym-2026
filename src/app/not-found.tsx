import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 py-16 text-center">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/brand/logo.png" alt="BJYM Chhattisgarh" className="h-14 w-auto object-contain opacity-90" />
      <div className="mt-6 font-serif text-6xl font-black text-primary-light sm:text-7xl">404</div>
      <h1 className="mt-2 text-lg font-black text-heading sm:text-xl">यह पृष्ठ नहीं मिला</h1>
      <p className="mt-2 max-w-[380px] text-[13.5px] text-muted">
        जिस पृष्ठ को आप खोज रहे हैं वह मौजूद नहीं है या हटा दिया गया है।
      </p>
      <div className="mt-7 flex flex-wrap justify-center gap-3">
        <Link href="/"><Button>होम पर जाएँ</Button></Link>
        <Link href="/register"><Button variant="ghost">सदस्य बनें</Button></Link>
      </div>
    </div>
  );
}

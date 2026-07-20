import Link from "next/link";
import { Facebook, Instagram, Phone, Mail } from "lucide-react";
import { SITE_CONFIG } from "@/lib/seo/site-config";

const SOCIAL = [
  { label: "Facebook", href: "https://www.facebook.com/BJYMForCG", Icon: Facebook },
  { label: "Instagram", href: "https://www.instagram.com/bjymforcg", Icon: Instagram },
];

// lucide-react has no dedicated X/Twitter glyph; a small inline SVG keeps
// the same icon-button treatment as the others.
function XIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.9 2H22l-7.7 8.8L23.3 22H16.6l-5.2-6.8L5.4 22H2.3l8.2-9.4L1.7 2h6.9l4.7 6.2L18.9 2Zm-1.2 18h1.7L7.4 4H5.6l12.1 16Z" />
    </svg>
  );
}

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-border bg-white">
      <div className="mx-auto max-w-[1100px] px-4 py-10 sm:px-8">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
          {/* branding */}
          <div>
            <div className="flex items-center gap-2.5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/brand/logo.png" alt="BJYM Chhattisgarh" className="h-9 w-auto object-contain" />
              <div>
                <div className="text-[13px] font-black leading-tight text-heading">भारतीय जनता युवा मोर्चा</div>
                <div className="text-[11px] font-bold leading-tight text-muted">छत्तीसगढ़</div>
              </div>
            </div>
            <p className="mt-3 text-[12.5px] leading-relaxed text-muted">
              डिजिटल सदस्यता पोर्टल — युवा शक्ति, राष्ट्र की शक्ति।
            </p>
            <div className="mt-4 text-[11px] font-black uppercase tracking-wide text-muted">Follow us</div>
            <div className="mt-2 flex gap-2">
              {SOCIAL.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noreferrer noopener"
                  title={s.label}
                  aria-label={s.label}
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-border text-muted transition-colors hover:border-primary hover:text-primary-dark"
                >
                  <s.Icon size={15} />
                </a>
              ))}
              <a
                href="https://www.x.com/BJYMForCG"
                target="_blank"
                rel="noreferrer noopener"
                title="X (Twitter)"
                aria-label="X (Twitter)"
                className="flex h-8 w-8 items-center justify-center rounded-full border border-border text-muted transition-colors hover:border-primary hover:text-primary-dark"
              >
                <XIcon />
              </a>
            </div>
          </div>

          {/* links */}
          <div>
            <div className="text-[11px] font-black uppercase tracking-wide text-muted">Quick Links</div>
            <ul className="mt-3 grid gap-2 text-[13px]">
              <li><Link href="/register" className="font-semibold text-heading hover:text-primary-dark">सदस्य बनें</Link></li>
              <li><Link href="/login" className="font-semibold text-heading hover:text-primary-dark">लॉगिन</Link></li>
              <li><Link href="/verify" className="font-semibold text-heading hover:text-primary-dark">सदस्यता सत्यापन</Link></li>
              <li><Link href="/privacy-policy" className="font-semibold text-heading hover:text-primary-dark">Privacy Policy</Link></li>
              <li><Link href="/terms-and-conditions" className="font-semibold text-heading hover:text-primary-dark">Terms &amp; Conditions</Link></li>
            </ul>
          </div>

          {/* contact */}
          <div>
            <div className="text-[11px] font-black uppercase tracking-wide text-muted">Contact</div>
            <ul className="mt-3 grid gap-2.5 text-[13px] text-heading">
              <li className="font-semibold">{SITE_CONFIG.shortName}</li>
              <li>
                <a href={SITE_CONFIG.url} className="font-semibold text-primary-dark hover:underline">
                  {SITE_CONFIG.url.replace(/^https?:\/\//, "")}
                </a>
              </li>
              <li className="flex items-start gap-2">
                <Phone size={14} className="mt-0.5 shrink-0 text-primary-dark" />
                <span>
                  किसी भी प्रकार की तकनीकी समस्या हेतु संपर्क करें:{" "}
                  <a href="tel:+919109881465" className="font-bold text-primary-dark hover:underline">9109881465</a>
                </span>
              </li>
              <li className="flex items-center gap-2">
                <Mail size={14} className="shrink-0 text-primary-dark" />
                <a href="mailto:bjym4cg@gmail.com" className="font-bold text-primary-dark hover:underline">bjym4cg@gmail.com</a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 flex flex-col items-center justify-between gap-2 border-t border-border pt-5 text-[11px] text-muted sm:flex-row">
          <span>© {year} भारतीय जनता युवा मोर्चा, छत्तीसगढ़ — सर्वाधिकार सुरक्षित</span>
          <span className="font-bold">Built by Techxos · techxos.in</span>
        </div>
      </div>
    </footer>
  );
}

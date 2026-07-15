"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useLang } from "@/lib/i18n/LanguageProvider";
import { Chakra } from "@/components/common/Chakra";
import { MembershipCard } from "@/components/id-card/MembershipCard";
import { Button } from "@/components/ui/button";

function Counter({ value, duration = 1400 }: { value: number; duration?: number }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    let start: number | null = null;
    let raf: number;
    const step = (t: number) => {
      if (start === null) start = t;
      const p = Math.min((t - start) / duration, 1);
      setN(Math.floor((1 - Math.pow(1 - p, 3)) * value));
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [value, duration]);
  return <>{n.toLocaleString("en-IN")}</>;
}

export function HomeClient({ totalMembers }: { totalMembers: number }) {
  const { d } = useLang();

  const sampleCard = {
    membershipId: "BJYM-CG-2026-000148",
    fullName: "प्रकाश देवांगन",
    dob: "18-04-2001",
    mandalNameHi: "जांजगीर नगर मंडल",
    districtNameHi: "जांजगीर-चांपा",
    photoBase64: null,
    joinedAt: "12-07-2026",
    status: "Active",
    signatoryName: "Rahul Yograj Tikariha",
    signatoryTitleHi: "प्रदेश अध्यक्ष",
    verifyBaseUrl: "/verify",
  };

  return (
    <div>
      {/* ===== HERO ===== */}
      <section
        className="relative overflow-hidden"
        style={{
          background:
            "radial-gradient(1100px 560px at 18% -8%, rgba(243,107,33,.34), transparent 60%), radial-gradient(900px 480px at 92% 8%, rgba(31,107,59,.26), transparent 58%), radial-gradient(700px 500px at 55% 115%, rgba(22,26,141,.22), transparent 60%), linear-gradient(165deg, #0D1220 0%, #141B2E 100%)",
        }}
      >
        <div
          className="pointer-events-none absolute inset-0 opacity-50"
          style={{
            backgroundImage: "radial-gradient(rgba(255,255,255,.09) 1px, transparent 1px)",
            backgroundSize: "26px 26px",
            maskImage: "linear-gradient(180deg, rgba(0,0,0,.9), transparent 78%)",
            WebkitMaskImage: "linear-gradient(180deg, rgba(0,0,0,.9), transparent 78%)",
          }}
        />
        <div
          className="pointer-events-none absolute -left-24 -top-16 h-[340px] w-[340px] rounded-full animate-glowPulse"
          style={{ background: "radial-gradient(circle, rgba(255,138,61,.4), transparent 65%)", filter: "blur(10px)" }}
        />
        <div
          className="pointer-events-none absolute -right-16 -bottom-20 h-[300px] w-[300px] rounded-full animate-glowPulse"
          style={{ background: "radial-gradient(circle, rgba(31,107,59,.36), transparent 65%)", filter: "blur(10px)" }}
        />

        <div className="relative mx-auto grid max-w-[1080px] grid-cols-1 items-center gap-10 px-4 py-16 sm:px-8 sm:py-24 md:grid-cols-[1.15fr_.85fr]">
          <div>
            <div className="inline-flex animate-fadeUp items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-extrabold uppercase tracking-wide text-orange-200 backdrop-blur">
              <span className="h-1.5 w-1.5 rounded-full bg-orange-400 shadow-[0_0_10px_#FF8A3D]" />
              {d.hero.badge}
            </div>
            <h1 className="mt-5 animate-fadeUp font-serif text-[38px] font-black leading-tight text-white sm:text-[52px] md:text-[62px]">
              {d.hero.title1}
              <br />
              <span
                style={{
                  background: "linear-gradient(92deg, #FF8A3D 5%, #FFD08A 45%, #FF8A3D 90%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                {d.hero.title2}
              </span>
            </h1>
            <div className="mt-4 animate-fadeUp text-lg font-extrabold text-emerald-200 sm:text-xl">{d.hero.subtitle}</div>
            <p className="mt-3.5 max-w-[470px] animate-fadeUp text-[15px] leading-relaxed text-white/60">{d.hero.desc}</p>
            <div className="mt-7 flex flex-wrap animate-fadeUp gap-3">
              <Link href="/register">
                <Button size="lg">{d.hero.ctaPrimary} →</Button>
              </Link>
              <Link href="/verify">
                <Button variant="ghostDark" size="lg">{d.hero.ctaSecondary}</Button>
              </Link>
            </div>
            <div className="mt-9 inline-flex animate-fadeUp flex-wrap gap-6 rounded-2xl border border-white/15 bg-white/8 px-6 py-4 backdrop-blur-md">
              <div>
                <div className="font-serif text-2xl font-black text-white"><Counter value={totalMembers} /></div>
                <div className="mt-0.5 text-[10px] font-extrabold uppercase tracking-wide text-white/55">{d.hero.statsMembers}</div>
              </div>
              <div>
                <div className="font-serif text-2xl font-black text-white"><Counter value={6} /></div>
                <div className="mt-0.5 text-[10px] font-extrabold uppercase tracking-wide text-white/55">{d.hero.statsDistricts}</div>
              </div>
              <div>
                <div className="font-serif text-2xl font-black text-white">{d.hero.statsCardVal}</div>
                <div className="mt-0.5 text-[10px] font-extrabold uppercase tracking-wide text-white/55">{d.hero.statsCard}</div>
              </div>
              <div>
                <div className="font-serif text-2xl font-black text-white">QR</div>
                <div className="mt-0.5 text-[10px] font-extrabold uppercase tracking-wide text-white/55">{d.hero.statsVerify}</div>
              </div>
            </div>
          </div>

          <div className="relative flex justify-center">
            <div
              className="pointer-events-none absolute h-[300px] w-[300px] rounded-full animate-glowPulse"
              style={{ background: "radial-gradient(circle, rgba(243,107,33,.3), transparent 62%)", filter: "blur(14px)" }}
            />
            <div className="relative animate-floaty">
              <MembershipCard data={sampleCard} compact />
              <div className="absolute -right-3.5 -top-4 rounded-full bg-gradient-to-br from-orange-400 to-primary-dark px-4 py-1.5 text-[11px] font-black text-white shadow-lg">
                ✦ INSTANT ID
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== 3 STEPS ===== */}
      <section className="mx-auto max-w-[1020px] px-4 py-16 sm:px-8">
        <div className="text-center">
          <div className="inline-block rounded-full bg-primary-light px-4 py-1.5 text-[11px] font-black uppercase tracking-widest text-primary-dark">
            {d.steps.badge}
          </div>
          <h2 className="mt-3.5 font-serif text-2xl font-black text-heading sm:text-3xl">{d.steps.title}</h2>
        </div>
        <div className="mt-9 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {[
            ["1", "📝", d.steps.s1t, d.steps.s1d],
            ["2", "🪪", d.steps.s2t, d.steps.s2d],
            ["3", "📣", d.steps.s3t, d.steps.s3d],
          ].map(([n, icon, title, desc]) => (
            <div
              key={n}
              className="relative overflow-hidden rounded-2xl border border-white/70 bg-white/90 p-6 shadow-[0_12px_34px_rgba(13,18,32,.07)] transition-transform hover:-translate-y-1"
            >
              <div className="absolute -right-1 -top-3 select-none font-serif text-[84px] font-black leading-none text-primary-light">{n}</div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-primary/20 bg-gradient-to-br from-primary-light to-white text-2xl">
                {icon}
              </div>
              <div className="relative mt-3.5 text-[17.5px] font-black text-heading">{title}</div>
              <p className="relative mt-1.5 text-[13.5px] leading-relaxed text-muted">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section
        className="relative mx-auto max-w-[1020px] overflow-hidden rounded-3xl px-6 py-10 text-center text-white shadow-[0_24px_60px_rgba(243,107,33,.35)] sm:px-12 sm:py-14"
        style={{
          background: "radial-gradient(700px 300px at 85% 20%, rgba(255,208,138,.35), transparent 60%), linear-gradient(120deg, #D85A0B, #F36B21 70%)",
        }}
      >
        <div
          className="pointer-events-none absolute inset-0 opacity-35"
          style={{ backgroundImage: "radial-gradient(rgba(255,255,255,.35) 1px, transparent 1px)", backgroundSize: "22px 22px" }}
        />
        <h2 className="relative font-serif text-2xl font-black sm:text-3xl">{d.cta.title}</h2>
        <p className="relative mx-auto mt-3 max-w-[520px] text-sm leading-relaxed opacity-95">{d.cta.desc}</p>
        <div className="relative mt-6">
          <Link href="/register">
            <Button size="lg" className="!bg-white !text-primary-dark shadow-[0_12px_32px_rgba(0,0,0,.22)]">
              {d.cta.button} →
            </Button>
          </Link>
        </div>
      </section>

      <div className="h-16" />
    </div>
  );
}

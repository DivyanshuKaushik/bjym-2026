"use client";

import Link from "next/link";
import Image from "next/image";
import { useLang } from "@/lib/i18n/LanguageProvider";
import { Button } from "@/components/ui/button";
import { CampaignCarousel } from "./CampaignCarousel";

export function HomeClient() {
    const { d } = useLang();

    return (
        <div>
            {/* ===== 1. FIXED HERO BANNER ===== */}
            <section className="border-b border-border bg-[linear-gradient(180deg,#FFFFFF_0%,#FFF8F0_100%)]">
                <div className="relative mx-auto aspect-[2/1] w-full max-w-[1400px] overflow-hidden sm:aspect-[21/10]">
                    <Image
                        src="/hero-banner.jpg"
                        alt="Join BJYM 2026 — भारतीय जनता युवा मोर्चा, छत्तीसगढ़"
                        fill
                        priority
                        sizes="100vw"
                        className="object-cover object-center"
                    />
                    {/* subtle gradient overlay at the bottom for readability if any UI sits over it later */}
                    <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/25 to-transparent" />
                </div>

                {/* ===== 2. CAMPAIGN SLIDES CAROUSEL ===== */}
                <section className="mx-auto max-w-[1100px] px-4 py-8 sm:px-8 sm:py-12">
                    <CampaignCarousel />
                </section>

                <div className="mx-auto max-w-[760px] px-4 py-8 text-center sm:px-8 sm:py-12">
                    <h1 className="font-serif text-[20px] font-black leading-tight text-heading sm:text-[32px]">
                        युवा शक्ति, राष्ट्र की शक्ति:{" "}
                        <span className="text-primary-dark">
                            भारतीय जनता युवा मोर्चा
                        </span>{" "}
                        छत्तीसगढ़ से जुड़ें!
                    </h1>
                    <p className="mx-auto mt-3 max-w-[560px] text-[13.5px] leading-relaxed text-muted sm:text-[15px]">
                        भारतीय जनता युवा मोर्चा परिवार का हिस्सा बनें और भारत
                        एवं छत्तीसगढ़ के नव-निर्माण में अपना योगदान दें।
                    </p>

                    <div className="mt-6 flex flex-col gap-2.5 px-2 sm:mt-7 sm:flex-row sm:flex-wrap sm:justify-center sm:gap-3 sm:px-0">
                        <Link href="/register" className="w-full sm:w-auto">
                            <Button size="lg" className="w-full sm:w-auto">
                                {d.hero.ctaPrimary} →
                            </Button>
                        </Link>
                        <Link href="/login" className="w-full sm:w-auto">
                            <Button
                                variant="ghost"
                                size="lg"
                                className="w-full sm:w-auto"
                            >
                                {d.nav.login}
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>

            <div className="h-10 sm:h-14" />
        </div>
    );
}

"use client";
import * as React from "react";
import { cn } from "@/lib/utils";

export function Tabs({ tabs, active, onChange }: { tabs: { key: string; label: string }[]; active: string; onChange: (k: string) => void }) {
  return (
    <div className="inline-flex flex-wrap gap-1 rounded-full border border-border bg-white p-1">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          onClick={() => onChange(tab.key)}
          className={cn(
            "rounded-full px-4 py-2 text-[13px] font-bold transition-colors",
            active === tab.key ? "bg-navy text-white" : "text-heading hover:bg-bg"
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

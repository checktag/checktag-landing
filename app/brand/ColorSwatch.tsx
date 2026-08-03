"use client";

import { useState } from "react";

export function ColorSwatch({
    name,
    hex,
    sub,
}: {
    name: string;
    hex: string;
    sub?: string;
}) {
    const [copied, setCopied] = useState(false);

    const copy = async () => {
        try {
            await navigator.clipboard.writeText(hex);
            setCopied(true);
            setTimeout(() => setCopied(false), 1200);
        } catch {
            /* clipboard unavailable — ignore */
        }
    };

    return (
        <button
            onClick={copy}
            className="group text-left rounded-2xl border border-white/10 overflow-hidden bg-white/5 hover:border-white/20 transition-all duration-300 w-full"
            aria-label={`Copy ${name} ${hex}`}
        >
            <div
                className="h-24 w-full relative"
                style={{ backgroundColor: hex }}
            >
                <span className="absolute top-2 right-2 text-[10px] px-2 py-1 rounded-full bg-black/50 text-white/90 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    {copied ? "Copied ✓" : "Copy"}
                </span>
            </div>
            <div className="p-3">
                <p className="text-white text-sm font-semibold">{name}</p>
                <p className="text-white/40 text-xs font-mono uppercase">{hex}</p>
                {sub && <p className="text-white/30 text-[11px] mt-1">{sub}</p>}
            </div>
        </button>
    );
}

"use client"

import dynamic from "next/dynamic"

export const NumberSelector = dynamic(
  () => import("@/components/number-selector").then(m => ({ default: m.NumberSelector })),
  {
    loading: () => (
      <div className="px-4 py-20 flex items-center justify-center">
        <p className="text-muted-foreground animate-pulse">Cargando números...</p>
      </div>
    ),
    ssr: false,
  }
)

export const FaqBot = dynamic(
  () => import("@/components/faq-bot").then(m => ({ default: m.FaqBot })),
  { ssr: false }
)

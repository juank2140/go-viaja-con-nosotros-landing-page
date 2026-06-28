import dynamic from "next/dynamic"
import { SiteHeader } from "@/components/site-header"
import { Hero } from "@/components/hero"
import { Prizes } from "@/components/prizes"
import { TrustSection } from "@/components/trust-section"
import { HowItWorks } from "@/components/how-it-works"
import { SiteFooter } from "@/components/site-footer"

const NumberSelector = dynamic(() => import("@/components/number-selector").then(m => ({ default: m.NumberSelector })), {
  loading: () => <div className="px-4 py-20 flex items-center justify-center"><p className="text-muted-foreground animate-pulse">Cargando números...</p></div>,
  ssr: false,
})

const FaqBot = dynamic(() => import("@/components/faq-bot").then(m => ({ default: m.FaqBot })), {
  ssr: false,
})

export default function Page() {
  return (
    <main className="min-h-screen bg-background">
      <SiteHeader />
      <Hero />
      <Prizes />
      <NumberSelector />
      <TrustSection />
      <HowItWorks />
      <SiteFooter />
      <FaqBot />
    </main>
  )
}

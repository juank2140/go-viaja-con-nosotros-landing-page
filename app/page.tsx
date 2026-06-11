import { SiteHeader } from "@/components/site-header"
import { Hero } from "@/components/hero"
import { Prizes } from "@/components/prizes"
import { TrustSection } from "@/components/trust-section"
import { NumberSelector } from "@/components/number-selector"
import { HowItWorks } from "@/components/how-it-works"
import { SiteFooter } from "@/components/site-footer"

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
    </main>
  )
}

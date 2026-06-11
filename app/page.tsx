import { Hero } from "@/components/hero"
import { Prizes } from "@/components/prizes"
import { NumberSelector } from "@/components/number-selector"
import { HowItWorks } from "@/components/how-it-works"
import { SiteFooter } from "@/components/site-footer"

export default function Page() {
  return (
    <main className="min-h-screen bg-background">
      <Hero />
      <Prizes />
      <NumberSelector />
      <HowItWorks />
      <SiteFooter />
    </main>
  )
}

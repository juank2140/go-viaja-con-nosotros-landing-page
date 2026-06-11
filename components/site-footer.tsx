import { Phone, AtSign, Plane, Calendar } from "lucide-react"

export function SiteFooter() {
  return (
    <footer className="border-t border-gold/20 bg-card/40 px-4 py-14">
      <div className="mx-auto grid max-w-6xl gap-10 md:grid-cols-3">
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <span className="flex size-9 items-center justify-center rounded-lg bg-gold text-gold-foreground">
              <Plane className="size-5" />
            </span>
            <span className="font-heading text-xl font-semibold text-foreground">
              Go Viaja Con Nosotros
            </span>
          </div>
          <p className="text-sm italic text-muted-foreground">
            El mundo te espera, nosotros te llevamos.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <h4 className="text-sm font-semibold uppercase tracking-wider text-gold">
            Fechas de sorteo
          </h4>
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="size-4 text-gold" /> Anticipado: 11 de julio de 2026
          </p>
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="size-4 text-gold" /> Premio Mayor: 25 de julio de 2026
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <h4 className="text-sm font-semibold uppercase tracking-wider text-gold">
            Contacto
          </h4>
          <a
            href="tel:+573005087122"
            className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-gold"
          >
            <Phone className="size-4 text-gold" /> 300 508 7122
          </a>
          <a
            href="https://instagram.com/goviajaconnosotros"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-gold"
          >
            <AtSign className="size-4 text-gold" /> @goviajaconnosotros
          </a>
        </div>
      </div>

      <div className="mx-auto mt-10 max-w-6xl border-t border-border pt-6 text-center text-xs leading-relaxed text-muted-foreground">
        <p>Responsable del sorteo: Juan David Pajo Osorio.</p>
        <p className="mt-1">
          Sorteo realizado con las últimas 4 cifras de la Lotería de Boyacá. Juega con responsabilidad.
        </p>
        <p className="mt-3">
          © {new Date().getFullYear()} Go Viaja Con Nosotros. Todos los derechos reservados.
        </p>
      </div>
    </footer>
  )
}

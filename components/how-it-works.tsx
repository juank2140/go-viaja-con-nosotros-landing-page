import { Hash, UserPlus, ShieldCheck, Trophy } from "lucide-react"

const steps = [
  { icon: Hash, title: "Elige tu número", desc: "Busca y selecciona el número que sientas de la suerte." },
  { icon: UserPlus, title: "Regístrate", desc: "Ingresa tu nombre, celular y ciudad en segundos." },
  { icon: ShieldCheck, title: "Paga seguro", desc: "Paga con Bold: tarjeta, PSE o Nequi de forma segura." },
  { icon: Trophy, title: "¡A ganar!", desc: "Quedas participando por tu viaje soñado. ¡Suerte!" },
]

export function HowItWorks() {
  return (
    <section className="px-4 py-20 sm:py-28">
      <div className="mx-auto max-w-6xl">
        <div className="mb-14 text-center">
          <span className="text-xs font-medium uppercase tracking-[0.25em] text-gold">
            Así de fácil
          </span>
          <h2 className="mt-3 font-heading text-balance text-4xl font-semibold text-foreground sm:text-5xl md:text-6xl">
            ¿Cómo funciona?
          </h2>
        </div>

        <ol className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((s, i) => (
            <li
              key={s.title}
              className="glass group relative flex flex-col gap-4 rounded-2xl p-6 transition-transform hover:-translate-y-1"
            >
              <span className="font-heading absolute right-5 top-4 text-5xl font-semibold text-gold/15">
                {i + 1}
              </span>
              <span className="flex size-12 items-center justify-center rounded-xl bg-gold/15 text-gold">
                <s.icon className="size-6" />
              </span>
              <h3 className="font-heading text-xl font-semibold text-foreground">
                {s.title}
              </h3>
              <p className="text-sm leading-relaxed text-muted-foreground">{s.desc}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}

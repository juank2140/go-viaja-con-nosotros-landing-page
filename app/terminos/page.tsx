export const metadata = {
  title: "Términos y Condiciones — Go Viaja Con Nosotros",
  description: "Términos y condiciones oficiales del sorteo Go Viaja Con Nosotros.",
}

const ARTICULOS = [
  {
    num: 1,
    titulo: "Participación",
    contenido: "Toda persona que desee participar podrá adquirir una boleta oficial a través de nuestros canales autorizados de atención.",
  },
  {
    num: 2,
    titulo: "Asignación del número",
    contenido: null,
    lista: [
      "Asignado aleatoriamente, o",
      "Elegido por el participante, siempre y cuando se encuentre disponible.",
    ],
    nota: "La disponibilidad será confirmada por el organizador al momento de la compra.",
    intro: "El número de participación podrá ser:",
  },
  {
    num: 3,
    titulo: "Validación de compra",
    lista: [
      "La participación solo será válida una vez el pago haya sido confirmado.",
      "El ticket oficial será entregado únicamente después de verificar correctamente el pago realizado.",
    ],
  },
  {
    num: 4,
    titulo: "Mecánica del sorteo",
    contenido: "El ganador será definido mediante las últimas cuatro (4) cifras del resultado oficial de la Lotería de Boyacá correspondiente a la fecha anunciada del sorteo.",
  },
  {
    num: 5,
    titulo: "Premio Mayor",
    intro: "El premio corresponde a:",
    lista: [
      "Viaje para dos (2) personas a Cancún.",
      "Hospedaje en Hotel RIU 4 estrellas o similar.",
      "Premio adicional de $3.000.000 COP.",
    ],
  },
  {
    num: 6,
    titulo: "Premio Anticipado",
    intro: "El premio anticipado corresponde a:",
    lista: [
      "Viaje para dos (2) personas a Cartagena.",
      "Hospedaje en Hotel Dubai o similar.",
    ],
  },
  {
    num: 7,
    titulo: "Entrega del premio",
    intro: "La entrega del premio podrá realizarse:",
    lista: [
      "De manera presencial, o",
      "Virtual,",
    ],
    nota: "según acuerdo entre las partes.",
  },
  {
    num: 8,
    titulo: "Reclamación del premio",
    contenido: "El ganador contará con un plazo máximo de treinta (30) días hábiles para reclamar su premio a partir de la fecha oficial del sorteo. Después de este tiempo, el premio se entenderá como no reclamado.",
  },
  {
    num: 9,
    titulo: "Viajes y reservas",
    intro: "Los viajes estarán sujetos a:",
    lista: [
      "Disponibilidad,",
      "Temporadas,",
      "Y coordinación previa.",
    ],
    nota: "Las fechas podrán ajustarse siempre y cuando exista una causa justificada y se informe con suficiente anticipación.",
  },
  {
    num: 10,
    titulo: "Gastos no incluidos",
    contenido: "Todo gasto, impuesto, trámite o servicio no especificado explícitamente dentro del premio será asumido por el ganador.",
  },
  {
    num: 11,
    titulo: "Transferencia del premio",
    contenido: "El premio podrá ser transferido a otra persona únicamente bajo validación y autorización previa del organizador. Aplican términos y condiciones.",
  },
  {
    num: 12,
    titulo: "Devoluciones",
    contenido: "Una vez confirmado el pago y asignado el número de participación, no se realizarán devoluciones de dinero.",
  },
  {
    num: 13,
    titulo: "Validación del ganador",
    intro: "Para reclamar el premio, el ganador deberá presentar:",
    lista: [
      "El ticket oficial,",
      "Y la validación correspondiente de participación.",
    ],
  },
  {
    num: 14,
    titulo: "Responsable del evento",
    contenido: "Evento organizado y administrado por: Juan David Pajoy Osorio.",
  },
  {
    num: 15,
    titulo: "Aceptación de términos",
    contenido: "La participación en el sorteo implica la aceptación total de los presentes términos y condiciones.",
  },
]

export default function TerminosPage() {
  return (
    <main className="min-h-screen bg-background px-4 py-16">
      <div className="mx-auto max-w-2xl">

        {/* Encabezado */}
        <div className="text-center mb-12">
          <p className="text-xs font-medium uppercase tracking-[0.25em] text-gold mb-3">Documento oficial</p>
          <h1 className="font-heading text-4xl font-semibold text-foreground mb-2">
            Términos y Condiciones
          </h1>
          <p className="text-muted-foreground">Go Viaja Con Nosotros</p>
        </div>

        {/* Artículos */}
        <div className="space-y-8">
          {ARTICULOS.map((art) => (
            <article key={art.num} className="border-l-2 border-gold/30 pl-5">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-gold mb-2">
                {art.num}. {art.titulo}
              </h2>
              {"intro" in art && art.intro && (
                <p className="text-muted-foreground text-sm mb-2">{art.intro}</p>
              )}
              {"contenido" in art && art.contenido && (
                <p className="text-foreground/80 text-sm leading-relaxed">{art.contenido}</p>
              )}
              {"lista" in art && art.lista && (
                <ul className="list-disc list-inside space-y-1 text-foreground/80 text-sm">
                  {art.lista.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              )}
              {"nota" in art && art.nota && (
                <p className="text-muted-foreground text-sm mt-2 italic">{art.nota}</p>
              )}
            </article>
          ))}
        </div>

        {/* Pie */}
        <div className="mt-14 border-t border-gold/20 pt-8 text-center space-y-2">
          <p className="text-xs text-muted-foreground">
            Responsable: Juan David Pajoy Osorio · 300 508 7122
          </p>
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Go Viaja Con Nosotros. Todos los derechos reservados.
          </p>
          <a href="/" className="inline-block mt-4 text-sm text-gold hover:underline underline-offset-4">
            ← Volver al inicio
          </a>
        </div>
      </div>
    </main>
  )
}

"use client"

import { useState, useRef, useEffect } from "react"
import { X, ChevronLeft, MessageCircle } from "lucide-react"

const WA_ASESOR = "https://wa.me/573005087122?text=" + encodeURIComponent("Hola, tengo una pregunta sobre el sorteo Go Viaja Con Nosotros 🌍")

// ── Contenido ────────────────────────────────────────────────

const CATEGORIAS = [
  { id: "compra",    emoji: "🛒", label: "Sobre la compra" },
  { id: "pagos",    emoji: "💳", label: "Medios de pago" },
  { id: "legal",    emoji: "⚖️", label: "Legalidad de la rifa" },
  { id: "premio",   emoji: "🏆", label: "El premio" },
  { id: "fechas",   emoji: "📅", label: "Fechas del sorteo" },
  { id: "ganador",  emoji: "🎯", label: "¿Ya hay ganador?" },
]

const FAQS: Record<string, { q: string; a: string }[]> = {
  compra: [
    {
      q: "¿Cómo selecciono mi número?",
      a: "Entra a la sección 'Elige tu número', haz clic en cualquier número disponible (los verdes están libres), llena tus datos y paga con Bold. ¡Listo! Recibirás tu boleta por WhatsApp al instante.",
    },
    {
      q: "¿Puedo comprar más de un número?",
      a: "¡Claro! Puedes seleccionar varios números a la vez. Además, comprar 2 o más tiene precio especial: $20.000 c/u en lugar de $25.000.",
    },
    {
      q: "¿Recibiré alguna confirmación?",
      a: "Sí. En cuanto se confirme tu pago, te enviamos tu boleta oficial por WhatsApp con tu nombre y número. Guárdala — es tu comprobante.",
    },
    {
      q: "¿Qué pasa si el número que quiero ya fue vendido?",
      a: "Los números vendidos aparecen en azul y no se pueden seleccionar. Si ves uno disponible (verde), puedes tomarlo. Si tienes algún problema, escríbenos por WhatsApp.",
    },
    {
      q: "¿Puedo comprar desde fuera de Colombia?",
      a: "Sí, puedes participar desde cualquier parte del mundo. El pago se procesa en pesos colombianos (COP) a través de Bold.",
    },
  ],
  pagos: [
    {
      q: "¿Qué métodos de pago aceptan?",
      a: "Aceptamos tarjetas débito y crédito (Visa, Mastercard, Amex), PSE, Nequi y DaviPlata — todo a través de Bold, la pasarela de pagos más usada en Colombia.",
    },
    {
      q: "¿Es seguro pagar en línea?",
      a: "100% seguro. Bold está certificado PCI-DSS, el estándar máximo de seguridad para pagos. Nunca almacenamos tu información bancaria.",
    },
    {
      q: "¿Puedo pagar en efectivo o por transferencia?",
      a: "Por el momento el pago es únicamente en línea a través de Bold. Si tienes alguna dificultad, escríbenos al WhatsApp y te orientamos.",
    },
    {
      q: "¿Por qué me piden nombre y celular?",
      a: "Para enviarte tu boleta por WhatsApp y contactarte si ganas. No compartimos tu información con terceros.",
    },
    {
      q: "¿Qué pasa si mi pago falla?",
      a: "El número queda libre automáticamente en unos minutos. Puedes intentarlo de nuevo. Si el cobro se aplicó pero no recibiste boleta, escríbenos de inmediato.",
    },
  ],
  legal: [
    {
      q: "¿Esto es legal?",
      a: "Sí. El sorteo opera bajo la modalidad de rifa con Lotería de Boyacá como mecanismo de transparencia — un método reconocido y común en Colombia. El responsable legal es Juan David Pajo Osorio.",
    },
    {
      q: "¿Cómo sé que no es una estafa?",
      a: "El ganador se determina por las últimas 4 cifras de la Lotería de Boyacá (sorteo oficial del Estado colombiano), completamente independiente de nosotros. El resultado es público y verificable por cualquier persona.",
    },
    {
      q: "¿Cómo se elige al ganador?",
      a: "El número ganador corresponde a las últimas 4 cifras del número ganador de la Lotería de Boyacá del 15 de agosto de 2026. Si tu boleta coincide, ¡ganaste!",
    },
    {
      q: "¿Quién es el responsable del sorteo?",
      a: "Juan David Pajo Osorio, organizador de Go Viaja Con Nosotros. Puedes contactarlo directamente al 300 508 7122.",
    },
    {
      q: "¿Dónde puedo verificar mi participación?",
      a: "En cualquier momento puedes entrar a viajaconnosotros.co/verificar, escribir tu celular y ver tu número registrado.",
    },
  ],
  premio: [
    {
      q: "¿Qué incluye el Premio Mayor (Cancún)?",
      a: "✈️ Tiquetes aéreos para 2 personas desde Colombia a Cancún\n🏨 Hotel RIU 4 estrellas todo incluido\n🍽️ Alimentación y bebidas completas\n\nFecha estimada: 29 de agosto de 2026.",
    },
    {
      q: "¿Qué incluye el Premio Anticipado (Cartagena)?",
      a: "🏨 Viaje para 2 personas a Cartagena\n🏨 Hotel Dubai o similar (estándar similar)\n\nEste premio se entrega el 15 de agosto de 2026, el mismo día del sorteo anticipado.",
    },
    {
      q: "¿El premio es en dinero o en viaje?",
      a: "El premio es el viaje completo (tiquetes + hotel). No se entrega en efectivo ni es transferible por dinero.",
    },
    {
      q: "¿El premio es transferible a otra persona?",
      a: "El ganador puede designar a quien quiera para viajar. No necesariamente tiene que ir él mismo — puede llevar a quien desee.",
    },
    {
      q: "¿Cuánto tiempo tengo para reclamar el premio?",
      a: "El ganador debe contactarse dentro de los 5 días hábiles siguientes al sorteo. Pasado ese tiempo, se puede relanzar el premio.",
    },
  ],
  fechas: [
    {
      q: "¿Cuándo es el sorteo anticipado?",
      a: "El sorteo anticipado es el 15 de agosto de 2026. El número ganador se determina con las últimas 4 cifras de la Lotería de Boyacá de ese día.",
    },
    {
      q: "¿Cuándo es el sorteo del Premio Mayor?",
      a: "El Premio Mayor (viaje a Cancún) se sortea el 29 de agosto de 2026, también con la Lotería de Boyacá.",
    },
    {
      q: "¿Cuándo serían las fechas del viaje a Cancún?",
      a: "El viaje está programado para finales de agosto de 2026 (fecha exacta se coordina con el ganador). El hotel y los tiquetes se gestionan después del sorteo.",
    },
    {
      q: "¿Hasta cuándo puedo comprar mi número?",
      a: "Los números están disponibles mientras queden libres. Se recomienda no esperar — los más buscados se agotan rápido.",
    },
  ],
  ganador: [
    {
      q: "¿Ya se realizó el sorteo?",
      a: "Aún no. El primer sorteo (Premio Anticipado) es el 15 de agosto de 2026. El Premio Mayor se sortea el 29 de agosto de 2026. ¡Todavía estás a tiempo de participar!",
    },
    {
      q: "¿Cómo sabré si gané?",
      a: "Te contactaremos directamente al celular que registraste. Además publicaremos el resultado en nuestro Instagram @goviajaconnosotros y en esta misma página.",
    },
    {
      q: "¿Dónde se publican los resultados?",
      a: "En nuestro Instagram @goviajaconnosotros y en la página web. También puedes verificar directamente con la Lotería de Boyacá en su sitio oficial.",
    },
    {
      q: "¿Qué pasa si el número ganador no fue vendido?",
      a: "Si el número exacto no fue vendido, el premio se asigna al número más cercano que sí esté vendido (hacia arriba o hacia abajo). Siempre habrá un ganador.",
    },
  ],
}

// ── Componente ───────────────────────────────────────────────

type Vista = "categorias" | "preguntas" | "respuesta"

export function FaqBot() {
  const [abierto, setAbierto] = useState(false)
  const [vista, setVista] = useState<Vista>("categorias")
  const [catActiva, setCatActiva] = useState<string | null>(null)
  const [faqActiva, setFaqActiva] = useState<{ q: string; a: string } | null>(null)
  const [pulso, setPulso] = useState(true)
  const bodyRef = useRef<HTMLDivElement>(null)

  // Detener pulso al primer clic
  useEffect(() => {
    if (abierto) setPulso(false)
  }, [abierto])

  // Scroll al tope en cada cambio de vista
  useEffect(() => {
    bodyRef.current?.scrollTo({ top: 0, behavior: "smooth" })
  }, [vista, catActiva])

  function abrirCategoria(id: string) {
    setCatActiva(id)
    setVista("preguntas")
  }

  function abrirFaq(faq: { q: string; a: string }) {
    setFaqActiva(faq)
    setVista("respuesta")
  }

  function volver() {
    if (vista === "respuesta") { setVista("preguntas"); setFaqActiva(null) }
    else { setVista("categorias"); setCatActiva(null) }
  }

  function cerrar() {
    setAbierto(false)
    setTimeout(() => { setVista("categorias"); setCatActiva(null); setFaqActiva(null) }, 300)
  }

  const cat = CATEGORIAS.find((c) => c.id === catActiva)

  return (
    <>
      {/* Botón flotante */}
      <button
        onClick={() => setAbierto((v) => !v)}
        aria-label="Preguntas frecuentes"
        className="fixed bottom-6 right-6 z-50 flex items-center justify-center w-14 h-14 rounded-full shadow-2xl transition-transform hover:scale-110 active:scale-95"
        style={{ background: "linear-gradient(135deg,#05111f,#c8993a)" }}
      >
        {abierto ? (
          <X size={24} className="text-white" />
        ) : (
          <MessageCircle size={24} className="text-white" />
        )}
        {pulso && !abierto && (
          <span className="absolute inset-0 rounded-full animate-ping opacity-50"
            style={{ background: "linear-gradient(135deg,#05111f,#c8993a)" }} />
        )}
      </button>

      {/* Panel del bot */}
      <div
        className={`fixed bottom-24 right-4 z-50 w-[calc(100vw-2rem)] max-w-sm rounded-2xl shadow-2xl border border-white/10 flex flex-col overflow-hidden transition-all duration-300 ${
          abierto ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 translate-y-4 pointer-events-none"
        }`}
        style={{ background: "#0d1a2b", maxHeight: "75vh" }}
      >
        {/* Header */}
        <div
          className="flex items-center gap-3 px-4 py-3 flex-shrink-0"
          style={{ background: "linear-gradient(135deg,#05111f,#c8993a)" }}
        >
          {vista !== "categorias" && (
            <button onClick={volver} className="text-white/80 hover:text-white mr-1">
              <ChevronLeft size={20} />
            </button>
          )}
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-base flex-shrink-0">
              ✈️
            </div>
            <div className="min-w-0">
              <p className="text-white text-sm font-semibold leading-tight">Asistente Go Viaja</p>
              <p className="text-white/70 text-xs">Respuestas inmediatas</p>
            </div>
          </div>
          <button onClick={cerrar} className="text-white/70 hover:text-white flex-shrink-0">
            <X size={18} />
          </button>
        </div>

        {/* Cuerpo scrollable */}
        <div ref={bodyRef} className="flex-1 overflow-y-auto p-4 space-y-3">

          {/* Vista: categorías */}
          {vista === "categorias" && (
            <>
              <div className="bg-white/5 rounded-xl px-4 py-3 text-sm text-white/80 leading-relaxed">
                👋 ¡Hola! Soy el asistente de <strong className="text-white">Go Viaja Con Nosotros</strong>. ¿En qué puedo ayudarte?
              </div>
              <p className="text-xs text-white/40 uppercase tracking-wider px-1">Elige una categoría</p>
              {CATEGORIAS.map((c) => (
                <button
                  key={c.id}
                  onClick={() => abrirCategoria(c.id)}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left text-sm text-white font-medium transition-colors hover:bg-white/10 bg-white/5 border border-white/10"
                >
                  <span className="text-xl flex-shrink-0">{c.emoji}</span>
                  {c.label}
                  <ChevronLeft size={16} className="ml-auto rotate-180 text-white/40" />
                </button>
              ))}
            </>
          )}

          {/* Vista: preguntas de la categoría */}
          {vista === "preguntas" && cat && (
            <>
              <div className="bg-white/5 rounded-xl px-4 py-3 text-sm text-white/80">
                {cat.emoji} <strong className="text-white">{cat.label}</strong> — elige tu pregunta:
              </div>
              {FAQS[cat.id].map((faq, i) => (
                <button
                  key={i}
                  onClick={() => abrirFaq(faq)}
                  className="w-full flex items-start gap-3 px-4 py-3 rounded-xl text-left text-sm text-white/90 transition-colors hover:bg-white/10 bg-white/5 border border-white/10"
                >
                  <span className="mt-0.5 text-gold flex-shrink-0">›</span>
                  {faq.q}
                </button>
              ))}
            </>
          )}

          {/* Vista: respuesta */}
          {vista === "respuesta" && faqActiva && (
            <>
              {/* Pregunta (burbuja usuario) */}
              <div className="flex justify-end">
                <div className="bg-gold/20 border border-gold/30 rounded-xl rounded-tr-sm px-4 py-3 text-sm text-white max-w-[85%]">
                  {faqActiva.q}
                </div>
              </div>
              {/* Respuesta (burbuja bot) */}
              <div className="flex justify-start">
                <div className="bg-white/5 border border-white/10 rounded-xl rounded-tl-sm px-4 py-3 text-sm text-white/90 max-w-[90%] leading-relaxed whitespace-pre-line">
                  {faqActiva.a}
                </div>
              </div>
              <button
                onClick={volver}
                className="w-full text-center text-xs text-gold/70 hover:text-gold py-2 transition-colors"
              >
                ← Ver otras preguntas
              </button>
            </>
          )}
        </div>

        {/* Footer: contacto WhatsApp */}
        <div className="flex-shrink-0 px-4 py-3 border-t border-white/10 bg-white/5">
          <p className="text-xs text-white/40 text-center mb-2">¿No encontraste tu respuesta?</p>
          <a
            href={WA_ASESOR}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-semibold text-white transition-colors"
            style={{ background: "#25D366" }}
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
              <path d="M12 0C5.373 0 0 5.373 0 12c0 2.124.558 4.118 1.529 5.845L.057 23.885l6.233-1.636A11.945 11.945 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.891 0-3.659-.498-5.191-1.369l-.372-.221-3.853 1.011 1.03-3.753-.242-.386A9.946 9.946 0 0 1 2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
            </svg>
            Hablar con un asesor
          </a>
        </div>
      </div>
    </>
  )
}

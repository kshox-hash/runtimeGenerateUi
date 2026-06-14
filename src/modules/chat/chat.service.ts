import { KnowledgeChunk, Intent } from "./chat.types";
import { formatCurrencyCLP } from "../../utils/format";

const STOPWORDS = new Set([
  "el", "la", "los", "las", "un", "una", "de", "en", "con", "por", "para",
  "que", "se", "es", "y", "o", "a", "del", "al", "le", "lo", "su", "sus",
  "me", "te", "nos", "como", "mas", "pero", "si", "no", "hay", "tiene",
  "tienen", "quiero", "necesito", "puedo", "puede", "cual", "cuanto", "cuando",
  "donde", "son", "esta", "este", "mi", "tu", "ya", "tan", "muy", "bien",
  "hola", "buenas", "gracias", "quisiera", "saber", "tener", "ser", "estar",
  "hacer", "dar", "ver", "soy", "estoy", "tengo", "favor", "info", "informacion"
]);

const PRICE_KEYWORDS = new Set([
  "precio", "precios", "costo", "costos", "vale", "cobran", "tarifa", "tarifas",
  "valor", "valores", "pagar", "pago", "cobro", "cuesta", "sale", "cuanto"
]);

const AVAIL_KEYWORDS = new Set([
  "hora", "horas", "disponible", "disponibles", "agendar", "reserva", "reservar",
  "turno", "turnos", "cita", "citas", "atencion", "atienden", "agenda", "cuando"
]);

function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD").replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function extractKeywords(text: string): string[] {
  return normalize(text)
    .split(" ")
    .filter(w => w.length > 2 && !STOPWORDS.has(w));
}

export function detectIntent(question: string): Intent {
  const words = extractKeywords(question);
  if (words.some(w => AVAIL_KEYWORDS.has(w))) return "availability";
  if (words.some(w => PRICE_KEYWORDS.has(w))) return "price";
  return "general";
}

function scoreChunk(keywords: string[], chunkText: string): number {
  const chunkSet = new Set(normalize(chunkText).split(" "));
  return keywords.filter(w => chunkSet.has(w)).length;
}

export function findBestMatch(
  question: string,
  chunks: KnowledgeChunk[]
): string {
  if (chunks.length === 0) {
    return "No tengo información disponible en este momento. Contáctanos directamente para más detalles.";
  }

  const words = extractKeywords(question);

  if (words.length === 0) {
    return "Hola, ¿en qué puedo ayudarte? Puedo responder preguntas sobre nuestros servicios, precios y disponibilidad.";
  }

  const scored = chunks
    .map(c => ({ text: c.chunk_text, score: scoreChunk(words, c.chunk_text) }))
    .filter(c => c.score > 0)
    .sort((a, b) => b.score - a.score);

  if (scored.length === 0) {
    return "No encontré información específica sobre eso. ¿Puedes reformular tu pregunta o contactarnos directamente?";
  }

  const top = scored[0];
  const second = scored[1];

  if (
    second &&
    second.score >= top.score * 0.8 &&
    (top.text + " " + second.text).length < 700
  ) {
    return `${top.text}\n\n${second.text}`;
  }

  return top.text;
}

export function buildPriceAnswer(
  products: Array<{ name: string; price: number; description?: string }>
): string {
  if (products.length === 0) {
    return "Por el momento no tenemos una lista de precios publicada. Contáctanos para más información.";
  }

  const list = products
    .map(p => `• ${p.name}: ${formatCurrencyCLP(p.price)}${p.description ? `\n  ${p.description}` : ""}`)
    .join("\n");

  return `Aquí están nuestros servicios y precios:\n\n${list}`;
}

export function buildAvailabilityAnswer(slotsData: unknown): string {
  const data = slotsData as Record<string, unknown>;
  const available = (data?.available ?? data?.slots ?? data) as Record<string, string[]> | null;

  if (!available || typeof available !== "object") {
    return "Por el momento estamos revisando nuestra disponibilidad. Te invitamos a reservar directamente desde el menú.";
  }

  const days = Object.entries(available)
    .filter(([, times]) => Array.isArray(times) && times.length > 0)
    .slice(0, 3);

  if (days.length === 0) {
    return "No tenemos horas disponibles en los próximos días. Por favor intenta más adelante.";
  }

  const formatted = days
    .map(([date, times]) => `• ${date}: ${times.slice(0, 5).join(", ")}`)
    .join("\n");

  return `Tenemos disponibilidad en:\n\n${formatted}\n\nPuedes reservar tu hora directamente desde el menú.`;
}

export async function extractChunksFromPdf(buffer: Buffer): Promise<string[]> {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const pdfParse = require("pdf-parse") as (b: Buffer) => Promise<{ text: string }>;
  const { text } = await pdfParse(buffer);

  const rawChunks = text
    .split(/\n{2,}/)
    .map((s: string) => s.replace(/\n/g, " ").replace(/\s+/g, " ").trim())
    .filter((s: string) => s.length >= 30);

  // Split overly long chunks by sentence
  const finalChunks: string[] = [];
  for (const chunk of rawChunks) {
    if (chunk.length <= 600) {
      finalChunks.push(chunk);
    } else {
      const sentences = chunk.split(/(?<=[.!?])\s+/);
      let current = "";
      for (const sentence of sentences) {
        if ((current + " " + sentence).length > 600 && current) {
          if (current.trim().length >= 30) finalChunks.push(current.trim());
          current = sentence;
        } else {
          current += (current ? " " : "") + sentence;
        }
      }
      if (current.trim().length >= 30) finalChunks.push(current.trim());
    }
  }

  return finalChunks;
}

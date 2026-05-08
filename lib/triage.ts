// Telemedicine intake triage.
//
// Primary path: Claude Haiku 4.5 with structured outputs (`output_config.format`)
// — the model returns valid JSON matching the schema below in a single round-trip.
// Latency is ~1-2s, which fits the "patient just clicked submit" UX.
//
// Fallback: keyword + flag heuristic (no external dep). Triggers when
// ANTHROPIC_API_KEY is missing, the API errors, or the response fails the
// schema check. The patient experience is identical either way.

import Anthropic from "@anthropic-ai/sdk";

export type Urgency = "low" | "medium" | "high" | "emergency";

export type TriageInput = {
  chiefComplaint: string;
  durationDays: number | null;
  severity: number | null; // 0-10
  hasFever: boolean;
  hasBreathingDifficulty: boolean;
  hasChestPain: boolean;
  hasBleeding: boolean;
  hasFainting: boolean;
  pregnancy: boolean;
  additionalSymptoms: string;
};

export type TriageResult = {
  urgency: Urgency;
  summary: string;
};

const URGENCY_LABELS: Record<Urgency, string> = {
  low: "Baixa",
  medium: "Média",
  high: "Alta",
  emergency: "Emergência",
};

export const URGENCY_LABEL_PT: Record<Urgency, string> = URGENCY_LABELS;

export const URGENCY_BADGE_CLASS: Record<Urgency, string> = {
  low: "bg-emerald-100 text-emerald-800",
  medium: "bg-amber-100 text-amber-800",
  high: "bg-orange-100 text-orange-800",
  emergency: "bg-red-100 text-red-700",
};

export const CONSULTATION_STATUS_LABELS: Record<string, string> = {
  scheduled: "Marcada",
  waiting: "À espera",
  in_progress: "Em curso",
  completed: "Concluída",
  cancelled: "Cancelada",
};

export function videoRoomUrl(consultationId: string): string {
  return `https://meet.jit.si/SaudeAngola-${consultationId}`;
}

// ---------------------------------------------------------------------------
// Claude-powered triage
// ---------------------------------------------------------------------------

const TRIAGE_MODEL = "claude-haiku-4-5";

const TRIAGE_SYSTEM = `És uma assistente clínica de triagem da plataforma Saúde Angola (telemedicina, pt-PT).

OBJETIVO
A partir da entrada estruturada submetida pelo paciente, decides um nível de urgência e escreves um resumo clínico breve em português europeu, dirigido ao médico que vai atender.

NÍVEIS DE URGÊNCIA
- "emergency" — risco imediato de vida ou de lesão grave irreversível: dor torácica de tipo anginoso, dificuldade respiratória grave, hemorragia ativa significativa, perda de consciência, sinais de AVC, anafilaxia, trauma major, intenção suicida ativa. Recomendar 112.
- "high" — necessita avaliação em horas: dor intensa (≥8/10), febre alta na grávida ou em lactente, vómitos/diarreia persistentes com sinais de desidratação, cefaleia intensa de início súbito, sangramento moderado, dor abdominal forte localizada.
- "medium" — consulta no próprio dia ou no dia seguinte: dor moderada, febre sem outros critérios, sintomas que persistem ≥7 dias, agravamento de doença crónica.
- "low" — consulta de rotina: sintomas ligeiros, dúvidas, seguimento, gestão de doença estável.

REGRAS
- Se o paciente assinalou DOR NO PEITO, DIFICULDADE EM RESPIRAR, HEMORRAGIA ou DESMAIO → no mínimo "high"; classificar "emergency" salvo se o contexto contradizer claramente.
- Febre + gravidez → no mínimo "high".
- Intensidade ≥8/10 → no mínimo "high".
- Em caso de dúvida entre dois níveis, escolhe o mais alto.

RESUMO (máx. ~280 caracteres, registo clínico, pt-PT)
Formato sugerido: "Queixa: <…> · Duração: <Nd> · Intensidade: <N/10> · Sinais: <bandeiras vermelhas, se houver> · Outros: <…> · → urgência <nível>: <razão curta>".
Sê específica e factual. Não inventes informação que o paciente não deu. Se houver bandeiras vermelhas, mencioná-las primeiro.

SAÍDA
Apenas JSON válido conforme o esquema fornecido. Sem prefácio, sem markdown, sem texto fora do JSON.`;

const TRIAGE_SCHEMA = {
  type: "object" as const,
  properties: {
    urgency: {
      type: "string" as const,
      enum: ["low", "medium", "high", "emergency"] as const,
      description: "Nível de urgência clínica.",
    },
    summary: {
      type: "string" as const,
      description:
        "Resumo clínico em pt-PT para o médico, ≤280 caracteres.",
    },
  },
  required: ["urgency", "summary"],
  additionalProperties: false,
};

const URGENCY_VALUES: ReadonlySet<Urgency> = new Set([
  "low",
  "medium",
  "high",
  "emergency",
]);

function isUrgency(v: unknown): v is Urgency {
  return typeof v === "string" && URGENCY_VALUES.has(v as Urgency);
}

export async function triage(input: TriageInput): Promise<TriageResult> {
  if (!process.env.ANTHROPIC_API_KEY) {
    return triageHeuristic(input);
  }

  try {
    const client = new Anthropic();
    const response = await client.messages.create({
      model: TRIAGE_MODEL,
      max_tokens: 600,
      system: TRIAGE_SYSTEM,
      output_config: {
        format: { type: "json_schema", schema: TRIAGE_SCHEMA },
      },
      messages: [
        {
          role: "user",
          content: JSON.stringify(serializeInput(input)),
        },
      ],
    });

    const textBlock = response.content.find((b) => b.type === "text");
    if (!textBlock || textBlock.type !== "text") {
      return triageHeuristic(input);
    }

    const parsed: unknown = JSON.parse(textBlock.text);
    if (
      !parsed ||
      typeof parsed !== "object" ||
      !("urgency" in parsed) ||
      !("summary" in parsed)
    ) {
      return triageHeuristic(input);
    }
    const candidate = parsed as { urgency: unknown; summary: unknown };
    if (
      !isUrgency(candidate.urgency) ||
      typeof candidate.summary !== "string"
    ) {
      return triageHeuristic(input);
    }

    let urgency: Urgency = candidate.urgency;
    // Safety floor — never let the model downgrade an explicit emergency flag.
    if (
      input.hasChestPain ||
      input.hasBreathingDifficulty ||
      input.hasBleeding ||
      input.hasFainting
    ) {
      if (urgency === "low" || urgency === "medium") urgency = "high";
    }

    return { urgency, summary: candidate.summary.trim() };
  } catch (err) {
    console.error("[triage] Claude API call failed, using heuristic:", err);
    return triageHeuristic(input);
  }
}

function serializeInput(input: TriageInput) {
  return {
    queixa_principal: input.chiefComplaint || null,
    duracao_dias: input.durationDays,
    intensidade_0_10: input.severity,
    bandeiras_vermelhas: {
      dor_no_peito: input.hasChestPain,
      dificuldade_respiratoria: input.hasBreathingDifficulty,
      hemorragia: input.hasBleeding,
      desmaio_ou_perda_de_consciencia: input.hasFainting,
      febre: input.hasFever,
      gravidez: input.pregnancy,
    },
    sintomas_adicionais: input.additionalSymptoms || null,
  };
}

// ---------------------------------------------------------------------------
// Heuristic fallback — used when the API is unreachable or the env var is
// missing. Same input/output shape as the Claude path so callers don't care.
// ---------------------------------------------------------------------------

const EMERGENCY_KEYWORDS = [
  "dor no peito",
  "dor torácica",
  "falta de ar grave",
  "perda de consciência",
  "desmaio",
  "convulsão",
  "hemorragia",
  "sangramento abundante",
  "trauma",
  "acidente",
  "queimadura",
  "intoxicação",
  "overdose",
  "suicídio",
];
const HIGH_KEYWORDS = [
  "febre alta",
  "vómito persistente",
  "diarreia com sangue",
  "dor abdominal forte",
  "dor de cabeça intensa",
  "visão turva súbita",
  "dificuldade em falar",
  "dormência",
];

function matchesAny(haystack: string, needles: string[]): boolean {
  const h = haystack.toLowerCase();
  return needles.some((n) => h.includes(n));
}

export function triageHeuristic(input: TriageInput): TriageResult {
  const text = [input.chiefComplaint, input.additionalSymptoms]
    .filter(Boolean)
    .join(" · ")
    .toLowerCase();

  let urgency: Urgency = "low";

  if (
    input.hasChestPain ||
    input.hasFainting ||
    input.hasBleeding ||
    input.hasBreathingDifficulty ||
    matchesAny(text, EMERGENCY_KEYWORDS)
  ) {
    urgency = "emergency";
  } else if (
    (input.hasFever && input.pregnancy) ||
    (input.severity ?? 0) >= 8 ||
    matchesAny(text, HIGH_KEYWORDS)
  ) {
    urgency = "high";
  } else if (
    input.hasFever ||
    (input.severity ?? 0) >= 5 ||
    (input.durationDays !== null && input.durationDays >= 7)
  ) {
    urgency = "medium";
  }

  const flags: string[] = [];
  if (input.hasChestPain) flags.push("dor no peito");
  if (input.hasBreathingDifficulty) flags.push("dificuldade respiratória");
  if (input.hasBleeding) flags.push("hemorragia");
  if (input.hasFainting) flags.push("perda de consciência");
  if (input.hasFever) flags.push("febre");
  if (input.pregnancy) flags.push("gravidez");

  const parts: string[] = [
    `Queixa: ${input.chiefComplaint || "—"}`,
  ];
  if (input.durationDays !== null) parts.push(`Duração: ${input.durationDays}d`);
  if (input.severity !== null) parts.push(`Intensidade: ${input.severity}/10`);
  if (flags.length) parts.push(`Sinais: ${flags.join(", ")}`);
  if (input.additionalSymptoms) parts.push(`Outros: ${input.additionalSymptoms}`);
  parts.push(`→ urgência ${URGENCY_LABELS[urgency]} (triagem heurística).`);

  return { urgency, summary: parts.join(" · ") };
}

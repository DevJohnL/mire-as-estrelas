import { GoogleGenerativeAI } from '@google/generative-ai'
import { IAIService, QEPBEvaluationInput, EssayEvaluationInput } from '../../application/ports/IAIService'
import { AIFeedback } from '../../domain/entities/Performance'
import { EssayEvaluation } from '../../domain/entities/Essay'

const QEPB_SYSTEM_PROMPT = `Você é TARS, um tutor de inteligência artificial especializado no ENEM.
Sua função é avaliar a resposta e a explicação do estudante em dois eixos:
1. ACERTO: Se a alternativa escolhida está correta (verifique contra o gabarito fornecido).
2. QUALIDADE DA EXPLICAÇÃO: Se o raciocínio é sólido ("solid"), parcial ("partial") ou chute ("guessed").

Se houver erro ou gargalo conceitual, mapeie a árvore de dependências:
- Tópico da questão → Pré-requisitos → Base fundamental.

Responda SEMPRE em JSON válido com esta estrutura exata:
{
  "isCorrect": boolean,
  "explanationQuality": "solid" | "partial" | "guessed",
  "aiExplanation": "string com explicação clara e didática",
  "prerequisitePath": null | {
    "topic": "nome do tópico da questão",
    "prerequisites": ["lista de pré-requisitos"],
    "base": "conceito base fundamental a revisar",
    "khanAcademyUrl": null
  }
}

Seja didático, encorajador e objetivo. Máximo 300 palavras na aiExplanation.`

const ESSAY_SYSTEM_PROMPT = `Você é TARS, especialista em redação ENEM. Avalie a redação nas 5 competências do ENEM:
C1 (0-200): Gramática e norma culta
C2 (0-200): Tema e repertório
C3 (0-200): Estrutura dissertativo-argumentativa
C4 (0-200): Coesão e coerência
C5 (0-200): Proposta de intervenção (requer: Ação, Agente, Modo/Meio, Efeito, Detalhamento)

Responda SEMPRE em JSON válido:
{
  "totalScore": number,
  "competency1": { "score": number, "feedback": "string", "suggestions": ["string"] },
  "competency2": { "score": number, "feedback": "string", "suggestions": ["string"] },
  "competency3": { "score": number, "feedback": "string", "suggestions": ["string"] },
  "competency4": { "score": number, "feedback": "string", "suggestions": ["string"] },
  "competency5": { "score": number, "feedback": "string", "suggestions": ["string"] },
  "overallFeedback": "string com feedback geral motivador (max 100 palavras)"
}

Considere o contexto e a competência-alvo fornecidos pelo usuário ao dar o feedback.`

export class GeminiService implements IAIService {
  private readonly model

  constructor() {
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY!)
    this.model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })
  }

  async evaluateQEPB(input: QEPBEvaluationInput): Promise<AIFeedback> {
    const prompt = `
QUESTÃO (${input.subjectName} — ${input.topicName}):
${input.question.statement}

ALTERNATIVAS:
${input.question.alternatives.map((a) => `${a.key}) ${a.text}`).join('\n')}

GABARITO CORRETO: ${input.question.correctAnswer}
RESPOSTA DO ESTUDANTE: ${input.chosenAnswer}
EXPLICAÇÃO DO ESTUDANTE: "${input.userExplanation}"

Avalie conforme as instruções do sistema.`

    const result = await this.model.generateContent({
      systemInstruction: QEPB_SYSTEM_PROMPT,
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: { responseMimeType: 'application/json', temperature: 0.3 },
    })

    const parsed = JSON.parse(result.response.text())
    return { ...parsed, youtubeVideos: [] }
  }

  async evaluateEssay(input: EssayEvaluationInput): Promise<EssayEvaluation> {
    const competencyContext = input.targetCompetency
      ? `O estudante estava especificamente treinando a Competência ${input.targetCompetency}. Dê mais atenção e detalhamento a ela.`
      : 'Avalie todas as competências de forma equilibrada.'

    const prompt = `
CONTEXTO DO ESTUDANTE: "${input.userContext}"
${competencyContext}

REDAÇÃO:
${input.essayText}`

    const result = await this.model.generateContent({
      systemInstruction: ESSAY_SYSTEM_PROMPT,
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: { responseMimeType: 'application/json', temperature: 0.3 },
    })

    return JSON.parse(result.response.text()) as EssayEvaluation
  }

  async suggestEssayTopics(): Promise<Array<{ theme: string; relevance: string }>> {
    const result = await this.model.generateContent({
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: 'Liste 5 temas atuais relevantes para redação ENEM no Brasil em 2025. Responda em JSON: [{"theme": "string", "relevance": "string"}]',
            },
          ],
        },
      ],
      generationConfig: { responseMimeType: 'application/json', temperature: 0.7 },
    })
    return JSON.parse(result.response.text())
  }
}

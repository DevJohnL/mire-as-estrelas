export type CompetencyScore = {
  score: number // 0-200
  feedback: string
  suggestions: string[]
}

export interface EssayEvaluation {
  totalScore: number // 0-1000
  competency1: CompetencyScore // Gramática
  competency2: CompetencyScore // Tema e Repertório
  competency3: CompetencyScore // Projeto de Texto
  competency4: CompetencyScore // Coesão
  competency5: CompetencyScore // Proposta de Intervenção
  overallFeedback: string
}

export interface Essay {
  id: string
  userId: string
  text: string
  userContext: string
  targetCompetency: 1 | 2 | 3 | 4 | 5 | null
  evaluation: EssayEvaluation | null
  createdAt: Date
}

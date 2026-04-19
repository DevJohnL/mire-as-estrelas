import { IAIService } from '../../application/ports/IAIService'
import { Essay, EssayEvaluation } from '../entities/Essay'

export interface EvaluateEssayInput {
  userId: string
  essayText: string
  userContext: string
  targetCompetency: 1 | 2 | 3 | 4 | 5 | null
}

export class EvaluateEssay {
  constructor(private readonly aiService: IAIService) {}

  async execute(input: EvaluateEssayInput): Promise<EssayEvaluation> {
    if (input.essayText.trim().length < 50) {
      throw new Error('Essay text is too short to evaluate')
    }

    return this.aiService.evaluateEssay({
      essayText: input.essayText,
      userContext: input.userContext,
      targetCompetency: input.targetCompetency,
    })
  }
}

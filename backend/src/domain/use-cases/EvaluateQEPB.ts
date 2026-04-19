import { IAIService, QEPBEvaluationInput } from '../../application/ports/IAIService'
import { IPerformanceRepository } from '../../application/ports/IPerformanceRepository'
import { IQuestionRepository } from '../../application/ports/IQuestionRepository'
import { IYouTubeService } from '../../application/ports/IYouTubeService'
import { AIFeedback, Performance, SelfAssessmentLevel } from '../entities/Performance'
import { AlternativeKey } from '../entities/Question'

export interface EvaluateQEPBInput {
  userId: string
  questionId: string
  chosenAnswer: string
  userExplanation: string
}

export interface EvaluateQEPBOutput {
  performance: Performance
  aiFeedback: AIFeedback
}

export class EvaluateQEPB {
  constructor(
    private readonly questionRepo: IQuestionRepository,
    private readonly performanceRepo: IPerformanceRepository,
    private readonly aiService: IAIService,
    private readonly youtubeService: IYouTubeService,
  ) {}

  async execute(input: EvaluateQEPBInput): Promise<EvaluateQEPBOutput> {
    const question = await this.questionRepo.findById(input.questionId)
    if (!question) throw new Error(`Question ${input.questionId} not found`)

    const isCorrect = question.correctAnswer === (input.chosenAnswer as AlternativeKey)

    const aiFeedback = await this.aiService.evaluateQEPB({
      question,
      chosenAnswer: input.chosenAnswer,
      userExplanation: input.userExplanation,
      topicName: question.topicId ?? 'Geral',
      subjectName: question.subjectId,
    })

    // Enrich with YouTube videos if prerequisite path identified
    if (aiFeedback.prerequisitePath) {
      const searchQuery = `aula ENEM ${aiFeedback.prerequisitePath.base}`
      const videos = await this.youtubeService.searchVideos(searchQuery, 3)
      aiFeedback.youtubeVideos = videos
    }

    const performance = await this.performanceRepo.save({
      userId: input.userId,
      questionId: input.questionId,
      chosenAnswer: input.chosenAnswer,
      isCorrect,
      userExplanation: input.userExplanation,
      aiFeedback,
      selfAssessment: 2 as SelfAssessmentLevel, // default; user updates via separate call
    })

    return { performance, aiFeedback }
  }
}

import { Request, Response, NextFunction } from 'express'
import { z } from 'zod'
import { EvaluateQEPB } from '../../domain/use-cases/EvaluateQEPB'
import { PgQuestionRepository } from '../../infrastructure/database/repositories/PgQuestionRepository'
import { PgPerformanceRepository } from '../../infrastructure/database/repositories/PgPerformanceRepository'
import { GeminiService } from '../../infrastructure/ai/GeminiService'
import { YouTubeService } from '../../infrastructure/apis/YouTubeService'
import { SelfAssessmentLevel } from '../../domain/entities/Performance'

const evaluateSchema = z.object({
  userId: z.string().uuid(),
  questionId: z.string().uuid(),
  chosenAnswer: z.enum(['A', 'B', 'C', 'D', 'E']),
  userExplanation: z.string().min(10, 'Explique seu raciocínio com pelo menos 10 caracteres'),
})

const selfAssessmentSchema = z.object({
  selfAssessment: z.union([z.literal(1), z.literal(2), z.literal(3)]),
})

export class QuestionsController {
  private readonly questionRepo = new PgQuestionRepository()
  private readonly performanceRepo = new PgPerformanceRepository()
  private readonly aiService = new GeminiService()
  private readonly youtubeService = new YouTubeService()

  getQuestion = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const question = await this.questionRepo.findById(req.params.id)
      if (!question) { res.status(404).json({ error: 'Question not found' }); return }
      res.json(question)
    } catch (e) { next(e) }
  }

  listQuestions = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { subjectId, limit = '10' } = req.query
      const questions = await this.questionRepo.findMany(
        { subjectId: subjectId as string },
        parseInt(limit as string, 10),
      )
      res.json(questions)
    } catch (e) { next(e) }
  }

  evaluate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const input = evaluateSchema.parse(req.body)
      const useCase = new EvaluateQEPB(
        this.questionRepo,
        this.performanceRepo,
        this.aiService,
        this.youtubeService,
      )
      const result = await useCase.execute(input)
      res.json(result)
    } catch (e) { next(e) }
  }

  updateSelfAssessment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { selfAssessment } = selfAssessmentSchema.parse(req.body)
      await this.performanceRepo.updateSelfAssessment(
        req.params.performanceId,
        selfAssessment as SelfAssessmentLevel,
      )
      res.json({ ok: true })
    } catch (e) { next(e) }
  }
}

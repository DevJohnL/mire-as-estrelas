import { Request, Response, NextFunction } from 'express'
import { z } from 'zod'
import { EvaluateEssay } from '../../domain/use-cases/EvaluateEssay'
import { GeminiService } from '../../infrastructure/ai/GeminiService'
import { pool } from '../../infrastructure/database/connection'

const evaluateSchema = z.object({
  userId: z.string().uuid(),
  essayText: z.string().min(50),
  userContext: z.string().default(''),
  targetCompetency: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4), z.literal(5)]).nullable().default(null),
})

export class EssayController {
  private readonly aiService = new GeminiService()

  evaluate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const input = evaluateSchema.parse(req.body)
      const useCase = new EvaluateEssay(this.aiService)
      const evaluation = await useCase.execute(input)

      await pool.query(
        `INSERT INTO essays (user_id, text, user_context, target_competency, evaluation)
         VALUES ($1,$2,$3,$4,$5)`,
        [input.userId, input.essayText, input.userContext, input.targetCompetency, JSON.stringify(evaluation)],
      )

      res.json(evaluation)
    } catch (e) { next(e) }
  }

  suggestTopics = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const topics = await this.aiService.suggestEssayTopics()
      res.json(topics)
    } catch (e) { next(e) }
  }
}

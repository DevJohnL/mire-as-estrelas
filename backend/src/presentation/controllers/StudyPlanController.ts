import { Request, Response, NextFunction } from 'express'
import { z } from 'zod'
import { GenerateStudyPlan } from '../../domain/use-cases/GenerateStudyPlan'
import { PgStudyPlanRepository } from '../../infrastructure/database/repositories/PgStudyPlanRepository'
import { PgPerformanceRepository } from '../../infrastructure/database/repositories/PgPerformanceRepository'

const generateSchema = z.object({
  userId: z.string().uuid(),
  config: z.object({
    dailyMinutes: z.number().min(15).max(480),
    studyDaysPerWeek: z.number().min(1).max(7),
  }),
  subjectIds: z.array(z.string()).min(1),
})

export class StudyPlanController {
  private readonly studyPlanRepo = new PgStudyPlanRepository()
  private readonly performanceRepo = new PgPerformanceRepository()

  generate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const input = generateSchema.parse(req.body)
      const useCase = new GenerateStudyPlan(this.studyPlanRepo, this.performanceRepo)
      const plan = await useCase.execute(input)
      res.status(201).json(plan)
    } catch (e) { next(e) }
  }

  getActive = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const plan = await this.studyPlanRepo.findActiveByUserId(req.params.userId)
      if (!plan) { res.status(404).json({ error: 'No active plan' }); return }
      res.json(plan)
    } catch (e) { next(e) }
  }
}

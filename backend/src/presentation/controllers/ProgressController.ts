import { Request, Response, NextFunction } from 'express'
import { GetWeeklyProgress } from '../../domain/use-cases/GetWeeklyProgress'
import { PgPerformanceRepository } from '../../infrastructure/database/repositories/PgPerformanceRepository'

export class ProgressController {
  private readonly performanceRepo = new PgPerformanceRepository()

  get = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const useCase = new GetWeeklyProgress(this.performanceRepo)
      const progress = await useCase.execute(req.params.userId)
      res.json(progress)
    } catch (e) { next(e) }
  }
}

import { IPerformanceRepository, SubjectProgress, WeeklyStats } from '../../application/ports/IPerformanceRepository'

export interface WeeklyProgressOutput {
  weeklyStats: WeeklyStats[]
  subjectProgress: SubjectProgress[]
  weakTopics: Array<{ topicId: string; topicName: string; accuracy: number }>
  totalAnswered: number
  overallAccuracy: number
}

export class GetWeeklyProgress {
  constructor(private readonly performanceRepo: IPerformanceRepository) {}

  async execute(userId: string): Promise<WeeklyProgressOutput> {
    const [weeklyStats, subjectProgress, weakTopics] = await Promise.all([
      this.performanceRepo.getWeeklyStats(userId, 4),
      this.performanceRepo.getSubjectProgress(userId),
      this.performanceRepo.getWeakTopics(userId),
    ])

    const totalAnswered = subjectProgress.reduce((sum, s) => sum + s.totalAnswered, 0)
    const totalCorrect = subjectProgress.reduce((sum, s) => sum + s.correctCount, 0)
    const overallAccuracy = totalAnswered > 0 ? totalCorrect / totalAnswered : 0

    return { weeklyStats, subjectProgress, weakTopics, totalAnswered, overallAccuracy }
  }
}

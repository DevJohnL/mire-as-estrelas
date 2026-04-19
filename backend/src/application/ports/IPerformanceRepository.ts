import { Performance, SelfAssessmentLevel } from '../../domain/entities/Performance'

export interface WeeklyStats {
  date: Date
  questionsAnswered: number
  correctCount: number
  accuracy: number
}

export interface SubjectProgress {
  subjectId: string
  subjectName: string
  totalAnswered: number
  correctCount: number
  accuracy: number
  weakTopics: string[]
}

export interface IPerformanceRepository {
  save(performance: Omit<Performance, 'id' | 'createdAt'>): Promise<Performance>
  findByUserId(userId: string, limit?: number): Promise<Performance[]>
  getWeeklyStats(userId: string, weeks?: number): Promise<WeeklyStats[]>
  getSubjectProgress(userId: string): Promise<SubjectProgress[]>
  getWeakTopics(userId: string): Promise<Array<{ topicId: string; topicName: string; accuracy: number }>>
  updateSelfAssessment(performanceId: string, level: SelfAssessmentLevel): Promise<void>
}

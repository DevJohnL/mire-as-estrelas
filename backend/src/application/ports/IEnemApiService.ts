import { Question } from '../../domain/entities/Question'

export interface EnemApiFilter {
  year?: number
  subject?: string
  page?: number
  limit?: number
}

export interface IEnemApiService {
  fetchQuestions(filter: EnemApiFilter): Promise<Question[]>
  fetchQuestionById(enemId: string): Promise<Question | null>
}

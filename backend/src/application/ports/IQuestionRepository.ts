import { Question } from '../../domain/entities/Question'

export interface QuestionFilter {
  subjectId?: string
  topicId?: string
  year?: number
  difficulty?: number
  excludeIds?: string[]
}

export interface IQuestionRepository {
  findById(id: string): Promise<Question | null>
  findMany(filter: QuestionFilter, limit: number): Promise<Question[]>
  save(question: Question): Promise<void>
  count(filter: QuestionFilter): Promise<number>
}

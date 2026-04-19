export type AlternativeKey = 'A' | 'B' | 'C' | 'D' | 'E'

export interface Alternative {
  key: AlternativeKey
  text: string
}

export interface Question {
  id: string
  enemId: string
  year: number
  subjectId: string
  topicId: string | null
  statement: string
  alternatives: Alternative[]
  correctAnswer: AlternativeKey
  difficulty: 1 | 2 | 3 | 4 | 5
}

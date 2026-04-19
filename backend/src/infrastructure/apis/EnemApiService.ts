import { IEnemApiService, EnemApiFilter } from '../../application/ports/IEnemApiService'
import { Question, Alternative, AlternativeKey } from '../../domain/entities/Question'
import { randomUUID } from 'crypto'

interface EnemApiQuestion {
  index: number
  year: number
  title: string
  context: string
  files: string[]
  correctAlternative: string
  alternativesIntroduction: string
  alternatives: Array<{ letter: string; text: string; file: string }>
  discipline: { label: string; value: string }
  language?: string
}

export class EnemApiService implements IEnemApiService {
  private readonly baseUrl = process.env.ENEM_API_BASE_URL ?? 'https://api.enem.dev/v1'

  async fetchQuestions(filter: EnemApiFilter): Promise<Question[]> {
    const params = new URLSearchParams()
    if (filter.year) params.set('year', String(filter.year))
    if (filter.page) params.set('page', String(filter.page))
    if (filter.limit) params.set('limit', String(filter.limit ?? 10))

    const url = `${this.baseUrl}/exams/${filter.year ?? '2023'}/questions?${params}`
    const res = await fetch(url)
    if (!res.ok) throw new Error(`ENEM API error: ${res.status}`)

    const data = await res.json() as EnemApiQuestion[]
    return data.map((q) => this.mapQuestion(q))
  }

  async fetchQuestionById(enemId: string): Promise<Question | null> {
    const [year, index] = enemId.split('-')
    const res = await fetch(`${this.baseUrl}/exams/${year}/questions/${index}`)
    if (res.status === 404) return null
    if (!res.ok) throw new Error(`ENEM API error: ${res.status}`)
    const q = await res.json() as EnemApiQuestion
    return this.mapQuestion(q)
  }

  private mapQuestion(q: EnemApiQuestion): Question {
    const subjectId = this.mapDiscipline(q.discipline?.value ?? '')
    const alternatives: Alternative[] = (q.alternatives ?? []).map((a) => ({
      key: a.letter as AlternativeKey,
      text: a.text,
    }))

    return {
      id: randomUUID(),
      enemId: `${q.year}-${q.index}`,
      year: q.year,
      subjectId,
      topicId: null,
      statement: [q.context, q.alternativesIntroduction, q.title].filter(Boolean).join('\n\n'),
      alternatives,
      correctAnswer: q.correctAlternative as AlternativeKey,
      difficulty: 3,
    }
  }

  private mapDiscipline(value: string): string {
    const map: Record<string, string> = {
      matematica: 'matematica',
      matematicaETecnologias: 'matematica',
      linguagens: 'portugues',
      linguagensETecnologias: 'portugues',
      cienciasHumanas: 'historia',
      cienciasHumanasETecnologias: 'historia',
      cienciasDaNatureza: 'biologia',
      cienciasDaNaturezaETecnologias: 'biologia',
    }
    return map[value] ?? 'portugues'
  }
}

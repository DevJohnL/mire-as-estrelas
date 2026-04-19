import { pool } from '../connection'
import { IQuestionRepository, QuestionFilter } from '../../../application/ports/IQuestionRepository'
import { Question, Alternative, AlternativeKey } from '../../../domain/entities/Question'

export class PgQuestionRepository implements IQuestionRepository {
  async findById(id: string): Promise<Question | null> {
    const { rows } = await pool.query('SELECT * FROM questions WHERE id = $1', [id])
    return rows[0] ? this.map(rows[0]) : null
  }

  async findMany(filter: QuestionFilter, limit: number): Promise<Question[]> {
    const conditions: string[] = []
    const params: unknown[] = []
    let i = 1

    if (filter.subjectId) { conditions.push(`subject_id = $${i++}`); params.push(filter.subjectId) }
    if (filter.topicId) { conditions.push(`topic_id = $${i++}`); params.push(filter.topicId) }
    if (filter.year) { conditions.push(`year = $${i++}`); params.push(filter.year) }
    if (filter.difficulty) { conditions.push(`difficulty = $${i++}`); params.push(filter.difficulty) }
    if (filter.excludeIds?.length) {
      conditions.push(`id NOT IN (${filter.excludeIds.map((_, j) => `$${i + j}`).join(',')})`)
      params.push(...filter.excludeIds)
      i += filter.excludeIds.length
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : ''
    params.push(limit)
    const { rows } = await pool.query(
      `SELECT * FROM questions ${where} ORDER BY RANDOM() LIMIT $${i}`,
      params,
    )
    return rows.map(this.map)
  }

  async save(question: Question): Promise<void> {
    await pool.query(
      `INSERT INTO questions (id, enem_id, year, subject_id, topic_id, statement, alternatives, correct_answer, difficulty)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
       ON CONFLICT (enem_id) DO UPDATE SET
         statement = EXCLUDED.statement,
         alternatives = EXCLUDED.alternatives,
         correct_answer = EXCLUDED.correct_answer`,
      [
        question.id, question.enemId, question.year, question.subjectId,
        question.topicId, question.statement, JSON.stringify(question.alternatives),
        question.correctAnswer, question.difficulty,
      ],
    )
  }

  async count(filter: QuestionFilter): Promise<number> {
    const conditions: string[] = []
    const params: unknown[] = []
    let i = 1
    if (filter.subjectId) { conditions.push(`subject_id = $${i++}`); params.push(filter.subjectId) }
    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : ''
    const { rows } = await pool.query(`SELECT COUNT(*) FROM questions ${where}`, params)
    return parseInt(rows[0].count, 10)
  }

  private map(row: Record<string, unknown>): Question {
    return {
      id: row.id as string,
      enemId: row.enem_id as string,
      year: row.year as number,
      subjectId: row.subject_id as string,
      topicId: row.topic_id as string | null,
      statement: row.statement as string,
      alternatives: (typeof row.alternatives === 'string'
        ? JSON.parse(row.alternatives)
        : row.alternatives) as Alternative[],
      correctAnswer: row.correct_answer as AlternativeKey,
      difficulty: row.difficulty as 1 | 2 | 3 | 4 | 5,
    }
  }
}

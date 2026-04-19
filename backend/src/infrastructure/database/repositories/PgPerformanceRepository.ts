import { pool } from '../connection'
import {
  IPerformanceRepository,
  SubjectProgress,
  WeeklyStats,
} from '../../../application/ports/IPerformanceRepository'
import { Performance, SelfAssessmentLevel, AIFeedback } from '../../../domain/entities/Performance'

export class PgPerformanceRepository implements IPerformanceRepository {
  async save(data: Omit<Performance, 'id' | 'createdAt'>): Promise<Performance> {
    const { rows } = await pool.query(
      `INSERT INTO performances
        (user_id, question_id, chosen_answer, is_correct, user_explanation, ai_feedback, self_assessment)
       VALUES ($1,$2,$3,$4,$5,$6,$7)
       RETURNING *`,
      [
        data.userId, data.questionId, data.chosenAnswer, data.isCorrect,
        data.userExplanation, JSON.stringify(data.aiFeedback), data.selfAssessment,
      ],
    )
    return this.map(rows[0])
  }

  async findByUserId(userId: string, limit = 50): Promise<Performance[]> {
    const { rows } = await pool.query(
      'SELECT * FROM performances WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2',
      [userId, limit],
    )
    return rows.map(this.map)
  }

  async getWeeklyStats(userId: string, weeks = 4): Promise<WeeklyStats[]> {
    const { rows } = await pool.query(
      `SELECT
        DATE_TRUNC('day', created_at) AS date,
        COUNT(*) AS questions_answered,
        SUM(CASE WHEN is_correct THEN 1 ELSE 0 END) AS correct_count
       FROM performances
       WHERE user_id = $1 AND created_at >= NOW() - INTERVAL '${weeks} weeks'
       GROUP BY 1 ORDER BY 1`,
      [userId],
    )
    return rows.map((r) => ({
      date: r.date as Date,
      questionsAnswered: parseInt(r.questions_answered, 10),
      correctCount: parseInt(r.correct_count, 10),
      accuracy: parseInt(r.correct_count, 10) / parseInt(r.questions_answered, 10),
    }))
  }

  async getSubjectProgress(userId: string): Promise<SubjectProgress[]> {
    const { rows } = await pool.query(
      `SELECT
        q.subject_id,
        s.name AS subject_name,
        COUNT(*) AS total_answered,
        SUM(CASE WHEN p.is_correct THEN 1 ELSE 0 END) AS correct_count
       FROM performances p
       JOIN questions q ON q.id = p.question_id
       JOIN subjects s ON s.id = q.subject_id
       WHERE p.user_id = $1
       GROUP BY q.subject_id, s.name`,
      [userId],
    )
    return rows.map((r) => ({
      subjectId: r.subject_id as string,
      subjectName: r.subject_name as string,
      totalAnswered: parseInt(r.total_answered, 10),
      correctCount: parseInt(r.correct_count, 10),
      accuracy: parseInt(r.correct_count, 10) / parseInt(r.total_answered, 10),
      weakTopics: [],
    }))
  }

  async getWeakTopics(
    userId: string,
  ): Promise<Array<{ topicId: string; topicName: string; accuracy: number }>> {
    const { rows } = await pool.query(
      `SELECT
        q.topic_id,
        t.name AS topic_name,
        COUNT(*) AS total,
        SUM(CASE WHEN p.is_correct THEN 1 ELSE 0 END) AS correct
       FROM performances p
       JOIN questions q ON q.id = p.question_id
       LEFT JOIN topics t ON t.id = q.topic_id
       WHERE p.user_id = $1 AND q.topic_id IS NOT NULL
       GROUP BY q.topic_id, t.name
       HAVING COUNT(*) >= 3
       ORDER BY (SUM(CASE WHEN p.is_correct THEN 1.0 ELSE 0 END) / COUNT(*)) ASC
       LIMIT 10`,
      [userId],
    )
    return rows.map((r) => ({
      topicId: r.topic_id as string,
      topicName: r.topic_name as string,
      accuracy: parseFloat(r.correct) / parseInt(r.total, 10),
    }))
  }

  async updateSelfAssessment(performanceId: string, level: SelfAssessmentLevel): Promise<void> {
    await pool.query('UPDATE performances SET self_assessment = $1 WHERE id = $2', [
      level,
      performanceId,
    ])
  }

  private map(row: Record<string, unknown>): Performance {
    return {
      id: row.id as string,
      userId: row.user_id as string,
      questionId: row.question_id as string,
      chosenAnswer: row.chosen_answer as string,
      isCorrect: row.is_correct as boolean,
      userExplanation: row.user_explanation as string,
      aiFeedback: (typeof row.ai_feedback === 'string'
        ? JSON.parse(row.ai_feedback)
        : row.ai_feedback) as AIFeedback,
      selfAssessment: row.self_assessment as SelfAssessmentLevel,
      createdAt: row.created_at as Date,
    }
  }
}

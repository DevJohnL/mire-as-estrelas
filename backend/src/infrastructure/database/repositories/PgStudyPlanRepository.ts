import { pool } from '../connection'
import { IStudyPlanRepository, StudyPlanInput } from '../../../application/ports/IStudyPlanRepository'
import { StudyPlan, StudyPlanItem } from '../../../domain/entities/StudyPlan'

export class PgStudyPlanRepository implements IStudyPlanRepository {
  async save(plan: StudyPlanInput): Promise<StudyPlan> {
    const client = await pool.connect()
    try {
      await client.query('BEGIN')

      const { rows } = await client.query(
        `INSERT INTO study_plans (user_id, week_start, config, status)
         VALUES ($1,$2,$3,$4) RETURNING *`,
        [plan.userId, plan.weekStart, JSON.stringify(plan.config), plan.status],
      )
      const savedPlan = rows[0]

      const items: StudyPlanItem[] = []
      for (const item of plan.items) {
        const { rows: itemRows } = await client.query(
          `INSERT INTO study_plan_items (plan_id, subject_id, daily_questions, day_of_week)
           VALUES ($1,$2,$3,$4) RETURNING *`,
          [savedPlan.id, item.subjectId, item.dailyQuestions, item.dayOfWeek],
        )
        items.push(this.mapItem(itemRows[0]))
      }

      await client.query('COMMIT')
      return { ...this.mapPlan(savedPlan), items }
    } catch (e) {
      await client.query('ROLLBACK')
      throw e
    } finally {
      client.release()
    }
  }

  async findActiveByUserId(userId: string): Promise<StudyPlan | null> {
    const { rows } = await pool.query(
      `SELECT sp.*, json_agg(spi.*) AS items
       FROM study_plans sp
       LEFT JOIN study_plan_items spi ON spi.plan_id = sp.id
       WHERE sp.user_id = $1 AND sp.status = 'active'
       GROUP BY sp.id LIMIT 1`,
      [userId],
    )
    if (!rows[0]) return null
    const items = rows[0].items?.[0] ? rows[0].items.map(this.mapItem) : []
    return { ...this.mapPlan(rows[0]), items }
  }

  async findByUserId(userId: string): Promise<StudyPlan[]> {
    const { rows } = await pool.query(
      `SELECT sp.*, json_agg(spi.*) AS items
       FROM study_plans sp
       LEFT JOIN study_plan_items spi ON spi.plan_id = sp.id
       WHERE sp.user_id = $1
       GROUP BY sp.id ORDER BY sp.created_at DESC`,
      [userId],
    )
    return rows.map((r) => ({
      ...this.mapPlan(r),
      items: r.items?.[0] ? r.items.map(this.mapItem) : [],
    }))
  }

  async complete(planId: string): Promise<void> {
    await pool.query(`UPDATE study_plans SET status = 'completed' WHERE id = $1`, [planId])
  }

  private mapPlan(row: Record<string, unknown>): Omit<StudyPlan, 'items'> {
    return {
      id: row.id as string,
      userId: row.user_id as string,
      weekStart: row.week_start as Date,
      config: typeof row.config === 'string' ? JSON.parse(row.config) : row.config,
      status: row.status as StudyPlan['status'],
    }
  }

  private mapItem(row: Record<string, unknown>): StudyPlanItem {
    return {
      id: row.id as string,
      planId: row.plan_id as string,
      subjectId: row.subject_id as string,
      dailyQuestions: row.daily_questions as number,
      dayOfWeek: row.day_of_week as StudyPlanItem['dayOfWeek'],
    }
  }
}

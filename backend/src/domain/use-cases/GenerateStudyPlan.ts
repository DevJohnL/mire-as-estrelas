import { IPerformanceRepository } from '../../application/ports/IPerformanceRepository'
import { IStudyPlanRepository, StudyPlanInput } from '../../application/ports/IStudyPlanRepository'
import { StudyPlan, StudyPlanConfig, StudyPlanItem } from '../entities/StudyPlan'

// ENEM weights: reflect actual question distribution and learning difficulty
// Higher = more ROI for score improvement
const SUBJECT_WEIGHTS: Record<string, number> = {
  redacao: 0.22,        // 1000pts standalone — highest ROI
  matematica: 0.20,     // 45 questions, hardest to improve
  fisica: 0.10,
  quimica: 0.10,
  biologia: 0.08,
  historia: 0.07,
  geografia: 0.07,
  portugues: 0.07,
  literatura: 0.03,
  filosofia: 0.03,
  sociologia: 0.03,
}

export interface GenerateStudyPlanInput {
  userId: string
  config: StudyPlanConfig
  subjectIds: string[] // all available subject ids
}

export class GenerateStudyPlan {
  constructor(
    private readonly studyPlanRepo: IStudyPlanRepository,
    private readonly performanceRepo: IPerformanceRepository,
  ) {}

  async execute(input: GenerateStudyPlanInput): Promise<StudyPlan> {
    const [weakTopics, existingPlan] = await Promise.all([
      this.performanceRepo.getWeakTopics(input.userId),
      this.studyPlanRepo.findActiveByUserId(input.userId),
    ])

    if (existingPlan && existingPlan.status === 'active') {
      await this.studyPlanRepo.complete(existingPlan.id)
    }

    const questionsPerDay = this.calculateDailyQuestions(input.config.dailyMinutes)
    const studyDays = this.getStudyDays(input.config.studyDaysPerWeek)
    const items = this.distributeSubjects(input.subjectIds, studyDays, questionsPerDay, weakTopics)

    const weekStart = this.getWeekStart()

    return this.studyPlanRepo.save({
      userId: input.userId,
      weekStart,
      config: input.config,
      status: 'active',
      items,
    })
  }

  private calculateDailyQuestions(dailyMinutes: number): number {
    // ~3-4 minutes per question with explanation + AI feedback
    return Math.max(3, Math.floor(dailyMinutes / 4))
  }

  private getStudyDays(daysPerWeek: number): number[] {
    // Distribute across week, skip Sunday (0) preferentially
    const allDays = [1, 2, 3, 4, 5, 6, 0]
    return allDays.slice(0, daysPerWeek)
  }

  private distributeSubjects(
    subjectIds: string[],
    studyDays: number[],
    questionsPerDay: number,
    weakTopics: Array<{ topicId: string; topicName: string; accuracy: number }>,
  ): Omit<StudyPlanItem, 'id' | 'planId'>[] {
    const weakSubjectIds = new Set(
      weakTopics
        .filter((t) => t.accuracy < 0.5)
        .map((t) => t.topicId.split('-')[0]),
    )

    const items: Omit<StudyPlanItem, 'id' | 'planId'>[] = []

    for (const day of studyDays) {
      // Sort subjects by weight + boost weak ones
      const sorted = subjectIds.slice().sort((a, b) => {
        const weightA = (SUBJECT_WEIGHTS[a] ?? 0.05) * (weakSubjectIds.has(a) ? 1.5 : 1)
        const weightB = (SUBJECT_WEIGHTS[b] ?? 0.05) * (weakSubjectIds.has(b) ? 1.5 : 1)
        return weightB - weightA
      })

      // Rotate subjects across days for interdisciplinary variety
      const dayIndex = studyDays.indexOf(day)
      const rotated = [...sorted.slice(dayIndex % sorted.length), ...sorted.slice(0, dayIndex % sorted.length)]
      const subjectsForDay = rotated.slice(0, Math.min(3, sorted.length))
      const questionsEach = Math.ceil(questionsPerDay / subjectsForDay.length)

      for (const subjectId of subjectsForDay) {
        items.push({
          subjectId,
          dailyQuestions: questionsEach,
          dayOfWeek: day as StudyPlanItem['dayOfWeek'],
        })
      }
    }

    return items
  }

  private getWeekStart(): Date {
    const now = new Date()
    const day = now.getDay()
    const diff = now.getDate() - day + (day === 0 ? -6 : 1) // Monday
    return new Date(now.setDate(diff))
  }
}

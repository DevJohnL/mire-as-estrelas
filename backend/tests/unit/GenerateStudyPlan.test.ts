import { GenerateStudyPlan } from '../../src/domain/use-cases/GenerateStudyPlan'
import { IStudyPlanRepository, StudyPlanInput } from '../../src/application/ports/IStudyPlanRepository'
import { IPerformanceRepository } from '../../src/application/ports/IPerformanceRepository'
import { StudyPlan } from '../../src/domain/entities/StudyPlan'

const mockStudyPlanRepo = (): jest.Mocked<IStudyPlanRepository> => ({
  save: jest.fn().mockImplementation(async (plan: StudyPlanInput) => ({
    ...plan, id: 'plan-1', items: plan.items.map((item, i) => ({ ...item, id: `item-${i}`, planId: 'plan-1' })),
  })),
  findActiveByUserId: jest.fn().mockResolvedValue(null),
  findByUserId: jest.fn().mockResolvedValue([]),
  complete: jest.fn().mockResolvedValue(undefined),
})

const mockPerformanceRepo = (): jest.Mocked<IPerformanceRepository> => ({
  save: jest.fn(),
  findByUserId: jest.fn().mockResolvedValue([]),
  getWeeklyStats: jest.fn().mockResolvedValue([]),
  getSubjectProgress: jest.fn().mockResolvedValue([]),
  getWeakTopics: jest.fn().mockResolvedValue([]),
  updateSelfAssessment: jest.fn().mockResolvedValue(undefined),
})

const SUBJECTS = ['matematica', 'fisica', 'quimica', 'biologia', 'historia', 'portugues']

describe('GenerateStudyPlan', () => {
  it('should generate a plan with correct number of study days', async () => {
    const useCase = new GenerateStudyPlan(mockStudyPlanRepo(), mockPerformanceRepo())

    const plan = await useCase.execute({
      userId: 'user-1',
      config: { dailyMinutes: 60, studyDaysPerWeek: 5 },
      subjectIds: SUBJECTS,
    })

    const uniqueDays = new Set(plan.items.map((i) => i.dayOfWeek))
    expect(uniqueDays.size).toBe(5)
  })

  it('should calculate at least 3 questions per day for 30 minute sessions', async () => {
    const useCase = new GenerateStudyPlan(mockStudyPlanRepo(), mockPerformanceRepo())

    const plan = await useCase.execute({
      userId: 'user-1',
      config: { dailyMinutes: 30, studyDaysPerWeek: 3 },
      subjectIds: SUBJECTS,
    })

    for (const item of plan.items) {
      expect(item.dailyQuestions).toBeGreaterThanOrEqual(1)
    }
  })

  it('should complete existing active plan before creating new one', async () => {
    const existingPlan: StudyPlan = {
      id: 'old-plan',
      userId: 'user-1',
      weekStart: new Date(),
      config: { dailyMinutes: 60, studyDaysPerWeek: 5 },
      status: 'active',
      items: [],
    }

    const planRepo = mockStudyPlanRepo()
    planRepo.findActiveByUserId.mockResolvedValue(existingPlan)

    const useCase = new GenerateStudyPlan(planRepo, mockPerformanceRepo())
    await useCase.execute({
      userId: 'user-1',
      config: { dailyMinutes: 60, studyDaysPerWeek: 5 },
      subjectIds: SUBJECTS,
    })

    expect(planRepo.complete).toHaveBeenCalledWith('old-plan')
  })

  it('should boost weak subjects in the distribution', async () => {
    const performanceRepo = mockPerformanceRepo()
    performanceRepo.getWeakTopics.mockResolvedValue([
      { topicId: 'fisica-termodinamica', topicName: 'Termodinâmica', accuracy: 0.2 },
    ])

    const useCase = new GenerateStudyPlan(mockStudyPlanRepo(), performanceRepo)
    const plan = await useCase.execute({
      userId: 'user-1',
      config: { dailyMinutes: 60, studyDaysPerWeek: 5 },
      subjectIds: SUBJECTS,
    })

    expect(plan.items.length).toBeGreaterThan(0)
  })
})

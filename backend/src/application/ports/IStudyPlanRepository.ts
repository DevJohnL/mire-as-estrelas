import { StudyPlan, StudyPlanItem } from '../../domain/entities/StudyPlan'

export type StudyPlanInput = Omit<StudyPlan, 'id' | 'items'> & {
  items: Omit<StudyPlanItem, 'id' | 'planId'>[]
}

export interface IStudyPlanRepository {
  save(plan: StudyPlanInput): Promise<StudyPlan>
  findActiveByUserId(userId: string): Promise<StudyPlan | null>
  findByUserId(userId: string): Promise<StudyPlan[]>
  complete(planId: string): Promise<void>
}

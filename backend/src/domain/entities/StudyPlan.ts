export interface StudyPlanConfig {
  dailyMinutes: number
  studyDaysPerWeek: number
}

export interface StudyPlanItem {
  id: string
  planId: string
  subjectId: string
  dailyQuestions: number
  dayOfWeek: 0 | 1 | 2 | 3 | 4 | 5 | 6
}

export interface StudyPlan {
  id: string
  userId: string
  weekStart: Date
  config: StudyPlanConfig
  status: 'active' | 'completed' | 'draft'
  items: StudyPlanItem[]
}

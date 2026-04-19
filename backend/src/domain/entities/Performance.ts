export type SelfAssessmentLevel = 1 | 2 | 3 // 1=aprendi, 2=mais ou menos, 3=não aprendi

export interface AIFeedback {
  isCorrect: boolean
  explanationQuality: 'solid' | 'partial' | 'guessed'
  aiExplanation: string
  prerequisitePath: PrerequisitePath | null
  youtubeVideos: YouTubeVideo[]
}

export interface PrerequisitePath {
  topic: string
  prerequisites: string[]
  base: string
  khanAcademyUrl: string | null
}

export interface YouTubeVideo {
  videoId: string
  title: string
  channelTitle: string
  thumbnailUrl: string
}

export interface Performance {
  id: string
  userId: string
  questionId: string
  chosenAnswer: string
  isCorrect: boolean
  userExplanation: string
  aiFeedback: AIFeedback
  selfAssessment: SelfAssessmentLevel
  createdAt: Date
}

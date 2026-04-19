import { AIFeedback } from '../../domain/entities/Performance'
import { EssayEvaluation } from '../../domain/entities/Essay'
import { Question } from '../../domain/entities/Question'

export interface QEPBEvaluationInput {
  question: Question
  chosenAnswer: string
  userExplanation: string
  topicName: string
  subjectName: string
}

export interface EssayEvaluationInput {
  essayText: string
  userContext: string
  targetCompetency: number | null
}

export interface IAIService {
  evaluateQEPB(input: QEPBEvaluationInput): Promise<AIFeedback>
  evaluateEssay(input: EssayEvaluationInput): Promise<EssayEvaluation>
  suggestEssayTopics(): Promise<Array<{ theme: string; relevance: string }>>
}

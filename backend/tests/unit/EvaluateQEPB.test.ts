import { EvaluateQEPB } from '../../src/domain/use-cases/EvaluateQEPB'
import { IQuestionRepository } from '../../src/application/ports/IQuestionRepository'
import { IPerformanceRepository } from '../../src/application/ports/IPerformanceRepository'
import { IAIService } from '../../src/application/ports/IAIService'
import { IYouTubeService } from '../../src/application/ports/IYouTubeService'
import { Question } from '../../src/domain/entities/Question'
import { AIFeedback, Performance } from '../../src/domain/entities/Performance'

const makeQuestion = (overrides: Partial<Question> = {}): Question => ({
  id: 'q1',
  enemId: 'enem-001',
  year: 2023,
  subjectId: 'matematica',
  topicId: 'geometria-plana',
  statement: 'Qual é a área de um triângulo com base 6 e altura 4?',
  alternatives: [
    { key: 'A', text: '10' },
    { key: 'B', text: '12' },
    { key: 'C', text: '24' },
    { key: 'D', text: '8' },
    { key: 'E', text: '6' },
  ],
  correctAnswer: 'B',
  difficulty: 2,
  ...overrides,
})

const makeAiFeedback = (overrides: Partial<AIFeedback> = {}): AIFeedback => ({
  isCorrect: true,
  explanationQuality: 'solid',
  aiExplanation: 'Área = (base × altura) / 2 = (6 × 4) / 2 = 12',
  prerequisitePath: null,
  youtubeVideos: [],
  ...overrides,
})

const makePerformance = (): Performance => ({
  id: 'perf-1',
  userId: 'user-1',
  questionId: 'q1',
  chosenAnswer: 'B',
  isCorrect: true,
  userExplanation: 'Calculei base vezes altura dividido por 2',
  aiFeedback: makeAiFeedback(),
  selfAssessment: 2,
  createdAt: new Date(),
})

const mockQuestionRepo = (): jest.Mocked<IQuestionRepository> => ({
  findById: jest.fn().mockResolvedValue(makeQuestion()),
  findMany: jest.fn().mockResolvedValue([]),
  save: jest.fn().mockResolvedValue(undefined),
  count: jest.fn().mockResolvedValue(0),
})

const mockPerformanceRepo = (): jest.Mocked<IPerformanceRepository> => ({
  save: jest.fn().mockResolvedValue(makePerformance()),
  findByUserId: jest.fn().mockResolvedValue([]),
  getWeeklyStats: jest.fn().mockResolvedValue([]),
  getSubjectProgress: jest.fn().mockResolvedValue([]),
  getWeakTopics: jest.fn().mockResolvedValue([]),
  updateSelfAssessment: jest.fn().mockResolvedValue(undefined),
})

const mockAiService = (): jest.Mocked<IAIService> => ({
  evaluateQEPB: jest.fn().mockResolvedValue(makeAiFeedback()),
  evaluateEssay: jest.fn(),
  suggestEssayTopics: jest.fn(),
})

const mockYouTubeService = (): jest.Mocked<IYouTubeService> => ({
  searchVideos: jest.fn().mockResolvedValue([]),
})

describe('EvaluateQEPB', () => {
  it('should evaluate a correct answer with solid explanation', async () => {
    const useCase = new EvaluateQEPB(
      mockQuestionRepo(),
      mockPerformanceRepo(),
      mockAiService(),
      mockYouTubeService(),
    )

    const result = await useCase.execute({
      userId: 'user-1',
      questionId: 'q1',
      chosenAnswer: 'B',
      userExplanation: 'Calculei base vezes altura dividido por 2',
    })

    expect(result.aiFeedback.isCorrect).toBe(true)
    expect(result.aiFeedback.explanationQuality).toBe('solid')
    expect(result.performance).toBeDefined()
  })

  it('should search YouTube videos when a prerequisite path is identified', async () => {
    const aiFeedbackWithPath: AIFeedback = makeAiFeedback({
      isCorrect: false,
      explanationQuality: 'guessed',
      prerequisitePath: {
        topic: 'Geometria Plana',
        prerequisites: ['Geometria Básica'],
        base: 'Frações e Operações',
        khanAcademyUrl: null,
      },
    })

    const aiService = mockAiService()
    aiService.evaluateQEPB.mockResolvedValue(aiFeedbackWithPath)

    const youtubeService = mockYouTubeService()
    youtubeService.searchVideos.mockResolvedValue([
      {
        videoId: 'abc123',
        title: 'Aula ENEM Frações',
        channelTitle: 'Canal Teste',
        thumbnailUrl: 'https://img.youtube.com/abc123',
      },
    ])

    const useCase = new EvaluateQEPB(
      mockQuestionRepo(),
      mockPerformanceRepo(),
      aiService,
      youtubeService,
    )

    const result = await useCase.execute({
      userId: 'user-1',
      questionId: 'q1',
      chosenAnswer: 'A',
      userExplanation: 'Chutei',
    })

    expect(youtubeService.searchVideos).toHaveBeenCalledWith('aula ENEM Frações e Operações', 3)
    expect(result.aiFeedback.youtubeVideos).toHaveLength(1)
  })

  it('should throw when question is not found', async () => {
    const questionRepo = mockQuestionRepo()
    questionRepo.findById.mockResolvedValue(null)

    const useCase = new EvaluateQEPB(
      questionRepo,
      mockPerformanceRepo(),
      mockAiService(),
      mockYouTubeService(),
    )

    await expect(
      useCase.execute({ userId: 'u1', questionId: 'missing', chosenAnswer: 'A', userExplanation: 'x' }),
    ).rejects.toThrow('Question missing not found')
  })
})

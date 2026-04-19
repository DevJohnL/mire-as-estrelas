import { EvaluateEssay } from '../../src/domain/use-cases/EvaluateEssay'
import { IAIService } from '../../src/application/ports/IAIService'
import { EssayEvaluation } from '../../src/domain/entities/Essay'

const makeEvaluation = (): EssayEvaluation => ({
  totalScore: 720,
  competency1: { score: 160, feedback: 'Boa gramática', suggestions: [] },
  competency2: { score: 160, feedback: 'Tema desenvolvido', suggestions: [] },
  competency3: { score: 120, feedback: 'Estrutura razoável', suggestions: ['Melhore a conclusão'] },
  competency4: { score: 160, feedback: 'Boa coesão', suggestions: [] },
  competency5: { score: 120, feedback: 'Intervenção incompleta', suggestions: ['Adicione o agente'] },
  overallFeedback: 'Boa redação, foco na competência 5',
})

const mockAiService = (): jest.Mocked<IAIService> => ({
  evaluateQEPB: jest.fn(),
  evaluateEssay: jest.fn().mockResolvedValue(makeEvaluation()),
  suggestEssayTopics: jest.fn(),
})

describe('EvaluateEssay', () => {
  it('should return evaluation with 5 competency scores', async () => {
    const useCase = new EvaluateEssay(mockAiService())

    const result = await useCase.execute({
      userId: 'user-1',
      essayText: 'A violência no Brasil é um problema social complexo que afeta toda a sociedade...'.repeat(10),
      userContext: 'Treinei a competência 5 com foco na proposta de intervenção',
      targetCompetency: 5,
    })

    expect(result.totalScore).toBe(720)
    expect(result.competency1).toBeDefined()
    expect(result.competency5).toBeDefined()
  })

  it('should throw for essays shorter than 50 characters', async () => {
    const useCase = new EvaluateEssay(mockAiService())

    await expect(
      useCase.execute({
        userId: 'user-1',
        essayText: 'curto',
        userContext: 'teste',
        targetCompetency: null,
      }),
    ).rejects.toThrow('Essay text is too short to evaluate')
  })
})

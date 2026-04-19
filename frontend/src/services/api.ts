const BASE = '/api'

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    ...options,
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }))
    throw new Error(err.error ?? 'Request failed')
  }
  return res.json() as Promise<T>
}

export const api = {
  questions: {
    list: (subjectId?: string, limit = 10) =>
      request(`/questions?${subjectId ? `subjectId=${subjectId}&` : ''}limit=${limit}`),
    get: (id: string) => request(`/questions/${id}`),
    evaluate: (body: { userId: string; questionId: string; chosenAnswer: string; userExplanation: string }) =>
      request('/questions/evaluate', { method: 'POST', body: JSON.stringify(body) }),
    updateSelfAssessment: (performanceId: string, selfAssessment: 1 | 2 | 3) =>
      request(`/questions/performances/${performanceId}/self-assessment`, {
        method: 'PATCH', body: JSON.stringify({ selfAssessment }),
      }),
  },
  studyPlan: {
    generate: (body: { userId: string; config: { dailyMinutes: number; studyDaysPerWeek: number }; subjectIds: string[] }) =>
      request('/study-plans', { method: 'POST', body: JSON.stringify(body) }),
    getActive: (userId: string) => request(`/study-plans/active/${userId}`),
  },
  essays: {
    evaluate: (body: { userId: string; essayText: string; userContext: string; targetCompetency: number | null }) =>
      request('/essays/evaluate', { method: 'POST', body: JSON.stringify(body) }),
    suggestTopics: () => request('/essays/topics'),
  },
  progress: {
    get: (userId: string) => request(`/progress/${userId}`),
  },
}

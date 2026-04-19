export interface Subtopic {
  id: string
  topicId: string
  name: string
  khanAcademyUrl: string | null
}

export interface Topic {
  id: string
  contentId: string
  name: string
  prerequisites: string[] // topic ids
  subtopics?: Subtopic[]
}

export interface Content {
  id: string
  subjectId: string
  name: string
}

export interface Subject {
  id: string
  name: string
  enemArea: string
  questionCountWeight: number // relative weight in ENEM (0-1)
}

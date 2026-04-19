CREATE TABLE IF NOT EXISTS questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  enem_id VARCHAR(100) UNIQUE NOT NULL,
  year SMALLINT NOT NULL,
  subject_id VARCHAR(50) NOT NULL REFERENCES subjects(id),
  topic_id UUID REFERENCES topics(id),
  statement TEXT NOT NULL,
  alternatives JSONB NOT NULL,
  correct_answer CHAR(1) NOT NULL,
  difficulty SMALLINT NOT NULL DEFAULT 3 CHECK (difficulty BETWEEN 1 AND 5),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_questions_subject ON questions(subject_id);
CREATE INDEX IF NOT EXISTS idx_questions_topic ON questions(topic_id);
CREATE INDEX IF NOT EXISTS idx_questions_year ON questions(year);
CREATE INDEX IF NOT EXISTS idx_questions_difficulty ON questions(difficulty);

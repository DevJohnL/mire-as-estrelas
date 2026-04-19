CREATE TABLE IF NOT EXISTS performances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES questions(id),
  chosen_answer CHAR(1) NOT NULL,
  is_correct BOOLEAN NOT NULL,
  user_explanation TEXT NOT NULL,
  ai_feedback JSONB NOT NULL,
  self_assessment SMALLINT NOT NULL DEFAULT 2 CHECK (self_assessment BETWEEN 1 AND 3),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS essays (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  user_context TEXT NOT NULL DEFAULT '',
  target_competency SMALLINT CHECK (target_competency BETWEEN 1 AND 5),
  evaluation JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_performances_user ON performances(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_performances_question ON performances(question_id);
CREATE INDEX IF NOT EXISTS idx_essays_user ON essays(user_id, created_at DESC);

CREATE TABLE IF NOT EXISTS contents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_id VARCHAR(50) NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  name VARCHAR(200) NOT NULL
);

CREATE TABLE IF NOT EXISTS topics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id UUID NOT NULL REFERENCES contents(id) ON DELETE CASCADE,
  name VARCHAR(200) NOT NULL,
  prerequisites JSONB NOT NULL DEFAULT '[]'
);

CREATE TABLE IF NOT EXISTS subtopics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  topic_id UUID NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
  name VARCHAR(200) NOT NULL,
  khan_academy_url VARCHAR(500)
);

CREATE INDEX IF NOT EXISTS idx_contents_subject ON contents(subject_id);
CREATE INDEX IF NOT EXISTS idx_topics_content ON topics(content_id);
CREATE INDEX IF NOT EXISTS idx_subtopics_topic ON subtopics(topic_id);

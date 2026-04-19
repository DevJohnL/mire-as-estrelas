CREATE TABLE IF NOT EXISTS subjects (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  enem_area VARCHAR(100) NOT NULL,
  question_count_weight DECIMAL(4,3) NOT NULL DEFAULT 0.1
);

INSERT INTO subjects (id, name, enem_area, question_count_weight) VALUES
  ('matematica',  'Matemática',        'Matemática e suas Tecnologias',          0.20),
  ('fisica',      'Física',            'Ciências da Natureza e suas Tecnologias', 0.10),
  ('quimica',     'Química',           'Ciências da Natureza e suas Tecnologias', 0.10),
  ('biologia',    'Biologia',          'Ciências da Natureza e suas Tecnologias', 0.08),
  ('historia',    'História',          'Ciências Humanas e suas Tecnologias',    0.07),
  ('geografia',   'Geografia',         'Ciências Humanas e suas Tecnologias',    0.07),
  ('filosofia',   'Filosofia',         'Ciências Humanas e suas Tecnologias',    0.03),
  ('sociologia',  'Sociologia',        'Ciências Humanas e suas Tecnologias',    0.03),
  ('portugues',   'Português',         'Linguagens, Códigos e suas Tecnologias', 0.07),
  ('literatura',  'Literatura',        'Linguagens, Códigos e suas Tecnologias', 0.03),
  ('redacao',     'Redação',           'Redação',                                0.22)
ON CONFLICT (id) DO NOTHING;

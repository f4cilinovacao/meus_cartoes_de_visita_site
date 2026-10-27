-- Tabela de perfil público / cartão virtual
CREATE TABLE IF NOT EXISTS perfis_publicos (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  nome TEXT,
  cargo TEXT,
  empresa TEXT,
  email TEXT,
  telefone TEXT,
  site TEXT,
  instagram TEXT,
  whatsapp TEXT,
  bio TEXT,
  foto_url TEXT,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_perfis_username ON perfis_publicos(lower(username));

ALTER TABLE perfis_publicos ENABLE ROW LEVEL SECURITY;

-- Qualquer um pode ler perfis ativos (página pública)
CREATE POLICY "perfil_publico_select" ON perfis_publicos
  FOR SELECT USING (ativo = true);

-- Só o próprio usuário pode inserir/atualizar
CREATE POLICY "perfil_proprio_insert" ON perfis_publicos
  FOR INSERT WITH CHECK (id = auth.uid());

CREATE POLICY "perfil_proprio_update" ON perfis_publicos
  FOR UPDATE USING (id = auth.uid());

CREATE POLICY "perfil_proprio_delete" ON perfis_publicos
  FOR DELETE USING (id = auth.uid());

-- Tabela de compartilhamentos
CREATE TABLE IF NOT EXISTS cartoes_compartilhados (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cartao_id UUID NOT NULL REFERENCES cartoes(id) ON DELETE CASCADE,
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  shared_with_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  shared_with_email TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_comp_cartao ON cartoes_compartilhados(cartao_id);
CREATE INDEX IF NOT EXISTS idx_comp_shared_with ON cartoes_compartilhados(shared_with_id);
CREATE INDEX IF NOT EXISTS idx_comp_email ON cartoes_compartilhados(shared_with_email);

ALTER TABLE cartoes_compartilhados ENABLE ROW LEVEL SECURITY;

CREATE POLICY "owner_select" ON cartoes_compartilhados
  FOR SELECT USING (owner_id = auth.uid());

CREATE POLICY "recipient_select" ON cartoes_compartilhados
  FOR SELECT USING (
    shared_with_id = auth.uid()
    OR shared_with_email = (SELECT email FROM auth.users WHERE id = auth.uid())
  );

CREATE POLICY "owner_insert" ON cartoes_compartilhados
  FOR INSERT WITH CHECK (owner_id = auth.uid());

CREATE POLICY "owner_delete" ON cartoes_compartilhados
  FOR DELETE USING (owner_id = auth.uid());

-- View para listar cartões recebidos com dados do dono
CREATE OR REPLACE VIEW cartoes_recebidos AS
  SELECT
    c.*,
    cs.id AS compartilhamento_id,
    cs.owner_id,
    u.email AS owner_email,
    u.raw_user_meta_data->>'full_name' AS owner_nome
  FROM cartoes_compartilhados cs
  JOIN cartoes c ON c.id = cs.cartao_id
  LEFT JOIN auth.users u ON u.id = cs.owner_id
  WHERE
    cs.shared_with_id = auth.uid()
    OR cs.shared_with_email = (SELECT email FROM auth.users WHERE id = auth.uid());

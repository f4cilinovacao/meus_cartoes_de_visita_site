-- Corrige políticas RLS que acessavam auth.users diretamente
-- Usa auth.email() que é permitido para roles autenticados

DROP POLICY IF EXISTS "recipient_select" ON cartoes_compartilhados;

CREATE POLICY "recipient_select" ON cartoes_compartilhados
  FOR SELECT USING (
    shared_with_id = auth.uid()
    OR shared_with_email = auth.email()
  );

-- Recria a view com a mesma correção
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
    OR cs.shared_with_email = auth.email();

-- Tabela dedicada para mensagens do chat entre usuários
CREATE TABLE IF NOT EXISTS public.chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  recipient_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  sender_name text NOT NULL DEFAULT '',
  message text NOT NULL,
  read_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Índices para busca rápida de conversas
CREATE INDEX IF NOT EXISTS idx_chat_sender    ON public.chat_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_chat_recipient ON public.chat_messages(recipient_id);
CREATE INDEX IF NOT EXISTS idx_chat_conv      ON public.chat_messages(sender_id, recipient_id, created_at);

-- RLS
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.chat_messages TO authenticated;
GRANT ALL ON public.chat_messages TO service_role;

-- Usuário pode VER mensagens que enviou OU recebeu
DROP POLICY IF EXISTS "Users see own chat messages" ON public.chat_messages;
CREATE POLICY "Users see own chat messages"
ON public.chat_messages FOR SELECT TO authenticated
USING (sender_id = auth.uid() OR recipient_id = auth.uid());

-- Usuário pode INSERIR apenas como remetente
DROP POLICY IF EXISTS "Users insert own chat messages" ON public.chat_messages;
CREATE POLICY "Users insert own chat messages"
ON public.chat_messages FOR INSERT TO authenticated
WITH CHECK (sender_id = auth.uid());

-- Usuário pode marcar como lida apenas o que recebeu
DROP POLICY IF EXISTS "Users update received chat messages" ON public.chat_messages;
CREATE POLICY "Users update received chat messages"
ON public.chat_messages FOR UPDATE TO authenticated
USING (recipient_id = auth.uid());

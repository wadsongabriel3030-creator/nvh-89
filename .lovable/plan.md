
## Objetivo

Conectar este projeto diretamente ao seu projeto **Supabase** existente (sem usar Lovable Cloud) e deixar pronto banco de dados, autenticação e storage para que o app comece a persistir dados reais (membros, eventos, PLC, dízimos, etc.).

---

## Etapa 1 — Conectar o Supabase ao projeto Lovable

Esta etapa é feita por você na interface do Lovable (não posso ativá-la por código):

1. No topo direito do editor Lovable, clique em **Supabase** → **Connect Supabase**.
2. Faça login na sua conta Supabase e autorize o Lovable.
3. Selecione a **organização** e o **projeto Supabase** existente que você quer usar.
4. Confirme a conexão.

A partir daí o Lovable terá acesso ao seu projeto Supabase (tabelas, RLS, secrets, edge functions) e eu poderei criar migrations, policies e edge functions diretamente.

> Importante: ao conectar um Supabase externo, o Lovable Cloud **não** é usado — exatamente como você pediu.

---

## Etapa 2 — Estrutura inicial do banco

Hoje o app roda 100% com mock data em `src/lib/mock-data.ts` e contexts (`MembersContext`, `TagsContext`, `TestimoniesContext`, etc.). Vou propor um schema inicial cobrindo o que já existe na UI:

- `profiles` — dados do usuário logado (nome, foto, role)
- `user_roles` + enum `app_role` (`admin`, `pastor`, `leader`, `server`, `member`) — em tabela separada por segurança
- `members` — membros e visitantes
- `tags` + `member_tags` — etiquetas e relacionamento N:N
- `plc_groups` + `plc_members` — grupos PLC
- `events` + `event_registrations` — eventos e inscrições
- `tithes` — dízimos/ofertas
- `testimonies` — testemunhos
- `baptisms`, `discipleship_courses`, `prayer_guides` — fluxos já presentes na UI

Cada tabela virá com:
- **RLS habilitado**
- **GRANTs explícitos** para `authenticated` e `service_role` (e `anon` somente onde fizer sentido leitura pública)
- **Policies** baseadas em `auth.uid()` e na função `has_role(user_id, role)`

> Podemos começar só pelas tabelas mais usadas (members, tags, plc_groups) e expandir depois — me diga se prefere assim.

---

## Etapa 3 — Autenticação

Substituir a `Login.tsx` mockada por autenticação real do Supabase:

- **Email + senha** (padrão)
- **Google** (opcional, se você quiser — precisa configurar OAuth no dashboard Supabase)
- Página `/reset-password` para recuperação de senha
- Listener `onAuthStateChange` para manter sessão
- Proteção de rotas privadas
- Trigger no Supabase que cria automaticamente um registro em `profiles` ao cadastrar um novo usuário

---

## Etapa 4 — Storage

Criar buckets para os uploads que o app já faz:

- `member-photos` (público) — fotos de perfil dos membros
- `prayer-guides` (privado) — PDFs do guia de oração
- `plc-documents` (privado) — PDFs PLC
- `cuarto-guerra` (privado) — PDFs do quarto de guerra
- `reunion-dominical` (público) — recursos do culto

Com policies de RLS apropriadas em `storage.objects`.

---

## Etapa 5 — Migrar contexts para usar Supabase

Refatorar gradualmente:

- `MembersContext` → ler/gravar via `supabase.from('members')`
- `TagsContext` → idem com `tags`
- `TestimoniesContext` → idem
- `ProfileContext` → ler do usuário autenticado
- Criar hooks reutilizáveis (`useMembers`, `useTags`, etc.) com **React Query** (já instalado)

Os componentes UI ficam praticamente intactos — só muda a fonte de dados.

---

## Detalhes técnicos

```text
Fluxo de conexão:
┌──────────────┐   OAuth   ┌──────────────┐
│   Lovable    │ ────────► │   Supabase   │
│   (editor)   │           │  (seu proj.) │
└──────┬───────┘           └──────┬───────┘
       │                          │
       │ injeta env vars          │
       ▼                          │
┌──────────────┐   API REST/Auth  │
│  React App   │ ◄────────────────┘
│ (este repo)  │
└──────────────┘
```

Variáveis criadas automaticamente após conectar:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY` (anon key — ok ir pro client)
- `VITE_SUPABASE_PROJECT_ID`

Arquivo gerado: `src/integrations/supabase/client.ts` (cliente tipado).

---

## O que preciso de você antes de começar

1. **Conectar o Supabase pela UI do Lovable** (Etapa 1) — sem isso eu não consigo criar migrations.
2. Decidir o **escopo da primeira leva**: começar com tudo (Etapas 2–5 completas) ou ir por partes (ex.: só auth + members primeiro)?
3. Confirmar se quer **Login com Google** além de email/senha.

Quando você conectar o Supabase e responder essas 3 perguntas, eu começo a implementação.

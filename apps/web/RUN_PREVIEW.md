# Rodar NOMMAD localmente — preview sem backend

O app está em **PREVIEW MODE**: login bypassed, APIs mockadas, nenhuma chave externa necessária.

## Como rodar

```bash
cd "apps/web"
npm run dev
```

Abrir: http://localhost:3000

- `/` redireciona pra `/onboarding`
- Middleware detecta `NEXT_PUBLIC_SUPABASE_URL=https://placeholder.supabase.co` em `.env.local` e pula login automaticamente
- `/api/orchestrate` e `/api/transcribe` retornam payload mock (texto de exemplo DJ techno) quando as chaves são `placeholder`
- Toda a sidebar navega: Estratégia, Minha Marca, Negócio, Gerador, Calendário, Editor, Kanban, Cérebro, Sound Design, Release System, Evolução, Guia, Configurações

## Sair do preview e ligar pra valer

Edite `apps/web/.env.local`:
- Trocar `NEXT_PUBLIC_SUPABASE_URL` / `ANON_KEY` / `SERVICE_ROLE_KEY` pelos valores reais do Supabase
- Preencher `DATABASE_URL`, `ANTHROPIC_API_KEY`, `GROQ_API_KEY`
- Restart `npm run dev`

O bypass se desliga automaticamente assim que a URL do Supabase deixa de conter `placeholder`.

# nommad-worker

Worker local que recebe jobs da NOMMAD (Vercel) e renderiza imagens via **ComfyUI**.
Fluxo: Vercel → Tailscale Funnel (HTTPS) → FastAPI worker → ComfyUI (127.0.0.1:8188) → Supabase Storage.

---

## Pré-requisitos no PC de render

- GPU NVIDIA com **6 GB+ VRAM**
- Python 3.11+
- **ComfyUI** instalado e rodando em `127.0.0.1:8188`  
  → https://github.com/comfyanonymous/ComfyUI
- **Tailscale** instalado e logado na mesma tailnet da conta NOMMAD  
  → https://tailscale.com/download

### Modelos a baixar pro ComfyUI

Dentro da pasta do ComfyUI:

```
ComfyUI/models/checkpoints/
  sd_xl_turbo_1.0_fp16.safetensors        # ~6.6 GB — https://huggingface.co/stabilityai/sdxl-turbo
  dreamshaperXL_lightningDPMSDE.safetensors # ~6.5 GB — https://civitai.com/models/112902
```

Rode o ComfyUI com flag de VRAM baixa:
```
python main.py --listen 127.0.0.1 --port 8188 --lowvram
```
(Ou `--medvram` se a 6GB aguentar; teste.)

---

## Setup do worker

```bash
cd nommad-worker
python -m venv .venv
.venv\Scripts\activate   # Windows
# source .venv/bin/activate  # Linux/Mac
pip install -r requirements.txt

cp .env.example .env
# edite .env preenchendo WORKER_ID (uuid4 random), WORKER_SHARED_SECRET,
# SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, VERCEL_API_BASE
```

`WORKER_SHARED_SECRET` tem que bater EXATAMENTE com o valor em:
```
vercel env add WORKER_SHARED_SECRET production
```

---

## Bootstrap do banco (uma vez)

1. No monorepo Vercel: `cd apps/web && pnpm db:push` (cria `design_jobs`, `design_workflows`, `design_workers`).
2. No Supabase SQL Editor, rode `apps/web/drizzle-sql/design.sql` (RLS + bucket `design-assets` + publication realtime).
3. De volta no worker: `python seed_workflows.py` (popula 2 workflows iniciais).

---

## Rodar o worker

### 1. Subir ComfyUI
```
cd ComfyUI && python main.py --listen 127.0.0.1 --port 8188 --lowvram
```

### 2. Subir o worker
```
cd nommad-worker && python main.py
# ou: uvicorn main:app --host 127.0.0.1 --port 7777
```

### 3. Expor via Tailscale Funnel
Funnel dá URL HTTPS pública `https://<hostname>.<tailnet>.ts.net` que proxy pra `127.0.0.1:7777` sem abrir porta no roteador:

```bash
tailscale serve --bg 127.0.0.1:7777   # proxy interno
tailscale funnel --bg 443              # publica pra internet
tailscale funnel status                # confirma URL pública
```

Copie a URL (ex: `https://studio-pc.taila1b2c.ts.net`) e coloque no `.env` do worker:
```
WORKER_PUBLIC_URL=https://studio-pc.taila1b2c.ts.net
```
Reinicie o worker. Na próxima batida de heartbeat (30s), o row em `design_workers` vai ter `tailnet_url` correto — o Vercel passa a despachar jobs pra esse endereço.

---

## Rodando como serviço

### Windows (NSSM)
```
nssm install nommad-worker "C:\path\to\.venv\Scripts\python.exe" "C:\path\to\nommad-worker\main.py"
nssm set nommad-worker AppDirectory "C:\path\to\nommad-worker"
nssm start nommad-worker
```

### Linux (systemd)
```ini
# /etc/systemd/system/nommad-worker.service
[Unit]
Description=NOMMAD worker
After=network-online.target

[Service]
WorkingDirectory=/home/you/nommad-worker
ExecStart=/home/you/nommad-worker/.venv/bin/python main.py
Restart=on-failure
User=you

[Install]
WantedBy=multi-user.target
```

---

## Verificação end-to-end

1. `curl http://127.0.0.1:7777/health` → `{"ok":true,...}`
2. Pelo celular na 4G: `curl https://<host>.<tailnet>.ts.net/health` → mesmo JSON (Funnel OK).
3. No Supabase Studio, tabela `design_workers` mostra uma row com `last_seen_at` recente e `status=online`.
4. No site NOMMAD logado → `/design` → aba Capas. Badge "render local online" verde.
5. Envie prompt "EP techno melódico, vibe Berlim chuvosa" → clique Gerar.
6. No Supabase Studio, `design_jobs` vai `queued → dispatched → running → done` (`progress` sobe).
7. Imagem renderiza na UI via realtime subscribe.

## Troubleshooting

| Sintoma | Causa provável |
|---|---|
| Badge "render local offline" | Worker parado ou `last_seen_at > 90s`. Cheque logs do worker. |
| Job fica em `queued` e nunca anda | `tailnet_url` no row não bate com o Funnel atual. Restart worker. |
| `Invalid signature` no worker | `WORKER_SHARED_SECRET` diferente entre `.env` local e `vercel env`. |
| Job em `error` com "workflow not found" | Seed não rodou ou slug digitado errado no `design_workflows`. |
| OOM (CUDA out of memory) | ComfyUI precisa de `--lowvram`; troque pra SDXL Turbo + reduza resolução. |
| Heartbeat 401 | SDK não conseguiu assinar — cheque se `WORKER_SHARED_SECRET` tem 16+ chars. |

## Próximos passos (v2)

- Upscale Real-ESRGAN 4x (já previsto no pipeline, falta wirear em `main.py`).
- Ajustar workflow JSON pra injetar width/height numéricos baseado em `aspect`.
- Suporte a múltiplos workers (load balancing por `vram_free_mb`).
- Presskit IA com IP-Adapter FaceID (single-shot, sem treino de LoRA).

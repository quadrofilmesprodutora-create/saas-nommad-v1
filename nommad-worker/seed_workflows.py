"""Seed inicial de workflows no Supabase.
Rodar UMA VEZ após `pnpm db:push` + rodar `drizzle-sql/design.sql` no Supabase.

    python seed_workflows.py
"""
import json
import pathlib
import supa

HERE = pathlib.Path(__file__).parent
WORKFLOWS_DIR = HERE / "workflows"

SEEDS = [
    {
        "slug": "capa-sdxl-turbo",
        "type": "capa",
        "name": "Capa · SDXL Turbo",
        "description": "Capa 1024x1024 · 4 steps · SDXL Turbo (~20s em 6GB VRAM).",
        "file": "capa-sdxl-turbo.json",
        "param_schema": {
            "prompt":    {"type": "string", "required": True, "label": "Descrição"},
            "style_mod": {"type": "enum", "options": ["minimalist, flat", "cinematic mood, dramatic lighting", "abstract shapes, vibrant gradients", "portrait, studio lighting"], "default": "cinematic mood, dramatic lighting", "label": "Estilo"},
            "seed":      {"type": "number", "optional": True},
        },
        "defaults": {"style_mod": "cinematic mood, dramatic lighting", "seed": 42},
    },
    {
        "slug": "arte-sdxl-lightning",
        "type": "arte",
        "name": "Arte · SDXL Lightning",
        "description": "Arte em aspect customizável (story/feed/thumb/banner). 4 steps.",
        "file": "arte-sdxl-lightning.json",
        "param_schema": {
            "prompt": {"type": "string", "required": True, "label": "Descrição"},
            "aspect": {
                "type": "enum",
                "options": ["1080x1920", "1080x1350", "1280x720", "2660x1140"],
                "default": "1080x1350",
                "label": "Formato",
            },
            "seed":   {"type": "number", "optional": True},
        },
        "defaults": {"aspect": "1080x1350", "seed": 42, "width": 1080, "height": 1350},
    },
]


def main():
    for seed in SEEDS:
        comfy_json = json.loads((WORKFLOWS_DIR / seed["file"]).read_text("utf-8"))
        row = {
            "slug": seed["slug"],
            "type": seed["type"],
            "name": seed["name"],
            "description": seed["description"],
            "comfy_json": comfy_json,
            "param_schema": seed["param_schema"],
            "defaults": seed["defaults"],
            "enabled": True,
        }
        supa.client().table("design_workflows").upsert(row).execute()
        print(f"seeded {seed['slug']}")


if __name__ == "__main__":
    main()

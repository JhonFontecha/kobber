import sys, json, re

d = json.load(sys.stdin)
cmd = d.get("tool_input", {}).get("command", "") or ""
if re.search(r"(^|[;&|])\s*git\s+(commit|push)\b", cmd):
    print(json.dumps({
        "hookSpecificOutput": {
            "hookEventName": "PostToolUse",
            "additionalContext": (
                "Recordatorio: este commit/push puede requerir actualizar "
                "CLAUDE.md o la memoria del proyecto (arquitectura, rutas de "
                "API, esquema de BD, convenciones nuevas). Revisa si aplica "
                "antes de seguir."
            ),
        }
    }))

# OpenClaw agent bootstrap backup

This directory contains safe, non-secret bootstrap files for project agents.

It intentionally does not contain:

- Telegram bot tokens
- OpenAI/API keys
- auth-state.json
- auth-profiles.json
- ~/.openclaw/openclaw.json with real tokens
- runtime logs
- private encrypted backups

Runtime OpenClaw files live on the server under:

- ~/.openclaw/agents/<agent>/agent/
- ~/.openclaw/workspace/<agent>/

Configured project agents:

- main
- prompt
- manager
- backend
- frontend
- reviewer
- tester

Workspace bootstrap files should be symlinks to canonical files in:

- ~/.openclaw/agents/<agent>/agent/

Important current Telegram routing:

- prompt  <- telegram accountId=default
- manager <- telegram accountId=manager
- backend <- telegram accountId=backend

Full private OpenClaw backup should be encrypted and must not be committed to GitHub.

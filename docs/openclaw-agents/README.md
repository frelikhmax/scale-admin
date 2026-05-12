# OpenClaw agent bootstrap backup

This directory contains safe, non-secret bootstrap files for project agents.

It intentionally does not contain:

- Telegram bot tokens
- OpenAI/API keys
- auth-state.json
- auth-profiles.json
- ~/.openclaw/openclaw.json with real tokens

Runtime OpenClaw files live on the server under:

- ~/.openclaw/agents/<agent>/agent/
- ~/.openclaw/workspace/<agent>/

For manager, workspace bootstrap files are symlinks to:

- ~/.openclaw/agents/manager/agent/

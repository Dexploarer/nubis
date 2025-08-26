---
description: Validate code compliance (style, security, architecture) with static checks
auto_execution_mode: 3
---

# Validate Compliance

Run automated checks against coding standards, security protocols, and architecture rules.

## Slash usage
- Invoke: `/validate_compliance`
- Example: `/validate_compliance scope=src`

## Parameters
- scope (optional): directory to scan (default: `src`)

## Checks
1) Type safety and lint
```bash
bun run check
```

2) Build integrity
```bash
bun run build
```

3) Security quick scan (no secrets, no debug logs)
```bash
grep -RIn --exclude-dir=node_modules -E "(AWS_|SECRET|PRIVATE_KEY|BEGIN RSA|BEGIN PRIVATE)" . || true
grep -RIn --exclude-dir=node_modules -E "console\.log\(|debug\(" ${scope:-src} || true
```

4) Dependency health (Biome)
```bash
bun run biome
```

5) Architecture constraints (manual verify)
- No circular deps across `src/plugins/*`
- Respect public API boundaries; avoid deep imports

## Turbo steps (safe to auto-run)
// turbo
1. Full compliance sweep
```bash
bun run check && bun run build && bun run biome
```

## Quality gates
- Typecheck, build, and Biome complete without errors
- Security scan finds no secrets or debug logs
- Architecture constraints reviewed; no circular deps; no deep internal imports
- Optional framework pattern checks produce no critical findings

## References
- `../knowledge/coding_standards.md`
- `../knowledge/security_protocols.md`
- `../knowledge/architecture_patterns.md`
- `../rules/elizaos_coding_standards.md`
- `../rules/elizaos-architecture-patterns.md`
- `../rules/testing_standards.md`
- `../rules/elizaos_security_protocols.md`

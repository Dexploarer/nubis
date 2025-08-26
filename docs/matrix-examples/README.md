# Matrix Examples

This folder demonstrates the recommended standard: keep a single base character/scenario and vary behavior via parameter-path overrides in a matrix file.

- Base character: `src/characters/nubi.ts`
- Example matrix: `nubi-matrix.yaml`

How to use (guide-level):
1. Load your base scenario/character.
2. For each matrix `parameter`+`value`, clone the base runtime config and apply the override.
3. Execute your test or scenario run per-combination.
4. Aggregate results by parameter combination.

Common parameter paths:
- `character.llm.model`
- `character.temperature`
- `plugins[i]` (toggle plugin presence)
- `settings.voice.model`
- `run[0].input` (if your runner supports per-run input overrides)

Benefits:
- Zero duplication of character config files
- Clear provenance of variations
- Easy CI integration to cover combinations

## Usage

- Run the local planner to print all parameter combinations from `nubi-matrix.yaml`:

```bash
bun run matrix:plan
```

- In CI, the workflow runs a "Plan matrix combinations" step before matrix tests, so the planned combinations are visible in logs. See `.github/workflows/ci.yml` under the Matrix Testing job.

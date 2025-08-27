import { z } from 'zod';

export const REQUIRED_PLUGINS = ['@elizaos/plugin-bootstrap', '@elizaos/plugin-sql'] as const;

export const characterSchema = z
  .object({
    name: z.string().min(1),
    username: z.string().min(1),
    plugins: z.array(z.string()),
  })
  .passthrough();

export function validateCharacter(character: unknown) {
  const result = characterSchema.safeParse(character);
  const errors: string[] = [];
  if (!result.success) {
    errors.push(...result.error.errors.map((e) => `${e.path.join('.')}: ${e.message}`));
  } else {
    const plugins = result.data.plugins ?? [];
    for (let i = 0; i < REQUIRED_PLUGINS.length; i++) {
      if (plugins[i] !== REQUIRED_PLUGINS[i]) {
        errors.push(
          `Required plugin order invalid at index ${i}: expected ${REQUIRED_PLUGINS[i]}, got ${
            plugins[i] ?? 'undefined'
          }`,
        );
        break;
      }
    }
  }
  return { valid: errors.length === 0, errors };
}

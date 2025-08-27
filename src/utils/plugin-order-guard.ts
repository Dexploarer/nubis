export function assertProjectPluginOrder(
  plugins: { name?: string }[],
  log?: { warn?: (m: string) => void; error?: (m: string) => void },
) {
  const names = plugins.map((p) => p.name ?? '');
  const t = names.indexOf('twitterEnhancedPlugin');
  const s = names.indexOf('socialRaidsPlugin');
  if (t !== -1 && s !== -1 && t > s) {
    const msg = 'Plugin load order violation: twitterEnhancedPlugin must load before socialRaidsPlugin';
    if (log?.error) log.error(msg);
    throw new Error(msg);
  }
}

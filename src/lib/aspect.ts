/** CSS custom properties for a cropped image block (consumed as aspect-ratio: var(--ar)). */
export function aspectVars(desktop?: number, mobile?: number): string | undefined {
  const vars = [desktop && `--ar:${desktop}`, mobile && `--ar-m:${mobile}`].filter(Boolean);
  return vars.length ? vars.join(';') : undefined;
}

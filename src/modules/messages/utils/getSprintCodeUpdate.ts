export function updateSprintCode(code: string): string {
  return code.replace(/\./g, '-')
}

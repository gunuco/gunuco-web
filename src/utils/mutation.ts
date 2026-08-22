/** True when this mutation is in flight for the given entity id. */
export function isPendingForId(
  mutation: { isPending: boolean; variables?: unknown },
  id: string | undefined,
): boolean {
  if (!mutation.isPending || id == null) return false;
  const vars = mutation.variables;
  if (vars === id) return true;
  if (vars && typeof vars === 'object' && 'id' in vars) {
    return (vars as { id?: unknown }).id === id;
  }
  return false;
}

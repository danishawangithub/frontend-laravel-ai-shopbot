import type { FieldValues, Path, UseFormSetError } from 'react-hook-form'

export function applyLaravelFieldErrors<T extends FieldValues>(
  errors: Record<string, string[]>,
  setError: UseFormSetError<T>
): void {
  for (const [key, messages] of Object.entries(errors)) {
    const msg = messages?.[0]
    if (msg) {
      setError(key as Path<T>, { type: 'server', message: msg })
    }
  }
}

import type { FieldErrors } from 'react-hook-form'

export function scrollToFormError(errors: FieldErrors) {
  const firstErrorField = Object.keys(errors)[0]
  if (!firstErrorField) return

  requestAnimationFrame(() => {
    const element =
      document.querySelector(`[name="${firstErrorField}"]`) ??
      document.getElementById(`${firstErrorField}`)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  })
}

export function scrollToFormError() {
  requestAnimationFrame(() => {
    const element =
      document.querySelector<HTMLElement>('[aria-invalid="true"]') ??
      document.querySelector<HTMLElement>('.text-destructive')
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' })
      element.focus?.()
    }
  })
}

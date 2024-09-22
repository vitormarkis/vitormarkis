export const isRefElementClicked = (
  e: { target: EventTarget | null },
  ref: React.RefObject<HTMLElement>
): boolean => {
  if (!ref.current) return false
  return ref.current.contains(e.target as Node)
}

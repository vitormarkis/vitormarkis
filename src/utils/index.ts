export const isRefElementClicked = (
  e: Event,
  ref: React.RefObject<HTMLElement>
): boolean => {
  if (!ref.current) return false
  return ref.current.contains(e.target as Node)
}

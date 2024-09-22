export const isRefElementClicked = (
  e: { target: EventTarget | null },
  ref: React.RefObject<HTMLElement>
): boolean => {
  if (!ref.current) return false
  return ref.current.contains(e.target as Node)
}

export function extractChanges<T>(obj: T, newObj: T) {
  const changes: any = {}
  for (const key in newObj) {
    if (!Object.is(obj[key], newObj[key])) {
      changes[key] = [obj[key], newObj[key]]
    }
  }
  const hasChanges = Object.keys(changes).length > 0
  return [hasChanges, changes]
}

export function createCompareValues<TSource>(oldSource: TSource, newSource: TSource) {
  return function compareChanges<TSelection>(selector: (md: TSource) => TSelection) {
    const newValue = selector(newSource)
    const oldValue = selector(oldSource)
    return !Object.is(oldValue, newValue)
  }
}

export function createDiff<TSource>(oldSource: TSource, newSource: TSource) {
  const compareValues = createCompareValues(oldSource, newSource)
  return function diff(selectors: ((state: TSource) => any)[]) {
    return selectors.some(selector => compareValues(selector))
  }
}

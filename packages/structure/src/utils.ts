let __idCounter = 1
export function generateId(prefix = 'node') {
  return `${prefix}-${__idCounter++}`
}

// for tests or debugging
export function resetIdCounter(n = 1) {
  __idCounter = n
}

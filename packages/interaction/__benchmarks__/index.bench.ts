import { bench } from 'vitest'

bench('interaction placeholder benchmark', () => {
  let n = 0
  for (let i = 0; i < 1000; i++) n += i
})

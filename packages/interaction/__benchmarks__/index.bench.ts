import { bench } from 'vitest'
import { greet } from '../../../src/interaction'

bench('greet default (1k)', () => {
  for (let i = 0; i < 1000; i++) greet()
})

bench('greet with name (1k)', () => {
  for (let i = 0; i < 1000; i++) greet('bench')
})

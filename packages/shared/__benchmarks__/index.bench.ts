import { bench } from 'vitest'
import { sharedHello } from '../src'

bench('sharedHello default (1k)', () => {
  for (let i = 0; i < 1000; i++) sharedHello()
})

bench('sharedHello with name (1k)', () => {
  for (let i = 0; i < 1000; i++) sharedHello('bench')
})

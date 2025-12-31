import { bench } from 'vitest'
import { runtimeName } from '../src'

bench('read runtimeName 10k', () => {
  for (let i = 0; i < 10_000; i++) void runtimeName
})

import { bench } from 'vitest'
import { ConfigLoader, ConfigCompiler } from '../src'

bench('ConfigLoader register + get (1k)', () => {
  const loader = new ConfigLoader()
  for (let i = 0; i < 1000; i++) {
    loader.registerLoader('k' + i, () => i)
  }
  for (let i = 0; i < 1000; i++) {
    const fn = loader.getLoader('k' + i)
    if (!fn) throw new Error('missing loader')
    fn()
  }
})

bench('ConfigCompiler register + run (1k)', () => {
  const compiler = new ConfigCompiler()
  for (let i = 0; i < 1000; i++) {
    compiler.registerCompiler('k' + i, (v: number) => v)
  }
  for (let i = 0; i < 1000; i++) {
    const fn = compiler.getCompiler('k' + i)
    if (!fn) throw new Error('missing compiler')
    fn(i)
  }
})

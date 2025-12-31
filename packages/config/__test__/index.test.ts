import { describe, it, expect } from 'vitest'
import { ConfigLoader, ConfigCompiler, useConfig } from '../../../src/config'

describe('ConfigLoader', () => {
  it('registers and retrieves loader functions', () => {
    const loader = new ConfigLoader()
    loader.registerLoader('json', () => ({ a: 1 }))

    const fn = loader.getLoader('json')
    expect(fn).toBeDefined()
    expect(fn!()).toEqual({ a: 1 })
  })

  it('returns undefined for missing loader', () => {
    const loader = new ConfigLoader()
    expect(loader.getLoader('missing')).toBeUndefined()
  })
})

describe('ConfigCompiler', () => {
  it('registers and retrieves compiler functions', () => {
    const compiler = new ConfigCompiler()
    compiler.registerCompiler<number>('double', (v) => v * 2)

    const fn = compiler.getCompiler<number>('double')
    expect(fn).toBeDefined()
    expect(fn!(3)).toBe(6)
  })

  it('returns undefined for missing compiler', () => {
    const compiler = new ConfigCompiler()
    expect(compiler.getCompiler('missing')).toBeUndefined()
  })
})

describe('useConfig compile', () => {
  it('exposes expected API', () => {
    const api = useConfig()
    expect(typeof api.addConfigMeta).toBe('function')
    expect(typeof api.compile).toBe('function')
  })

  it('compiles using loader only', () => {
    const {loader, addConfigMeta, compile} = useConfig()
    loader.registerLoader('raw', () => ({ x: 1 }))
    addConfigMeta({ prop: 'cfg', loaderKey: 'raw' })

    const out = compile()
    expect(out).toHaveProperty('cfg')
    expect(out.cfg).toEqual({ x: 1 })
  })

  it('compiles using loader + compiler', () => {
    const {loader, compiler, addConfigMeta, compile} = useConfig()
    loader.registerLoader('num', () => 3)
    compiler.registerCompiler<number>('double', (v) => v * 2)
    addConfigMeta({ prop: 'n', loaderKey: 'num', compilerKey: 'double' })

    const out = compile()
    expect(out.n).toBe(6)
  })

  it('falls back to raw value if compiler missing', () => {
    const {loader, addConfigMeta, compile} = useConfig()
    loader.registerLoader('value', () => 's')
    addConfigMeta({ prop: 's', loaderKey: 'value', compilerKey: 'missing' })

    const out = compile()
    expect(out.s).toBe('s')
  })

  it('ignores metas without loader or missing loader', () => {
    const {addConfigMeta, compile} = useConfig()
    addConfigMeta({ prop: 'a' }) // no loaderKey
    addConfigMeta({ prop: 'b', loaderKey: 'missing' }) // loader not registered

    const out = compile()
    expect(out).toEqual({})
  })
})

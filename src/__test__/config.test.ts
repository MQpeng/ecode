import { describe, it, expect } from 'vitest'
import { useConfig } from '../config'

describe('useConfig', () => {
  it('compiles values using registered loaders and compilers', () => {
    const { loader, compiler, addConfigMeta, compile } = useConfig()

    loader.registerLoader('one', () => 1)
    compiler.registerCompiler('double', (v: number) => v * 2)

    addConfigMeta({ prop: 'a', loaderKey: 'one' })
    addConfigMeta({ prop: 'b', loaderKey: 'one', compilerKey: 'double' })

    const result = compile()
    expect(result).toEqual({ a: 1, b: 2 })
  })

  it('ignores metas without loaderKey or missing loaders', () => {
    const { addConfigMeta, compile } = useConfig()
    addConfigMeta({ prop: 'noLoader' })
    const result = compile()
    expect(result).toEqual({})
  })
})

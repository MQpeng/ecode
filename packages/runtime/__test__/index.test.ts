import { describe, it, expect } from 'vitest'
import { runtimeName } from '../src/index'

describe('runtimeName', () => {
  it('is set', () => {
    expect(runtimeName).toBe('tonyer-runtime')
  })

  it('contains runtime', () => {
    expect(runtimeName).toContain('runtime')
  })
})

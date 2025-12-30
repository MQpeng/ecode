import { describe, it, expect } from 'vitest'
import { sharedHello } from '../src/index'

describe('sharedHello', () => {
  it('returns a greeting', () => {
    expect(sharedHello('tonyer')).toBe('hello tonyer')
  })
})

import { describe, it, expect } from 'vitest'
import { greet } from '../src/index'

describe('greet', () => {
  it('says hi', () => {
    expect(greet('tonyer')).toBe('hi tonyer')
  })
})

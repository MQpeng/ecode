import { describe, it, expect } from 'vitest'
import { greet } from '../../../src/interaction'

describe('greet', () => {
  it('says hi', () => {
    expect(greet('tonyer')).toBe('hi tonyer')
  })

  it('defaults to friend', () => {
    expect(greet()).toBe('hi friend')
  })
})

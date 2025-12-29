import { describe, it, expect } from 'vitest'
import { getConfig } from '../src/index'

describe('getConfig', () => {
  it('returns an object with env', () => {
    expect(getConfig()).toHaveProperty('env')
  })
})

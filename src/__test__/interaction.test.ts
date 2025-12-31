import { describe, it, expect } from 'vitest'
import { useInteraction } from '../interaction'

describe('useInteraction', () => {
  it('maintains a map of interaction metadata', () => {
    const { interactionRelationship } = useInteraction()
    expect(interactionRelationship.size).toBe(0)

    const meta = { label: 'L', eventName: 'evt', trigger: () => {} }
    interactionRelationship.set('k', meta)

    expect(interactionRelationship.get('k')).toEqual(meta)

    interactionRelationship.delete('k')
    expect(interactionRelationship.get('k')).toBeUndefined()
  })
})

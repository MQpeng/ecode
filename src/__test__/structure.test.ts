import { describe, it, expect } from 'vitest'
import { buildIndexes, usePageSructure } from '../structure'

function makeNode(id: string, children: unknown[] = []){
  return { id, type: 'type', widget: { id, type: 'type' }, children }
}

describe('structure helpers', () => {
  const grandchild = makeNode('grandchild')
  const child1 = makeNode('child1', [grandchild])
  const child2 = makeNode('child2')
  const root = makeNode('root', [child1, child2])

  it('buildIndexes returns an index for all nodes', () => {
    const idx = buildIndexes(root)
    expect(Object.keys(idx).sort()).toEqual(['child1','child2','grandchild','root'].sort())
    expect(idx['child1'].pid).toBe('root')
    expect(idx['grandchild'].pid).toBe('child1')
  })

  it('usePageSructure provides navigation and mutation helpers', () => {
    const utils = usePageSructure(root)
    expect(utils.getWidgetById('child1')?.id).toBe('child1')
    expect(utils.getParentWidget('grandchild')?.id).toBe('child1')

    const newNode = makeNode('new-child')
    expect(utils.appendWidget('child2', newNode)).toBe(true)
    expect(utils.getWidgetById('new-child')?.id).toBe('new-child')

    expect(utils.removeWidgetById('child1')).toBe(true)
    expect(utils.getWidgetById('child1')).toBeNull()
  })
})

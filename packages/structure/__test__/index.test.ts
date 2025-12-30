import { describe, it, expect } from 'vitest'
import { usePageSructure } from '../src/page'
import type { WidgetTreeNode } from '../src/widget'

function makeNode(id: string, children?: WidgetTreeNode[]): WidgetTreeNode {
  return {
    id,
    type: 'node',
    widget: { id, type: 'node' },
    children,
  }
}

describe('usePageSructure', () => {
  const root: WidgetTreeNode = makeNode('root', [
    makeNode('a', [makeNode('a1')]),
    makeNode('b'),
  ])

  it('can find widgets and parents', () => {
    const { getWidgetById, getParentWidget } = usePageSructure(root)

    expect(getWidgetById('a1')?.id).toBe('a1')
    expect(getParentWidget('a1')?.id).toBe('a')
    expect(getParentWidget('root')).toBeNull()
  })

  it('appendWidget adds child and preserves parent links', () => {
    const { appendWidget, getWidgetById, getParentWidget } = usePageSructure(root)
    const newNode = makeNode('b1')

    expect(appendWidget('b', newNode)).toBe(true)
    expect(getWidgetById('b1')?.id).toBe('b1')

    // parent of new node is 'b'
    expect(getParentWidget('b1')?.id).toBe('b')

    // ensure parent 'b' still has parent 'root' after rebuilding indexes
    expect(getParentWidget('b')?.id).toBe('root')
  })

  it('appendWidget returns false for missing parent', () => {
    const { appendWidget } = usePageSructure(root)
    expect(appendWidget('nonexistent', makeNode('x'))).toBe(false)
  })

  it('removeWidgetById removes child and preserves parent links', () => {
    const { removeWidgetById, getWidgetById, getParentWidget } = usePageSructure(root)
    // remove a1
    expect(removeWidgetById('a1')).toBe(true)
    expect(getWidgetById('a1')).toBeNull()

    // ensure 'a' still has parent 'root'
    expect(getParentWidget('a')?.id).toBe('root')
  })

  it('removeWidgetById returns false for missing or root ids', () => {
    const { removeWidgetById } = usePageSructure(root)
    expect(removeWidgetById('nonexistent')).toBe(false)
    expect(removeWidgetById('root')).toBe(false)
  })
})

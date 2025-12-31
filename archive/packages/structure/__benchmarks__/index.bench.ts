import { bench } from 'vitest'
import { usePageSructure } from '../../../src/structure'
import type { WidgetTreeNode } from '../../../src/structure'

function makeNode(id: string, children?: WidgetTreeNode[]): WidgetTreeNode {
  return { id, type: 'node', widget: { id, type: 'node' }, children }
}

const root: WidgetTreeNode = makeNode('root', [
  makeNode('a', [makeNode('a1'), makeNode('a2')]),
  makeNode('b', [makeNode('b1'), makeNode('b2')]),
])

bench('lookup widget by id (10k)', () => {
  const { getWidgetById } = usePageSructure(root)
  for (let i = 0; i < 10000; i++) {
    getWidgetById('a1')
    getWidgetById('b2')
  }
})

bench('append and remove widget (1k)', () => {
  const treeCopy: WidgetTreeNode = JSON.parse(JSON.stringify(root))
  const { appendWidget, removeWidgetById, getParentWidget } = usePageSructure(treeCopy)
  for (let i = 0; i < 1000; i++) {
    const id = 'x' + i
    appendWidget('a', { id, type: 'node', widget: { id, type: 'node' } })
    removeWidgetById(id)
  }
})

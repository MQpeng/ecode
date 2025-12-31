import { describe, it, expect } from 'vitest'
import { useOps } from '../ops'
import { WidgetTreeNode } from '../structure'

function makeNode(id: string, children: unknown[] = []){
  return { id, type: 'type', widget: { id, type: 'type' }, children } as WidgetTreeNode
}

describe('useOps', () => {
  const child = makeNode('child')
  const root = makeNode('root', [child])

  it('wraps page structure helpers', () => {
    const ops = useOps(root)
    expect(ops.getWidgetById('child')?.id).toBe('child')
    expect(ops.getParentWidget('child')?.id).toBe('root')

    const newNode = makeNode('new')
    expect(ops.appendWidget('root', newNode)).toBe(true)
    expect(ops.getWidgetById('new')?.id).toBe('new')

    expect(ops.removeWidgetById('child')).toBe(true)
    expect(ops.getWidgetById('child')).toBeNull()
  })

  it('exposes interaction helpers and keeps shared state', () => {
    const ops = useOps(root)
    const meta = { label: 'L', eventName: 'e', trigger: () => 'ok' }
    ops.addInteractionMeta('k', meta)
    expect(ops.getInteractionMeta('k')).toEqual(meta)
    expect(ops.interactionRelationship.get('k')).toEqual(meta)
    ops.removeInteractionMeta('k')
    expect(ops.getInteractionMeta('k')).toBeUndefined()
  })

  it('exposes config helpers and compile works', () => {
    const ops = useOps(root)
    ops.loader.registerLoader('one', () => 1)
    ops.compiler.registerCompiler('double', (v: number) => (v as number) * 2)
    ops.addConfigMeta({ prop: 'a', loaderKey: 'one' })
    ops.addConfigMeta({ prop: 'b', loaderKey: 'one', compilerKey: 'double' })

    const out = ops.compile()
    expect(out).toEqual({ a: 1, b: 2 })
  })
})
import { describe, it, expect } from 'vitest'
import { parseJSONToTree, formatTreeToJSON, PageTree } from '../src/index'

const sampleJson = {
  id: 'root',
  type: 'Page',
  props: { title: 'Home' },
  children: [
    { id: 'c1', type: 'Header', props: { text: 'Welcome' }, events: { onClick: 'openMenu' } },
    {
      id: 'c2',
      type: 'List',
      props: { items: [1, 2] },
      children: [
        { id: 'c2-1', type: 'ListItem', props: { text: 'Item 1' }, events: { onSelect: { name: 'selectItem', payload: { idx: 0 } } } }
      ]
    }
  ]
}

describe('@tonyer/structure core', () => {
  it('parses JSON into a tree and preserves ids/types/events', () => {
    const root = parseJSONToTree(sampleJson)
    expect(root.type).toBe('Page')
    expect(root.children).toHaveLength(2)
    const listItem = root.children?.[1].children?.[0]
    expect(listItem).not.toBeUndefined()
    expect(listItem?.type).toBe('ListItem')
    expect(listItem?.events).toHaveProperty('onSelect')
    if (typeof listItem?.events?.onSelect === 'object') {
      expect((listItem.events.onSelect as any).name).toBe('selectItem')
    }
  })

  it('formats a tree back to JSON (roundtrip)', () => {
    const root = parseJSONToTree(sampleJson)
    const json = formatTreeToJSON(root)
    expect(json).toEqual(sampleJson)
  })

  it('manages tree operations efficiently with PageTree', () => {
    const tree = PageTree.fromJSON(sampleJson)

    // append a new node under c2 (generate id if missing)
    const newNode = { type: 'ListItem', props: { text: 'Item 2' } }
    const appended = tree.append('c2', newNode)
    expect(appended.id).toMatch(/^listitem-/)
    expect(tree.getNode(appended.id)).toBeDefined()

    // find and remove the appended node
    const removed = tree.remove(appended.id)
    expect(removed.id).toBe(appended.id)
    expect(tree.getNode(appended.id)).toBeNull()

    // replace c1 with a Banner (local replace should update index only locally)
    const beforeSize = tree.size()
    const replaced = tree.replace('c1', { id: 'c1', type: 'Banner', props: { level: 1 }, children: [{ type: 'Leaf' }] })
    expect(tree.getNode('c1')?.type).toBe('Banner')
    expect(tree.size()).toBeGreaterThanOrEqual(beforeSize)

    // moving a node into its own descendant should throw (c2-1 is currently a descendant of c2)
    expect(() => tree.move('c2', 'c2-1')).toThrow()

    // move c2-1 under root at index 1
    tree.move('c2-1', 'root', 1)
    const rootChildren = tree.root.children!.map((c) => c.id)
    expect(rootChildren).toContain('c2-1')

    // ancestors helper
    const ancestors = tree.getAncestors('c2-1').map((n) => n.id)
    expect(ancestors).toContain('root')

    // toObject and toJSON
    const outObj = tree.toObject()
    expect(outObj).toHaveProperty('children')
    const outJsonStr = tree.toJSON()
    const outJson = JSON.parse(outJsonStr)
    expect(outJson).toHaveProperty('children')
  })
})

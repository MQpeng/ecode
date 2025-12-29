import type { ComponentNode, PageJSON } from './types'
import { parseJSONToTree, formatTreeToJSON } from './parser'

export class PageTree {
  root: ComponentNode
  private index = new Map<string, ComponentNode>()
  private parent = new Map<string, string | null>()

  private constructor(root: ComponentNode) {
    this.root = root
    this.rebuildIndex()
  }

  static fromJSON(json: PageJSON) {
    const root = parseJSONToTree(json)
    return new PageTree(root)
  }

  static fromNode(root: ComponentNode) {
    return new PageTree(root)
  }

  private rebuildIndex() {
    this.index.clear()
    this.parent.clear()

    const walk = (node: ComponentNode, parentId: string | null) => {
      this.index.set(node.id, node)
      this.parent.set(node.id, parentId)
      if (node.children) {
        for (const c of node.children) walk(c, node.id)
      }
    }

    walk(this.root, null)
  }

  getNode(id: string) {
    return this.index.get(id) ?? null
  }

  getParentId(id: string) {
    return this.parent.get(id) ?? null
  }

  append(parentId: string, child: PageJSON | ComponentNode, atIndex?: number): ComponentNode {
    const parent = this.index.get(parentId)
    if (!parent) throw new Error(`Parent ${parentId} not found`)

    const node = typeof (child as any).type === 'string' && (child as any).id === undefined
      ? parseJSONToTree(child as PageJSON)
      : (child as ComponentNode)

    if (!parent.children) parent.children = []
    if (typeof atIndex === 'number') parent.children.splice(atIndex, 0, node)
    else parent.children.push(node)

    this.index.set(node.id, node)
    this.parent.set(node.id, parentId)

    const walkIndex = (n: ComponentNode) => {
      if (n.children) {
        for (const c of n.children) {
          this.index.set(c.id, c)
          this.parent.set(c.id, n.id)
          walkIndex(c)
        }
      }
    }
    walkIndex(node)

    return node
  }

  replace(id: string, newNode: PageJSON | ComponentNode): ComponentNode {
    const existing = this.index.get(id)
    if (!existing) throw new Error(`Node ${id} not found`)

    const parentId = this.parent.get(id) ?? null
    const parentNode = parentId ? this.index.get(parentId) : null

    const node = typeof (newNode as any).type === 'string' && (newNode as any).id === undefined
      ? parseJSONToTree(newNode as PageJSON)
      : (newNode as ComponentNode)

    node.id = node.id ?? id

    if (!parentNode) {
      this.root = node
    } else {
      if (!parentNode.children) parentNode.children = []
      const idx = parentNode.children.findIndex((c) => c.id === id)
      if (idx === -1) throw new Error('Inconsistent parent-child relationship')
      parentNode.children[idx] = node
    }

    this.rebuildIndex()
    return node
  }

  remove(id: string): ComponentNode {
    const node = this.index.get(id)
    if (!node) throw new Error(`Node ${id} not found`)

    const parentId = this.parent.get(id) ?? null
    if (!parentId) throw new Error('Cannot remove root node')
    const parentNode = this.index.get(parentId)!
    if (!parentNode.children) throw new Error('Inconsistent state')
    const idx = parentNode.children.findIndex((c) => c.id === id)
    if (idx === -1) throw new Error('Inconsistent parent-child relationship')
    const [removed] = parentNode.children.splice(idx, 1)

    const walkRemove = (n: ComponentNode) => {
      this.index.delete(n.id)
      this.parent.delete(n.id)
      if (n.children) for (const c of n.children) walkRemove(c)
    }
    walkRemove(removed)

    return removed
  }

  move(id: string, newParentId: string, atIndex?: number) {
    const node = this.index.get(id)
    if (!node) throw new Error(`Node ${id} not found`)
    const oldParentId = this.parent.get(id) ?? null
    if (!oldParentId) throw new Error('Cannot move root node')
    const oldParent = this.index.get(oldParentId)!
    const newParent = this.index.get(newParentId)
    if (!newParent) throw new Error(`New parent ${newParentId} not found`)

    const idx = oldParent.children!.findIndex((c) => c.id === id)
    if (idx === -1) throw new Error('Inconsistent state')
    oldParent.children!.splice(idx, 1)

    if (!newParent.children) newParent.children = []
    if (typeof atIndex === 'number') newParent.children.splice(atIndex, 0, node)
    else newParent.children.push(node)

    const walkUpdateParent = (n: ComponentNode, parentId: string) => {
      this.parent.set(n.id, parentId)
      if (n.children) for (const c of n.children) walkUpdateParent(c, n.id)
    }
    walkUpdateParent(node, newParentId)
  }

  toJSON() {
    return formatTreeToJSON(this.root)
  }
}

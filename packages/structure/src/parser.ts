import type { ComponentNode, PageJSON } from './types'
import { generateId } from './utils'

/**
 * Parse a JSON description into a ComponentNode tree (no indexing).
 * - Generates ids when missing
 */
export function parseJSONToTree(json: PageJSON): ComponentNode {
  const id = json.id ?? generateId(json.type.replace(/[^a-z0-9]/gi, '').toLowerCase())
  const node: ComponentNode = {
    id,
    type: json.type,
    props: json.props ? { ...json.props } : undefined,
    events: json.events ? { ...json.events } : undefined,
    children: json.children ? json.children.map(parseJSONToTree) : undefined
  }
  return node
}

/**
 * Format a ComponentNode tree back to JSON representation.
 * Leaves out undefined fields for compactness.
 */
export function formatTreeToJSON(node: ComponentNode): PageJSON {
  const out: PageJSON = { id: node.id, type: node.type }
  if (node.props && Object.keys(node.props).length > 0) out.props = { ...node.props }
  if (node.events && Object.keys(node.events).length > 0) out.events = { ...node.events }
  if (node.children && node.children.length > 0) out.children = node.children.map(formatTreeToJSON)
  return out
}

export function findNodeById(root: ComponentNode, id: string): ComponentNode | null {
  if (root.id === id) return root
  if (!root.children) return null
  for (const c of root.children) {
    const found = findNodeById(c, id)
    if (found) return found
  }
  return null
}

export function mapTree<T>(root: ComponentNode, fn: (node: ComponentNode) => T): T[] {
  const out: T[] = []
  out.push(fn(root))
  if (root.children) {
    for (const c of root.children) {
      out.push(...mapTree(c, fn))
    }
  }
  return out
}

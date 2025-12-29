export * from './types'
export * from './utils'
export * from './parser'
export * from './page-tree'

// convenience wrapper
import { PageTree } from './page-tree'
export function parseJSONToIndexedTree(json: import('./types').PageJSON) {
  return PageTree.fromJSON(json)
}


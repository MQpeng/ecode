export type EventHandler = string | { name: string; payload?: unknown }

export interface ComponentNode {
  id: string
  type: string // component name, e.g., 'Button', 'List'
  props?: Record<string, unknown>
  events?: Record<string, EventHandler>
  children?: ComponentNode[]
}

export type PageJSON = {
  id?: string
  type: string
  props?: Record<string, unknown>
  events?: Record<string, EventHandler>
  children?: PageJSON[]
}

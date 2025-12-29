# @tonyer/structure

Utilities to represent page structure as a component tree (vnode-like) and convert between JSON and tree form.

## API

- `parseJSONToTree(json)` - parse a JSON description into a `ComponentNode` tree. Generates `id` when missing.
- `formatTreeToJSON(node)` - serialize a `ComponentNode` back into JSON.
- `findNodeById(root, id)` - find a node by `id` in the tree.
- `mapTree(root, fn)` - pre-order traversal mapping helper.

## Concept

The basic unit is a **component** (e.g. `Header`, `ListItem`), not raw HTML elements. Each component can have `props`, `children`, and `events` (simple event descriptors or named handlers with payloads).

Example JSON:

```json
{
  "id": "root",
  "type": "Page",
  "props": { "title": "Home" },
  "children": [
    { "id": "c1", "type": "Header", "props": { "text": "Welcome" }, "events": { "onClick": "openMenu" } }
  ]
}
```

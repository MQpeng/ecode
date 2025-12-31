# @tonyer/structure

A small TypeScript utility for modeling and manipulating a page as a tree of widgets.

## ✨ Overview

This package provides lightweight types and helpers for representing a UI page as a widget tree and performing simple, predictable mutations and lookups.

Key features:
- Clear types for widgets and tree nodes (`Widget`, `WidgetTreeNode`, `WidgetTreeIndex`).
- Utility `usePageSructure(root)` that exposes an index-backed API for O(1) lookups and safe in-place mutations.
- Simple, dependency-free implementation suitable for tests and small-to-medium page models.

---

## 🧩 Quick usage

```ts
import { usePageSructure } from '@tonyer/structure'
import type { WidgetTreeNode } from '@tonyer/structure'

const root: WidgetTreeNode = {
  id: 'root',
  type: 'page',
  widget: { id: 'root', type: 'page' },
  children: [
    { id: 'a', type: 'section', widget: { id: 'a', type: 'section' }, children: [] }
  ]
}

const { getWidgetById, getParentWidget, appendWidget, removeWidgetById } = usePageSructure(root)

appendWidget('a', { id: 'a1', type: 'widget', widget: { id: 'a1', type: 'widget' } })
console.log(getWidgetById('a1')) // -> widget
console.log(getParentWidget('a1')) // -> widget with id 'a'

removeWidgetById('a1')
```

---

## 📚 API (surface)

- Types
  - `Widget` — widget metadata (id, type, optional props, events, etc.)
  - `WidgetTreeNode` — tree node containing `widget` and optional `children`
  - `WidgetTreeIndex` — internal index item with `pid` and `node`

- Functions
  - `usePageSructure(root: WidgetTreeNode)` — returns an API:
    - `getWidgetById(id: string): Widget | null`
    - `getParentWidget(id: string): Widget | null`
    - `appendWidget(parentId: string, newWidgetNode: WidgetTreeNode): boolean`
    - `removeWidgetById(id: string): boolean`

Notes:
- `usePageSructure` maintains an internal index for fast lookups and rebuilds it after mutations to keep parent links correct.

---

## ✅ Tests & Benchmarks

- Tests live in `packages/structure/__test__` (Vitest).
- Benchmarks (placeholders) are in `packages/structure/__benchmarks__`.

Run package tests:

```bash
pnpm -C packages/structure test
```

Run workspace tests (root):

```bash
pnpm -w test
```

---

## 🤝 Contributing

- Add tests in `__test__` for new behavior.
- Keep public API stable and document changes in README and `DESIGN.md` when appropriate.
- Run `pnpm -w test` before opening PRs.

---

## 📄 License

MIT — see the project `LICENSE` for details.

# DESIGN: @tonyer/structure (redesign)

Overview

This package models a page as a tree of components. Each node is a component (not raw HTML); nodes have `id`, `type`, `props`, `events`, and `children`.

Key design choices

- Immutable model: When calling `Ops.append`, `Ops.replace`, `Ops.remove`, or `Ops.move`, the function returns a new root `Model` (a lightweight, shallow-copying tree) so callers can keep previous versions and reason about changes.
- Deterministic id generation: `generateId(type)` produces predictable ids in tests; a `seed` option supports fixed ids.
- Fast operations: `Ops` can accept an optional index to speed up repeated operations; the default is a straightforward functional implementation.
- Serializer: `Serializer.toJSON(model): string` and `Serializer.toObject(model)` provide roundtrip conversions.

Public API

- `Model` (immutable view): { id, type, props?, events?, children?: Model[] }
- `Ops` functions: `append(model, parentId, child)`, `replace(model, id, newNode)`, `remove(model, id)`, `move(model, id, newParentId, atIndex?)` — all return new `Model` roots
- `Serializer`: `toObject(model)`, `toJSON(model)`

Testing strategy

- Unit tests covering: append/replace/remove/move, edge cases (move into descendant), immutability, serializer roundtrip, id generation.

Performance

- Baseline functional implementations O(m + c) for operations (m=subtree size, c=child count). Optional indexed variants can be added later.

Storage abstraction

- Children lists are arrays in the baseline implementation for simplicity and correctness. To support very large sibling lists with better insert/remove performance, introduce an `OrderedStorage` interface and provide an adapter for a well-maintained red-black tree library (or B-tree).
- Recommendation: keep the adapter behind an interface so the public API remains unchanged; prefer wrapping an existing, well-tested library for reliability.

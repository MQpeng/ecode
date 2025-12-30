# @tonyer/structure

⚙️ A small TypeScript library for modeling page structure as a Widget tree (immutable, test-friendly, deterministic ids).

## Goals

- Represent a page as a single `WidgetTree` (hierarchy of widgets).
- Support operations: append/replace/remove/move (all immutable, returning a new `ModelRoot`).
- Fast lookup by `id` via `ModelRoot`'s internal index (`idMap`).
- Copy & paste: deep clone a subtree with deterministic id remapping.
- Low coupling: minimal runtime dependencies and pluggable storage interface for future performance improvements (e.g., red-black tree adapter).

## Quick start

```ts
import { createModel, ModelRoot, Ops, getGenerateIdFn, Serializer } from '@tonyer/structure';
// Note: currently use ModelRoot constructor directly
import type { Widget } from '@tonyer/structure';

const rootWidget: Widget = { type: 'Page', name: 'page', props: {}, events: {} };
const rootNode = { id: 'root', data: rootWidget, children: [] };
const model = new ModelRoot(rootNode);

const child: Widget = { type: 'Header', name: 'h', props: {}, events: {} };
const newModel = Ops.append(model, 'root', child, { idGen: getGenerateIdFn(1) });

console.log(Serializer.toJSON(newModel));
```

## API (overview)

- Types: `Widget`, `TreeNode`, `Model` exported from package.
- Id helpers: `getGenerateIdFn(seed?)`, `ensureUniqueId`, `remapIds`.
- Cloning: `deepCloneNode(node, remapIds?, idGen?)` -> `{ node, idMap }`.
- Model: `ModelRoot` (fields: `root`, `idMap`, methods: `findById`, `clone`).
- Operations: `Ops.append`, `Ops.replace`, `Ops.remove`, `Ops.move` (all return new `ModelRoot`).
- Serializer: `toObject`, `toJSON`, `fromObject`, `fromJSON`.

## Design notes

- Immutability: Ops return new `ModelRoot` instances; the previous model remains intact.
- Deterministic id generation: Use `getGenerateIdFn(seed)` in tests to make ids predictable.
- Low coupling: The package exposes a small, stable API and keeps internal storage pluggable. For very large sibling lists a pluggable `OrderedStorage` interface can be implemented and an RB-tree adapter added.

## Tests

Run tests in package:

```bash
pnpm --filter @tonyer/structure test
```

## Contributing

Please follow the repository contribution guidelines. Add unit tests for new behavior and keep changes minimal and well-documented.

---

For implementation details and design rationale, see `DESIGN.md`.

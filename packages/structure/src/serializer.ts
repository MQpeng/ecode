import { ModelRoot } from './model';
import { TreeNode } from './types';

export function toObject(model: ModelRoot): TreeNode {
    return model.toObject();
}

export function toJSON(model: ModelRoot): string {
    return JSON.stringify(toObject(model));
}

export function fromObject(obj: TreeNode): ModelRoot {
    return new ModelRoot(obj);
}

export function fromJSON(json: string): ModelRoot {
    const obj = JSON.parse(json);
    return fromObject(obj);
}

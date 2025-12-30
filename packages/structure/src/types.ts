export type Event = { name: string; handlerStr: string; handler?: Function };

export interface Widget {
    type: string;
    name: string;
    className?: string;

    props: Record<string, any>;
    events: Record<string, Event>;
}

export interface TreeNode<T = Widget> {
    id: string;
    data: T;
    children: TreeNode<T>[];
}

export type Model = TreeNode<Widget>;

import { WidgetNode } from "../widgetTree";

export enum OperationType {
  AddNode,
  DeleteNode,
  UpdateNode,
  ReplaceNode,
  PasteNode,
  AddMeta,
  DeleteMeta,
  UpdateMeta,
}

export enum OperationSource {
  WidgetTree,
  WidgetMeta,
}

export interface Operation {
  source: OperationSource;
  type: OperationType;
  timestamp: number;
  payload: any; 
}

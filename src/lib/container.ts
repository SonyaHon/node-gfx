import { NodeCtor } from "./types";

export class DataContainer {
  static NODES: NodeCtor[] = [];

  static serializeCtor(param: any) {
    return Reflect.getMetadata("__$node-id$__", param.constructor);
  }

  static deserializeCtor(ctor: string) {
    return DataContainer.NODES.find((node) => {
      return Reflect.getMetadata("__$node-id$__", node) === ctor;
    });
  }
}

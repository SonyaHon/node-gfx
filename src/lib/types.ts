import { NodeGFX } from "./node";
import { NodeGFXSocket } from "./socket";

export type NodeCtor = new () => NodeGFX;

export interface IExecutable {
  execute(): Promise<void>;
}

export interface ISerializable<D extends Record<string, unknown>> {
  serialize(): D;
  deserialize(data: D): void;
}

export interface DivWithMetadata extends HTMLDivElement {
  socket?: NodeGFXSocket;
}

export interface ISerializedSocket {
  id: string;
  name: string;
  connections: string[];
}

export type ISerializedNode<C, M extends Record<string, unknown>> = M & {
  ctor: new () => C;
  x: number;
  y: number;
  sockets: {
    input: ISerializedSocket[];
    output: ISerializedSocket[];
  };
};

export interface ISerializedEditor {
  canvasX: number;
  canvasY: number;
}

export interface ISerializedEngine {
  editor: ISerializedEditor;
  engine: {
    nodes: ISerializedNode<unknown, Record<string, unknown>>[];
  };
}

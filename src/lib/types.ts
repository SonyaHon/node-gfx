import { NodeGFX } from "./node";
import { NodeGFXSocket } from "./socket";

export type NodeCtor = new () => NodeGFX;

export interface IExecutable {
  execute(): Promise<void>;
}

export interface DivWithMetadata extends HTMLDivElement {
  socket?: NodeGFXSocket;
}

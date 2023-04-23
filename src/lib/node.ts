import {
  action,
  computed,
  makeObservable,
  observable,
  runInAction,
} from "mobx";
import EventEmitter from "events";
import { v4 as uuid } from "uuid";
import { getEditor, getEngine, getNodeMetadata } from "./utils";
import React from "react";
import type { NodeGFXSocket } from "./socket";
// eslint-disable-next-line no-duplicate-imports
import { SocketMode } from "./socket";
import { NodeGFXException } from "./error";
import { DivWithMetadata, IExecutable } from "./types";
import { DataContainer } from "./container";

export class NodeGFX extends EventEmitter {
  @observable id: string;
  @observable title: string;
  @observable evaluated = false;
  @observable collapsed = false;

  @observable.deep pivotX = 0;
  @observable.deep pivotY = 0;
  @observable.deep draggingOffset = { x: 0, y: 0 };

  @observable.deep customUI: (() => JSX.Element) | null = null;

  @observable.deep inputSockets: NodeGFXSocket[] = [];
  @observable.deep outputSockets: NodeGFXSocket[] = [];

  constructor(id?: string) {
    super();
    this.id = id ?? uuid();
    this.title = getNodeMetadata(this.constructor as unknown as any).title;
    makeObservable(this);
  }

  @action
  setPivot(pivot: { x: number; y: number }) {
    this.pivotX = pivot.x;
    this.pivotY = pivot.y;
    getEngine().touchNodes();
  }

  @action
  setTitle(title: string) {
    this.title = title;
  }

  @action
  toggleCollapsed() {
    this.collapsed = !this.collapsed;
  }

  @computed
  get pivot() {
    return {
      x: this.pivotX,
      y: this.pivotY,
    };
  }

  @action
  startDragging(mouseDownEvent: React.MouseEvent<HTMLDivElement>) {
    const { x, y } = (mouseDownEvent.target as Element).getBoundingClientRect();
    this.draggingOffset = {
      x: mouseDownEvent.clientX - x,
      y: mouseDownEvent.clientY - y,
    };

    const dragCallback = (mouseMoveEvent: MouseEvent) => {
      runInAction(() => {
        this.setPivot({
          x:
            mouseMoveEvent.clientX -
            this.draggingOffset.x -
            getEditor().canvasX,
          y:
            mouseMoveEvent.clientY -
            this.draggingOffset.y -
            getEditor().canvasY,
        });
      });
    };

    window.addEventListener("mousemove", dragCallback);

    window.addEventListener(
      "mouseup",
      () => {
        runInAction(() => {
          this.draggingOffset = { x: 0, y: 0 };
        });
        window.removeEventListener("mousemove", dragCallback);
      },
      { once: true }
    );
  }

  @action
  addSocket(socket: NodeGFXSocket) {
    const target =
      socket.mode === SocketMode.Input ? this.inputSockets : this.outputSockets;
    socket.setRef(this);
    socket.on("connection", (...args) => this.emit("connection", ...args));
    target.push(socket);
  }

  @action
  setCustomUI(ui: () => JSX.Element) {
    this.customUI = ui;
  }

  @action
  getInputSocket(socketName: string): NodeGFXSocket {
    const socket = this.inputSockets.find(
      (socket) => socket.name === socketName
    );
    if (!socket) {
      throw new NodeGFXException(`Socket ${socketName} is not found`);
    }
    return socket;
  }

  @action
  getOutputSocket(socketName: string): NodeGFXSocket {
    const socket = this.outputSockets.find(
      (socket) => socket.name === socketName
    );
    if (!socket) {
      throw new NodeGFXException(`Socket ${socketName} is not found`);
    }
    return socket;
  }

  @action
  startConnectionFrom(startingSocket: NodeGFXSocket) {
    const connection = getEngine().startConnection(startingSocket);
    const dragCallback = (mouseMoveEvent: MouseEvent) => {
      connection.setEndingPivot({
        x: mouseMoveEvent.clientX - getEditor().canvasX,
        y: mouseMoveEvent.clientY - getEditor().canvasY,
      });
    };

    window.addEventListener("mousemove", dragCallback);
    window.addEventListener(
      "mouseup",
      (mouseUpEvent) => {
        window.removeEventListener("mousemove", dragCallback);
        connection.end((mouseUpEvent.target as DivWithMetadata).socket, {
          x: mouseUpEvent.clientX,
          y: mouseUpEvent.clientY,
        });
      },
      { once: true }
    );
  }

  @action
  reset() {
    this.evaluated = false;
    this.inputSockets.forEach((socket) => {
      socket.evaluated = false;
    });
    this.outputSockets.forEach((socket) => {
      socket.evaluated = false;
    });
  }

  @action
  async evaluate() {
    if ("execute" in this) {
      await (this as unknown as IExecutable).execute();
    }
    for (const socket of this.outputSockets) {
      for (const connectedSocket of socket.connections) {
        connectedSocket.evaluated = true;
      }
    }
    this.evaluated = true;
  }

  @computed
  get inputsEvaluated() {
    return this.inputSockets.every((socket) => socket.evaluated);
  }

  @action
  findSuggestedSocket(socket: NodeGFXSocket) {
    const target =
      socket.mode === SocketMode.Input ? this.outputSockets : this.inputSockets;
    return target.find((s) => s.canConnectTo(socket));
  }

  serialize(data: Record<string, any> = {}): Record<string, any> {
    return {
      ctor: DataContainer.serializeCtor(this),
      x: this.pivotX,
      y: this.pivotY,
      sockets: {
        input: this.inputSockets.map((socket) => socket.serialize()),
        output: this.outputSockets.map((socket) => socket.serialize()),
      },
      ...data,
    } as Record<string, any>;
  }

  static deserialize(data: any) {
    const ctor = DataContainer.deserializeCtor(data.ctor);
    if (!ctor) {
      return;
    }

    const node = new ctor();
    runInAction(() => {
      node.setPivot({ x: data.x, y: data.y });
    });
    return node;
  }

  @action
  destroy() {
    getEngine().destroyNode(this);
  }

  @action
  disconnectAll() {
    this.inputSockets.forEach((socket) => socket.disconnect());
    this.outputSockets.forEach((socket) => socket.disconnect());
  }
}

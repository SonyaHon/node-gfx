import EventEmitter from "events";
import {
  action,
  computed,
  makeObservable,
  observable,
  runInAction,
} from "mobx";
import type { NodeGFX } from "./node";
import { NodeGFXException } from "./error";
import { v4 as uuid } from "uuid";
import { getEditor } from "./utils";

export enum SocketMode {
  Input = "input",
  Output = "output",
}

export enum ConnectionStatus {
  Disconnected = "disconnected",
  Connected = "connected",
  Connecting = "connecting",
}

export interface ICreateInputSocketOpts {
  datatype?: string;
}

export interface ICreateOutputSocketOpts {
  datatype?: string;
}

export type OutputSocketGetter = () => unknown;

export class NodeGFXSocket extends EventEmitter {
  private constructor(mode: SocketMode, name: string, datatype?: string) {
    super();
    this.mode = mode;
    this.name = name;
    if (datatype) {
      this.datatype = datatype;
    }
    makeObservable(this);
  }

  @observable evaluated = false;
  @observable id: string = uuid();
  @observable mode: SocketMode;
  @observable connectionStatus: ConnectionStatus =
    ConnectionStatus.Disconnected;

  @observable.deep nodeRef: NodeGFX | null = null;
  @observable name = "";

  @observable.deep connections: NodeGFXSocket[] = [];

  @observable datatype = "*";
  @observable.deep valueGetter: OutputSocketGetter | null = null;

  @observable previewable = false;

  @observable.deep
  pivot: Element | null = null;

  static createInput(name: string, opts: ICreateInputSocketOpts = {}) {
    const sock = new NodeGFXSocket(SocketMode.Input, name, opts.datatype);
    return sock;
  }

  static createOutput(
    name: string,
    getter: OutputSocketGetter,
    opts: ICreateOutputSocketOpts = {}
  ) {
    const sock = new NodeGFXSocket(SocketMode.Output, name, opts.datatype);
    runInAction(() => {
      sock.valueGetter = getter;
    });
    return sock;
  }

  @action
  setRef(node: NodeGFX, id?: string) {
    if (id) {
      this.id = id;
    }
    this.nodeRef = node;
  }

  @action
  fetch<T>(): T {
    if (this.mode !== SocketMode.Input) {
      throw new NodeGFXException("Trying to fetch a non-input socket");
    }

    if (this.connectionStatus !== ConnectionStatus.Connected) {
      throw new NodeGFXException("Trying to fetch not connected socket");
    }

    return this.connections[0].valueGetter?.() as T;
  }

  @action
  connect(socket: NodeGFXSocket) {
    if (!this.canConnectTo(socket)) {
      throw new NodeGFXException("Not connectable sockets");
    }

    if (this.mode === SocketMode.Input) {
      this.disconnect();
    }

    if (socket.mode === SocketMode.Input) {
      socket.disconnect();
    }

    this.connectionStatus = ConnectionStatus.Connected;
    socket.connectionStatus = ConnectionStatus.Connected;

    this.connections.push(socket);
    socket.connections.push(this);

    this.emit("connection", {
      input: this.mode === SocketMode.Input ? this : socket,
      output: this.mode === SocketMode.Input ? socket : this,
    });
  }

  // @TODO: Make sure that the disconnection happens on the other hand
  // @TODO: Make sure "disconnect" event is emitted
  @action
  disconnect(socket?: NodeGFXSocket) {
    if (!socket) {
      const connections = [...this.connections];
      this.connections = [];
      connections.forEach((connection) => {
        connection.disconnect(this);
      });
    } else {
      const connectionsIndex = this.connections.findIndex(
        (connection) => connection === socket
      );
      if (connectionsIndex >= 0) {
        socket.disconnect(this);
        this.connections.splice(connectionsIndex, 1);
        if (this.connections.length === 0) {
          this.connectionStatus = ConnectionStatus.Disconnected;
        }
      }
    }
  }

  @action
  setPivot(element: Element) {
    this.pivot = element;
  }

  @action
  getPivotPoint(): { x: number; y: number } {
    if (!this.pivot) {
      return { x: 0, y: 0 };
    }
    const { x, y, width, height } = this.pivot.getBoundingClientRect();

    return {
      x: x + width / 2 - getEditor().canvasX,
      y: y + height / 2 - getEditor().canvasY,
    };
  }

  @computed
  get node(): NodeGFX {
    if (!this.nodeRef) {
      throw new NodeGFXException(
        "Trying to unwrap a non-initialised socket's node-card"
      );
    }
    return this.nodeRef;
  }

  @action
  canConnectTo(socket: NodeGFXSocket) {
    return (
      this.mode !== socket.mode &&
      (this.datatype === socket.datatype ||
        this.datatype === "*" ||
        socket.datatype === "*")
    );
  }

  serialize() {
    return {
      id: this.id,
      connections: this.connections.map((socket) => socket.id),
    };
  }
}

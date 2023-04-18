import { action, computed, makeObservable, observable } from "mobx";

export enum SocketMode {
  Input = "input",
  Output = "output",
}

export type ISocketOptions =
  | { mode: SocketMode.Output; fn: () => unknown; previewAvailable?: boolean }
  | { mode: SocketMode.Input; transform?: (val: unknown) => unknown };

export class Socket {
  @observable.deep
  connections: Socket[] = [];

  @observable
  previewAvailable: boolean;

  @observable
  mode: SocketMode;

  @observable.deep
  fn: (...args: any) => unknown;

  @observable.deep
  htmlEl: Element | null = null;

  @observable
  ready = false;

  @observable
  node: any = null;

  @observable
  name = "";

  constructor(options: ISocketOptions) {
    this.mode = options.mode;

    this.fn =
      "fn" in options
        ? options.fn
        : options.transform
        ? options.transform
        : (v) => v;

    this.previewAvailable =
      "previewAvailable" in options && options.previewAvailable
        ? options.previewAvailable
        : false;

    makeObservable(this);
  }

  @action
  setNodeAndName(node: any, name: string) {
    this.node = node;
    this.name = name;
  }

  @computed
  get data() {
    if (this.mode !== SocketMode.Input) {
      throw new Error("Trying to unreference a non-input socket");
    }
    if (this.connections.length <= 0) {
      throw new Error("No connected socket");
    }
    return this.fn(this.connections[0].fn());
  }

  @action
  connect(other: Socket) {
    if (this.mode === other.mode) {
      throw new Error("Connecting similar sockets");
    }

    if (this.mode === SocketMode.Input && this.connections.length > 0) {
      this.disconnectAll();
    }

    this.connections.push(other);
    other.connections.push(this);
  }

  @action
  disconnect(other: Socket) {
    const idx = this.connections.findIndex((s) => s === other);
    if (idx >= 0) {
      this.connections.splice(idx, 1);
    }
  }

  @action
  disconnectAll() {
    this.connections.forEach((socket) => {
      socket.disconnect(this);
    });
    this.connections = [];
  }

  @computed
  get clientPos() {
    if (!this.htmlEl) return { x: 0, y: 0 };
    const { x, y, width, height } = this.htmlEl.getBoundingClientRect();
    return { x: x + width / 2, y: y + height / 2 };
  }

  @action
  setHtmlEl(el: Element) {
    this.htmlEl = el;
  }
}

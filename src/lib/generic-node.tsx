import {
  action,
  computed,
  makeObservable,
  observable,
  runInAction,
} from "mobx";
import { Socket, SocketMode } from "./socket";

import { v4 as uuid } from "uuid";
import { NodeComponent } from "./node-component";
// import { Engine } from "./engine";

export class GenericNode {
  @observable
  id: string = uuid();

  @observable
  public x = 0;

  @observable
  public y = 0;

  @observable
  public collapsed = false;

  @observable
  public title: string;

  @observable.deep
  public customComponent: (() => JSX.Element) | null = null;

  @observable.deep
  outputSockets: Record<string, Socket> = {};

  @observable.deep
  inputSockets: Record<string, Socket> = {};

  @observable
  colorClass = "#ffffff";

  @observable
  evaluated = false;

  @observable
  engine!: any;

  @computed
  get allInputsEvaluated() {
    if (Object.values(this.inputSockets).length === 0) return true;
    return Object.values(this.inputSockets).every((socket) => socket.ready);
  }

  private clickOffset = { x: 0, y: 0 };

  constructor(title: string) {
    this.title = title;
    makeObservable(this);
  }

  @action
  clear() {
    this.evaluated = false;
    Object.values(this.inputSockets).forEach((socket) => {
      socket.ready = false;
    });
  }

  @action
  async execute() {
    for (const socket of Object.values(this.outputSockets)) {
      for (const connectedSocket of socket.connections) {
        connectedSocket.ready = true;
      }
    }
  }

  @action
  toggleCollapsed() {
    this.collapsed = !this.collapsed;
  }

  getSocket(mode: SocketMode, name: string) {
    if (mode === SocketMode.Input) {
      return this.inputSockets[name];
    }
    return this.outputSockets[name];
  }

  @action
  setCustomComponent(component: (() => JSX.Element) | null) {
    this.customComponent = component;
  }

  @action
  addOutputSocket(name: string, getterOrSocket: (() => unknown) | Socket) {
    if (getterOrSocket instanceof Socket) {
      this.outputSockets[name] = getterOrSocket;
    } else {
      this.outputSockets[name] = new Socket({
        fn: getterOrSocket,
        mode: SocketMode.Output,
        previewAvailable: true,
      });
    }
  }

  @action
  addInputSocket(
    name: string,
    transformOrSocket: ((v: unknown) => unknown) | Socket
  ) {
    if (transformOrSocket instanceof Socket) {
      this.inputSockets[name] = transformOrSocket;
    } else {
      this.inputSockets[name] = new Socket({
        mode: SocketMode.Input,
        transform: transformOrSocket,
      });
    }
  }

  @action
  move(newX: number, newY: number) {
    this.x = newX;
    this.y = newY;
  }

  startDragging = (e: React.MouseEvent<HTMLDivElement, MouseEvent>): void => {
    const { x, y } = (e.target as Element).getBoundingClientRect();
    this.clickOffset = {
      x: e.clientX - x,
      y: e.clientY - y,
    };

    const clb = (evt: MouseEvent) => {
      runInAction(() => {
        this.move(
          evt.clientX - this.clickOffset.x,
          evt.clientY - this.clickOffset.y
        );
      });
    };

    window.addEventListener(
      "mouseup",
      () => {
        window.removeEventListener("mousemove", clb);
      },
      { once: true }
    );
    window.addEventListener("mousemove", clb);
  };

  @computed
  get color() {
    return this.colorClass;
  }

  @computed
  get reactComponent() {
    return <NodeComponent key={this.id} model={this} />;
  }
}

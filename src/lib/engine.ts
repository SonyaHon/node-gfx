import EventEmitter from "events";
import { singleton } from "tsyringe";
import {
  action,
  computed,
  makeObservable,
  observable,
  runInAction,
} from "mobx";
import { DataContainer } from "./container";
import { getEditor, getNodeMetadata } from "./utils";
import { MenuItem } from "primereact/menuitem";
// import { Point } from "./point";
import { NodeGFX } from "./node";
import type { NodeGFXSocket } from "./socket";
// eslint-disable-next-line no-duplicate-imports
import { ConnectionStatus, SocketMode } from "./socket";

import "./nodes";
import { OngoingConnection } from "./ongoing-connection";

export interface INodeItem extends MenuItem {
  isCategory: boolean;
}

@singleton()
export class NodeGFXEngine extends EventEmitter {
  @observable.deep nodes: NodeGFX[] = [];
  @observable.deep ongoingConnection: OngoingConnection | null = null;

  constructor() {
    super();
    (window as any).$engine = this;
    makeObservable(this);
  }

  @action
  reset() {
    this.nodes = [];
  }

  @action
  async run() {
    this.nodes.forEach((node) => node.reset());
    for (;;) {
      const nodes = this.nodes.filter(
        (node) => node.inputsEvaluated && !node.evaluated
      );

      if (nodes.length === 0) {
        break;
      }

      await Promise.all(
        nodes.map(async (node) => {
          await node.evaluate();
        })
      );
    }
  }

  @action
  createNode(node: NodeGFX, spawnPoint: { x: number; y: number }) {
    const editor = getEditor();
    node.setPivot({
      x: spawnPoint.x - editor.canvasX,
      y: spawnPoint.y - editor.canvasY,
    });
    this.nodes.push(node);
    return node;
  }

  @computed
  get nodeItems(): INodeItem[] {
    const items: INodeItem[] = [];

    DataContainer.NODES.forEach((nodeCtor) => {
      const { title, category } = getNodeMetadata(nodeCtor);
      const item = {
        isCategory: false,
        label: title,
        command: () => {
          const editor = getEditor();
          const node = this.createNode(new nodeCtor(), editor.spawnPoint);

          const acSocket = editor.autoConnectSocket;
          runInAction(() => {
            if (acSocket) {
              const suggestedSocket = node.findSuggestedSocket(acSocket);
              if (suggestedSocket) {
                suggestedSocket.connect(acSocket);
                setTimeout(() => this.touchNodes(), 10);
              }
              editor.autoConnectSocket = null;
            }
          });
        },
      };
      if (category) {
        let categoryItem = items.find((i) => {
          return i.label === category && i.isCategory;
        });
        if (!categoryItem) {
          categoryItem = {
            label: category,
            isCategory: true,
            items: [],
          };
          items.push(categoryItem);
        }
        categoryItem.items?.push(item as any);
      } else {
        items.push(item);
      }
    });

    return items;
  }

  @action
  startConnection(startingSocket: NodeGFXSocket) {
    this.ongoingConnection = new OngoingConnection(startingSocket);
    return this.ongoingConnection;
  }

  @action
  stopConnection() {
    this.ongoingConnection = null;
  }

  @action
  endOngoingConnection() {
    this.ongoingConnection = null;
  }

  @action
  connect(socketA: NodeGFXSocket, socketB: NodeGFXSocket) {
    socketA.connect(socketB);
  }

  @action
  getCurrentConnections(): { points: { x: number; y: number }[] }[] {
    const connections: { points: { x: number; y: number }[] }[] = [];

    const sockets = this.nodes.flatMap((node) => [
      ...node.inputSockets,
      ...node.outputSockets,
    ]);

    const checkedSockets: NodeGFXSocket[] = [];

    for (const socket of sockets) {
      if (
        socket.connectionStatus !== ConnectionStatus.Connected ||
        checkedSockets.includes(socket)
      ) {
        continue;
      }

      socket.connections.forEach((connectedSocket) => {
        if (connectedSocket.mode === SocketMode.Input) {
          checkedSockets.push(connectedSocket);
        }
        connections.push({
          points: [socket.getPivotPoint(), connectedSocket.getPivotPoint()],
        });
      });
      checkedSockets.push(socket);
    }

    return connections;
  }

  @action
  touchNodes() {
    this.nodes = [...this.nodes];
  }

  @action
  serialize() {
    return {
      editor: getEditor().serialize(),
      engine: {
        nodes: this.nodes.map((node) => node.serialize()),
      },
    };
  }

  deserialize(state: string) {
    const data = JSON.parse(state);
    getEditor().deserialize(data.editor);

    console.debug(data.engine.nodes);

    this.nodes = data.engine.nodes.map((data: any) => {
      return NodeGFX.deserialize(data);
    });

    runInAction(() => this.touchNodes());
  }
}

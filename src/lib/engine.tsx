import {
  action,
  computed,
  makeObservable,
  observable,
  runInAction,
} from "mobx";
import { ConnectorLine } from "./connection-line";
import { GenericNode } from "./generic-node";
import { Socket, SocketMode } from "./socket";
import { v4 as uuid } from "uuid";
import { NODES } from "../core";

interface Loc {
  x: number;
  y: number;
}

class Connection {
  constructor(
    public id: string,
    public addedPoints: Loc[],
    public getEnds: () => Loc[]
  ) {}

  points() {
    const [s, e] = this.getEnds();
    return [s, ...this.addedPoints, e];
  }
}

export class Engine {
  static AVAILABLE_NODES: any[] = [];

  @observable.deep
  nodes: GenericNode[] = [];

  @observable.deep
  connections: Connection[] = [];

  @observable.deep
  ongoingConnection: any | null = null;

  constructor() {
    makeObservable(this);
  }

  @action
  async run(sync = true) {
    this.nodes.forEach((node) => node.clear());

    for (;;) {
      const nodesToRun = this.nodes.filter((node) => {
        return node.allInputsEvaluated && !node.evaluated;
      });

      if (nodesToRun.length === 0) {
        break;
      }

      if (sync) {
        for (const node of nodesToRun) {
          await node.execute();
          node.evaluated = true;
        }
      } else {
        await Promise.all(
          nodesToRun.map(async (node) => {
            await node.execute();
            node.evaluated = true;
          })
        );
      }
    }
  }

  @action
  clear() {
    this.nodes = [];
    this.connections = [];
  }

  @action
  async step() {
    const nodesToRun = this.nodes.filter((node) => {
      return node.allInputsEvaluated && !node.evaluated;
    });

    for (const node of nodesToRun) {
      await node.execute();
      node.evaluated = true;
    }
  }

  @action
  addNode(node: GenericNode, x = 0, y = 0) {
    node.engine = this;
    node.move(x, y);
    this.nodes.push(node);
    return node;
  }

  @action
  connect(
    nodeA: GenericNode,
    outputName: string,
    nodeB: GenericNode,
    inputName: string
  ) {
    const socketA = nodeA.getSocket(SocketMode.Output, outputName);
    const socketB = nodeB.getSocket(SocketMode.Input, inputName);

    socketA.connect(socketB);

    this.connections.push(
      new Connection(uuid(), [], () => [socketA.clientPos, socketB.clientPos])
    );
  }

  @action
  startConnection(socket: Socket) {
    this.ongoingConnection = new OngoingConnection(socket, this);
    return this.ongoingConnection;
  }

  @computed
  get ui() {
    return (
      <>
        {this.connections.map((conn) => {
          return <ConnectorLine key={conn.id} points={conn.points()} />;
        })}
        {this.ongoingConnection && (
          <ConnectorLine
            points={[
              this.ongoingConnection.startingSocket.clientPos,
              this.ongoingConnection.endPoint,
            ]}
          />
        )}
        {this.nodes.map((el) => el.reactComponent)}
      </>
    );
  }
}

class OngoingConnection {
  @observable
  engine: Engine;

  @observable
  startingSocket: Socket;

  @observable
  endPoint: { x: number; y: number };

  constructor(socket: Socket, engine: Engine) {
    this.startingSocket = socket;
    this.engine = engine;
    this.endPoint = socket.clientPos;

    makeObservable(this);
  }

  @action
  setEndPoint(x: number, y: number) {
    this.endPoint = { x, y };
  }

  @action
  tryConnect(target: any) {
    console.log(this, target.socket);
    if (target.socket) {
      this.startingSocket.connect(target.socket);
      this.engine.connections.push(
        new Connection(uuid(), [], () => {
          return [this.startingSocket.clientPos, target.socket.clientPos];
        })
      );
    }

    setTimeout(() => {
      runInAction(() => {
        this.engine.ongoingConnection = null;
      });
    }, 0);
  }
}
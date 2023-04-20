import { ConnectionStatus, NodeGFXSocket } from "./socket";
import {
  action,
  computed,
  makeObservable,
  observable,
  runInAction,
} from "mobx";
import { getEditor, getEngine } from "./utils";

export class OngoingConnection {
  @observable.deep startingSocket: NodeGFXSocket;
  @observable.deep endPivot: { x: number; y: number };

  constructor(startingSocket: NodeGFXSocket) {
    this.startingSocket = startingSocket;
    runInAction(() => {
      this.startingSocket.connectionStatus = ConnectionStatus.Connecting;
    });
    this.endPivot = startingSocket.getPivotPoint();

    makeObservable(this);
  }

  @action
  setEndingPivot(point: { x: number; y: number }) {
    this.endPivot = point;
  }

  @action
  end(socket: NodeGFXSocket | undefined, point: { x: number; y: number }) {
    if (!socket) {
      runInAction(() => {
        this.startingSocket.connectionStatus = ConnectionStatus.Disconnected;
        this.startingSocket.disconnect();
        getEngine().endOngoingConnection();
      });

      getEditor().openInlineMenu(this.startingSocket, point);
      return;
    }

    if (this.startingSocket.canConnectTo(socket)) {
      runInAction(() => {
        const engine = getEngine();
        engine.connect(this.startingSocket, socket);
        engine.endOngoingConnection();
      });
    }
  }

  @computed
  get connectionPoints() {
    return [this.startingSocket.getPivotPoint(), this.endPivot];
  }
}

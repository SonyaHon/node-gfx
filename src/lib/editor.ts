import {
  action,
  computed,
  makeObservable,
  observable,
  runInAction,
} from "mobx";
import { singleton } from "tsyringe";
import { getEditor, getEngine } from "./utils";
import { NodeGFXSocket } from "./socket";
// import { Point } from "./point";

@singleton()
export class NodeGFXEditorModel {
  @observable loaded = false;
  @observable.deep spawnPoint = { x: 0, y: 0 };
  @observable autoConnectSocket: NodeGFXSocket | null = null;

  @observable canvasX = 0;
  @observable canvasY = 0;
  @observable canvasWidth = 20000;
  @observable canvasHeight = 20000;

  @observable inlineMenuRef: any = null;

  constructor() {
    this.canvasX = this.canvasWidth / -2;
    this.canvasY = this.canvasHeight / -2;

    makeObservable(this);

    window.addEventListener("mousewheel", (e) => {
      const { deltaX, deltaY } = e as unknown as {
        deltaX: number;
        deltaY: number;
      };

      runInAction(() => {
        if (
          this.canvasX - deltaX < 0 &&
          this.canvasX - deltaX > -(this.canvasWidth - window.innerWidth)
        ) {
          this.canvasX -= deltaX;
        }
        if (
          this.canvasY - deltaY < 0 &&
          this.canvasY - deltaY > -(this.canvasHeight - window.innerHeight)
        ) {
          this.canvasY -= deltaY;
        }
      });
    });
  }

  @action
  async init() {
    this.loaded = true;
  }

  @computed
  get dialActions() {
    return [
      {
        label: "Clear",
        icon: "pi pi-times",
        command: () => {
          getEngine().reset();
        },
      },
      {
        label: "Load",
        icon: "pi pi-file-import",
        command: () => {
          const state = localStorage.getItem("lastState");
          if (!state) {
            console.error("No last state");
            return;
          }

          getEngine().deserialize(state);
        },
      },
      {
        label: "Save",
        icon: "pi pi-save",
        command: () => {
          localStorage.setItem(
            "lastState",
            JSON.stringify(getEngine().serialize())
          );
        },
      },

      {
        label: "Run",
        icon: "pi pi-play",
        command: () => {
          getEngine()
            .run()
            .catch((error) => {
              console.error(error);
            });
        },
      },
    ];
  }

  @action
  setSpawnPoint(clientX: number, clientY: number) {
    this.spawnPoint = { x: clientX, y: clientY };
  }

  @action
  openInlineMenu(socket: NodeGFXSocket, point: { x: number; y: number }) {
    this.spawnPoint = point;
    this.autoConnectSocket = socket;
    this.inlineMenuRef.show({
      stopPropagation: () => undefined,
      preventDefault: () => undefined,
    });
  }

  @action
  setInlineRef(ref: any) {
    this.inlineMenuRef = ref;
  }

  serialize() {
    return {
      canvasX: this.canvasX,
      canvasY: this.canvasY,
    };
  }

  deserialize(data: { canvasX: number; canvasY: number }) {
    runInAction(() => {
      this.canvasX = data.canvasX;
      this.canvasY = data.canvasY;
    });
  }
}

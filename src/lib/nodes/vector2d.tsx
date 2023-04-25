import { NodeGFX } from "../node";
import { node } from "../decorators";
import { makeObservable, observable } from "mobx";
import { NodeGFXSocket, SocketMode } from "../socket";

@node("vector2d", { title: "Vector 2D", category: "Primitive" })
export class Vector2dNode extends NodeGFX {
  @observable x = 0;
  @observable y = 0;

  constructor() {
    super();

    this.addSocket(
      NodeGFXSocket.createOutput(
        "vector2d",
        () => {
          return { x: this.x, y: this.y };
        },
        { datatype: "vector2d" }
      )
    );

    const splitClb = () => {
      this.removeSocket(SocketMode.Output, "vector2d");
      this.removeMenuOption("Split values");
      this.addMenuOption("Join values", () => {
        this.removeSocket(SocketMode.Output, "vector2d.x");
        this.removeSocket(SocketMode.Output, "vector2d.y");
        this.removeMenuOption("Join values");
        this.addMenuOption("Split values", splitClb);
        this.addSocket(
          NodeGFXSocket.createOutput(
            "vector2d",
            () => {
              return { x: this.x, y: this.y };
            },
            { datatype: "vector2d" }
          )
        );
      });
      this.addSocket(
        NodeGFXSocket.createOutput(
          "vector2d.x",
          () => {
            return this.x;
          },
          { datatype: "number" }
        )
      );
      this.addSocket(
        NodeGFXSocket.createOutput(
          "vector2d.y",
          () => {
            return this.y;
          },
          { datatype: "number" }
        )
      );
    };

    this.addMenuOption("Split values", splitClb);

    makeObservable(this);
  }
}

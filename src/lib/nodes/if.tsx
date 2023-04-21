import { NodeGFX } from "../node";
import { node } from "../decorators";
import { NodeGFXSocket } from "../socket";

@node("if", { title: "If", category: "Logic" })
export class IfNode extends NodeGFX {
  constructor() {
    super();
    this.addSocket(
      NodeGFXSocket.createInput("condition", { datatype: "boolean" })
    );
    this.addSocket(NodeGFXSocket.createInput("true branch"));
    this.addSocket(NodeGFXSocket.createInput("false branch"));
    this.addSocket(
      NodeGFXSocket.createOutput("value", () => {
        const condition = this.getInputSocket("condition").fetch<boolean>();
        if (condition) {
          return this.getInputSocket("true branch").fetch();
        } else {
          return this.getInputSocket("false branch").fetch();
        }
      })
    );
  }
}

import { NodeGFX } from "../node";
import { node } from "../decorators";
import { IConnectionEvent, NodeGFXSocket, SocketMode } from "../socket";

@node("connector", { title: "Connector", category: "Utils" })
export class ConnectorNode extends NodeGFX {
  constructor() {
    super();
    this.addSocket(NodeGFXSocket.createInput("input", { datatype: "*" }));
    this.addSocket(
      NodeGFXSocket.createOutput(
        "output",
        () => {
          return this.getInputSocket("input").fetch();
        },
        { datatype: "*" }
      )
    );

    this.on("connection", ({ input, output }: IConnectionEvent) => {
      console.log(input);
      if (input === this.getInputSocket("input")) {
        this.setTitle(output.name);
      }
    });
  }
}

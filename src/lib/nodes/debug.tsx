import { node } from "../decorators";
import { NodeGFX } from "../node";
import { NodeGFXSocket } from "../socket";
import { action, makeObservable, observable } from "mobx";
import { InputText } from "primereact/inputtext";
import { IExecutable, ISerializable } from "../types";

@node("debug", { title: "Debug", category: "Utilities" })
export class DebugNode
  extends NodeGFX
  implements IExecutable, ISerializable<{ prefix: string }>
{
  @observable prefix = "";

  constructor() {
    super();

    this.addSocket(NodeGFXSocket.createInput("value"));
    this.addSocket(
      NodeGFXSocket.createOutput("value", () => {
        return this.getInputSocket("value").fetch();
      })
    );

    this.setCustomUI(() => {
      return (
        <InputText
          id="prefix"
          className="p-inputtext-sm"
          value={this.prefix}
          placeholder="Prefix"
          onChange={(e) => this.setPrefix(e.target.value)}
        />
      );
    });

    makeObservable(this);
  }

  @action
  setPrefix(prefix: string) {
    this.prefix = prefix;
  }

  @action
  async execute() {
    const input = this.getInputSocket("value").fetch();
    console.debug(`${this.prefix || "Debug"}:`, input);
  }

  serialize(): { prefix: string } {
    return {
      prefix: this.prefix,
    };
  }

  @action
  deserialize(data: { prefix: string }): void {
    this.setPrefix(data.prefix);
  }
}

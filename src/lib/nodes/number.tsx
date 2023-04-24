import { node } from "../decorators";
import { NodeGFX } from "../node";
import { action, makeObservable, observable } from "mobx";
import { NodeGFXSocket } from "../socket";
import { InputText } from "primereact/inputtext";
import { ISerializable } from "../types";

@node("number", { title: "Number", category: "Primitive" })
export class NumberNode
  extends NodeGFX
  implements ISerializable<{ value: number }>
{
  @observable value = "0";
  constructor() {
    super();

    this.addSocket(
      NodeGFXSocket.createOutput(
        "value",
        () => {
          return parseFloat(this.value || "0");
        },
        { datatype: "number" }
      )
    );

    this.setCustomUI(() => {
      return (
        <InputText
          id="value"
          className="p-inputtext-sm"
          value={this.value}
          placeholder="Value"
          onChange={(e) => this.setValue(e.target.value)}
        />
      );
    });

    makeObservable(this);
  }

  @action
  setValue(value: string) {
    this.value = value;
  }

  @action
  deserialize(data: { value: number }): void {
    this.setValue(`${data.value}`);
  }

  serialize(): { value: number } {
    return {
      value: parseFloat(this.value || "0"),
    };
  }
}

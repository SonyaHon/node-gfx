import { action, makeObservable, observable, override } from "mobx";
import { GenericNode } from "../lib";
import { Socket, SocketMode } from "../lib/socket";

import { InputText } from "primereact/inputtext";
import { node } from "../lib/decorators";

@node({ title: "Debug", category: "Utilities" })
export class Debug extends GenericNode {
  public static Name = "Debug";

  @observable
  prefix = "";

  constructor() {
    super("Debug");

    this.addInputSocket(
      "value",
      new Socket({
        mode: SocketMode.Input,
      })
    );

    this.setCustomComponent(() => {
      return (
        <div className="p-float-label">
          <InputText
            id="prefix"
            className="p-inputtext-sm"
            value={this.prefix}
            onChange={(e) => this.setPrefix(e.target.value)}
          />
          <label htmlFor="prefix">Prefix</label>
        </div>
      );
    });

    makeObservable(this);
  }

  @action
  setPrefix(prefix: string) {
    this.prefix = prefix;
  }

  @override
  override async execute() {
    const value = this.getSocket(SocketMode.Input, "value").data;
    console.debug(`${this.prefix || "Debug"}:`, value);
  }
}

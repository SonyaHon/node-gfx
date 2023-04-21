import { node } from "../../decorators";
import { NodeGFX } from "../../node";
import { IExecutable } from "../../types";
import { action, makeObservable, observable } from "mobx";
import { NodeGFXSocket } from "../../socket";
import { InputText } from "primereact/inputtext";
import { Checkbox } from "primereact/checkbox";

import "./index.css";

@node("random", { title: "Random number", category: "Primitive" })
export class RandomNumberNode extends NodeGFX implements IExecutable {
  @observable value: number;
  @observable randomEnabled = true;
  @observable rangeFrom = 0;
  @observable rangeTo = 1;

  constructor() {
    super();
    this.value = this.generateRandom();

    this.addSocket(
      NodeGFXSocket.createOutput(
        "number",
        () => {
          return this.value;
        },
        { datatype: "number" }
      )
    );

    this.setCustomUI(() => {
      return (
        <>
          <InputText
            className="p-inputtext-sm w-full gfx-text "
            value={this.value + ""}
            placeholder="Value"
            onChange={(e) => this.setValue(Number(e.target.value || 0))}
          />
          <div className="flex items-center justify-between mt-2">
            <label className="mr-6 block">Random enabled</label>
            <Checkbox
              className="gfx-checkbox mt-2"
              onChange={(e) => this.setRandomEnabled(e.checked || false)}
              checked={this.randomEnabled}
            />
          </div>
          <div className="flex items-center justify-between mt-2 gap-6">
            <InputText
              className="p-inputtext-sm w-full"
              value={this.rangeFrom + ""}
              placeholder="From"
              tooltip="Range start (inclusive)"
              onChange={(e) => this.setRangeFrom(Number(e.target.value || 0))}
            />
            <InputText
              className="p-inputtext-sm w-full"
              value={this.rangeTo + ""}
              placeholder="To"
              tooltip="Range end (not inclusive)"
              onChange={(e) => this.setRangeTo(Number(e.target.value || 0))}
            />
          </div>
        </>
      );
    });

    makeObservable(this);
  }

  @action
  setRandomEnabled(value: boolean) {
    this.randomEnabled = value;
  }

  @action
  setRangeFrom(value: number) {
    this.rangeFrom = value;
  }

  @action
  setRangeTo(value: number) {
    this.rangeTo = value;
  }

  @action
  setValue(data: number) {
    this.value = data;
  }

  private generateRandom() {
    if (this.randomEnabled) {
      return Math.random();
    }
    return this.value;
  }

  @action
  async execute(): Promise<void> {
    this.value = this.generateRandom();
  }
}

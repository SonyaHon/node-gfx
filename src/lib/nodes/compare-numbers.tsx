import { node } from "../decorators";
import { NodeGFX } from "../node";
import { IExecutable } from "../types";
import { action, makeObservable, observable } from "mobx";
import { NodeGFXSocket } from "../socket";
import React, { useEffect, useState } from "react";
import { Dropdown } from "primereact/dropdown";

const ComparingMethods = [
  { label: "Greater than", fn: (a: number, b: number) => a > b },
  { label: "Greater than or equal", fn: (a: number, b: number) => a >= b },
  { label: "Less than", fn: (a: number, b: number) => a < b },
  { label: "Less than or equal", fn: (a: number, b: number) => a <= b },
  { label: "Equal", fn: (a: number, b: number) => a === b },
];

@node("compare-numbers", { title: "Compare", category: "Logic" })
export class CompareNumbersNode extends NodeGFX implements IExecutable {
  @observable result = false;
  @observable comparingMethod = ComparingMethods[0];

  constructor() {
    super();

    this.addSocket(NodeGFXSocket.createInput("a", { datatype: "number" }));
    this.addSocket(NodeGFXSocket.createInput("b", { datatype: "number" }));
    this.addSocket(
      NodeGFXSocket.createOutput(
        "result",
        () => {
          return this.result;
        },
        { datatype: "boolean" }
      )
    );

    this.setCustomUI(() => {
      const [val, setVal] = useState(ComparingMethods[0]);

      useEffect(() => {
        this.setComparingMethod(val);
      }, [val]);

      return (
        <Dropdown
          optionLabel="label"
          value={val}
          options={ComparingMethods}
          onChange={(e) => setVal(e.value)}
          className="p-inputtext-sm w-full"
          placeholder="Compare method"
        />
      );
    });

    makeObservable(this);
  }

  @action
  setComparingMethod(method: (typeof ComparingMethods)[number]) {
    this.comparingMethod = method;
  }

  @action
  async execute(): Promise<void> {
    const a = this.getInputSocket("a").fetch<number>();
    const b = this.getInputSocket("b").fetch<number>();
    this.result = this.comparingMethod.fn(a, b);
  }

  override serialize(data: Record<string, any> = {}) {
    return super.serialize({
      comparingMethod: this.comparingMethod.label,
      ...data,
    });
  }
}

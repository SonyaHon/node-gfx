import { node } from "../decorators";
import { NodeGFX } from "../node";
import { IExecutable, ISerializable } from "../types";
import { action, makeObservable, observable } from "mobx";
import { NodeGFXSocket } from "../socket";
import React, { useEffect, useState } from "react";
import { Dropdown } from "primereact/dropdown";
import { NodeGFXException } from "../error";

const ComparingMethods = [
  {
    label: "Greater than",

    fn: (a: number, b: number) => a > b,
  },
  {
    label: "Greater than or equal",

    fn: (a: number, b: number) => a >= b,
  },
  {
    label: "Less than",

    fn: (a: number, b: number) => a < b,
  },
  {
    label: "Less than or equal",

    fn: (a: number, b: number) => a <= b,
  },
  { label: "Equal", fn: (a: number, b: number) => a === b },
];

@node("compare-numbers", { title: "Compare", category: "Logic" })
export class CompareNumbersNode
  extends NodeGFX
  implements IExecutable, ISerializable<{ method: string }>
{
  @observable result = false;
  @observable comparingMethod = ComparingMethods[0].label;

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
      return (
        <Dropdown
          value={this.comparingMethod}
          options={ComparingMethods.map((el) => el.label)}
          onChange={(e) => this.setComparingMethod(e.value)}
          className="p-inputtext-sm w-full"
          placeholder="Compare method"
        />
      );
    });

    makeObservable(this);
  }

  serialize(): { method: string } {
    return {
      method: this.comparingMethod,
    };
  }

  @action
  deserialize(data: { method: string }): void {
    this.setComparingMethod(data.method);
  }

  @action
  setComparingMethod(method: string) {
    this.comparingMethod = method;
  }

  @action
  async execute(): Promise<void> {
    const a = this.getInputSocket("a").fetch<number>();
    const b = this.getInputSocket("b").fetch<number>();
    const item = ComparingMethods.find(
      (el) => el.label === this.comparingMethod
    );
    if (!item) {
      throw new NodeGFXException("Invalid comparing method");
    }
    this.result = item.fn(a, b);
  }
}

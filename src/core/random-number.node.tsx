import { action, makeObservable, observable, override } from "mobx";
import { GenericNode } from "../lib";

import { Checkbox } from "primereact/checkbox";
import { InputNumber } from "primereact/inputnumber";
import { node } from "../lib/decorators";

export interface IRandomNumberData {
  range?: [number, number];
  random?: boolean;
  currentValue?: number;
}

@node({ title: "Random Number", category: "Math" })
export class RandomNumber extends GenericNode {
  public static Name = "Random number";

  public static Sockets = {
    Out: {
      Value: "value",
    },
  };

  @observable
  public range: [number, number];

  @observable
  public random: boolean;

  @observable
  public currentValue: number;

  constructor(data: IRandomNumberData = {}) {
    super("Random number");

    this.range = data.range || [0, 1];
    this.random = data.random === undefined ? true : data.random;
    this.currentValue =
      data.currentValue === undefined ? this.genRandom() : data.currentValue;

    this.addOutputSocket(RandomNumber.Sockets.Out.Value, () => {
      return this.currentValue;
    });

    this.setCustomComponent(() => {
      return (
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <div className="p-float-label">
              <InputNumber
                id="from"
                className="p-inputtext-sm"
                value={this.range[0]}
                onValueChange={(e) => this.setRange(e.value, this.range[1])}
              />
              <label htmlFor="from">From</label>
            </div>
            <div className="p-float-label">
              <InputNumber
                id="to"
                className="p-inputtext-sm"
                value={this.range[1]}
                onValueChange={(e) => this.setRange(this.range[0], e.value)}
              />
              <label htmlFor="to">To</label>
            </div>
          </div>
          <div
            className="flex items-center justify-between mt-2"
            style={{ color: "var(--surface-500)" }}
          >
            <label htmlFor="israndom" className="mr-2">
              Enable random
            </label>
            <Checkbox
              inputId="israndom"
              value="Enable random"
              onChange={(e) => this.setRandom(e.checked || false)}
              checked={this.random}
            />
          </div>
        </div>
      );
    });

    makeObservable(this);
  }

  @action
  setRandom(val: boolean) {
    this.random = val;
  }

  @action
  setRange(from: number, to: number) {
    this.range = [from, to];
  }

  @action
  generateValue() {
    if (this.random) {
      this.currentValue = this.genRandom();
      return this.currentValue;
    }
    return this.currentValue;
  }

  @override
  override async execute() {
    this.generateValue();
    super.execute();
  }

  genRandom() {
    const rnd = Math.random();
    const distance = Math.abs(this.range[1] - this.range[0]);
    return rnd * distance + this.range[0];
  }
}

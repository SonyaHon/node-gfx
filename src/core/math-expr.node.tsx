import { action, makeObservable, observable, override } from "mobx";
import { GenericNode } from "../lib";
import { node } from "../lib/decorators";
import { Socket, SocketMode } from "../lib/socket";

@node({ title: "Math Expression", category: "Math" })
export class MathExpr extends GenericNode {
  public static Name = "Math expression";

  constructor() {
    super("Math expression");

    this.addInputSocket(
      "$a",
      new Socket({
        mode: SocketMode.Input,
      })
    );

    this.addOutputSocket(
      "value",
      new Socket({
        mode: SocketMode.Output,
        fn: () => this.currentValue,
        previewAvailable: false,
      })
    );

    this.colorClass = "#ff00ff";

    this.setCustomComponent(() => {
      return (
        <div>
          <textarea
            onChange={(e) => this.setExpr(e.target.value)}
            className="bg-slate-500 text-xs text-slate-50 font-mono"
          />
        </div>
      );
    });

    makeObservable(this);
  }

  @observable
  expr = "";

  @action
  setExpr(expr: string) {
    this.expr = expr;
  }

  @observable
  currentValue = 0;

  @override
  override async execute() {
    const input: number = this.getSocket(SocketMode.Input, "$a").data as number;
    const expr = this.expr;
    const fn = function () {
      return eval(expr.replace(/\$(\w)/g, "this.$1"));
    }.bind({ a: input });

    this.currentValue = fn();
    super.execute();
  }
}

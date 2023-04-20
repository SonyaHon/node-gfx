import { observer } from "mobx-react-lite";
import React from "react";
import { NodeGFX } from "../../node";
import { Button } from "primereact/button";

export interface INodeGFXTitleProps {
  node: NodeGFX;
}

export const NodeGFXTitle: React.FC<INodeGFXTitleProps> = observer(
  ({ node }) => {
    return (
      <div
        className="flex items-center justify-between text-sm"
        style={{ minWidth: 100 }}
        onMouseDown={(event) => node.startDragging(event)}
      >
        <span className="mr-4">{node.title}</span>
        <Button text size="small" icon="pi pi-bars" />
      </div>
    );
  }
);

import { observer } from "mobx-react-lite";
import { NodeGFX } from "../../node";
import React from "react";
import { Fieldset } from "primereact/fieldset";
import { NodeGFXTitle } from "./title";

import "./index.css";
import { SocketComponent } from "./socket";

export interface INodeGFXCardProps {
  node: NodeGFX;
}

export const NodeGFXCard: React.FC<INodeGFXCardProps> = observer(({ node }) => {
  return (
    <Fieldset
      className="absolute gfx-fieldset"
      style={{
        left: node.pivot.x,
        top: node.pivot.y,
        minWidth: 120,
      }}
      legend={<NodeGFXTitle node={node} />}
    >
      <div className="flex justify-between select-none gap-5">
        <div className="flex flex-col">
          {node.inputSockets.map((socket) => {
            return (
              <SocketComponent
                disabled={node.collapsed}
                key={socket.id}
                socket={socket}
                node={node}
              />
            );
          })}
        </div>
        <div className="flex flex-col">
          {node.outputSockets.map((socket) => {
            return (
              <SocketComponent
                disabled={node.collapsed}
                key={socket.id}
                socket={socket}
                node={node}
              />
            );
          })}
        </div>
      </div>
      {node.customUI && !node.collapsed && (
        <div className="mt-2">{node.customUI()}</div>
      )}
    </Fieldset>
  );
});

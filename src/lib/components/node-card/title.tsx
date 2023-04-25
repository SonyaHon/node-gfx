import { observer } from "mobx-react-lite";
import React, { useRef } from "react";
import { NodeGFX } from "../../node";
import { Button } from "primereact/button";
import { Menu } from "primereact/menu";

export interface INodeGFXTitleProps {
  node: NodeGFX;
}

export const NodeGFXTitle: React.FC<INodeGFXTitleProps> = observer(
  ({ node }) => {
    const menu = useRef<Menu>(null);
    const items = [
      ...node.customMenuProps,
      {
        label: node.collapsed ? "Expand" : "Collapse",
        icon: "pi " + node.collapsed ? "pi-chevron-up" : "pi-chevron-down",
        command: () => {
          node.toggleCollapsed();
        },
      },
      {
        label: "Delete",
        icon: "pi pi-trash",
        command: () => {
          node.destroy();
        },
      },
    ];

    return (
      <div
        className="flex items-center justify-between text-sm"
        style={{ minWidth: 100 }}
        onMouseDown={(event) => node.startDragging(event)}
      >
        <span className="mr-4">{node.title}</span>
        <Button
          text
          size="small"
          icon="pi pi-bars"
          onClick={(e) => menu.current?.toggle(e)}
        />
        <Menu model={items} popup ref={menu} />
      </div>
    );
  }
);

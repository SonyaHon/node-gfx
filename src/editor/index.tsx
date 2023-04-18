import { observer } from "mobx-react-lite";

import { ContextMenu } from "primereact/contextmenu";
import { SpeedDial } from "primereact/speeddial";

import { useEffect, useState } from "react";
import { Engine } from "../lib/engine";
import "../core";

export const Editor = observer(() => {
  const [engine] = useState(new Engine());
  window.Engine = Engine;
  window.engine = engine;

  const [menuItems, setMenuItems] = useState<any[]>([]);

  useEffect(() => {
    const items: any[] = [];
    Engine.AVAILABLE_NODES.forEach((node) => {
      const { title, category } = Reflect.getMetadata("__$node$__", node);
      const item = {
        isCategory: false,
        label: title,
        command: (evt: any) => {
          const { clientX, clientY } = evt.originalEvent;
          engine.addNode(new node(), clientX, clientY);
        },
      };
      if (category) {
        let categoryItem = items.find((i) => {
          return i.label === category && i.isCategory;
        });
        if (!categoryItem) {
          categoryItem = {
            label: category,
            isCategory: true,
            items: [],
          };
          items.push(categoryItem);
        }
        categoryItem.items.push(item);
      } else {
        items.push(item);
      }
    });

    setMenuItems(items);
  }, []);

  const menu = [
    {
      label: "Add",
      icon: "pi pi-fw pi-plus",
      items: menuItems,
    },
  ];

  const dial = [
    {
      label: "Clear",
      icon: "pi pi-times",
      command: () => {
        engine.clear();
      },
    },
    {
      label: "Load",
      icon: "pi pi-file-import",
      command: () => {
        engine.run();
      },
    },
    {
      label: "Save",
      icon: "pi pi-save",
      command: () => {
        engine.run();
      },
    },

    {
      label: "Run",
      icon: "pi pi-play",
      command: () => {
        engine.run();
      },
    },
  ];

  return (
    <>
      <div className="absolute w-screen h-screen">
        <ContextMenu global model={menu}></ContextMenu>
        <div className="static w-screen h-screen">
          <SpeedDial
            model={dial}
            radius={100}
            type="quarter-circle"
            direction="down-left"
            style={{ top: 20, right: 20 }}
            showIcon="pi pi-bars"
            buttonClassName="p-button-outlined"
            hideIcon="pi pi-times"
          />
        </div>
        {engine.ui}
      </div>
    </>
  );
});

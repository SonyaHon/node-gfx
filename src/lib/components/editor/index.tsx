import { observer } from "mobx-react-lite";
import { useEditor, useEngine } from "../../utils";
import { useEffect, useRef } from "react";
import { SpeedDial } from "primereact/speeddial";
import { ContextMenu } from "primereact/contextmenu";
import { NodeGFXCard } from "../node-card";
import { ConnectionComponent } from "../connection";

import "./index.css";
import { Menu } from "primereact/menu";

export const NodeGFXEditor = observer(() => {
  const editor = useEditor();
  const engine = useEngine();

  const inlineRef = useRef(null);

  useEffect(() => {
    editor.init().catch((error) => {
      console.error(error);
    });
  }, []);

  useEffect(() => {
    editor.setInlineRef(inlineRef.current);
  }, [inlineRef]);

  return (
    <>
      <div className="absolute w-screen h-screen overflow-hidden">
        <div
          className="editor-pattern absolute"
          style={{
            left: editor.canvasX,
            top: editor.canvasY,
            width: editor.canvasWidth,
            height: editor.canvasHeight,
          }}
        >
          {engine.getCurrentConnections().map((connection, index) => {
            return (
              <ConnectionComponent key={index} points={connection.points} />
            );
          })}
          {engine.ongoingConnection && (
            <ConnectionComponent
              ongoing
              points={engine.ongoingConnection.connectionPoints}
            />
          )}
          {engine.nodes.map((node) => {
            return <NodeGFXCard key={node.id} node={node} />;
          })}
        </div>
      </div>
      <div className="static w-screen h-screen">
        <SpeedDial
          model={editor.dialActions}
          radius={100}
          type="quarter-circle"
          direction="down-left"
          style={{ top: 20, right: 20 }}
          showIcon="pi pi-bars"
          hideIcon="pi pi-times"
        />

        <ContextMenu
          ref={inlineRef}
          model={engine.nodeItems}
          style={{ top: editor.spawnPoint.y, left: editor.spawnPoint.x }}
        />

        <ContextMenu
          global
          model={[
            {
              label: "Add",
              icon: "pi pi-plus",
              items: engine.nodeItems,
            },
          ]}
          onShow={(e) => {
            editor.setSpawnPoint(
              (e as unknown as PointerEvent).clientX,
              (e as unknown as PointerEvent).clientY
            );
          }}
        />
      </div>
    </>
  );
});

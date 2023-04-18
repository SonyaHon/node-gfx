import { observer } from "mobx-react-lite";
import { Fieldset } from "primereact/fieldset";
import { Divider } from "primereact/divider";

import { Button } from "primereact/button";

import React, { useCallback, useEffect, useRef } from "react";

import { GenericNode } from "./generic-node";
import { Socket } from "./socket";

export const NodeComponent: React.FC<{ model: GenericNode }> = observer(
  ({ model }) => {
    const Title = () => (
      <div
        className="flex items-center justify-between text-sm"
        style={{ minWidth: 100 }}
        onMouseDown={(e) => model.startDragging(e)}
      >
        <span className="mr-4">{model.title}</span>
        <Button text icon="pi pi-bars" />
      </div>
    );

    const InputSocket: React.FC<{ name: string; socket: Socket }> = ({
      name,
      socket,
    }) => {
      const ref = useRef(null);
      useEffect(() => {
        if (ref.current) {
          (ref.current as any).socket = socket;
          socket.setHtmlEl(ref.current);
        }
      }, [ref]);

      const startConnection = useCallback(() => {
        console.debug("ASJKDNAKJSND");
        const upgoingConnection = model.engine.startConnection(socket);
        const callback = (e: MouseEvent) => {
          upgoingConnection.setEndPoint(e.clientX, e.clientY);
        };
        window.addEventListener("mousemove", callback);
        window.addEventListener(
          "mouseup",
          (e) => {
            window.removeEventListener("mousemove", callback);
            upgoingConnection.tryConnect(e.target);
          },
          { once: true }
        );
      }, [ref]);

      return (
        <div className="relative flex items-center">
          <div
            ref={ref}
            className="absolute w-4 h-4 rounded-full border -left-6 cursor-grab flex justify-center items-center"
            onMouseDown={startConnection}
            style={{
              borderColor: "var(--surface-border)",
              background: "var(--surface-card)",
            }}
          >
            {socket.connections.length > 0 && (
              <div
                className="w-2 h-2 rounded-full"
                style={{ background: "var(--surface-border)" }}
              />
            )}
          </div>
          <div>{name}</div>
        </div>
      );
    };

    const OutputSocket: React.FC<{ name: string; socket: Socket }> = ({
      name,
      socket,
    }) => {
      const ref = useRef(null);
      useEffect(() => {
        if (ref.current) {
          (ref.current as any).socket = socket;
          socket.setHtmlEl(ref.current);
        }
      }, [ref]);

      const startConnection = () => {
        const upgoingConnection = model.engine.startConnection(socket);
        const callback = (e: MouseEvent) => {
          upgoingConnection.setEndPoint(e.clientX, e.clientY);
        };
        window.addEventListener("mousemove", callback);
        window.addEventListener(
          "mouseup",
          (e) => {
            window.removeEventListener("mousemove", callback);
            upgoingConnection.tryConnect(e.target);
          },
          { once: true }
        );
      };

      return (
        <div className="relative flex items-center">
          <div>{name}</div>
          <div
            ref={ref}
            onMouseDown={startConnection}
            className="absolute w-4 h-4 rounded-full border -right-6 flex justify-center items-center cursor-grab"
            style={{
              borderColor: "var(--surface-border)",
              background: "var(--surface-card)",
            }}
          >
            {socket.connections.length > 0 && (
              <div
                className="w-2 h-2 rounded-full"
                style={{ background: "var(--surface-border)" }}
              />
            )}
          </div>
        </div>
      );
    };

    return (
      <Fieldset
        className="absolute"
        style={{
          left: model.x,
          top: model.y,
          minWidth: 120,
        }}
        legend={<Title />}
      >
        <div className="flex justify-between select-none">
          <div className="flex flex-col">
            {Object.entries(model.inputSockets).length > 0 && (
              <>
                {Object.entries(model.inputSockets).map(([name, socket]) => {
                  return <InputSocket key={name} name={name} socket={socket} />;
                })}
              </>
            )}
          </div>
          <div className="flex flex-col">
            {Object.entries(model.outputSockets).length > 0 && (
              <>
                {Object.entries(model.outputSockets).map(([name, socket]) => {
                  return (
                    <OutputSocket key={name} name={name} socket={socket} />
                  );
                })}
              </>
            )}
          </div>
        </div>
        <div>
          {model.customComponent && (
            <>
              <Divider />
              {model.customComponent()}
            </>
          )}
        </div>
      </Fieldset>
    );
  }
);

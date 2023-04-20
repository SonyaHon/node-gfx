import React, { useEffect, useRef } from "react";
import { ConnectionStatus, NodeGFXSocket, SocketMode } from "../../socket";
import { observer } from "mobx-react-lite";
import { NodeGFX } from "../../node";

export const SocketComponent: React.FC<{
  node: NodeGFX;
  socket: NodeGFXSocket;
}> = observer(({ node, socket }) => {
  const ref = useRef(null);
  useEffect(() => {
    if (ref.current) {
      (ref.current as any).socket = socket;
      socket.setPivot(ref.current);
    }
  }, [ref]);

  return (
    <div className="relative flex items-center">
      <div
        ref={ref}
        className={`absolute w-4 h-4 rounded-full border cursor-grab flex justify-center items-center ${
          socket.mode === SocketMode.Input ? "-left-4" : "-right-4"
        }`}
        style={{
          borderColor:
            socket.connectionStatus === ConnectionStatus.Connecting
              ? "white"
              : "var(--surface-border)",
          background: "var(--surface-card)",
        }}
        onMouseDown={() => node.startConnectionFrom(socket)}
      >
        {socket.connectionStatus !== ConnectionStatus.Disconnected && (
          <div
            className="w-2 h-2 rounded-full"
            style={{
              background:
                socket.connectionStatus === ConnectionStatus.Connecting
                  ? "white"
                  : "var(--surface-border)",
            }}
          />
        )}
      </div>

      <div className={socket.mode === SocketMode.Input ? "pl-2" : "pr-2"}>
        {socket.name}
      </div>
    </div>
  );
});

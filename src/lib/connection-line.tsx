import React from "react";

export interface IConnectorLineProps {
  points: { x: number; y: number }[];
}

const buildLine = ([a, b]: { x: number; y: number }[]) => {
  const lx = Math.abs(a.x - b.x);
  const ly = Math.abs(a.y - b.y);

  return (
    `M${a.x} ${a.y} ` +
    `Q${a.x + lx / 4} ${a.y} ${a.x + lx / 2} ${
      a.y + (ly / 2) * Math.sign(b.y - a.y)
    } ` +
    `Q${b.x - lx / 4} ${b.y} ${b.x} ${b.y} ` +
    `M${b.x} ${b.y} ` +
    "Z"
  );
};

export const ConnectorLine: React.FunctionComponent<IConnectorLineProps> = ({
  points,
}) => {
  const pointsSorted = points.sort((a, b) => a.x - b.x);
  const pairs = [];
  for (let i = 0; i < pointsSorted.length - 1; i++) {
    pairs.push([pointsSorted[i], pointsSorted[i + 1]]);
  }

  return (
    <div
      style={{
        top: 0,
        left: 0,
        width: window.innerWidth,
        height: window.innerHeight,
      }}
      className="absolute"
    >
      <svg viewBox={`0 0 ${window.innerWidth} ${window.innerHeight}`}>
        {pairs.map((pair, index) => {
          return (
            <path
              key={index}
              d={buildLine(pair)}
              style={{
                fill: "none",
                stroke: "var(--surface-border)",
                strokeWidth: 4,
              }}
            />
          );
        })}
      </svg>
    </div>
  );
};

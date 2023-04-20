import React from "react";
import { observer } from "mobx-react-lite";
import { getEditor } from "../../utils";
// import { Point } from "../../point";

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

export interface IConnectionComponentProps {
  points: { x: number; y: number }[];
  ongoing?: boolean;
}

export const ConnectionComponent: React.FC<IConnectionComponentProps> =
  observer(({ points, ongoing }) => {
    const pointsSorted = points.sort((a, b) => a.x - b.x);
    const pairs = [];
    for (let i = 0; i < pointsSorted.length - 1; i++) {
      pairs.push([pointsSorted[i], pointsSorted[i + 1]]);
    }
    return (
      <div
        className="absolute"
        style={{
          top: 0,
          left: 0,
          width: getEditor().canvasWidth,
          height: getEditor().canvasHeight,
        }}
      >
        <svg
          viewBox={`0 0 ${getEditor().canvasWidth} ${getEditor().canvasHeight}`}
        >
          {pairs.map((pair, index) => {
            return (
              <path
                key={index}
                d={buildLine(pair)}
                style={{
                  fill: "none",
                  stroke: ongoing ? "white" : "var(--surface-border)",
                  strokeWidth: 4,
                }}
              />
            );
          })}
        </svg>
      </div>
    );
  });

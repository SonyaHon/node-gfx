import React, { useMemo } from "react";
import { observer } from "mobx-react-lite";

const buildLine = ([a, b]: { x: number; y: number }[]) => {
  const lx = Math.abs(a.x - b.x);
  const ly = Math.abs(a.y - b.y);

  const lx4 = Math.floor(lx / 4);
  const lx2 = Math.floor(lx / 2);
  const ly2 = Math.floor(ly / 2);

  return (
    `M${a.x} ${a.y} ` +
    `Q${a.x + lx4} ${a.y} ${a.x + lx2} ${a.y + ly2 * Math.sign(b.y - a.y)} ` +
    `Q${b.x - lx4} ${b.y} ${b.x} ${b.y} ` +
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
    const [left, right] = points.sort((ap, bp) => ap.x - bp.x);

    const svgWidth = right.x - left.x;
    const svgHeight = Math.max(left.y, right.y) - Math.min(left.y, right.y);
    const leftLower = left.y >= right.y;

    const top = Math.min(left.y, right.y);

    const pathd = useMemo(
      () =>
        buildLine([
          { x: 0, y: leftLower ? svgHeight + 16 : 16 },
          { x: svgWidth, y: leftLower ? 16 : svgHeight + 16 },
        ]),
      [svgHeight, svgWidth]
    );

    return (
      <div
        className="absolute"
        style={{
          top: top - 16,
          left: left.x,
          width: svgWidth,
          height: svgHeight + 32,
        }}
      >
        <svg viewBox={`0 0 ${svgWidth} ${svgHeight + 32}`}>
          <path
            d={pathd}
            style={{
              fill: "none",
              stroke: ongoing ? "white" : "var(--surface-border)",
              strokeWidth: 4,
            }}
          />
        </svg>
      </div>
    );
  });

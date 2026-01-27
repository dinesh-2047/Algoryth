"use client";

import { useMemo } from "react";

function isNumber(n) {
  return typeof n === "number" && isFinite(n);
}

function tryParseJSON(text) {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

function ArrayViz({ data }) {
  const arr = Array.isArray(data) ? data : [];
  return (
    <div className="flex flex-wrap gap-2">
      {arr.map((v, i) => (
        <div
          key={i}
          className="inline-flex items-center justify-center rounded-md border border-[#deceb7] bg-white px-3 py-2 text-sm text-[#5d5245] dark:border-[#40364f] dark:bg-[#221d2b] dark:text-[#d7ccbe]"
          title={String(v)}
        >
          {String(v)}
        </div>
      ))}
    </div>
  );
}

function MatrixViz({ data }) {
  const rows = Array.isArray(data) ? data : [];
  return (
    <div className="overflow-auto">
      <table className="border-collapse">
        <tbody>
          {rows.map((row, r) => (
            <tr key={r}>
              {Array.isArray(row)
                ? row.map((cell, c) => (
                    <td
                      key={c}
                      className="border border-[#e0d5c2] px-3 py-1 text-sm dark:border-[#3c3347]"
                    >
                      {String(cell)}
                    </td>
                  ))
                : null}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function GraphViz({ data }) {
  const graph = data || { nodes: [], edges: [] };
  const { nodes = [], edges = [] } = graph;

  // Simple circular layout for nodes
  const layout = useMemo(() => {
    const R = 90; // radius
    const cx = 120;
    const cy = 120;
    const n = nodes.length || 1;
    return nodes.map((node, i) => {
      const angle = (2 * Math.PI * i) / n - Math.PI / 2;
      return {
        id: node.id ?? i,
        label: node.label ?? String(node.id ?? i),
        x: cx + R * Math.cos(angle),
        y: cy + R * Math.sin(angle),
      };
    });
  }, [nodes]);

  const nodeMap = useMemo(() => {
    const m = new Map();
    layout.forEach((p) => m.set(p.id, p));
    return m;
  }, [layout]);

  const width = 240;
  const height = 240;

  return (
    <div className="flex flex-col gap-3">
      <svg width={width} height={height} className="rounded-md bg-white dark:bg-[#221d2b]">
        {/* edges */}
        {edges.map((e, idx) => {
          const from = nodeMap.get(e.from);
          const to = nodeMap.get(e.to);
          if (!from || !to) return null;
          return (
            <g key={idx}>
              <line
                x1={from.x}
                y1={from.y}
                x2={to.x}
                y2={to.y}
                stroke="#a78bfa"
                strokeWidth={2}
              />
            </g>
          );
        })}
        {/* nodes */}
        {layout.map((p) => (
          <g key={p.id}>
            <circle cx={p.x} cy={p.y} r={14} fill="#fbbf24" />
            <text
              x={p.x}
              y={p.y + 4}
              textAnchor="middle"
              fontSize="12"
              className="fill-black"
            >
              {p.label}
            </text>
          </g>
        ))}
      </svg>

      <div className="text-xs text-[#8a7a67] dark:text-[#b5a59c]">
        Nodes: {nodes.length} · Edges: {edges.length}
      </div>
    </div>
  );
}

export default function Visualizer({ data, type = "auto", title }) {
  const resolved = useMemo(() => {
    if (type !== "auto") return { type, data };

    if (Array.isArray(data)) {
      if (Array.isArray(data[0])) return { type: "matrix", data };
      return { type: "array", data };
    }

    if (data && typeof data === "object") {
      if (Array.isArray(data.nodes) && Array.isArray(data.edges)) {
        return { type: "graph", data };
      }
      return { type: "json", data };
    }

    return { type: "json", data };
  }, [data, type]);

  const header = (
    <div className="border-b border-[#e0d5c2] bg-[#f2e3cc] px-4 py-2 text-xs font-semibold dark:border-[#3c3347] dark:bg-[#292331]">
      {title || "Visualization"}
    </div>
  );

  let content = null;
  if (resolved.type === "array") content = <ArrayViz data={resolved.data} />;
  else if (resolved.type === "matrix" || resolved.type === "grid")
    content = <MatrixViz data={resolved.data} />;
  else if (resolved.type === "graph") content = <GraphViz data={resolved.data} />;
  else {
    const text =
      typeof resolved.data === "string"
        ? resolved.data
        : JSON.stringify(resolved.data, null, 2);
    content = (
      <pre className="text-xs leading-5 whitespace-pre-wrap break-words">{text}</pre>
    );
  }

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-2xl border border-[#e0d5c2] bg-[#fff8ed] dark:border-[#3c3347] dark:bg-[#211d27]">
      {header}
      <div className="flex-1 overflow-auto p-4">{content}</div>
    </div>
  );
}

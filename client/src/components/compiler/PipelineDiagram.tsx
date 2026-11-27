import "@xyflow/react/dist/style.css";
import { Position, ReactFlow, type Edge, type Node } from "@xyflow/react";
import { useMemo } from "react";
import { useTheme } from "../../hooks/useTheme";
import type { PhaseReport } from "../../types/compiler.types";

const colors = {
  success: { background: "#dcfce7", color: "#166534", border: "1px solid #16a34a" },
  failed: { background: "#fee2e2", color: "#991b1b", border: "1px solid #dc2626" },
  skipped: { background: "#f1f5f9", color: "#475569", border: "1px dashed #94a3b8" },
} as const;

const SUFFIX = { success: "done", failed: "failed", skipped: "not run" } as const;

export default function PipelineDiagram({ phases }: { phases: PhaseReport[] }) {
  const { theme } = useTheme();

  const graph = useMemo(() => {
    const nodes: Node[] = phases.map((p, i) => ({
      id: p.phase,
      position: { x: 0, y: i * 70 },
      data: { label: `${p.label}: ${SUFFIX[p.status]}` },
      sourcePosition: Position.Bottom,
      targetPosition: Position.Top,
      style: { width: 220, fontSize: 13, ...colors[p.status] },
    }));
    const edges: Edge[] = phases.slice(1).map((p, i) => ({
      id: `e${i}`,
      source: phases[i].phase,
      target: p.phase,
    }));
    return { nodes, edges };
  }, [phases]);

  return (
    <div
      className="h-[26rem] rounded-lg border border-slate-200 dark:border-slate-700"
      aria-label="Compiler pipeline"
    >
      <ReactFlow
        nodes={graph.nodes}
        edges={graph.edges}
        fitView
        colorMode={theme}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={false}
        panOnDrag={false}
        zoomOnScroll={false}
        zoomOnDoubleClick={false}
        preventScrolling={false}
      />
    </div>
  );
}

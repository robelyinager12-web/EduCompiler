import "@xyflow/react/dist/style.css";
import { Background, Controls, Position, ReactFlow, type Edge, type Node } from "@xyflow/react";
import { useMemo } from "react";
import { useTheme } from "../../hooks/useTheme";
import type { Expr, ProgramNode, Stmt } from "../../types/compiler.types";

interface TreeNode {
  label: string;
  children: TreeNode[];
}

const MAX_NODES = 300;
const X_GAP = 170;
const Y_GAP = 80;

const short = (text: string) => (text.length > 22 ? `${text.slice(0, 22)}...` : text);

function toTree(node: ProgramNode | Stmt | Expr): TreeNode {
  switch (node.kind) {
    case "Program":
      return { label: "Program", children: node.body.map(toTree) };
    case "VariableDeclaration":
      return {
        label: `Declare ${node.varType} ${node.name}`,
        children: node.initializer ? [toTree(node.initializer)] : [],
      };
    case "Assignment":
      return { label: `Assign ${node.name}`, children: [toTree(node.value)] };
    case "PrintStatement":
      return { label: "Print", children: [toTree(node.expression)] };
    case "Literal":
      return {
        label: short(`${node.valueType}: ${typeof node.value === "string" ? JSON.stringify(node.value) : node.value}`),
        children: [],
      };
    case "Identifier":
      return { label: `Variable ${node.name}`, children: [] };
    case "Unary":
      return { label: `Unary ${node.operator}`, children: [toTree(node.operand)] };
    case "Binary":
      return { label: `Binary ${node.operator}`, children: [toTree(node.left), toTree(node.right)] };
    case "Grouping":
      return { label: "( group )", children: [toTree(node.expression)] };
  }
}

const countNodes = (t: TreeNode): number => 1 + t.children.reduce((n, c) => n + countNodes(c), 0);

// Leaves get consecutive columns; a parent sits above the middle of its children.
function layout(root: TreeNode): { nodes: Node[]; edges: Edge[] } {
  const nodes: Node[] = [];
  const edges: Edge[] = [];
  let nextLeaf = 0;
  let counter = 0;

  const walk = (tree: TreeNode, depth: number, parentId: string | null): number => {
    const id = `n${counter++}`;
    const childXs = tree.children.map((child) => walk(child, depth + 1, id));
    const x = childXs.length > 0 ? (childXs[0] + childXs[childXs.length - 1]) / 2 : nextLeaf++ * X_GAP;

    nodes.push({
      id,
      position: { x, y: depth * Y_GAP },
      data: { label: tree.label },
      sourcePosition: Position.Bottom,
      targetPosition: Position.Top,
      style: { width: 150, fontSize: 12 },
    });
    if (parentId) edges.push({ id: `e-${parentId}-${id}`, source: parentId, target: id });
    return x;
  };

  walk(root, 0, null);
  return { nodes, edges };
}

export default function AstViewer({ ast }: { ast: ProgramNode }) {
  const { theme } = useTheme();
  const tree = useMemo(() => toTree(ast), [ast]);
  const size = useMemo(() => countNodes(tree), [tree]);
  const graph = useMemo(() => (size <= MAX_NODES ? layout(tree) : null), [tree, size]);

  if (!graph) {
    return (
      <p className="text-sm text-slate-500">
        The tree has {size} nodes, which is too large to draw. Try a shorter program.
      </p>
    );
  }
  if (ast.body.length === 0) {
    return <p className="text-sm text-slate-500">The program is empty, so the tree has only a root.</p>;
  }

  return (
    <div
      className="h-[28rem] rounded-lg border border-slate-200 dark:border-slate-700"
      aria-label="Abstract syntax tree"
    >
      <ReactFlow
        nodes={graph.nodes}
        edges={graph.edges}
        fitView
        minZoom={0.2}
        colorMode={theme}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={false}
      >
        <Background />
        <Controls showInteractive={false} />
      </ReactFlow>
    </div>
  );
}

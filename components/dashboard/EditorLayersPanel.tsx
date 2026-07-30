"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";
import { EDITOR_ID_ATTR } from "@/lib/dom-annotate";

interface LayerNode {
  id: string;
  tag: string;
  label: string;
  children: LayerNode[];
}

function labelFor(el: Element): string {
  const text = el.textContent?.trim().replace(/\s+/g, " ").slice(0, 40) ?? "";
  return text || `<${el.tagName.toLowerCase()}>`;
}

/** Walks the live preview DOM into a tree, skipping unlabeled wrapper elements transparently. */
function buildLayerTree(el: Element): LayerNode[] {
  const nodes: LayerNode[] = [];
  for (const child of Array.from(el.children)) {
    const id = child.getAttribute(EDITOR_ID_ATTR);
    if (id) {
      nodes.push({
        id,
        tag: child.tagName.toLowerCase(),
        label: labelFor(child),
        children: buildLayerTree(child),
      });
    } else {
      nodes.push(...buildLayerTree(child));
    }
  }
  return nodes;
}

/**
 * Layers sidebar for the visual page editor. Built directly from the live
 * preview DOM (via `version`, bumped by the parent on every edit) rather
 * than a separate parsed copy, so it's always in sync with what's on screen.
 */
export function EditorLayersPanel({
  container,
  version,
  selectedId,
  onSelect,
}: {
  container: HTMLElement | null;
  version: number;
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  const tree = useMemo(() => {
    if (!container) return [];
    return buildLayerTree(container);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [container, version]);

  if (tree.length === 0) {
    return <p className="p-4 text-xs text-zinc-500">Belum ada elemen.</p>;
  }

  return (
    <div className="space-y-0.5 p-2">
      {tree.map((node) => (
        <LayerRow key={node.id} node={node} depth={0} selectedId={selectedId} onSelect={onSelect} />
      ))}
    </div>
  );
}

function LayerRow({
  node,
  depth,
  selectedId,
  onSelect,
}: {
  node: LayerNode;
  depth: number;
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  const isSelected = node.id === selectedId;
  return (
    <div>
      <button
        type="button"
        onClick={() => onSelect(node.id)}
        style={{ paddingLeft: `${8 + depth * 14}px` }}
        className={cn(
          "flex w-full items-center gap-1.5 rounded-md py-1 pr-2 text-left text-xs transition-colors",
          isSelected ? "bg-indigo-500/20 text-indigo-200" : "text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200"
        )}
      >
        <span className="shrink-0 font-mono text-[10px] uppercase text-zinc-600">{node.tag}</span>
        <span className="truncate">{node.label}</span>
      </button>
      {node.children.map((child) => (
        <LayerRow key={child.id} node={child} depth={depth + 1} selectedId={selectedId} onSelect={onSelect} />
      ))}
    </div>
  );
}

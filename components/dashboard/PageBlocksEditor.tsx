"use client";

import { useState, useTransition, useRef } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import type { Block } from "@/lib/blocks-types";
import type { BlockType, SiteType } from "@/lib/site-types";
import { createEmptyBlock, BLOCK_TYPE_LABELS } from "@/lib/empty-block";
import { BlockFields } from "@/components/dashboard/blocks/BlockFields";
import { AiGeneratorPanel } from "@/components/dashboard/AiGeneratorPanel";
import { AiBlockGeneratorButton } from "@/components/dashboard/AiBlockGeneratorButton";

interface ProductOption {
  id: string;
  name: string;
}

/** Menghasilkan ringkasan konten singkat dari data block untuk ditampilkan di card header */
function getBlockPreview(block: Block): string {
  switch (block.type) {
    case "hero": {
      const d = block.data;
      const parts: string[] = [];
      if (d.title) parts.push(d.title);
      if (d.subtitle) parts.push(d.subtitle);
      return parts.join(" · ") || "—";
    }
    case "about": {
      const d = block.data;
      const text = d.title ? `${d.title}: ${d.content}` : d.content;
      return text.length > 80 ? text.slice(0, 80) + "…" : text || "—";
    }
    case "banner": {
      const d = block.data;
      return d.image_url ? "📷 Ada gambar" : "Belum ada gambar";
    }
    case "cta": {
      const d = block.data;
      const parts: string[] = [];
      if (d.title) parts.push(d.title);
      if (d.button_text) parts.push(`[${d.button_text}]`);
      return parts.join(" · ") || "—";
    }
    case "contact": {
      const d = block.data;
      const parts: string[] = [];
      if (d.address) parts.push(d.address);
      if (d.phone) parts.push(d.phone);
      return parts.join(" · ") || "—";
    }
    case "product_highlight": {
      const d = block.data;
      return d.headline || (d.product_id ? `Produk dipilih` : "Belum dipilih produk");
    }
    case "featured_products": {
      const d = block.data;
      const jumlah = d.product_ids?.length ?? 0;
      return d.title + (jumlah > 0 ? ` · ${jumlah} produk dipilih` : " · Otomatis");
    }
    case "features": {
      const d = block.data;
      const n = d.items?.length ?? 0;
      return (d.title ? `${d.title} · ` : "") + `${n} fitur`;
    }
    case "faq": {
      const d = block.data;
      const n = d.items?.length ?? 0;
      return (d.title ? `${d.title} · ` : "") + `${n} pertanyaan`;
    }
    case "testimonial": {
      const d = block.data;
      const n = d.items?.length ?? 0;
      return (d.title ? `${d.title} · ` : "") + `${n} testimoni`;
    }
    default:
      return "—";
  }
}

export function PageBlocksEditor({
  pageId,
  storeId,
  storeSlug,
  themeColor,
  templateId,
  whatsappNumber,
  initialBlocks,
  allowedBlocks,
  products,
  siteType,
  pageType,
  pageLabel,
  showAiGenerator = false,
  action,
}: {
  pageId: string;
  storeId: string;
  storeSlug: string;
  themeColor: string;
  templateId: string | null;
  whatsappNumber?: string | null;
  initialBlocks: Block[];
  allowedBlocks: BlockType[];
  products: ProductOption[];
  siteType: SiteType;
  pageType: string;
  pageLabel: string;
  showAiGenerator?: boolean;
  action: (pageId: string, blocks: Block[]) => Promise<void>;
}) {
  const [blocks, setBlocks] = useState<Block[]>(() =>
    [...initialBlocks].sort((a, b) => a.order - b.order)
  );
  const [newType, setNewType] = useState<BlockType>(allowedBlocks[0]);
  const [isPending, startTransition] = useTransition();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Drag & drop state
  const dragIdRef = useRef<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);

  function updateBlockData(id: string, data: Block["data"]) {
    setBlocks((prev) =>
      prev.map((b) => (b.id === id ? ({ ...b, data } as Block) : b))
    );
  }

  function removeBlock(id: string) {
    setBlocks((prev) => prev.filter((b) => b.id !== id));
    if (expandedId === id) setExpandedId(null);
  }

  function moveBlock(id: string, direction: -1 | 1) {
    setBlocks((prev) => {
      const sorted = [...prev].sort((a, b) => a.order - b.order);
      const index = sorted.findIndex((b) => b.id === id);
      const target = index + direction;
      if (target < 0 || target >= sorted.length) return prev;
      const orderA = sorted[index].order;
      sorted[index] = { ...sorted[index], order: sorted[target].order };
      sorted[target] = { ...sorted[target], order: orderA };
      return [...sorted];
    });
  }

  function addBlock() {
    const newBlock = createEmptyBlock(
      newType,
      blocks.length ? Math.max(...blocks.map((b) => b.order)) + 1 : 1
    );
    setBlocks((prev) => [...prev, newBlock]);
    setExpandedId(newBlock.id);
  }

  function handleSave() {
    startTransition(async () => {
      try {
        await action(pageId, blocks);
        toast.success("Halaman disimpan");
      } catch {
        toast.error("Gagal menyimpan halaman");
      }
    });
  }

  // ── Drag & Drop handlers ───────────────────────────────────────
  function handleDragStart(e: React.DragEvent, id: string) {
    dragIdRef.current = id;
    e.dataTransfer.effectAllowed = "move";
    // Firefox requires dataTransfer.setData
    e.dataTransfer.setData("text/plain", id);
  }

  function handleDragOver(e: React.DragEvent, id: string) {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (id !== dragIdRef.current) setDragOverId(id);
  }

  function handleDrop(e: React.DragEvent, targetId: string) {
    e.preventDefault();
    const sourceId = dragIdRef.current;
    if (!sourceId || sourceId === targetId) {
      setDragOverId(null);
      dragIdRef.current = null;
      return;
    }

    setBlocks((prev) => {
      const sorted = [...prev].sort((a, b) => a.order - b.order);
      const sourceIdx = sorted.findIndex((b) => b.id === sourceId);
      const targetIdx = sorted.findIndex((b) => b.id === targetId);
      if (sourceIdx === -1 || targetIdx === -1) return prev;

      // Re-assign orders: move source to target position, shift others
      const updated = [...sorted];
      const [moved] = updated.splice(sourceIdx, 1);
      updated.splice(targetIdx, 0, moved);
      return updated.map((b, i) => ({ ...b, order: i + 1 }));
    });

    setDragOverId(null);
    dragIdRef.current = null;
  }

  function handleDragEnd() {
    setDragOverId(null);
    dragIdRef.current = null;
  }
  // ──────────────────────────────────────────────────────────────

  function handleAiApply(newBlocks: Block[], mode: "replace" | "append") {
    if (mode === "replace") {
      setBlocks(newBlocks);
    } else {
      setBlocks((prev) => {
        const maxOrder = prev.length ? Math.max(...prev.map((b) => b.order)) : 0;
        const shifted = newBlocks.map((b, i) => ({ ...b, order: maxOrder + i + 1 }));
        return [...prev, ...shifted];
      });
    }
  }

  const sorted = [...blocks].sort((a, b) => a.order - b.order);

  return (
    <div className="space-y-4">
      {showAiGenerator && (
        <AiGeneratorPanel
          pageId={pageId}
          siteType={siteType}
          pageType={pageType}
          pageLabel={pageLabel}
          hasExistingBlocks={blocks.length > 0}
          storeSlug={storeSlug}
          themeColor={themeColor}
          templateId={templateId}
          whatsappNumber={whatsappNumber}
          onApply={handleAiApply}
        />
      )}

      {sorted.length === 0 && (
        <p className="text-sm text-muted-foreground">Belum ada blok. Tambahkan di bawah.</p>
      )}

      <div className="space-y-2">
        {sorted.map((block, i) => {
          const isExpanded = expandedId === block.id;
          const isDragOver = dragOverId === block.id;
          const isDragging = dragIdRef.current === block.id;
          const preview = getBlockPreview(block);

          return (
            <div
              key={block.id}
              draggable
              onDragStart={(e) => handleDragStart(e, block.id)}
              onDragOver={(e) => handleDragOver(e, block.id)}
              onDrop={(e) => handleDrop(e, block.id)}
              onDragEnd={handleDragEnd}
              className={[
                "rounded-lg border transition-all duration-150",
                isDragOver
                  ? "border-indigo-400 ring-2 ring-indigo-300/50 bg-indigo-50/50 dark:bg-indigo-950/20"
                  : "border-border bg-card",
                isDragging ? "opacity-40" : "opacity-100",
              ].join(" ")}
            >
              {/* Card Header — selalu terlihat, bisa di-drag dari sini */}
              <div
                className="flex items-center gap-2 px-3 py-2.5 cursor-grab active:cursor-grabbing select-none"
                onClick={() => setExpandedId(isExpanded ? null : block.id)}
              >
                {/* Drag handle icon */}
                <span className="shrink-0 text-muted-foreground/50 hover:text-muted-foreground transition-colors" title="Seret untuk pindah">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor" aria-hidden="true">
                    <circle cx="4" cy="3" r="1.2" /><circle cx="10" cy="3" r="1.2" />
                    <circle cx="4" cy="7" r="1.2" /><circle cx="10" cy="7" r="1.2" />
                    <circle cx="4" cy="11" r="1.2" /><circle cx="10" cy="11" r="1.2" />
                  </svg>
                </span>

                {/* Label + preview */}
                <div className="flex-1 min-w-0">
                  <span className="text-xs font-semibold text-foreground">
                    {BLOCK_TYPE_LABELS[block.type]}
                  </span>
                  <p className="text-xs text-muted-foreground truncate mt-0.5">{preview}</p>
                </div>

                {/* Action buttons */}
                <div
                  className="flex shrink-0 gap-0.5 items-center"
                  onClick={(e) => e.stopPropagation()}
                >
                  {showAiGenerator && (
                    <AiBlockGeneratorButton
                      storeId={storeId}
                      blockType={block.type}
                      onApply={(data) => updateBlockData(block.id, data)}
                    />
                  )}
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                    disabled={i === 0}
                    onClick={() => moveBlock(block.id, -1)}
                    title="Pindah ke atas"
                  >
                    ↑
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                    disabled={i === sorted.length - 1}
                    onClick={() => moveBlock(block.id, 1)}
                    title="Pindah ke bawah"
                  >
                    ↓
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2 text-xs text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                    onClick={() => removeBlock(block.id)}
                  >
                    Hapus
                  </Button>
                  {/* Expand toggle chevron */}
                  <span
                    className={`ml-1 text-muted-foreground transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`}
                    aria-hidden="true"
                  >
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <polyline points="3,5 7,9 11,5" />
                    </svg>
                  </span>
                </div>
              </div>

              {/* Collapsed / Expanded isi form */}
              {isExpanded && (
                <div className="border-t px-3 pb-3 pt-3">
                  <BlockFields
                    block={block}
                    products={products}
                    storeId={storeId}
                    onChange={(data) => updateBlockData(block.id, data)}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="flex flex-wrap items-end gap-2 rounded-lg border border-dashed p-4">
        <div className="space-y-1.5">
          <Label htmlFor="newBlockType">Tambah Blok</Label>
          <select
            id="newBlockType"
            value={newType}
            onChange={(e) => setNewType(e.target.value as BlockType)}
            className="h-8 rounded-lg border border-input bg-transparent px-2.5 text-sm"
          >
            {allowedBlocks.map((type) => (
              <option key={type} value={type}>
                {BLOCK_TYPE_LABELS[type]}
              </option>
            ))}
          </select>
        </div>
        <Button type="button" variant="outline" onClick={addBlock}>
          + Tambah
        </Button>
      </div>

      <Button type="button" onClick={handleSave} disabled={isPending}>
        {isPending ? "Menyimpan..." : "Simpan Halaman"}
      </Button>
    </div>
  );
}

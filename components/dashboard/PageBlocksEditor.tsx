"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import type { Block } from "@/lib/blocks-types";
import type { BlockType } from "@/lib/site-types";
import { createEmptyBlock, BLOCK_TYPE_LABELS } from "@/lib/empty-block";
import { BlockFields } from "@/components/dashboard/blocks/BlockFields";

interface ProductOption {
  id: string;
  name: string;
}

export function PageBlocksEditor({
  pageId,
  initialBlocks,
  allowedBlocks,
  products,
  action,
}: {
  pageId: string;
  initialBlocks: Block[];
  allowedBlocks: BlockType[];
  products: ProductOption[];
  action: (pageId: string, blocks: Block[]) => Promise<void>;
}) {
  const [blocks, setBlocks] = useState<Block[]>(() =>
    [...initialBlocks].sort((a, b) => a.order - b.order)
  );
  const [newType, setNewType] = useState<BlockType>(allowedBlocks[0]);
  const [isPending, startTransition] = useTransition();

  function updateBlockData(id: string, data: Block["data"]) {
    setBlocks((prev) =>
      prev.map((b) => (b.id === id ? ({ ...b, data } as Block) : b))
    );
  }

  function removeBlock(id: string) {
    setBlocks((prev) => prev.filter((b) => b.id !== id));
  }

  function moveBlock(id: string, direction: -1 | 1) {
    setBlocks((prev) => {
      const sorted = [...prev].sort((a, b) => a.order - b.order);
      const index = sorted.findIndex((b) => b.id === id);
      const target = index + direction;
      if (target < 0 || target >= sorted.length) return prev;
      const orderA = sorted[index].order;
      sorted[index].order = sorted[target].order;
      sorted[target].order = orderA;
      return [...sorted];
    });
  }

  function addBlock() {
    setBlocks((prev) => [
      ...prev,
      createEmptyBlock(newType, prev.length ? Math.max(...prev.map((b) => b.order)) + 1 : 1),
    ]);
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

  const sorted = [...blocks].sort((a, b) => a.order - b.order);

  return (
    <div className="space-y-4">
      {sorted.length === 0 && (
        <p className="text-sm text-muted-foreground">Belum ada blok. Tambahkan di bawah.</p>
      )}
      {sorted.map((block, i) => (
        <div key={block.id} className="rounded-lg border p-4">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-sm font-medium">{BLOCK_TYPE_LABELS[block.type]}</span>
            <div className="flex gap-1">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={i === 0}
                onClick={() => moveBlock(block.id, -1)}
              >
                ↑
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={i === sorted.length - 1}
                onClick={() => moveBlock(block.id, 1)}
              >
                ↓
              </Button>
              <Button type="button" variant="ghost" size="sm" onClick={() => removeBlock(block.id)}>
                Hapus
              </Button>
            </div>
          </div>
          <BlockFields
            block={block}
            products={products}
            onChange={(data) => updateBlockData(block.id, data)}
          />
        </div>
      ))}

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

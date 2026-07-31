"use client";

import { useState, useTransition, useRef, useEffect } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  ArrowLeft, Save, LayoutTemplate, Sparkles, Code2,
  Plus, GripVertical, Trash2, Pencil, Check, X,
  ChevronUp, ChevronDown, Wand2
} from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Block } from "@/lib/blocks-types";
import type { BlockType, SiteType } from "@/lib/site-types";
import { SITE_TYPE_CONFIG } from "@/lib/site-types";
import { BLOCK_TYPE_LABELS, createEmptyBlock } from "@/lib/empty-block";
import { BlockRendererClient } from "@/components/storefront/blocks/BlockRendererClient";
import { BlockFields } from "@/components/dashboard/blocks/BlockFields";
import { StylePanel } from "@/components/dashboard/StylePanel";
import { updateAdminPageBlocks } from "@/app/admin/actions";
import { generateSingleBlockAction, generatePageBlocksAction } from "@/app/dashboard/halaman/generate-action";
import { SITE_TYPE_PROMPT_PLACEHOLDERS } from "@/lib/ai-prompt-placeholders";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

interface ProductOption { id: string; name: string; }

interface VisualBuilderProps {
  pageId: string;
  storeId: string;
  storeSlug: string;
  storeName: string;
  siteType: SiteType;
  initialBlocks: Block[];
  allowedBlocks: BlockType[];
  products: ProductOption[];
  whatsappNumber: string | null;
}

// Custom names stored per block id
type BlockNames = Record<string, string>;

export function VisualBuilder({
  pageId, storeId, storeSlug, storeName, siteType,
  initialBlocks, allowedBlocks, products, whatsappNumber,
}: VisualBuilderProps) {
  const [blocks, setBlocks] = useState<Block[]>(() =>
    [...initialBlocks].sort((a, b) => a.order - b.order)
  );
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"prompt" | "edit" | "style" | "code">("prompt");
  const [blockNames, setBlockNames] = useState<BlockNames>({});
  const [isPending, startTransition] = useTransition();

  const [genDialogOpen, setGenDialogOpen] = useState(false);
  const [genPrompt, setGenPrompt] = useState("");
  const [isGeneratingPage, startGeneratingPage] = useTransition();

  function handleGenerateFullPage() {
    if (blocks.length > 0 && !window.confirm(
      "Ini akan mengganti semua section yang ada saat ini dengan hasil generate AI. Lanjutkan?"
    )) {
      return;
    }
    startGeneratingPage(async () => {
      const result = await generatePageBlocksAction(pageId, genPrompt);
      if (!result || !result.ok) {
        toast.error(result?.error || "Gagal menghubungi AI (Server Timeout).");
        return;
      }
      setBlocks(result.blocks);
      setSelectedBlockId(null);
      setGenDialogOpen(false);
      toast.success(`${result.blocks.length} section berhasil di-generate! Publish untuk menyimpan.`);
    });
  }

  const selectedBlock = blocks.find((b) => b.id === selectedBlockId) || null;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function updateBlockData(id: string, data: any, styles?: any) {
    setBlocks((prev) =>
      prev.map((b) => (b.id === id ? { ...b, data, style_overrides: styles ?? b.style_overrides } : b))
    );
  }

  function renameBlock(id: string, name: string) {
    setBlockNames((prev) => ({ ...prev, [id]: name }));
  }

  function moveBlock(id: string, dir: -1 | 1) {
    setBlocks((prev) => {
      const sorted = [...prev].sort((a, b) => a.order - b.order);
      const idx = sorted.findIndex((b) => b.id === id);
      const target = idx + dir;
      if (target < 0 || target >= sorted.length) return prev;
      const orders = sorted.map((b) => b.order);
      sorted[idx].order = orders[target];
      sorted[target].order = orders[idx];
      return [...sorted];
    });
  }

  function deleteBlock(id: string) {
    setBlocks((prev) => prev.filter((b) => b.id !== id));
    if (selectedBlockId === id) setSelectedBlockId(null);
  }

  function handleSave() {
    startTransition(async () => {
      try {
        await updateAdminPageBlocks(pageId, blocks);
        toast.success("Halaman berhasil di-publish!");
      } catch {
        toast.error("Gagal menyimpan halaman.");
      }
    });
  }

  const sorted = [...blocks].sort((a, b) => a.order - b.order);

  function getBlockLabel(block: Block) {
    return blockNames[block.id] || BLOCK_TYPE_LABELS[block.type] || block.type;
  }

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-zinc-950 text-zinc-100 font-sans">
      {/* ─── Top Bar ─── */}
      <header className="flex h-14 shrink-0 items-center justify-between border-b border-zinc-800 bg-zinc-900 px-4 shadow-sm z-20">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/generator-ai"
            className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "text-zinc-400 hover:text-white")}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Kembali
          </Link>
          <div className="h-4 w-px bg-zinc-700" />
          <div className="flex items-center gap-2">
            <span className="font-semibold text-white">{storeName}</span>
            <span className="rounded bg-zinc-800 px-2 py-0.5 text-xs text-zinc-400">Live Editor</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setGenDialogOpen(true)}
            className="border-violet-500/30 bg-violet-500/10 text-violet-300 hover:bg-violet-500/20 hover:text-violet-200"
          >
            <Wand2 className="mr-2 h-4 w-4" />
            {blocks.length > 0 ? "Generate Ulang dengan AI" : "Generate Halaman Penuh AI"}
          </Button>
          <Button
            size="sm"
            onClick={handleSave}
            disabled={isPending}
            className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-900/20"
          >
            <Save className="mr-2 h-4 w-4" />
            {isPending ? "Menyimpan..." : "Publish"}
          </Button>
        </div>
      </header>

      <Dialog open={genDialogOpen} onOpenChange={setGenDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Wand2 className="h-4 w-4 text-violet-500" />
              Generate Halaman Penuh dengan AI
            </DialogTitle>
            <DialogDescription>
              AI akan mengisi seluruh section halaman ini sesuai jenis situs{" "}
              <strong>{SITE_TYPE_CONFIG[siteType].label}</strong>. Hasilnya langsung tampil di
              kanvas sebagai pratinjau — belum tersimpan sampai kamu klik Publish. Setelah itu
              kamu masih bisa edit per section atau generate ulang.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            rows={4}
            placeholder={SITE_TYPE_PROMPT_PLACEHOLDERS[siteType]}
            value={genPrompt}
            onChange={(e) => setGenPrompt(e.target.value)}
            disabled={isGeneratingPage}
            className="resize-none"
          />
          {isGeneratingPage && <Progress value={null} />}
          <DialogFooter>
            <Button
              onClick={handleGenerateFullPage}
              disabled={isGeneratingPage}
              className="bg-violet-600 text-white hover:bg-violet-700"
            >
              {isGeneratingPage ? "Sedang Generate…" : "✨ Generate"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="flex flex-1 overflow-hidden relative">
        {/* ─── Left Sidebar ─── */}
        <aside className="w-64 shrink-0 flex flex-col border-r border-zinc-800 bg-zinc-900 z-10">
          <div className="flex items-center justify-between p-4 border-b border-zinc-800/50">
            <div className="flex items-center gap-2 font-medium text-sm">
              <LayoutTemplate className="h-4 w-4 text-zinc-400" />
              Susunan Blok
            </div>
            <Button
              variant="ghost" size="icon"
              className="h-6 w-6 text-zinc-400 hover:text-white"
              title="Tambah blok baru"
              onClick={() => {
                const nb = createEmptyBlock(allowedBlocks[0], blocks.length + 1);
                setBlocks((prev) => [...prev, nb]);
                setSelectedBlockId(nb.id);
              }}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-0.5 scrollbar-hide">
            {sorted.map((block, idx) => (
              <BlockLayerItem
                key={block.id}
                block={block}
                label={getBlockLabel(block)}
                isSelected={selectedBlockId === block.id}
                isFirst={idx === 0}
                isLast={idx === sorted.length - 1}
                onSelect={() => setSelectedBlockId(block.id)}
                onRename={(name) => renameBlock(block.id, name)}
                onMoveUp={() => moveBlock(block.id, -1)}
                onMoveDown={() => moveBlock(block.id, 1)}
                onDelete={() => deleteBlock(block.id)}
              />
            ))}
            {blocks.length === 0 && (
              <div className="p-4 text-center text-xs text-zinc-500">
                Belum ada blok. Klik + untuk menambah.
              </div>
            )}
          </div>
        </aside>

        {/* ─── Center Canvas ─── */}
        <main
          className="flex-1 relative bg-zinc-950 overflow-hidden"
          onClick={() => setSelectedBlockId(null)}
        >
          <div className="absolute inset-0 overflow-y-auto scrollbar-hide">
            <div className="min-h-full flex flex-col bg-white">
              {sorted.length === 0 && (
                <div className="flex flex-1 flex-col items-center justify-center gap-4 py-24 text-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-100">
                    <Wand2 className="h-7 w-7 text-violet-600" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-zinc-900">Halaman ini masih kosong</p>
                    <p className="text-xs text-zinc-500">
                      Generate seluruh section sekaligus dengan AI, sesuai jenis situs{" "}
                      {SITE_TYPE_CONFIG[siteType].label}.
                    </p>
                  </div>
                  <Button
                    size="sm"
                    onClick={(e) => { e.stopPropagation(); setGenDialogOpen(true); }}
                    className="bg-violet-600 text-white hover:bg-violet-700"
                  >
                    <Wand2 className="mr-2 h-4 w-4" />
                    Generate Halaman Penuh AI
                  </Button>
                </div>
              )}
              {sorted.map((block) => {
                const isSelected = selectedBlockId === block.id;
                return (
                  <div
                    key={block.id}
                    onClick={(e) => { e.stopPropagation(); setSelectedBlockId(block.id); }}
                    className={cn(
                      "relative group cursor-pointer transition-all duration-200",
                      isSelected
                        ? "ring-4 ring-indigo-500/80 ring-inset z-10 shadow-[0_0_20px_rgba(99,102,241,0.3)]"
                        : "hover:ring-2 hover:ring-indigo-300/50 hover:ring-inset"
                    )}
                  >
                    {/* Block label badge */}
                    <div className={cn(
                      "absolute top-2 left-2 px-2 py-1 text-[10px] font-bold uppercase tracking-wider rounded bg-indigo-600 text-white shadow-sm transition-opacity z-20",
                      isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                    )}>
                      {getBlockLabel(block)}
                    </div>

                    {/* Floating toolbar — appears above block when selected */}
                    {isSelected && (
                      <div
                        className="absolute top-2 right-2 flex items-center gap-1 z-30"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          onClick={() => { setActiveTab("prompt"); }}
                          className={cn(
                            "flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-semibold tracking-wide transition-all shadow-sm",
                            activeTab === "prompt"
                              ? "bg-indigo-600 text-white"
                              : "bg-zinc-900/90 text-indigo-300 hover:bg-indigo-600 hover:text-white border border-indigo-500/30"
                          )}
                          title="Edit dengan AI"
                        >
                          <Sparkles className="h-3 w-3" />
                          AI Edit
                        </button>
                        <button
                          onClick={() => { setActiveTab("code"); }}
                          className={cn(
                            "flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-semibold tracking-wide transition-all shadow-sm",
                            activeTab === "code"
                              ? "bg-zinc-700 text-white"
                              : "bg-zinc-900/90 text-zinc-300 hover:bg-zinc-700 hover:text-white border border-zinc-700/30"
                          )}
                          title="Edit JSON"
                        >
                          <Code2 className="h-3 w-3" />
                          Code
                        </button>
                        <button
                          onClick={() => deleteBlock(block.id)}
                          className="flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-semibold tracking-wide bg-zinc-900/90 text-red-400 hover:bg-red-600 hover:text-white border border-red-500/20 transition-all shadow-sm"
                          title="Hapus blok"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    )}

                    <div className="pointer-events-none">
                      <BlockRendererClient
                        blocks={[block]}
                        storeSlug={storeSlug}
                        whatsappNumber={whatsappNumber}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </main>

        {/* ─── Right Panel ─── */}
        {selectedBlock && (
          <aside className="absolute right-6 top-20 w-96 rounded-xl border border-zinc-800/80 bg-zinc-900/95 backdrop-blur-md shadow-2xl flex flex-col max-h-[calc(100vh-8rem)] z-30">
            <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800">
              <div>
                <span className="text-[10px] font-bold tracking-wider text-indigo-400 uppercase block">
                  Section
                </span>
                <span className="text-sm font-semibold text-white">
                  {blockNames[selectedBlock.id] || BLOCK_TYPE_LABELS[selectedBlock.type]}
                </span>
              </div>
              <Button
                variant="ghost" size="icon"
                className="h-8 w-8 text-red-400 hover:text-red-300 hover:bg-red-950/50"
                onClick={() => deleteBlock(selectedBlock.id)}
                title="Hapus blok"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex-1 overflow-hidden flex flex-col">
              {/* Custom Tab Bar */}
              <div className="flex gap-1 px-3 pt-3">
                {(["prompt", "edit", "style", "code"] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={cn(
                      "flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-md text-xs font-semibold transition-all",
                      activeTab === tab
                        ? tab === "prompt"
                          ? "bg-indigo-600 text-white shadow-sm shadow-indigo-900/30"
                          : "bg-zinc-700 text-white shadow-sm"
                        : "bg-zinc-800/50 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200"
                    )}
                  >
                    {tab === "prompt" && <Sparkles className="h-3 w-3" />}
                    {tab === "code" && <Code2 className="h-3 w-3" />}
                    {tab === "prompt" ? "AI" : tab === "edit" ? "Form" : tab === "style" ? "Style" : "JSON"}
                  </button>
                ))}
              </div>

              <div className="flex-1 overflow-y-auto p-4 scrollbar-hide">
                {activeTab === "prompt" && (
                  <AiPromptTab
                    block={selectedBlock}
                    storeId={storeId}
                    onApply={(data) => updateBlockData(selectedBlock.id, data)}
                  />
                )}

                {activeTab === "edit" && (
                  <div className="bg-white rounded-lg p-4 text-zinc-900 shadow-inner">
                    <BlockFields
                      block={selectedBlock}
                      products={products}
                      storeId={storeId}
                      onChange={(data) => updateBlockData(selectedBlock.id, data)}
                    />
                  </div>
                )}

                {activeTab === "style" && (
                  <StylePanel
                    styles={selectedBlock.style_overrides}
                    onChange={(styles) => {
                      updateBlockData(selectedBlock.id, selectedBlock.data, styles);
                    }}
                    storeId={storeId}
                  />
                )}

                {activeTab === "code" && (
                  <>
                    <Textarea
                      className="font-mono text-xs h-72 bg-zinc-950 border-zinc-800 text-zinc-300 resize-none focus-visible:ring-indigo-500"
                      value={JSON.stringify(selectedBlock.data, null, 2)}
                      onChange={(e) => {
                        try {
                          updateBlockData(selectedBlock.id, JSON.parse(e.target.value));
                        } catch { /* allow partial typing */ }
                      }}
                    />
                    <p className="mt-2 text-[10px] text-zinc-500">
                      Edit JSON secara langsung. Preview akan diperbarui otomatis.
                    </p>
                  </>
                )}
              </div>
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}

/* ─── Block Layer Item (Left Sidebar Row) ─── */
function BlockLayerItem({
  label, isSelected, isFirst, isLast,
  onSelect, onRename, onMoveUp, onMoveDown, onDelete,
}: {
  block: Block;
  label: string;
  isSelected: boolean;
  isFirst: boolean;
  isLast: boolean;
  onSelect: () => void;
  onRename: (name: string) => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onDelete: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(label);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing) inputRef.current?.focus();
  }, [editing]);

  function confirmRename() {
    const trimmed = draft.trim();
    if (trimmed) onRename(trimmed);
    setEditing(false);
  }

  function cancelRename() {
    setDraft(label);
    setEditing(false);
  }

  return (
    <div
      className={cn(
        "group relative flex items-center rounded-md px-1.5 py-1 transition-colors",
        isSelected
          ? "bg-indigo-500/20 border border-indigo-500/30"
          : "border border-transparent hover:bg-zinc-800/50"
      )}
    >
      {/* Drag handle */}
      <GripVertical className="h-3 w-3 text-zinc-600 mr-1 shrink-0 cursor-grab" />

      {/* Label / Rename input */}
      {editing ? (
        <div className="flex flex-1 items-center gap-1">
          <input
            ref={inputRef}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") confirmRename();
              if (e.key === "Escape") cancelRename();
            }}
            className="flex-1 bg-zinc-800 border border-indigo-500/50 rounded px-1.5 py-0.5 text-xs text-white outline-none"
          />
          <button onClick={confirmRename} className="text-green-400 hover:text-green-300">
            <Check className="h-3.5 w-3.5" />
          </button>
          <button onClick={cancelRename} className="text-zinc-400 hover:text-zinc-300">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ) : (
        <button
          onClick={onSelect}
          className="flex-1 text-left text-xs truncate text-zinc-300"
        >
          <span className={cn("truncate", isSelected && "text-indigo-200 font-medium")}>
            {label}
          </span>
        </button>
      )}

      {/* Action icons — shown on hover or selected */}
      {!editing && (
        <div className={cn(
          "flex items-center gap-0.5 ml-1 transition-opacity",
          isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-100"
        )}>
          {/* Rename */}
          <button
            onClick={(e) => { e.stopPropagation(); setDraft(label); setEditing(true); }}
            className="p-0.5 rounded text-zinc-400 hover:text-indigo-300 hover:bg-zinc-800"
            title="Ganti nama"
          >
            <Pencil className="h-3 w-3" />
          </button>
          {/* Move up */}
          <button
            onClick={(e) => { e.stopPropagation(); onMoveUp(); }}
            disabled={isFirst}
            className="p-0.5 rounded text-zinc-400 hover:text-white hover:bg-zinc-800 disabled:opacity-20"
            title="Naikan"
          >
            <ChevronUp className="h-3 w-3" />
          </button>
          {/* Move down */}
          <button
            onClick={(e) => { e.stopPropagation(); onMoveDown(); }}
            disabled={isLast}
            className="p-0.5 rounded text-zinc-400 hover:text-white hover:bg-zinc-800 disabled:opacity-20"
            title="Turunkan"
          >
            <ChevronDown className="h-3 w-3" />
          </button>
          {/* Delete */}
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(); }}
            className="p-0.5 rounded text-zinc-400 hover:text-red-400 hover:bg-zinc-800"
            title="Hapus blok"
          >
            <Trash2 className="h-3 w-3" />
          </button>
        </div>
      )}
    </div>
  );
}

/* ─── AI Prompt Tab ─── */
function AiPromptTab({ block, storeId, onApply }: { block: Block; storeId: string; onApply: (data: unknown) => void }) {
  const [prompt, setPrompt] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleGenerate() {
    if (!prompt.trim()) return;
    startTransition(async () => {
      const fullPrompt = `Konteks saat ini: ${JSON.stringify(block.data)}.\nInstruksi Perubahan: ${prompt}`;
      const result = await generateSingleBlockAction(storeId, block.type, fullPrompt);
      if (!result) {
        toast.error("Gagal menghubungi AI (Server Timeout).");
        return;
      }
      if (result.ok) {
        onApply(result.data);
        setPrompt("");
        toast.success("AI berhasil mengubah blok!");
      } else {
        toast.error(result.error);
      }
    });
  }

  return (
    <div className="flex flex-col h-full space-y-4">
      <div className="text-center space-y-2">
        <div className="mx-auto w-12 h-12 rounded-full bg-indigo-500/20 flex items-center justify-center">
          <Sparkles className="h-6 w-6 text-indigo-400" />
        </div>
        <h3 className="text-sm font-medium text-white">Edit elemen dengan AI</h3>
        <p className="text-xs text-zinc-400 leading-relaxed">
          Berikan instruksi dan AI akan langsung mengubah elemen ini.
        </p>
      </div>

      <div className="relative">
        <Textarea
          placeholder="Ubah warna latar jadi gelap, bikin teks lebih dramatis..."
          className="resize-none bg-zinc-950 border-zinc-800 text-sm focus-visible:ring-indigo-500 pb-12"
          rows={4}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleGenerate(); }
          }}
        />
        <div className="absolute bottom-2 right-2">
          <Button
            size="sm"
            onClick={handleGenerate}
            disabled={isPending || !prompt.trim()}
            className="bg-indigo-600 hover:bg-indigo-700 h-8 rounded"
          >
            {isPending ? "Berpikir..." : "Kirim"}
          </Button>
        </div>
      </div>
      {isPending && (
        <Progress
          value={null}
          className="[&_[data-slot=progress-track]]:bg-zinc-800"
        />
      )}
      <p className="text-[10px] text-center text-zinc-500">
        Tekan Enter untuk kirim · Shift+Enter untuk baris baru
      </p>
    </div>
  );
}

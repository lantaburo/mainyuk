"use client";

import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  ArrowLeft, Save, Undo2, Redo2, Monitor, Tablet, Smartphone, Trash2, X, GripVertical,
} from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { TEMPLATE_STYLE, DEFAULT_TEMPLATE, isTemplatePreset } from "@/lib/templates";
import { annotateSelectableElements, getCleanHtml, findById, EDITOR_ID_ATTR } from "@/lib/dom-annotate";
import { EditorLayersPanel } from "@/components/dashboard/EditorLayersPanel";
import { ElementStylePanel, type ElementStyleValues } from "@/components/dashboard/ElementStylePanel";
import { ElementAiEditTab } from "@/components/dashboard/ElementAiEditTab";
import { saveEditedHtmlAction } from "@/lib/ai-actions";

type Tab = "preview" | "design" | "code";
type Device = "desktop" | "tablet" | "mobile";
type RightTab = "teks" | "gaya" | "ai";

const DEVICE_WIDTH: Record<Device, string> = {
  desktop: "w-full",
  tablet: "w-[768px]",
  mobile: "w-[390px]",
};

function rgbToHex(rgb: string): string {
  const match = rgb.match(/[\d.]+/g);
  if (!match || match.length < 3) return "#ffffff";
  const alpha = match[3] !== undefined ? Number(match[3]) : 1;
  if (alpha === 0) return "#ffffff";
  const [r, g, b] = match.map(Number);
  return "#" + [r, g, b].map((x) => Math.round(x).toString(16).padStart(2, "0")).join("");
}

function readStyleValues(el: HTMLElement): ElementStyleValues {
  const cs = getComputedStyle(el);
  return {
    color: rgbToHex(cs.color),
    backgroundColor: rgbToHex(cs.backgroundColor),
    fontSize: Math.round(parseFloat(cs.fontSize) || 16),
    fontWeight: String(cs.fontWeight || "400"),
    textAlign: cs.textAlign === "center" || cs.textAlign === "right" ? cs.textAlign : "left",
    paddingTop: Math.round(parseFloat(cs.paddingTop) || 0),
    paddingBottom: Math.round(parseFloat(cs.paddingBottom) || 0),
    paddingLeft: Math.round(parseFloat(cs.paddingLeft) || 0),
    paddingRight: Math.round(parseFloat(cs.paddingRight) || 0),
    borderRadius: Math.round(parseFloat(cs.borderRadius) || 0),
  };
}

function applyStylePatch(el: HTMLElement, patch: Partial<ElementStyleValues>) {
  if (patch.color !== undefined) el.style.setProperty("color", patch.color);
  if (patch.backgroundColor !== undefined) el.style.setProperty("background-color", patch.backgroundColor);
  if (patch.fontSize !== undefined) el.style.setProperty("font-size", `${patch.fontSize}px`);
  if (patch.fontWeight !== undefined) el.style.setProperty("font-weight", patch.fontWeight);
  if (patch.textAlign !== undefined) el.style.setProperty("text-align", patch.textAlign);
  if (patch.paddingTop !== undefined) el.style.setProperty("padding-top", `${patch.paddingTop}px`);
  if (patch.paddingBottom !== undefined) el.style.setProperty("padding-bottom", `${patch.paddingBottom}px`);
  if (patch.paddingLeft !== undefined) el.style.setProperty("padding-left", `${patch.paddingLeft}px`);
  if (patch.paddingRight !== undefined) el.style.setProperty("padding-right", `${patch.paddingRight}px`);
  if (patch.borderRadius !== undefined) el.style.setProperty("border-radius", `${patch.borderRadius}px`);
}

const DEFAULT_PANEL_POS = { x: -1, y: -1 }; // -1 = use CSS default position (right-6 top-[88px])

export function PageEditor({
  pageId,
  storeId,
  storeSlug,
  storeName,
  themeColor,
  templateId,
  initialHtml,
  backUrl = "/dashboard/ai-generator",
}: {
  pageId: string;
  storeId: string;
  storeSlug: string;
  storeName: string;
  themeColor: string;
  templateId: string | null;
  initialHtml: string;
  backUrl?: string;
}) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const historyRef = useRef<string[]>([initialHtml]);
  const historyIndexRef = useRef(0);
  const isFirstRender = useRef(true);

  const [activeTab, setActiveTab] = useState<Tab>("design");
  const [device, setDevice] = useState<Device>("desktop");
  const [version, setVersion] = useState(0);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [rightTab, setRightTab] = useState<RightTab>("teks");
  const [styleValues, setStyleValues] = useState<ElementStyleValues | null>(null);

  // Draggable panel state
  const [panelPos, setPanelPos] = useState(DEFAULT_PANEL_POS);
  const panelDragRef = useRef<{ startX: number; startY: number; startPanelX: number; startPanelY: number } | null>(null);
  const panelRef = useRef<HTMLElement>(null);
  const [textValue, setTextValue] = useState("");
  const [codeText, setCodeText] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [html, setHtml] = useState(initialHtml);

  // Mount the live DOM once. Never re-render this from React state after —
  // all edits mutate it directly so text/style edits don't fight React
  // reconciliation while the user is actively interacting.
  useEffect(() => {
    if (!canvasRef.current) return;
    canvasRef.current.innerHTML = initialHtml;
    annotateSelectableElements(canvasRef.current);
    setVersion((v) => v + 1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function pushHistory() {
    if (!canvasRef.current) return;
    const html = canvasRef.current.innerHTML;
    const idx = historyIndexRef.current;
    historyRef.current = [...historyRef.current.slice(0, idx + 1), html];
    historyIndexRef.current += 1;
    setHtml(html);
  }

  function restoreFromHistory(idx: number) {
    if (!canvasRef.current) return;
    const html = historyRef.current[idx];
    if (html === undefined) return;
    canvasRef.current.innerHTML = html;
    annotateSelectableElements(canvasRef.current);
    historyIndexRef.current = idx;
    setSelectedId(null);
    setVersion((v) => v + 1);
    setHtml(html);
  }

  function handleUndo() {
    if (historyIndexRef.current > 0) restoreFromHistory(historyIndexRef.current - 1);
  }

  function handleRedo() {
    if (historyIndexRef.current < historyRef.current.length - 1) restoreFromHistory(historyIndexRef.current + 1);
  }

  function handleCanvasClick(e: React.MouseEvent<HTMLDivElement>) {
    const target = e.target as HTMLElement;
    const anchor = target.closest("a");
    if (anchor) e.preventDefault();

    if (activeTab !== "design") return;
    const el = target.closest(`[${EDITOR_ID_ATTR}]`) as HTMLElement | null;
    if (!el) {
      setSelectedId(null);
      return;
    }
    const id = el.getAttribute(EDITOR_ID_ATTR);
    setSelectedId(id);
    setStyleValues(readStyleValues(el));
    setTextValue(el.tagName === "IMG" ? "" : (el.textContent ?? ""));
    setRightTab("teks");
    setPanelPos(DEFAULT_PANEL_POS); // reset to default position on new selection
  }

  function getSelectedElement(): HTMLElement | null {
    if (!canvasRef.current || !selectedId) return null;
    return findById(canvasRef.current, selectedId);
  }

  function handleTextChange(value: string) {
    setTextValue(value);
    const el = getSelectedElement();
    if (el) el.textContent = value;
  }

  function handleTextCommit() {
    pushHistory();
  }

  function handleStylePatch(patch: Partial<ElementStyleValues>) {
    const el = getSelectedElement();
    if (!el) return;
    applyStylePatch(el, patch);
    setStyleValues((prev) => (prev ? { ...prev, ...patch } : prev));
    pushHistory();
  }

  // ── Panel drag handlers ─────────────────────────────────────────────
  const handlePanelPointerDown = useCallback((e: React.PointerEvent) => {
    if (!panelRef.current) return;
    e.preventDefault();
    const rect = panelRef.current.getBoundingClientRect();
    // If panel is still at CSS default pos, calculate its actual rendered position
    const currentX = panelPos.x >= 0 ? panelPos.x : rect.left;
    const currentY = panelPos.y >= 0 ? panelPos.y : rect.top;
    panelDragRef.current = { startX: e.clientX, startY: e.clientY, startPanelX: currentX, startPanelY: currentY };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }, [panelPos]);

  const handlePanelPointerMove = useCallback((e: React.PointerEvent) => {
    if (!panelDragRef.current) return;
    const dx = e.clientX - panelDragRef.current.startX;
    const dy = e.clientY - panelDragRef.current.startY;
    const newX = panelDragRef.current.startPanelX + dx;
    const newY = panelDragRef.current.startPanelY + dy;
    // Clamp within viewport
    const panelW = panelRef.current?.offsetWidth ?? 384;
    const panelH = panelRef.current?.offsetHeight ?? 300;
    setPanelPos({
      x: Math.max(8, Math.min(newX, window.innerWidth - panelW - 8)),
      y: Math.max(8, Math.min(newY, window.innerHeight - panelH - 8)),
    });
  }, []);

  const handlePanelPointerUp = useCallback(() => {
    panelDragRef.current = null;
  }, []);
  // ────────────────────────────────────────────────────────────────────

  function handleAiApply(newOuterHtml: string) {
    const el = getSelectedElement();
    if (!el || !canvasRef.current) return;
    el.outerHTML = newOuterHtml;
    annotateSelectableElements(canvasRef.current);
    setSelectedId(null);
    setVersion((v) => v + 1);
    pushHistory();
  }

  function handleDeleteSelected() {
    const el = getSelectedElement();
    if (!el) return;
    el.remove();
    setSelectedId(null);
    setVersion((v) => v + 1);
    pushHistory();
  }

  function handleTabChange(tab: Tab) {
    if (tab === "code" && canvasRef.current) {
      setCodeText(getCleanHtml(canvasRef.current));
    }
    setActiveTab(tab);
    setSelectedId(null);
  }

  function handleApplyCode() {
    if (!canvasRef.current) return;
    canvasRef.current.innerHTML = codeText;
    annotateSelectableElements(canvasRef.current);
    setVersion((v) => v + 1);
    pushHistory();
    toast.success("Kode diterapkan ke pratinjau.");
  }

  // Debounced auto-save ke server
  useEffect(() => {
    if (isFirstRender.current || html === initialHtml) {
      isFirstRender.current = false;
      return;
    }
    const timer = setTimeout(async () => {
      const res = await saveEditedHtmlAction(storeId, pageId, html);
      if (!res || !res.ok) toast.error(res?.error || "Gagal auto-save");
    }, 1500);
    return () => clearTimeout(timer);
  }, [html, initialHtml, storeId, pageId]);

  function handleSave() {
    if (!canvasRef.current) return;
    const liveHtml = getCleanHtml(canvasRef.current);
    setIsSaving(true);
    saveEditedHtmlAction(storeId, pageId, liveHtml)
      .then((res) => {
        if (!res || !res.ok) {
          toast.error(res?.error || "Gagal menyimpan");
          return;
        }
        toast.success("Halaman berhasil disimpan!");
      })
      .finally(() => setIsSaving(false));
  }

  const templateStyle =
    TEMPLATE_STYLE[templateId && isTemplatePreset(templateId) ? templateId : DEFAULT_TEMPLATE];
  const themeStyle = {
    "--store-primary": themeColor,
    "--store-radius": templateStyle.radius,
    "--store-shadow": templateStyle.shadow,
  } as CSSProperties;

  const selectedElement = getSelectedElement();
  const selectedTag = selectedElement?.tagName.toLowerCase();

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-zinc-950 text-zinc-100 font-sans">
      <header className="flex h-14 shrink-0 items-center justify-between border-b border-zinc-800 bg-zinc-900 px-4 shadow-sm z-20">
        <div className="flex items-center gap-4">
          <Link
            href={backUrl}
            className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "text-zinc-400 hover:text-white")}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Kembali
          </Link>
          <div className="h-4 w-px bg-zinc-700" />
          <span className="font-semibold text-white">{storeName}</span>
          <a
            href={`/${storeSlug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-zinc-500 hover:text-zinc-300"
          >
            Lihat situs ↗
          </a>

          <div className="ml-2 flex rounded-md bg-zinc-800 p-1">
            {(["preview", "design", "code"] as Tab[]).map((tab) => (
              <button
                key={tab}
                onClick={() => handleTabChange(tab)}
                className={cn(
                  "rounded px-3 py-1 text-xs font-medium capitalize transition-colors",
                  activeTab === tab ? "bg-indigo-600 text-white" : "text-zinc-400 hover:text-zinc-200"
                )}
              >
                {tab === "preview" ? "Preview" : tab === "design" ? "Design" : "Code"}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 rounded-md bg-zinc-800 p-1">
            {([
              ["desktop", Monitor],
              ["tablet", Tablet],
              ["mobile", Smartphone],
            ] as [Device, typeof Monitor][]).map(([d, Icon]) => (
              <button
                key={d}
                onClick={() => setDevice(d)}
                className={cn(
                  "rounded p-1.5 transition-colors",
                  device === d ? "bg-zinc-700 text-white" : "text-zinc-500 hover:text-zinc-300"
                )}
                title={d}
              >
                <Icon className="h-3.5 w-3.5" />
              </button>
            ))}
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-400 hover:text-white" onClick={handleUndo} title="Undo">
            <Undo2 className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-400 hover:text-white" onClick={handleRedo} title="Redo">
            <Redo2 className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            onClick={handleSave}
            disabled={isSaving}
            className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-900/20"
          >
            <Save className="mr-2 h-4 w-4" />
            {isSaving ? "Menyimpan..." : "Publish"}
          </Button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden relative">
        {activeTab === "design" && (
          <aside className="w-64 shrink-0 flex flex-col border-r border-zinc-800 bg-zinc-900 z-10 overflow-y-auto">
            <div className="border-b border-zinc-800/50 p-4 text-sm font-medium">Susunan Halaman</div>
            <EditorLayersPanel
              container={canvasRef.current}
              version={version}
              selectedId={selectedId}
              onSelect={(id) => {
                setSelectedId(id);
                const el = canvasRef.current ? findById(canvasRef.current, id) : null;
                if (el) {
                  setStyleValues(readStyleValues(el));
                  setTextValue(el.tagName === "IMG" ? "" : (el.textContent ?? ""));
                  el.scrollIntoView({ behavior: "smooth", block: "center" });
                }
                setRightTab("teks");
              }}
            />
          </aside>
        )}

        <main className="flex-1 relative bg-zinc-950 overflow-hidden">
          <div className="absolute inset-0 overflow-y-auto scrollbar-hide p-6">
            <div className="mx-auto flex gap-4" style={{ maxWidth: activeTab === "code" ? "100%" : undefined }}>
              {activeTab === "code" && (
                <div className="flex w-1/2 flex-col gap-2">
                  <Textarea
                    value={codeText}
                    onChange={(e) => setCodeText(e.target.value)}
                    className="h-[75vh] resize-none bg-zinc-900 border-zinc-800 font-mono text-xs text-zinc-300"
                  />
                  <Button size="sm" onClick={handleApplyCode} className="self-start">
                    Terapkan
                  </Button>
                </div>
              )}

              <div
                className={cn(
                  "bg-white shadow-xl transition-all",
                  activeTab === "code" ? "w-1/2" : cn("mx-auto", DEVICE_WIDTH[device])
                )}
              >
                <div
                  ref={canvasRef}
                  style={themeStyle}
                  onClick={handleCanvasClick}
                  className={cn(activeTab === "design" && "[&_[data-klikweb-id]]:hover:outline [&_[data-klikweb-id]]:hover:outline-1 [&_[data-klikweb-id]]:hover:outline-indigo-300")}
                />
              </div>
            </div>
          </div>
        </main>

        {activeTab === "design" && selectedId && selectedElement && (
          <aside
            ref={panelRef}
            className="w-96 rounded-xl border border-zinc-800/80 bg-zinc-900/95 backdrop-blur-md shadow-2xl flex flex-col z-30"
            style={{
              position: "fixed",
              maxHeight: "calc(100vh - 3rem)",
              ...(panelPos.x >= 0
                ? { left: panelPos.x, top: panelPos.y }
                : { right: 24, top: 88 }), // default: top-right, below header
            }}
          >
            {/* ── Drag handle header ── */}
            <div
              className="flex items-center justify-between px-3 py-2.5 border-b border-zinc-800 cursor-grab active:cursor-grabbing select-none"
              onPointerDown={handlePanelPointerDown}
              onPointerMove={handlePanelPointerMove}
              onPointerUp={handlePanelPointerUp}
              onPointerCancel={handlePanelPointerUp}
              title="Seret untuk memindahkan panel"
            >
              <div className="flex items-center gap-2 min-w-0">
                <GripVertical className="h-4 w-4 shrink-0 text-zinc-600" />
                <div className="min-w-0">
                  <span className="text-[10px] font-bold tracking-wider text-indigo-400 uppercase block">
                    {selectedTag}
                  </span>
                  <span className="text-sm font-semibold text-white">Elemen Terpilih</span>
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0" onPointerDown={(e) => e.stopPropagation()}>
                <Button
                  variant="ghost" size="icon"
                  className="h-8 w-8 text-red-400 hover:text-red-300 hover:bg-red-950/50"
                  onClick={handleDeleteSelected}
                  title="Hapus elemen"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost" size="icon"
                  className="h-8 w-8 text-zinc-400 hover:text-white"
                  onClick={() => setSelectedId(null)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="flex gap-1 px-3 pt-3">
              {(["teks", "gaya", "ai"] as RightTab[]).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setRightTab(tab)}
                  className={cn(
                    "flex-1 rounded-md px-2 py-1.5 text-xs font-semibold capitalize transition-all",
                    rightTab === tab
                      ? "bg-indigo-600 text-white shadow-sm"
                      : "bg-zinc-800/50 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200"
                  )}
                >
                  {tab === "ai" ? "AI" : tab}
                </button>
              ))}
            </div>

            <div className="flex-1 overflow-y-auto p-4 scrollbar-hide">
              {rightTab === "teks" && (
                selectedTag === "img" ? (
                  <p className="text-xs text-zinc-500">Elemen gambar — gunakan tab Gaya untuk mengatur ukuran, atau tab AI untuk mengubahnya.</p>
                ) : (
                  <Textarea
                    rows={5}
                    value={textValue}
                    onChange={(e) => handleTextChange(e.target.value)}
                    onBlur={handleTextCommit}
                    className="resize-none bg-white text-zinc-900 text-sm"
                  />
                )
              )}
              {rightTab === "gaya" && styleValues && (
                <div className="rounded-lg bg-white p-4 text-zinc-900 shadow-inner">
                  <ElementStylePanel values={styleValues} onChange={handleStylePatch} />
                </div>
              )}
              {rightTab === "ai" && selectedElement && (
                <ElementAiEditTab
                  storeId={storeId}
                  currentOuterHtml={selectedElement.outerHTML}
                  onApply={handleAiApply}
                />
              )}
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}

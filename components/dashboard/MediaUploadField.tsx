"use client";

import { useRef, useState, useCallback } from "react";
import { toast } from "sonner";
import { Film, Image as ImageIcon, X, Wand2, RefreshCw } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"];
const ALLOWED_VIDEO_TYPES = ["video/mp4", "video/webm", "video/ogg", "video/quicktime"];
const ALLOWED_TYPES = [...ALLOWED_IMAGE_TYPES, ...ALLOWED_VIDEO_TYPES];

const MAX_IMAGE_MB = 5;
const MAX_VIDEO_MB = 50;

interface MediaUploadFieldProps {
  value?: string;
  defaultValue?: string;
  name?: string;
  onChange?: (url: string) => void;
  label?: string;
  storeId?: string;
}

export function MediaUploadField({ value, defaultValue, name, onChange, label = "Media", storeId }: MediaUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [internalValue, setInternalValue] = useState(defaultValue ?? "");
  const [isDragging, setIsDragging] = useState(false);
  const [progress, setProgress] = useState<number | null>(null);
  const [aiPrompt, setAiPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const isControlled = value !== undefined;
  const displayValue = isControlled ? value : internalValue;
  const isVideo = displayValue?.match(/\.(mp4|webm|ogg|mov)$/i);

  const handleChange = useCallback(
    (newVal: string) => {
      if (!isControlled) setInternalValue(newVal);
      onChange?.(newVal);
    },
    [isControlled, onChange]
  );

  const uploadFile = useCallback(
    (file: File) => {
      const isVid = ALLOWED_VIDEO_TYPES.includes(file.type);
      const isImg = ALLOWED_IMAGE_TYPES.includes(file.type);

      if (!isVid && !isImg) {
        toast.error("Format tidak didukung. Gunakan: JPEG, PNG, WebP, GIF, MP4, WebM, atau OGG.");
        return;
      }
      
      const maxMb = isVid ? MAX_VIDEO_MB : MAX_IMAGE_MB;
      if (file.size > maxMb * 1024 * 1024) {
        toast.error(`Ukuran file maksimal ${maxMb}MB untuk ${isVid ? "video" : "gambar"}.`);
        return;
      }

      setProgress(0);

      const formData = new FormData();
      formData.append("file", file);
      if (storeId) formData.append("storeId", storeId);

      const xhr = new XMLHttpRequest();

      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          setProgress(Math.round((e.loaded / e.total) * 90));
        }
      };

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const { publicUrl } = JSON.parse(xhr.responseText);
            setProgress(null);
            handleChange(publicUrl);
            toast.success("Media berhasil diupload!");
          } catch {
            setProgress(null);
            toast.error("Respons server tidak valid.");
          }
        } else {
          let msg = "Upload gagal.";
          try { msg = JSON.parse(xhr.responseText).error ?? msg; } catch { /* noop */ }
          setProgress(null);
          toast.error(msg);
        }
      };

      xhr.onerror = () => {
        setProgress(null);
        toast.error("Koneksi gagal saat upload.");
      };

      xhr.open("POST", "/api/upload");
      xhr.send(formData);
    },
    [handleChange, storeId]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) uploadFile(file);
    },
    [uploadFile]
  );

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) uploadFile(file);
      e.target.value = "";
    },
    [uploadFile]
  );

  const isUploading = progress !== null;

  return (
    <div className="space-y-2">
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => !isUploading && inputRef.current?.click()}
        className={`relative flex min-h-[120px] cursor-pointer flex-col items-center justify-center overflow-hidden rounded-[var(--store-radius,0.5rem)] border-2 border-dashed transition-colors ${
          isDragging
            ? "border-primary bg-primary/5"
            : "border-border bg-muted/30 hover:border-primary/50 hover:bg-muted/60"
        } ${isUploading ? "pointer-events-none opacity-70" : ""}`}
      >
        {isUploading && (
          <div className="absolute inset-x-0 bottom-0 h-1 bg-muted">
            <div
              className="h-full bg-primary transition-all duration-200"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}

        {displayValue ? (
          <>
            {isVideo ? (
              <video
                src={displayValue}
                className="absolute inset-0 h-full w-full object-cover"
                autoPlay
                muted
                loop
                playsInline
              />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={displayValue}
                alt={label}
                className="absolute inset-0 h-full w-full object-cover"
              />
            )}
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 opacity-0 transition-opacity hover:opacity-100">
              <span className="text-xs font-semibold text-white">Klik untuk ganti</span>
            </div>
          </>
        ) : isUploading ? (
          <div className="flex flex-col items-center gap-2 text-center">
            <div className="h-7 w-7 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <span className="text-xs font-medium text-muted-foreground">
              Mengupload… {progress}%
            </span>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 px-4 py-6 text-center">
            <div className="flex gap-2 text-muted-foreground/50 mb-1">
              <ImageIcon className="h-6 w-6" />
              <Film className="h-6 w-6" />
            </div>
            <p className="text-xs text-muted-foreground">
              <span className="font-semibold text-foreground">Klik</span> atau{" "}
              <span className="font-semibold text-foreground">drag & drop</span>
            </p>
            <p className="text-[10px] text-muted-foreground leading-tight mt-1">
              Gambar: JPG, PNG, WebP (maks {MAX_IMAGE_MB}MB)<br />
              Video: MP4, WebM (maks {MAX_VIDEO_MB}MB)
            </p>
          </div>
        )}
      </div>

      <Tabs defaultValue="upload" className="w-full">
        <TabsList className="grid w-full grid-cols-2 h-7 p-0.5 mb-1.5 bg-muted/50">
          <TabsTrigger value="upload" className="text-[10px] h-6 px-2">Upload / URL</TabsTrigger>
          <TabsTrigger value="ai" className="text-[10px] h-6 px-2">
            <Wand2 className="w-3 h-3 mr-1" /> AI Image
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="mt-0">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={displayValue}
              onChange={(e) => handleChange(e.target.value)}
              placeholder="Atau paste URL media langsung…"
              className="h-8 flex-1 rounded-md border border-input bg-transparent px-3 text-xs text-muted-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-ring"
            />
            {displayValue && (
              <button
                type="button"
                onClick={() => handleChange("")}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-input text-muted-foreground transition-colors hover:bg-destructive hover:text-white"
                title="Hapus media"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </TabsContent>

        <TabsContent value="ai" className="mt-0">
          <div className="flex gap-2">
            <input
              type="text"
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  if (aiPrompt.trim()) {
                    setIsGenerating(true);
                    handleChange(`https://image.pollinations.ai/prompt/${encodeURIComponent(aiPrompt.trim())}?nologo=true&seed=${Math.floor(Math.random() * 100000)}&width=1080&height=720`);
                    setTimeout(() => setIsGenerating(false), 500); // Simulate brief loading
                  }
                }
              }}
              placeholder="Ketik prompt gambar (Bhs Inggris disarankan)..."
              className="h-8 flex-1 rounded-md border border-input bg-transparent px-3 text-[11px] text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-ring"
            />
            <Button
              type="button"
              size="sm"
              disabled={!aiPrompt.trim() || isGenerating}
              onClick={() => {
                setIsGenerating(true);
                handleChange(`https://image.pollinations.ai/prompt/${encodeURIComponent(aiPrompt.trim())}?nologo=true&seed=${Math.floor(Math.random() * 100000)}&width=1080&height=720`);
                setTimeout(() => setIsGenerating(false), 500); // Pollinations handles rendering synchronously via URL
              }}
              className="h-8 shrink-0 px-3 bg-indigo-600 text-white hover:bg-indigo-700"
            >
              {isGenerating ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : "Generate"}
            </Button>
          </div>
          <p className="text-[9px] text-muted-foreground mt-1.5 leading-tight">
            *Ditenagai oleh Pollinations AI. Gambar akan langsung dirender saat Anda menekan Generate.
          </p>
        </TabsContent>
      </Tabs>

      <input
        ref={inputRef}
        type="file"
        accept={ALLOWED_TYPES.join(",")}
        className="hidden"
        onChange={handleFileChange}
      />
      {name && <input type="hidden" name={name} value={displayValue} />}
    </div>
  );
}

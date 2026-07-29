"use client";

import { useRef, useState, useCallback } from "react";
import { toast } from "sonner";

const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"];
const MAX_MB = 5;

interface ImageUploadFieldProps {
  /** Current image URL (controlled) */
  value?: string;
  /** Initial image URL (uncontrolled) */
  defaultValue?: string;
  /** Field name for HTML forms */
  name?: string;
  /** Called with new public URL after upload, or "" when cleared */
  onChange?: (url: string) => void;
  /** Optional label suffix */
  label?: string;
}

export function ImageUploadField({ value, defaultValue, name, onChange, label = "Gambar" }: ImageUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [internalValue, setInternalValue] = useState(defaultValue ?? "");
  const [isDragging, setIsDragging] = useState(false);
  const [progress, setProgress] = useState<number | null>(null);

  const isControlled = value !== undefined;
  const displayValue = isControlled ? value : internalValue;

  const handleChange = useCallback(
    (newVal: string) => {
      if (!isControlled) setInternalValue(newVal);
      onChange?.(newVal);
    },
    [isControlled, onChange]
  );

  const uploadFile = useCallback(
    async (file: File) => {
      // Client-side validation
      if (!ALLOWED_TYPES.includes(file.type)) {
        toast.error("Format tidak didukung. Gunakan: JPEG, PNG, WebP, atau GIF.");
        return;
      }
      if (file.size > MAX_MB * 1024 * 1024) {
        toast.error(`Ukuran file maksimal ${MAX_MB}MB.`);
        return;
      }

      setProgress(0);

      // 1. Get presigned URL from server
      let uploadUrl: string;
      let publicUrl: string;
      try {
        const res = await fetch("/api/upload/presign", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            filename: file.name,
            contentType: file.type,
            size: file.size,
          }),
        });

        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error ?? "Gagal mendapatkan upload URL.");
        }

        ({ uploadUrl, publicUrl } = await res.json());
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Upload gagal.");
        setProgress(null);
        return;
      }

      // 2. Upload directly to R2 via XHR (supports progress)
      try {
        await new Promise<void>((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          xhr.upload.onprogress = (e) => {
            if (e.lengthComputable) {
              setProgress(Math.round((e.loaded / e.total) * 100));
            }
          };
          xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) {
              resolve();
            } else {
              reject(new Error(`Upload gagal (status ${xhr.status}).`));
            }
          };
          xhr.onerror = () => reject(new Error("Koneksi gagal saat upload."));
          xhr.open("PUT", uploadUrl);
          xhr.setRequestHeader("Content-Type", file.type);
          xhr.send(file);
        });
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Upload gagal.");
        setProgress(null);
        return;
      }

      setProgress(null);
      handleChange(publicUrl);
      toast.success("Gambar berhasil diupload!");
    },
    [handleChange]
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
      // Reset input so same file can be re-selected
      e.target.value = "";
    },
    [uploadFile]
  );

  const isUploading = progress !== null;

  return (
    <div className="space-y-2">
      {/* Preview / Drop zone */}
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
        {/* Progress bar */}
        {isUploading && (
          <div className="absolute inset-x-0 bottom-0 h-1 bg-muted">
            <div
              className="h-full bg-primary transition-all duration-200"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}

        {displayValue ? (
          /* Image preview */
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={displayValue}
              alt={label}
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 opacity-0 transition-opacity hover:opacity-100">
              <span className="text-xs font-semibold text-white">Klik untuk ganti</span>
            </div>
          </>
        ) : isUploading ? (
          /* Uploading state */
          <div className="flex flex-col items-center gap-2 text-center">
            <div className="h-7 w-7 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <span className="text-xs font-medium text-muted-foreground">
              Mengupload… {progress}%
            </span>
          </div>
        ) : (
          /* Empty state */
          <div className="flex flex-col items-center gap-2 px-4 py-6 text-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8 text-muted-foreground/50"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
              />
            </svg>
            <p className="text-xs text-muted-foreground">
              <span className="font-semibold text-foreground">Klik untuk upload</span> atau{" "}
              <span className="font-semibold text-foreground">drag & drop</span>
            </p>
            <p className="text-[10px] text-muted-foreground">
              PNG, JPG, WebP, GIF · maks. {MAX_MB}MB
            </p>
          </div>
        )}
      </div>

      {/* URL input + clear button */}
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={displayValue}
          onChange={(e) => handleChange(e.target.value)}
          placeholder="Atau paste URL gambar langsung…"
          className="h-8 flex-1 rounded-md border border-input bg-transparent px-3 text-xs text-muted-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-ring"
        />
        {displayValue && (
          <button
            type="button"
            onClick={() => handleChange("")}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-input text-muted-foreground transition-colors hover:bg-destructive hover:text-white"
            title="Hapus gambar"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Hidden file input */}
      <input
        ref={inputRef}
        type="file"
        accept={ALLOWED_TYPES.join(",")}
        className="hidden"
        onChange={handleFileChange}
      />
      {/* Hidden input for HTML form submission if name is provided */}
      {name && <input type="hidden" name={name} value={displayValue} />}
    </div>
  );
}

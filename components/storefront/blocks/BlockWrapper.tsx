import type { BlockStyleOverrides } from "@/lib/blocks-types";
import { cn } from "@/lib/utils";

interface BlockWrapperProps {
  styles?: BlockStyleOverrides;
  children: React.ReactNode;
}

export function BlockWrapper({ styles, children }: BlockWrapperProps) {
  if (!styles) return <>{children}</>;

  const hasAnimation = styles.animation && styles.animation !== "none";

  return (
    <div
      className={cn(
        "relative w-full sf-style-wrapper",
        hasAnimation && `animate-${styles.animation}`
      )}
      style={{
        // Colors
        ...(styles.bg_color ? { backgroundColor: styles.bg_color } : {}),
        ...(styles.text_color ? { color: styles.text_color } : {}),
        
        // Typography
        ...(styles.font_family ? { fontFamily: styles.font_family } : {}),
        ...(styles.font_style === "italic" ? { fontStyle: "italic" } : {}),
        ...(styles.font_style === "bold" ? { fontWeight: "bold" } : {}),
        ...(styles.font_style === "bold-italic" ? { fontWeight: "bold", fontStyle: "italic" } : {}),
        
        // Spacing
        ...(styles.padding_top !== undefined ? { paddingTop: `${styles.padding_top}px` } : {}),
        ...(styles.padding_bottom !== undefined ? { paddingBottom: `${styles.padding_bottom}px` } : {}),
        ...(styles.padding_x !== undefined ? { paddingLeft: `${styles.padding_x}px`, paddingRight: `${styles.padding_x}px` } : {}),
        
        // Alignment
        ...(styles.text_align ? { textAlign: styles.text_align } : {}),

        // Custom properties for inner elements to inherit if they want
        "--sf-btn-bg": styles.btn_color,
        "--sf-btn-text": styles.btn_text_color,
        animationDelay: styles.animation_delay ? `${styles.animation_delay}ms` : undefined,
      } as React.CSSProperties}
    >
      {/* Background Video */}
      {styles.bg_video_url && (
        <video
          src={styles.bg_video_url}
          className="absolute inset-0 w-full h-full object-cover -z-10 opacity-60"
          autoPlay
          muted
          loop={styles.bg_video_loop ?? true}
          playsInline
        />
      )}

      {children}
    </div>
  );
}

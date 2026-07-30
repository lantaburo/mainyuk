import type { HeroData } from "@/lib/blocks-types";
import { isVideoUrl } from "@/lib/media";

export function HeroBlock({ data }: { data: HeroData }) {
  const align = data.align ?? "center";
  const style = data.style ?? "gradient";
  const hasImage = Boolean(data.image_url) && !isVideoUrl(data.image_url);
  const hasVideo = isVideoUrl(data.image_url);

  // Background style (only apply image if it's not a video)
  const bgStyle: React.CSSProperties = hasImage
    ? {
        backgroundImage: `linear-gradient(160deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.25) 60%, rgba(0,0,0,0.5) 100%), url(${data.image_url})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }
    : style === "dark"
    ? { background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)" }
    : style === "light"
    ? { background: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)" }
    : {
        background: `linear-gradient(135deg, var(--store-primary) 0%, color-mix(in srgb, var(--store-primary) 65%, #000) 100%)`,
      };

  const textColor =
    !(hasImage || hasVideo) && style === "light" ? "text-foreground" : "text-white";
  const subtitleColor =
    !(hasImage || hasVideo) && style === "light" ? "text-foreground/60" : "text-white/80";
  const ctaTextColor =
    style === "light" ? "text-white" : undefined;
  const ctaBgColor =
    style === "light" ? "var(--store-primary)" : "white";

  // Split layout: text left, decorative right
  if (align === "split" && !hasImage && !hasVideo) {
    return (
      <section
        className="relative overflow-hidden px-6 py-24"
        style={bgStyle}
      >
        {/* Decorative orbs */}
        <div className="pointer-events-none absolute -top-24 -right-24 h-[480px] w-[480px] rounded-full opacity-10 blur-3xl" style={{ background: "white" }} />
        <div className="pointer-events-none absolute -bottom-16 right-1/3 h-[300px] w-[300px] rounded-full opacity-10 blur-2xl" style={{ background: "white" }} />

        <div className="relative z-10 mx-auto grid max-w-6xl items-center gap-12 sm:grid-cols-2">
          {/* Text side */}
          <div className="flex flex-col gap-6">
            <h1 className={`sf-animate text-balance text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl lg:text-6xl ${textColor}`}>
              {data.title}
            </h1>
            {data.subtitle && (
              <p className={`sf-animate sf-delay-1 text-base sm:text-lg ${subtitleColor}`}>
                {data.subtitle}
              </p>
            )}
            {data.cta_text && (
              <div className="sf-animate sf-delay-2">
                <a
                  href={data.cta_link || "#"}
                  className="group inline-flex h-12 items-center gap-2 rounded-[var(--store-radius)] px-8 text-sm font-bold shadow-lg transition-all duration-200 hover:scale-105 hover:shadow-xl"
                  style={{ background: "var(--sf-btn-bg, " + ctaBgColor + ")", color: "var(--sf-btn-text, " + (ctaTextColor ?? "var(--store-primary)") + ")" }}
                >
                  {data.cta_text}
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </a>
              </div>
            )}
          </div>

          {/* Decorative side: abstract shape */}
          <div className="sf-animate sf-delay-1 hidden sm:flex items-center justify-center">
            <div className="relative h-72 w-72">
              <div className="absolute inset-0 rounded-full opacity-20" style={{ background: "white" }} />
              <div className="absolute inset-8 rounded-full opacity-30" style={{ background: "white" }} />
              <div className="absolute inset-16 rounded-full opacity-40" style={{ background: "white" }} />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-7xl font-black opacity-30 text-white">✦</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Default centered layout
  return (
      <section
      className="relative flex min-h-[580px] flex-col items-center justify-center overflow-hidden px-6 py-24 text-center"
      style={bgStyle}
    >
      {hasVideo && (
        <>
          <div className="absolute inset-0 bg-black/50 z-0" />
          <video
            src={data.image_url}
            className="absolute inset-0 w-full h-full object-cover -z-10"
            autoPlay
            muted
            loop
            playsInline
          />
        </>
      )}

      {!(hasImage || hasVideo) && (
        <>
          <div className="pointer-events-none absolute -top-32 -right-32 h-[500px] w-[500px] rounded-full opacity-20 blur-3xl" style={{ background: "white" }} />
          <div className="pointer-events-none absolute -bottom-24 -left-24 h-[400px] w-[400px] rounded-full opacity-10 blur-3xl" style={{ background: "white" }} />
        </>
      )}

      <div className="relative z-10 flex flex-col items-center gap-5">
        <h1 className={`sf-animate max-w-3xl text-balance text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl lg:text-6xl ${textColor}`}>
          {data.title}
        </h1>
        {data.subtitle && (
          <p className={`sf-animate sf-delay-1 max-w-xl text-base sm:text-lg ${subtitleColor}`}>
            {data.subtitle}
          </p>
        )}
        {data.cta_text && (
          <a
            href={data.cta_link || "#"}
            className="sf-animate sf-delay-2 group mt-2 inline-flex h-12 items-center gap-2 rounded-[var(--store-radius)] px-8 text-sm font-semibold shadow-lg transition-all duration-200 hover:scale-105 hover:shadow-xl"
            style={{ background: "var(--sf-btn-bg, " + ctaBgColor + ")", color: "var(--sf-btn-text, " + (ctaTextColor ?? "var(--store-primary)") + ")" }}
          >
            {data.cta_text}
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </a>
        )}
      </div>

      <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black/20 to-transparent" />
    </section>
  );
}

/**
 * Shared OG image renderer for all tool pages.
 * Used by each tool's opengraph-image.tsx route.
 */
import { ImageResponse } from "next/og";
import { SITE_NAME } from "@/lib/seo";

export const OG_SIZE = { width: 1200, height: 630 };

// Emoji icons per tool slug
const TOOL_ICONS: Record<string, string> = {
  "image-converter": "🖼️",
  "video-converter": "🎬",
  "pdf-converter": "📄",
  "word-to-pdf": "📝",
  "pdf-to-word": "📋",
  "jpg-to-png": "🔄",
  "png-to-webp": "⚡",
  "compress-image": "🗜️",
  "compress-video": "📦",
};

// Accent colors per tool slug
const TOOL_ACCENTS: Record<string, [string, string]> = {
  "image-converter": ["#6366f1", "#8b5cf6"],
  "video-converter": ["#f59e0b", "#ef4444"],
  "pdf-converter": ["#ef4444", "#f59e0b"],
  "word-to-pdf": ["#3b82f6", "#6366f1"],
  "pdf-to-word": ["#10b981", "#3b82f6"],
  "jpg-to-png": ["#6366f1", "#06b6d4"],
  "png-to-webp": ["#8b5cf6", "#ec4899"],
  "compress-image": ["#06b6d4", "#6366f1"],
  "compress-video": ["#f59e0b", "#10b981"],
};

interface ToolOgImageProps {
  slug: string;
  ogTitle: string;
  ogDescription: string;
}

export function renderToolOgImage({ slug, ogTitle, ogDescription }: ToolOgImageProps) {
  const icon = TOOL_ICONS[slug] ?? "⚡";
  const [color1, color2] = TOOL_ACCENTS[slug] ?? ["#6366f1", "#8b5cf6"];

  return new ImageResponse(
    (
      <div
        style={{
          width: "1200px",
          height: "630px",
          display: "flex",
          flexDirection: "column",
          background: "linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 50%, #16213e 100%)",
          fontFamily: "system-ui, -apple-system, sans-serif",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Background grid */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "radial-gradient(circle at 1px 1px, rgba(99,102,241,0.12) 1px, transparent 0)",
            backgroundSize: "40px 40px",
          }}
        />

        {/* Top-left glow */}
        <div
          style={{
            position: "absolute",
            top: "-120px",
            left: "-120px",
            width: "480px",
            height: "480px",
            borderRadius: "50%",
            background: `radial-gradient(circle, ${color1}44 0%, transparent 70%)`,
          }}
        />

        {/* Bottom-right glow */}
        <div
          style={{
            position: "absolute",
            bottom: "-120px",
            right: "-120px",
            width: "480px",
            height: "480px",
            borderRadius: "50%",
            background: `radial-gradient(circle, ${color2}33 0%, transparent 70%)`,
          }}
        />

        {/* Main content */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            flex: 1,
            padding: "60px 80px",
            position: "relative",
            zIndex: 1,
          }}
        >
          {/* Site brand (top-left) */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              marginBottom: "auto",
            }}
          >
            <div
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "10px",
                background: `linear-gradient(135deg, ${color1}, ${color2})`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "20px",
              }}
            >
              ⚡
            </div>
            <span
              style={{
                fontSize: "24px",
                fontWeight: 700,
                color: "rgba(255,255,255,0.7)",
                letterSpacing: "-0.5px",
              }}
            >
              {SITE_NAME}
            </span>
          </div>

          {/* Tool icon + title */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "20px",
              marginTop: "40px",
            }}
          >
            {/* Icon badge */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "20px",
              }}
            >
              <div
                style={{
                  width: "88px",
                  height: "88px",
                  borderRadius: "22px",
                  background: `linear-gradient(135deg, ${color1}33, ${color2}33)`,
                  border: `2px solid ${color1}66`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "44px",
                }}
              >
                {icon}
              </div>

              {/* Title */}
              <div
                style={{
                  fontSize: "52px",
                  fontWeight: 800,
                  color: "#ffffff",
                  letterSpacing: "-1.5px",
                  lineHeight: 1.1,
                  flex: 1,
                }}
              >
                {ogTitle}
              </div>
            </div>

            {/* Description */}
            <div
              style={{
                fontSize: "24px",
                color: "rgba(255,255,255,0.55)",
                lineHeight: 1.45,
                maxWidth: "900px",
                marginTop: "8px",
              }}
            >
              {ogDescription}
            </div>
          </div>

          {/* Bottom: badges */}
          <div
            style={{
              display: "flex",
              gap: "12px",
              marginTop: "auto",
              paddingTop: "32px",
            }}
          >
            {["Free", "No Upload", "Instant", "Private"].map((badge) => (
              <div
                key={badge}
                style={{
                  padding: "8px 18px",
                  borderRadius: "100px",
                  background: "rgba(255,255,255,0.08)",
                  border: "1px solid rgba(255,255,255,0.15)",
                  color: "rgba(255,255,255,0.7)",
                  fontSize: "15px",
                  fontWeight: 600,
                }}
              >
                ✓ {badge}
              </div>
            ))}
          </div>
        </div>

        {/* Bottom accent bar */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: "5px",
            background: `linear-gradient(90deg, ${color1}, ${color2}, ${color1})`,
          }}
        />

        {/* Right-side decorative stripe */}
        <div
          style={{
            position: "absolute",
            top: 0,
            right: "80px",
            width: "3px",
            height: "100%",
            background: `linear-gradient(180deg, transparent, ${color1}44, transparent)`,
          }}
        />
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
